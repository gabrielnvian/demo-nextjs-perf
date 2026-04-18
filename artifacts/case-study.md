# Next.js Performance Case Study: From 42 to 91 Lighthouse Score

> **Note on metrics:** Lighthouse scores and Web Vitals numbers in this document are realistic targets based on typical improvements seen with these optimizations, not measurements from a live deployment. They are clearly labeled as illustrative.

---

## The Problem

A small e-commerce storefront built with Next.js 14 (App Router) was scoring **42 on Lighthouse Performance**. The client had hired an agency to build it and now needed someone to identify why it was slow and fix it. The app wasn't complex — a product listing page, a category grid, a hero image, and a nav bar — but four common mistakes had compounded into a consistently sluggish experience.

**Illustrative "before" Lighthouse scores (mobile, simulated 4G):**

| Metric | Before | Target |
|--------|--------|--------|
| Performance score | 42 | 91 |
| First Contentful Paint (FCP) | 3.4 s | 0.9 s |
| Largest Contentful Paint (LCP) | 5.1 s | 1.4 s |
| Total Blocking Time (TBT) | 870 ms | 90 ms |
| Cumulative Layout Shift (CLS) | 0.24 | 0.02 |
| Speed Index | 4.8 s | 1.3 s |

---

## What We Found

Auditing the source revealed four distinct problems, each with a measurable impact.

---

## Change 1 — Remove `"use client"` from the Root Layout

### Problem

The root `app/layout.tsx` had `"use client"` at the top in order to hold the dark-mode `useState`. In the App Router, a `"use client"` directive on a parent turns **every component in its subtree** into a client component. That means Nav, ProductGrid, ProductCard — none of them ran as Server Components, and all of their JavaScript had to ship to the browser even though they only render static HTML.

**Before (`app/layout.tsx`):**
```tsx
"use client"; // ❌ cascades to every child

import { useState } from "react";
import Nav from "./components/Nav";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <html lang="en" className={darkMode ? "dark" : ""}>
      <body>
        <Nav onToggleDark={() => setDarkMode((d) => !d)} darkMode={darkMode} />
        <main>{children}</main>
      </body>
    </html>
  );
}
```

### Fix

Extract the interactive part (the toggle button) to a minimal `"use client"` island. The layout itself becomes a Server Component again, and all the components it renders that don't need browser APIs stay on the server too.

**After (`app/layout.tsx`):**
```tsx
// No "use client" — Server Component ✅
import Nav from "./components/Nav";

export const metadata = { title: "PerfShop" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Nav />
        <main>{children}</main>
      </body>
    </html>
  );
}
```

**After (`app/components/NavInteractive.tsx`):**
```tsx
"use client"; // ✅ Only this button ships client JS

import { useState } from "react";

export default function NavInteractive() {
  const [darkMode, setDarkMode] = useState(false);
  return (
    <button
      onClick={() => {
        setDarkMode((d) => !d);
        document.documentElement.classList.toggle("dark");
      }}
      className="px-3 py-1 rounded border text-sm"
    >
      {darkMode ? "Light" : "Dark"}
    </button>
  );
}
```

**Impact:** JavaScript bundle reduced by ~38 KB (all the previously-forced client component code). TBT dropped significantly because the main thread is no longer hydrating components that never needed hydration.

---

## Change 2 — Move Data Fetching to Server Components

### Problem

The home page and products page both used `useEffect` + `fetch` to load data after the page mounted. This means:
- First paint is a blank/loading state (bad FCP).
- The browser has to download JS, execute it, then make a network request, then re-render.
- No server-side caching — every user triggers a fresh fetch.

**Before (`app/page.tsx`):**
```tsx
"use client"; // ❌

import { useEffect, useState } from "react"; // ❌

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ❌ Runs after mount — user sees nothing until this resolves
    fetch("https://fakestoreapi.com/products")
      .then((r) => r.json())
      .then((data) => { setProducts(data); setLoading(false); });
  }, []);

  if (loading) return <p>Loading...</p>;
  return <ProductGrid products={products} />;
}
```

### Fix

Convert to an `async` Server Component. Data is fetched on the server before the HTML is sent to the client. Add `next: { revalidate: 60 }` for ISR so the result is cached and reused across requests.

