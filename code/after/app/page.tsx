// ✅ Server Component - no "use client", no useEffect, no useState.
// Data is fetched on the server at request time; the client receives HTML.
import Image from "next/image";
import ProductGrid from "./components/ProductGrid";

interface Product {
 id: number;
 title: string;
 price: number;
 category: string;
 image: string;
 rating: { rate: number; count: number };
}

async function getProducts(): Promise<Product[]> {
 // ✅ fetch() in a Server Component is cached by Next.js automatically.
 // Use { next: { revalidate: 60 } } for ISR if data changes.
 try {
 const res = await fetch("https://fakestoreapi.com/products", {
 next: { revalidate: 60 },
 });
 if (!res.ok) return [];
 return res.json();
 } catch {
 // Fall back to empty list so the build can prerender even when the
 // upstream API is unreachable. ISR will refresh on the next request.
 return [];
 }
}

export default async function HomePage() {
 const products = await getProducts();

 return (
 <div>
 {/* ✅ next/image: automatic WebP conversion, lazy loading, prevents CLS */}
 <div className="relative w-full h-[400px]">
 <Image
 src="/hero.jpg"
 alt="Hero banner"
 fill
 priority // above-the-fold image: preload it
 className="object-cover"
 />
 </div>
 <h1 className="text-3xl font-bold my-6">All Products</h1>
 <ProductGrid products={products} />
 </div>
 );
}
