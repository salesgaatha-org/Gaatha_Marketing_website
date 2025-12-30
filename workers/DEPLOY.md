# Deploy Cloudflare Worker for R2 Presigned URLs

Follow these steps to deploy the worker that generates presigned URLs for R2 uploads.

## Prerequisites

1. **Cloudflare Account** ✅ (You already have this)
2. **R2 API Token** ✅ (You created this earlier)
3. **Node.js** (for Wrangler CLI) - Download from [nodejs.org](https://nodejs.org/)

## Step-by-Step Deployment

### Step 1: Install Wrangler CLI

Open your terminal/command prompt and run:

```bash
npm install -g wrangler
```

Or if you prefer not to install globally:

```bash
npm install wrangler
```

Then use: `npx wrangler` instead of just `wrangler`

### Step 2: Login to Cloudflare

```bash
wrangler login
```

This will open your browser to authenticate. Click "Allow" to authorize Wrangler.

### Step 3: Navigate to Workers Directory

```bash
cd workers
```

### Step 4: Get Your R2 Credentials

You need these from your Cloudflare account:

1. **R2 Account ID**: 
   - Go to Cloudflare Dashboard → R2 → Overview
   - Look for "Account ID" (it's visible in the URL or in the overview section)
   - Example: `cb1b911ff5b46293ee2f9e562b1cc015`

2. **R2 Access Key ID** and **Secret Access Key**:
   - Go to R2 → API Tokens
   - You created this earlier - find the Access Key ID and Secret Access Key
   - If you don't have them saved, you'll need to create a new API token

### Step 5: Set Environment Variables (Secrets)

Set each secret one by one. Wrangler will prompt you to enter the value:

```bash
# Account ID (from R2 Overview)
wrangler secret put R2_ACCOUNT_ID

# Access Key ID (from your R2 API token)
wrangler secret put R2_ACCESS_KEY_ID

# Secret Access Key (from your R2 API token - you won't see it again if lost!)
wrangler secret put R2_SECRET_ACCESS_KEY

# Bucket name
wrangler secret put R2_BUCKET_NAME
# When prompted, enter: gaatha-media

# Custom domain (optional but recommended)
wrangler secret put R2_CUSTOM_DOMAIN
# When prompted, enter: https://media.gaa-tha.com
```

**Important**: For the Secret Access Key, paste it carefully - you won't be able to see it again after setting it.

### Step 6: Deploy the Worker

```bash
wrangler deploy
```

You should see output like:
```
✨ Built Worker successfully
✨ Uploaded Worker successfully
✨ Published Worker successfully
   https://r2-presign.YOUR_SUBDOMAIN.workers.dev
```

### Step 7: Copy Your Worker URL

After deployment, Wrangler will show you the worker URL. It will look like:
```
https://r2-presign.YOUR_SUBDOMAIN.workers.dev
```

Copy this URL - you'll need it in the next step.

### Step 8: Update Frontend Code

Open `reels.html` and find this line (around line 693):

```javascript
const R2_PRESIGN_ENDPOINT = 'https://r2-presign.YOUR_SUBDOMAIN.workers.dev';
```

Replace `YOUR_SUBDOMAIN` with your actual worker subdomain. For example:
```javascript
const R2_PRESIGN_ENDPOINT = 'https://r2-presign.abc123.workers.dev';
```

### Step 9: Test the Worker

Test the worker using curl or your browser's console:

```bash
curl -X POST https://r2-presign.YOUR_SUBDOMAIN.workers.dev \
  -H "Content-Type: application/json" \
  -d '{"fileName": "test/reel.mp4", "contentType": "video/mp4"}'
```

You should get a response like:
```json
{
  "uploadUrl": "https://...presigned-url...",
  "publicUrl": "https://media.gaa-tha.com/test/reel.mp4"
}
```

### Step 10: Enable R2 Uploads

1. Open your admin page (`reels.html` in admin mode)
2. Open browser console (F12)
3. Run:
```javascript
localStorage.setItem('USE_R2', 'true')
```
4. Now when you upload a new reel, it will go to R2 instead of Cloudinary

## Troubleshooting

### Error: "R2 credentials not configured"
- Make sure you set all 5 secrets (R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, R2_CUSTOM_DOMAIN)
- Check spelling of secret names

### Error: "403 Forbidden" when uploading
- Check your R2 API token has "Object Read & Write" permissions
- Verify the bucket name matches exactly

### Error: "Invalid signature"
- Double-check your R2_ACCESS_KEY_ID and R2_SECRET_ACCESS_KEY are correct
- Make sure you're using the full Account ID (not truncated)

### CORS errors
- The worker includes CORS headers
- If you still get CORS errors, check your browser console for the exact error
- Make sure you're calling the worker from the correct domain

### Worker URL not working
- Check the worker is deployed: `wrangler deployments list`
- View worker logs: `wrangler tail`

## Viewing Worker Logs

To see what's happening in real-time:

```bash
wrangler tail
```

This shows all requests and errors.

## Updating the Worker

If you make changes to `r2-presign.js`:

```bash
cd workers
wrangler deploy
```

## Next Steps

Once the worker is deployed and tested:
1. ✅ Update `R2_PRESIGN_ENDPOINT` in `reels.html`
2. ✅ Enable R2 uploads: `localStorage.setItem('USE_R2', 'true')`
3. ✅ Test uploading a reel
4. ✅ Verify it plays on the reels page

## Need Help?

- Check Cloudflare Workers docs: https://developers.cloudflare.com/workers/
- Check R2 docs: https://developers.cloudflare.com/r2/
- View worker logs: `wrangler tail`

