/**
 * Cloudflare Worker — "Publish site" hook for content-admin.html
 *
 * The admin panel POSTs here; the worker fires a GitHub `repository_dispatch`
 * event (type `cms-publish`) on the site repo, which runs
 * .github/workflows/deploy.yml: it rebuilds every page with the Firebase
 * overrides merged in (node build/build.js), commits the output and deploys
 * to Netlify. The GitHub token never leaves this worker.
 *
 * Secrets (wrangler secret put …):
 *   GITHUB_TOKEN   fine-grained PAT with "Contents: read & write" on the repo
 *   GITHUB_REPO    e.g. salesgaatha-org/Gaatha_Marketing_website
 *   ALLOWED_ORIGIN e.g. https://gaa-tha.com   (CORS; "*" while testing)
 */
export default {
  async fetch(request, env) {
    const origin = env.ALLOWED_ORIGIN || '*';
    const cors = {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json',
    };
    if (request.method === 'OPTIONS') return new Response(null, { headers: cors });
    if (request.method !== 'POST') return new Response(JSON.stringify({ error: 'POST only' }), { status: 405, headers: cors });
    if (!env.GITHUB_TOKEN || !env.GITHUB_REPO) return new Response(JSON.stringify({ error: 'Publish hook not configured' }), { status: 500, headers: cors });

    let payload = {};
    try { payload = await request.json(); } catch (_) { /* optional body */ }

    const res = await fetch(`https://api.github.com/repos/${env.GITHUB_REPO}/dispatches`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github+json',
        'User-Agent': 'gaatha-publish-hook',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ event_type: 'cms-publish', client_payload: { requestedAt: payload.requestedAt || new Date().toISOString(), by: payload.by || 'admin' } }),
    });

    if (res.status !== 204) {
      const text = await res.text();
      return new Response(JSON.stringify({ error: 'GitHub refused the dispatch', status: res.status, detail: text.slice(0, 300) }), { status: 502, headers: cors });
    }
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: cors });
  },
};