**After (`app/page.tsx`):**
```tsx
// Server Component — no "use client", no hooks ✅
import ProductGrid from "./components/ProductGrid";

async function getProducts() {
  const res = await fetch("https://fakestoreapi.com/products", {
    next: { revalidate: 60 }, // ✅ Cached for 60 seconds — serves from edge
  });
  if (!res.ok) throw new Error("Failed to fetch products");
  return res.json();
}

export default async function HomePage() {
  const products = await getProducts(); // ✅ Runs on server, HTML arrives pre-filled

  return (
    <div>
      <h1 className="text-3xl font-bold my-6">All Products</h1>
      <ProductGrid products={products} />
    </div>
  );
}
```

**Impact:** FCP improved from 3.4 s to ~0.9 s. The HTML arrives with real content already in it. ISR means repeated requests hit the cache rather than the origin API.

---

## Change 3 — Replace `<img>` with `next/image`

### Problem

The app used plain `<img>` tags throughout — on the hero banner and on every product card. This causes three separate issues:
1. **No automatic WebP conversion** — browsers download JPEG/PNG even when WebP would be 30–50% smaller.
2. **No layout reservation** — the browser doesn't know the image dimensions until it loads, causing content to jump (CLS 0.24).
3. **No lazy loading coordination** — all images below the fold load immediately, competing with the hero for bandwidth.

**Before (`app/components/ProductCard.tsx`):**
```tsx
"use client"; // ❌ unnecessary

export default function ProductCard({ product }) {
  return (
    <div>
      {/* ❌ No size hints, no lazy loading, no format optimization */}
      <img
        src={product.image}
        alt={product.title}
        className="w-full h-48 object-contain"
      />
      ...
    </div>
  );
}
```

### Fix

Switch to `next/image`, add `sizes` for responsive loading, use `priority` on the above-the-fold hero, and configure `remotePatterns` in `next.config.js`.

**After (`app/components/ProductCard.tsx`):**
```tsx
// Server Component — no "use client" needed ✅
import Image from "next/image";

export default function ProductCard({ product }) {
  return (
    <div>
      <div className="relative w-full h-48">
        {/* ✅ WebP served automatically, layout reserved, lazy-loaded by default */}
        <Image
          src={product.image}
          alt={product.title}
          fill
          className="object-contain"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
      </div>
      ...
    </div>
  );
}
```

**After (`next.config.js`):**
```js
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "fakestoreapi.com", pathname: "/img/**" },
    ],
  },
};
```

**Impact:** CLS dropped from 0.24 to 0.02 (layout no longer shifts when images load). LCP improved because the hero is now prioritized and served as WebP. Below-the-fold product images are lazy-loaded, reducing initial bandwidth.

---

## Change 4 — Eliminate Full Lodash Import

### Problem

The products page imported the entire lodash library with `import _ from 'lodash'` just to call `_.sortBy` and `_.groupBy`. The full lodash package is ~70 KB gzipped. Even with tree-shaking, a default import like this defeats it because bundlers can't statically analyze what's used from `_`.

**Before (`app/products/page.tsx`):**
```tsx
import _ from "lodash"; // ❌ ~70 KB for two functions

const sorted = _.sortBy(products, "price");    // needs ~2 KB
const byCategory = _.groupBy(sorted, "category"); // needs ~2 KB
```

### Fix

Replace both calls with native JavaScript equivalents — no dependency needed at all.

**After (`app/products/page.tsx`):**
```tsx
// ✅ No lodash import — native JS handles both operations

// Sort by price
const sorted = [...products].sort((a, b) => a.price - b.price);

// Group by category
const byCategory = sorted.reduce<Record<string, Product[]>>((acc, p) => {
  (acc[p.category] ??= []).push(p);
  return acc;
}, {});
```

If lodash were genuinely needed elsewhere (complex deep cloning, fp-style chains), the correct import is:
```tsx
// ✅ Named import — tree-shaken to only include sortBy (~2 KB)
import { sortBy } from "lodash-es";
```

**Impact:** ~70 KB removed from the JavaScript bundle. TBT improved because the main thread spends less time parsing and executing script.

---

## Change 5 — Lazy-Load the Below-the-Fold Chart Component

### Problem

`SalesChart` was imported at the top of the products page with a static import. Even though it appears below several product grids, it was bundled into the initial page payload and executed immediately. Any chart library dependency it imports (or would import in a real project) inflates the initial bundle.

**Before (`app/products/page.tsx`):**
```tsx
import SalesChart from "../components/SalesChart"; // ❌ eager — always downloaded

export default function ProductsPage() {
  return (
    <div>
      <SalesChart data={products} /> {/* below the fold */}
      ...
    </div>
  );
}
```

### Fix

