# Performance Baseline

Date: 2026-09-18
Environment: Next.js 16.3.5, Turbopack, local development server on `localhost:3000`

## Runtime Measurements

Measurements were captured from the homepage with Playwright in the local development build. They are directional, not production Lighthouse scores.

| View | TTFB | FCP | DOMContentLoaded | Load | Requests | Transfer |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Desktop, first visit | 521 ms | 1,880 ms | 1,248 ms | 1,854 ms | 41 | 1.39 MB |
| Mobile 390px, reload with cache | 833 ms | 1,276 ms | 1,012 ms | 1,373 ms | 39 | 25 KB |

The mobile measurement was cache-warm after the desktop visit. A cold mobile run should be collected in production or a clean browser profile before using it as a release gate.

## Build Baseline

The existing production build completed successfully:

- Next.js 16.3.5 with Turbopack
- TypeScript completed successfully
- 36 static/prerendered routes generated
- Dynamic API and authenticated routes remained dynamic
- Standalone output enabled

## Findings

### P1: Duplicate homepage stats request

`src/app/page.tsx` fetched `/api/home` after mount while `src/app/home-hero-stats.tsx` separately fetched `/api/about/stats`. This added one request and repeated four database count queries on the homepage.

Status: fixed. Hero stats now use the `/api/home` payload. The public home API has a short `s-maxage=60` cache with stale-while-revalidate.

Expected impact: one fewer browser request and four fewer count queries per uncached homepage visit.

### P1: Homepage is fully client-rendered

`src/app/page.tsx` is a client component and loads CMS/profile data after hydration. This increases initial JavaScript and delays data-dependent content. Moving the full page to server rendering would be a larger architectural change and may affect the language/auth workflow.

Status: documented, not changed in this pass.

### P1: External Google font CSS imports

`src/app/globals.css` imports three Google font families through CSS `@import`. These are render-blocking external stylesheet dependencies and can increase first-render latency on slow networks.

Status: documented, not changed yet because typography and Bengali fallback behavior need a controlled visual comparison. Self-hosting with `next/font` is the likely follow-up.

### P2: Broad client-component surface

There are 78 files containing `use client`, including shared providers, public pages, dashboard pages, and UI primitives. This increases hydration and JavaScript cost, especially for public pages.

Status: documented. Safe reduction requires route-by-route component boundary work and visual regression checks.

### P2: Public API requests are generally uncached

`next.config.ts` applies `no-store` to all `/api/*` responses. This is correct for authenticated/user-specific APIs but overly conservative for public, non-sensitive content such as home CMS data, site branding, and published blog/story lists.

Status: home data received a targeted cache policy. Other endpoints remain unchanged to avoid stale or private-data leaks.

### P2: Location endpoint performs multiple external fetches

`src/app/api/locations/route.ts` fetches the main dataset plus multiple Bengali label datasets, and may fetch secondary datasets for union fallback. Its fetches use revalidation in some paths but the main dataset uses `no-store`.

Status: documented. Candidate for a server-side cached dataset with an explicit refresh policy.

### P3: Service worker uses runtime network-first caching

`public/sw.js` caches arbitrary non-API/non-Next GET responses after network completion. This can improve repeat visits but can also create stale HTML behavior and cache writes during navigation.

Status: documented; changing strategy requires offline/update regression testing.

## Image Audit

Next image optimization is enabled with AVIF/WebP output and a 30-day minimum cache TTL. Homepage images use `next/image`; the hero image is prioritized and below-fold images are generally lazy by default. No blind asset conversion was performed.

## Third-Party and State Audit

- Framer Motion is used across many client pages and contributes to client JavaScript/hydration.
- Socket.IO connects only when the user is authenticated and a socket URL is configured.
- Notification polling exists in admin UI; it is not part of public initial load.
- No analytics or map script was found in the inspected application surface.
- MongoDB connection pooling is already configured with a shared Mongoose connection cache.

## Recommended Next Steps

1. Self-host the three critical fonts with `next/font` and compare cold mobile FCP/LCP.
2. Add targeted public caching for branding, published blog/story feeds, and location datasets only after confirming freshness requirements.
3. Split public server-renderable shells from interactive islands, starting with the homepage.
4. Run production Lighthouse/WebPageTest from a clean mobile profile and record LCP, INP, CLS, TTFB, and transfer size.
5. Profile authenticated dashboard routes separately; do not apply public caching to user-specific responses.

## Post-Optimization Snapshot

After the first safe optimization slice, a fresh local homepage visit measured:

- TTFB: 448 ms
- FCP: 1,656 ms
- Requests: 39
- Transfer: 55.6 KB in the warm browser measurement
- `/api/about/stats`: no longer requested by the homepage
- `/api/home`: the only homepage data endpoint; development Strict Mode can issue the effect twice

The transfer comparison is not a cold-cache apples-to-apples comparison, so it is not presented as a definitive page-weight win. The request-path reduction and duplicate database-query removal are deterministic.

Generated client chunks total 2.57 MB across 67 route-split files. Largest source images are `bouquet.jpg` (216 KB), `table.jpg` (151 KB), and `ceremony.jpg` (111 KB); they are delivered through `next/image` rather than directly as original files.
