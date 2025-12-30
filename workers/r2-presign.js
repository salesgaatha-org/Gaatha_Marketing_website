/**
 * Cloudflare Worker for R2 Presigned URL Generation
 * 
 * This worker generates presigned URLs for uploading files to Cloudflare R2
 * Supports both images and videos with proper content-type handling
 */

export default {
  async fetch(request, env) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    // DELETE: remove object from R2
    if (request.method === 'DELETE') {
      try {
        const url = new URL(request.url);
        const fileName = url.searchParams.get('fileName');
        if (!fileName) {
          return new Response(JSON.stringify({ error: 'fileName query parameter is required' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
          });
        }
        if (!env.BUCKET) {
          return new Response(JSON.stringify({ error: 'R2 bucket not configured' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
          });
        }
        await env.BUCKET.delete(fileName);
        return new Response(JSON.stringify({ success: true, fileName }), {
          status: 200,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: error.message || 'Delete failed' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
      }
    }

    // Only allow POST requests for upload/presign
    if (request.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed. Use POST.' }),
        {
          status: 405,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    try {
      const contentTypeHeader = request.headers.get('Content-Type') || '';
      
      // Check if this is a file upload (multipart/form-data or direct file)
      if (contentTypeHeader.includes('multipart/form-data') || contentTypeHeader.includes('application/octet-stream') || request.body) {
        // Direct file upload - upload to R2 via worker (avoids CORS)
        return await handleDirectUpload(request, env);
      } else {
        // JSON request - generate presigned URL (legacy support)
        return await handlePresignedUrlRequest(request, env);
      }
    } catch (error) {
      console.error('Error processing request:', error);
      return new Response(
        JSON.stringify({ error: error.message || 'Internal server error' }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }
  },
};

/**
 * Handle direct file upload (avoids CORS issues)
 */
async function handleDirectUpload(request, env) {
  try {
    // Get fileName from query parameter or form data
    const url = new URL(request.url);
    const fileName = url.searchParams.get('fileName');
    
    if (!fileName) {
      return new Response(
        JSON.stringify({ error: 'fileName query parameter is required' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    // Get the file data from request body
    const fileData = await request.arrayBuffer();
    
    if (!fileData || fileData.byteLength === 0) {
      return new Response(
        JSON.stringify({ error: 'No file data provided' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    // Get content type from request or use default
    const contentType = request.headers.get('Content-Type') || 'application/octet-stream';
    
    // Upload to R2 using the bucket binding (no CORS issues server-side)
    if (!env.BUCKET) {
      return new Response(
        JSON.stringify({ error: 'R2 bucket not configured' }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    // Upload file to R2 with public access
    await env.BUCKET.put(fileName, fileData, {
      httpMetadata: {
        contentType: contentType,
      },
      // Ensure file is publicly accessible
      customMetadata: {
        'Cache-Control': 'public, max-age=31536000',
      },
    });

    // Construct public URL
    // Ensure custom domain has https:// prefix and no trailing slash
    let customDomain = env.R2_CUSTOM_DOMAIN || `https://pub-${env.R2_ACCOUNT_ID}.r2.dev`;
    if (!customDomain.startsWith('http://') && !customDomain.startsWith('https://')) {
      customDomain = `https://${customDomain}`;
    }
    customDomain = customDomain.replace(/\/$/, ''); // Remove trailing slash
    const publicUrl = `${customDomain}/${fileName}`;

    return new Response(
      JSON.stringify({
        success: true,
        publicUrl: publicUrl,
        fileName: fileName,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (error) {
    console.error('Error uploading file:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Upload failed' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
}

/**
 * Handle presigned URL generation request (legacy support)
 */
async function handlePresignedUrlRequest(request, env) {
  // Parse request body
  const body = await request.json();
  const { fileName, contentType } = body;

  // Validate inputs
  if (!fileName) {
    return new Response(
      JSON.stringify({ error: 'fileName is required' }),
      {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }

  // Check if secrets are configured
  if (!env.R2_ACCOUNT_ID || !env.R2_ACCESS_KEY_ID || !env.R2_SECRET_ACCESS_KEY || !env.R2_BUCKET_NAME) {
    return new Response(
      JSON.stringify({ error: 'R2 credentials not configured' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }

  // Generate presigned URL (valid for 1 hour)
  const expiresIn = 3600; // 1 hour in seconds

  // Create signature for presigned URL
  // Using S3-compatible API (R2 uses S3-compatible API)
  const bucketName = env.R2_BUCKET_NAME;
  const accountId = env.R2_ACCOUNT_ID;
  const accessKeyId = env.R2_ACCESS_KEY_ID;
  const secretAccessKey = env.R2_SECRET_ACCESS_KEY;

  // R2 endpoint
  const endpoint = `https://${accountId}.r2.cloudflarestorage.com`;
  
  // URL encode the object key
  const encodedFileName = encodeURIComponent(fileName).replace(/%2F/g, '/');
  
  // Generate presigned URL using AWS Signature Version 4
  const presignedUrl = await generatePresignedUrl(
    endpoint,
    bucketName,
    encodedFileName,
    accessKeyId,
    secretAccessKey,
    expiresIn,
    contentType || 'application/octet-stream'
  );

  // Construct public URL
  const customDomain = env.R2_CUSTOM_DOMAIN || `https://pub-${accountId}.r2.dev`;
  const publicUrl = `${customDomain}/${fileName}`;

  return new Response(
    JSON.stringify({
      uploadUrl: presignedUrl,
      publicUrl: publicUrl,
      expiresIn: expiresIn,
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    }
  );
}

/**
 * Generate AWS Signature Version 4 presigned URL for R2
 */
async function generatePresignedUrl(
  endpoint,
  bucketName,
  objectKey,
  accessKeyId,
  secretAccessKey,
  expiresIn,
  contentType
) {
  const algorithm = 'AWS4-HMAC-SHA256';
  const service = 's3';
  const region = 'auto'; // R2 uses 'auto' as region
  
  // Get current date
  const now = new Date();
  const dateStamp = now.toISOString().slice(0, 10).replace(/-/g, '');
  const amzDate = now.toISOString().slice(0, 19).replace(/[:\-]|\.\d{3}/g, '');
  
  // Create canonical request
  const canonicalUri = `/${bucketName}/${objectKey}`;
  // For R2, we only sign 'host' header to avoid signature mismatches
  // Content-Type can be sent without being in the signature
  const signedHeaders = 'host';
  const canonicalQueryString = `X-Amz-Algorithm=${algorithm}&X-Amz-Credential=${encodeURIComponent(`${accessKeyId}/${dateStamp}/${region}/${service}/aws4_request`)}&X-Amz-Date=${amzDate}&X-Amz-Expires=${expiresIn}&X-Amz-SignedHeaders=${encodeURIComponent(signedHeaders)}`;
  
  // Build canonical headers - only include signed headers
  const hostHeader = endpoint.replace('https://', '');
  const canonicalHeaders = `host:${hostHeader}\n`;
  
  const payloadHash = await sha256('');
  const canonicalRequest = `PUT\n${canonicalUri}\n${canonicalQueryString}\n${canonicalHeaders}\n${signedHeaders}\n${payloadHash}`;
  
  // Create string to sign
  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
  const stringToSign = `${algorithm}\n${amzDate}\n${credentialScope}\n${await sha256(canonicalRequest)}`;
  
  // Calculate signature
  const kDate = await hmacSha256(`AWS4${secretAccessKey}`, dateStamp);
  const kRegion = await hmacSha256(kDate, region);
  const kService = await hmacSha256(kRegion, service);
  const kSigning = await hmacSha256(kService, 'aws4_request');
  const signature = await hmacSha256(kSigning, stringToSign);
  
  // Construct presigned URL
  const signatureHex = Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  
  const presignedUrl = `${endpoint}${canonicalUri}?${canonicalQueryString}&X-Amz-Signature=${signatureHex}`;
  
  return presignedUrl;
}

// Helper functions for crypto operations
async function sha256(message) {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return new Uint8Array(hashBuffer);
}

async function hmacSha256(key, message) {
  const encoder = new TextEncoder();
  const keyData = typeof key === 'string' ? encoder.encode(key) : key;
  const messageData = encoder.encode(message);
  
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
  return new Uint8Array(signature);
}

