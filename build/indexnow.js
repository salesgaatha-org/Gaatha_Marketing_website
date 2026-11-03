#!/usr/bin/env node
/* ==========================================================================
   gaa-tha — IndexNow ping
   Tells Bing (and Yandex, Seznam, Naver, Yep — every IndexNow engine) which
   pages changed, so they are recrawled within minutes instead of days.
   Google does not use IndexNow; it reads sitemap.xml from Search Console.

   Usage:  node build/indexnow.js <git-rev>   # pages changed since <git-rev>
           node build/indexnow.js --all       # every URL in sitemap.xml
           add --dry-run to print the URLs without sending them

   The key is public by design: it lives at https://gaa-tha.com/<key>.txt and
   only proves the request comes from the site's owner.
   Zero dependencies — Node 18+.
   ========================================================================== */
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const HOST = 'gaa-tha.com';
const SITE_URL = `https://${HOST}`;
const KEY = 'c6e4bff1e33a55dde022f7b98bd08076';
const ENDPOINT = 'https://api.indexnow.org/indexnow';

const args = process.argv.slice(2);
const DRY = args.includes('--dry-run');
const ALL = args.includes('--all');
const base = args.find((a) => !a.startsWith('--'));

const sitemapUrls = [...fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);

// Repository file → public URL (mirrors the clean URLs in netlify.toml).
function fileToUrl(file) {
  if (file === 'index.html') return `${SITE_URL}/`;
  if (file === 'sitemap.xml') return null;
  const m = file.match(/^((?:services|work|blog)\/)?([a-z0-9-]+)\.html$/);
  return m ? `${SITE_URL}/${m[1] || ''}${m[2]}` : null;
}

function changedUrls(rev) {
  let files;
  try {
    files = execSync(`git diff --name-only ${rev} HEAD`, { cwd: ROOT, stdio: ['ignore', 'pipe', 'ignore'] }).toString().split('\n').filter(Boolean);
  } catch (_) {
    console.log(`Cannot diff against ${rev}; submitting the whole sitemap.`);
    return sitemapUrls;
  }
  // A change to shared CSS/JS or the nav/footer touches every page's HTML anyway,
  // so mapping changed HTML files is enough.
  return [...new Set(files.map(fileToUrl).filter((u) => u && sitemapUrls.includes(u)))];
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Wait until the deploy is live (key file served) so engines can verify it.
async function waitForKey() {
  for (let i = 0; i < 20; i++) {
    try {
      const res = await fetch(`${SITE_URL}/${KEY}.txt`, { cache: 'no-store' });
      if (res.ok && (await res.text()).trim() === KEY) return true;
    } catch (_) { /* not live yet */ }
    await sleep(30000);
  }
  return false;
}

(async () => {
  const urls = ALL || !base || /^0+$/.test(base) ? sitemapUrls : changedUrls(base);
  if (!urls.length) { console.log('IndexNow: no indexable page changed; nothing to submit.'); return; }
  console.log(`IndexNow: ${urls.length} URL(s)\n  ${urls.slice(0, 20).join('\n  ')}${urls.length > 20 ? '\n  …' : ''}`);
  if (DRY) return;
  if (!(await waitForKey())) { console.log(`::warning::IndexNow key file ${SITE_URL}/${KEY}.txt is not live yet; skipping.`); return; }
  // Give the CDN a moment to serve the new HTML everywhere before engines fetch it.
  await sleep(60000);
  for (let i = 0; i < urls.length; i += 10000) {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `${SITE_URL}/${KEY}.txt`, urlList: urls.slice(i, i + 10000) })
    });
    // 200 = accepted, 202 = accepted, key verification pending.
    const note = `IndexNow responded ${res.status} ${res.statusText}`;
    if (res.status === 200 || res.status === 202) console.log(note);
    else console.log(`::warning::${note} — ${(await res.text()).slice(0, 300)}`);
  }
})().catch((e) => console.log(`::warning::IndexNow failed: ${e.message}`));
