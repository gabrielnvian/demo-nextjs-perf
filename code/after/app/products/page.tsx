// ✅ Server Component — data fetched server-side, no client JS needed for this page.
import dynamic from "next/dynamic";
import ProductCard from "../components/ProductCard";

// ✅ Dynamic import: SalesChart is only loaded when the browser reaches it.
//    { ssr: false } avoids a server render of a client-only chart component.
const SalesChart = dynamic(() => import("../components/SalesChart"), {
  ssr: false,
  loading: () => (
    <div className="my-8 p-4 border rounded-lg h-40 flex items-center justify-center text-gray-400">
      Loading chart…
    </div>
  ),
});

interface Product {
  id: number;
  title: string;
  price: number;
  category: string;
  image: string;
  rating: { rate: number; count: number };
}

async function getProducts(): Promise<Product[]> {
  const res = await fetch("https://fakestoreapi.com/products", {
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error("Failed to fetch products");
  return res.json();
}

export default async function ProductsPage() {
  const products = await getProducts();

  // ✅ Native JS replaces lodash entirely — no extra bundle weight.
  const sorted = [...products].sort((a, b) => a.price - b.price);

  const byCategory = sorted.reduce<Record<string, Product[]>>((acc, p) => {
    (acc[p.category] ??= []).push(p);
    return acc;
  }, {});

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Products by Category</h1>
      {/* SalesChart loads lazily — doesn't block initial page paint */}
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
