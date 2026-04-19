# Next.js App Router Performance Case Study

Took a Next.js 14 storefront from Lighthouse 56 to 100 with 6 targeted changes. Numbers below are medians of 5 Lighthouse runs, mobile profile, simulated 4G, headless Chromium 147.

## Before vs After

| Metric | Before | After |
|---|---|---|
| Performance score | 56 | 100 |
| First Contentful Paint | 0.8 s | 0.8 s |
| Largest Contentful Paint | 10.0 s | 1.7 s |
| Total Blocking Time | 27 ms | 16 ms |
| Cumulative Layout Shift | 0.41 | 0.00 |
| Speed Index | 2.1 s | 0.8 s |

FCP barely moved because the old page paints a "Loading..." state fast, then waits for a client fetch before showing anything real. The user-visible win shows up in LCP (10.0 s to 1.7 s), CLS (0.41 to 0.00), and overall score.

## The 6 changes

1. Extracted the client island from the root layout so Server Components actually render on the server.
2. Moved data fetching out of `useEffect` into async Server Components with ISR.
3. Swapped `<img>` for `next/image` with `sizes` and `priority`.
4. Killed a full `import _ from 'lodash'` in favor of native JS.
5. Lazy-loaded the below-the-fold chart with `dynamic()`.
6. Removed unnecessary `"use client"` from leaf components.

Full write-up with before/after code: [docs/case-study.md](docs/case-study.md).

## Run it locally

    cd code/before
    npm install
    npm run dev
    # then visit http://localhost:3000

Same commands for `code/after`. Open both side by side to see the difference.

## About

Built by Gabriel Vian. I build and ship full-stack internal tools for SMBs and startups. If you have a Next.js app that is slower than it should be, or a spreadsheet-shaped problem that wants to be a real admin panel, get in touch.

Last updated: 2026-04-19.