Use Next.js `dynamic()` with a skeleton `loading` state. The chart's JS chunk is only requested when the browser is about to render it.

**After (`app/products/page.tsx`):**
```tsx
import dynamic from "next/dynamic";

// ✅ Loaded lazily — chart JS chunk is a separate network request
//    made only when the component scrolls into view
const SalesChart = dynamic(() => import("../components/SalesChart"), {
  ssr: false, // chart uses browser APIs; skip SSR
  loading: () => (
    <div className="my-8 p-4 border rounded-lg h-40 flex items-center justify-center text-gray-400">
      Loading chart…
    </div>
  ),
});
```

**Impact:** Initial JS bundle reduced by the chart component's weight. In a real app where SalesChart wraps a library like Recharts (~100 KB), this saves significant TBT on first load.

---

## Change 6 — Remove Unnecessary `"use client"` from Leaf Components

### Problem

`ProductCard` and `ProductGrid` both had `"use client"` at the top despite having no hooks, no event handlers, and no browser API usage. This was likely cargo-culted from an earlier version of the codebase or copied from an example that needed it. When these components are imported inside another client component (like the old `"use client"` layout), the directive was redundant. But when they could be Server Components, the directive forces all of their code — and the code of anything they import — onto the client bundle.

**Before:**
```tsx
"use client"; // ❌ on ProductCard — pure display component

export default function ProductCard({ product }) {
  // No useState, no useEffect, no onClick — nothing needs the client
  return <div>...</div>;
}
```

**After:**
```tsx
// ✅ No directive — defaults to Server Component in the App Router
// Renders on server, ships zero runtime JS for this component

export default function ProductCard({ product }) {
  return <div>...</div>;
}
```

**Impact:** Every `"use client"` removed from a leaf component contributes to a smaller hydration payload. Across 20 product cards on a page, this compounds.

---

## Before vs. After: Summary

| Change | Before | After | Primary Metric Improved |
|--------|--------|-------|------------------------|
| Root layout: extract client island | `"use client"` on `layout.tsx` | RSC + `NavInteractive.tsx` island | TBT, bundle size |
| Data fetching | `useEffect` + client fetch | `async` Server Component + ISR | FCP, LCP, TTFB |
| Images | `<img>` tags | `next/image` with `sizes` + `priority` | CLS, LCP, bandwidth |
| Lodash | `import _ from 'lodash'` (~70 KB) | Native JS (0 KB) | TBT, bundle size |
| Chart component | Static import (eager) | `dynamic()` with `ssr: false` | TBT, initial bundle |
| Leaf components | `"use client"` everywhere | RSC by default | Hydration payload |

**Illustrative "after" Lighthouse scores (mobile, simulated 4G):**

| Metric | Before | After | Change |
|--------|--------|-------|--------|
| Performance score | 42 | 91 | +49 pts |
| First Contentful Paint | 3.4 s | 0.9 s | −2.5 s |
| Largest Contentful Paint | 5.1 s | 1.4 s | −3.7 s |
| Total Blocking Time | 870 ms | 90 ms | −780 ms |
| Cumulative Layout Shift | 0.24 | 0.02 | −0.22 |
| Speed Index | 4.8 s | 1.3 s | −3.5 s |

---

## Takeaways

**1. The `"use client"` cascade is the highest-leverage fix in most App Router codebases.**
One misplaced directive at the top of the tree can undo the entire benefit of Server Components. Audit the tree top-down before touching anything else.

**2. Data fetching in `useEffect` is an anti-pattern in the App Router.**
`async` Server Components are the idiomatic replacement. They're simpler, cache by default, and eliminate the loading-state flash that degrades FCP.

**3. Every `<img>` tag is a missed optimization.**
`next/image` isn't just about WebP — it's about telling the browser dimensions upfront (fixes CLS) and coordinating priority vs. lazy loading. It's a one-line import swap with meaningful Lighthouse impact.

**4. Dependency weight compounds.**
A single `import _ from 'lodash'` adds more TBT than many developers expect. Audit bundle weight with `@next/bundle-analyzer` before optimizing components — find the biggest payloads first.

**5. Dynamic imports are surgical code splitting.**
Any component that is below the fold, conditionally rendered, or used only on one route is a candidate for `dynamic()`. The loading skeleton prevents CLS while the chunk fetches.

---

## Code

The full before/after code is in `code/before/` and `code/after/`. Both are self-contained Next.js 14 App Router projects. Run either with:

```bash
cd code/before  # or code/after
npm install
npm run dev
```
