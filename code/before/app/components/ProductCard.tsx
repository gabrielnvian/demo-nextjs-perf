"use client"; // ❌ purely presentational - no hooks, no events, no browser APIs

interface Product {
 id: number;
 title: string;
 price: number;
 image: string;
 rating: { rate: number; count: number };
}

export default function ProductCard({ product }: { product: Product }) {
 return (
 <div className="border rounded-lg p-4 flex flex-col gap-2">
 {/* ❌ plain <img> - no next/image, no size hints, no lazy loading attributes */}
 <img
 src={product.image}
 alt={product.title}
 className="w-full h-48 object-contain"
 />
 <p className="font-medium text-sm line-clamp-2">{product.title}</p>
 <p className="text-gray-500 text-xs">★ {product.rating.rate} ({product.rating.count})</p>
 <p className="font-bold">${product.price.toFixed(2)}</p>
 <button className="mt-auto bg-blue-600 text-white rounded px-3 py-1 text-sm">
 Add to cart
 </button>
 </div>
 );
}
