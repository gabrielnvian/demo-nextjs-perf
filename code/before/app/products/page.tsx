"use client"; // ❌ not needed

import { useEffect, useState } from "react";
import _ from "lodash"; // ❌ imports entire ~70 KB lodash bundle for two utility calls
import ProductCard from "../components/ProductCard";
import SalesChart from "../components/SalesChart";

interface Product {
  id: number;
  title: string;
  price: number;
  category: string;
  image: string;
  rating: { rate: number; count: number };
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetch("https://fakestoreapi.com/products")
      .then((r) => r.json())
      .then(setProducts);
  }, []);

  // ❌ full lodash used; _.sortBy and _.groupBy are the only functions needed
  const sorted = _.sortBy(products, "price");
  const byCategory = _.groupBy(sorted, "category");

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Products by Category</h1>
      {/* ❌ SalesChart is imported eagerly even though it's below the fold */}
      <SalesChart data={products} />
      {Object.entries(byCategory).map(([category, items]) => (
        <section key={category} className="mb-10">
          <h2 className="text-xl font-semibold mb-4 capitalize">{category}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {items.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
