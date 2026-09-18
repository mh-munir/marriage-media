# Performance Report

Date: 2026-09-18
Project: Marriage Media

## Status

Performance audit and first optimization pass complete. The implementation preserved routes, APIs, authentication, payment behavior, database semantics, and UI design.

## Changes Made

- Removed the duplicate homepage `/api/about/stats` request by passing aggregate stats from the existing `/api/home` response into `HomeHeroStats`.
- Added a 60-second public CDN cache and 300-second stale-while-revalidate window to the non-sensitive `/api/home` response.
- Changed the homepage data request to use the browser/CDN cache instead of forcing `no-store`.
- Added font-origin preconnect hints for the existing Google font imports.
- Added `PERFORMANCE_BASELINE.md` with audit evidence, measurements, and remaining risks.

## Before vs After

| Metric | Before | After | Notes |
| --- | ---: | ---: | --- |
| Desktop FCP | 1,880 ms | 1,656 ms | Local dev measurements; cache/runtime conditions differ |
| Desktop requests | 41 | 39 | After snapshot had no `/api/about/stats`; dev Strict Mode can duplicate effects |
| Homepage stats endpoints | `/api/home` + `/api/about/stats` | `/api/home` | Deterministic request/query reduction |
| Generated client chunks | Not previously recorded | 67 files / 2.57 MB total | Route-split total, not initial route payload |

The runtime measurements are directional local measurements, not production Lighthouse or WebPageTest scores. A clean production mobile run is still required for trustworthy LCP, INP, CLS, and TTFB release gates.

## Validation

- `npx tsc --noEmit` passed.
- `npm run lint` passed.
- `npm run build` passed with Next.js 16.3.5 and Turbopack.
- Homepage was opened at desktop and 390px mobile viewport with Playwright timing/resource checks.
- Next image optimization remains enabled for AVIF/WebP with 30-day minimum cache TTL.

## Remaining Bottlenecks

- Homepage and many dashboard/public content components are client components, increasing hydration and JavaScript cost.
- Three Google font families are loaded through CSS `@import`; self-hosting with `next/font` is the strongest next step, but needs visual Bengali typography comparison.
- Public blog, success-story, branding, and location endpoints still need individually reviewed cache policies.
- Location lookup can fetch several external datasets and is a likely slow path on onboarding.
- Framer Motion is used broadly and should be profiled on low-end mobile before selectively reducing animation.
- No production Lighthouse/WebPageTest run was available in this environment.

## Out of Scope - Requires User Decision

- Removing or replacing dependencies without bundle-level proof.
- Converting all source images or changing visual quality without a visual regression pass.
- Moving the homepage from client rendering to server rendering, because it intersects language persistence, auth state, CMS overrides, and interactive profile loading.
- Caching authenticated or user-specific APIs.
- Changing database indexes without production query statistics.