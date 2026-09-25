# gaa-tha content

Everything under `content/` is the source of truth for the generated pages.
`node build/build.js` renders it into static HTML (services, case studies,
hubs, 404, sitemap, llms.txt) and syncs the shared header/footer into the
hand-written pages. Nothing on the live site depends on client-side JS to
show text — crawlers and AI tools get finished HTML.

Admin overrides (images, metrics, quotes, publish toggles) live in Firebase
under `cms/…` and are merged on top of these files at build time. The admin
panel is `content-admin.html`.

## Files

| Path | What |
|---|---|
| `site.json` | Brand facts, contact, socials, stats — used by schema and llms.txt |
| `groups.json` | The service groups (hubs at `/services/<group>`) |
| `services/<slug>.json` | One record per service page (`/services/<slug>`) |
| `case-studies/<slug>.json` | One record per case study (`/work/<slug>`) |
| `clients.json` | Client roster: logo, industry, show-on-logo-wall |
| `posts.json` | Registry of blog posts (existing + generated) for "related reading" |
| `blog/<slug>.json` | Generated posts (drafts stay `published: false`) |
| `faqs-commerce.json` | FAQ groups 08/09 (also rendered into faq.html) |

## Service record

```jsonc
{
  "slug": "meta-ads-agency",          // URL: /services/meta-ads-agency
  "group": "growth-marketing",         // key in groups.json
  "order": 3,                          // position inside the group
  "published": true,                   // false = not rendered, not in sitemap
  "name": "Meta Ads Agency",           // H1 — the exact keyword phrase
  "shortName": "Meta ads",             // menus, cards, chips
  "promise": "…",                      // one line under the name on cards
  "intro": "…",                        // 40–60 words, answer-first, self-contained
  "glance": { "bestFor": "…", "timeline": "…", "model": "…", "channels": "…" },
  "whatIs": ["definition-first paragraph", "second short paragraph"],
  "included": ["6–10 deliverable bullets"],
  "steps": [{ "title": "…", "text": "…" }],      // exactly 5
  "deliverables": ["tangible outputs"],
  "tools": ["text chips only — never third-party logos"],
  "pricing": "one line, no prices",
  "faq": [{ "q": "…", "a": "…" }],                // 5–8, answer-first, 2–4 sentences
  "related": ["slug", "slug", "slug", "cross-group-slug"],
  "reading": ["blog-seo-aeo-geo-guide"],          // 2–3 keys from posts.json
  "existingPage": "/reels",                       // optional: the craft page it extends
  "meta": { "title": "≤60 chars", "description": "≤155 chars" },
  "updated": "2026-09-25"
}
```

Case studies pull in automatically: any published case whose `services`
array contains this slug is shown in the Proof block (max 3).

## Case-study record

```jsonc
{
  "slug": "charliee",
  "published": false,                  // stays off until the client approves
  "featured": false,
  "client": "charliee",                // key in clients.json (logo comes from there)
  "headline": "outcome headline (H1)",
  "summary": "one line",
  "industry": "FMCG / packaged snacks",
  "location": "Gujarat & Mumbai",
  "duration": "TODO-DATA",
  "channels": "…",
  "filters": ["websites-shopify", "performance-ads"],   // /work filter chips
  "services": ["shopify-development", "…"],             // service slugs used
  "metrics": [{ "label": "Website orders", "value": "TODO-DATA" }],
  "challenge": ["para", "para"],
  "workstreams": [{ "title": "Shopify website", "text": "…" }],
  "results": ["para"],
  "quote": { "text": "", "name": "", "role": "" },      // hidden while empty
  "gallery": 6,                                          // number of 4:5 slots
  "video": "",                                           // optional embed URL
  "images": { "hero": "", "card": "", "og": "" },        // admin-managed media ids/urls
  "meta": { "title": "…", "description": "…" },
  "updated": "2026-09-25"
}
```

Any value equal to `TODO-DATA` (or an empty string) is treated as unfilled:
the field is hidden on the page rather than rendered.

## Honesty rules

- No invented numbers, quotes, logos or client claims.
- Metrics stay `TODO-DATA` until the team fills them from real reports.
- Third-party platform names are text, never logos.
