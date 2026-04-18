"use client"; // ❌ not needed - no interactivity here, just data display

import { useEffect, useState } from "react"; // ❌ data fetching in useEffect
import ProductGrid from "./components/ProductGrid";

interface Product {
 id: number;
 title: string;
 price: number;
 category: string;
 image: string;
 rating: { rate: number; count: number };
}

export default function HomePage() {
 const [products, setProducts] = useState<Product[]>([]);
 const [loading, setLoading] = useState(true);

 // ❌ Client-side fetch: no SSR, blank page on first paint, no caching
 useEffect(() => {
 fetch("https://fakestoreapi.com/products")
 .then((r) => r.json())
 .then((data) => {
 setProducts(data);
 setLoading(false);
 });
 }, []);

 if (loading) return <p>Loading...</p>;

 return (
 <div>
 {/* ❌ unoptimized hero image - no width/height, no lazy loading config */}
 <img
 src="/hero.jpg"
 alt="Hero banner"
 style={{ width: "100%", height: "400px", objectFit: "cover" }}
 />
 <h1 className="text-3xl font-bold my-6">All Products</h1>
 <ProductGrid products={products} />
 </div>
 );
}
