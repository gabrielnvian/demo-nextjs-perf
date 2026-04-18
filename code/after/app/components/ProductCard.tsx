// ✅ Server Component — pure display, no hooks, no events.
//    Removes unnecessary "use client" and switches to next/image.
import Image from "next/image";

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
      {/* ✅ next/image: known dimensions prevent layout shift, WebP served automatically */}
      <div className="relative w-full h-48">
        <Image
          src={product.image}
          alt={product.title}
          fill
          className="object-contain"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
      </div>
      <p className="font-medium text-sm line-clamp-2">{product.title}</p>
      <p className="text-gray-500 text-xs">
        ★ {product.rating.rate} ({product.rating.count})
      </p>
      <p className="font-bold">${product.price.toFixed(2)}</p>
      {/* Add to cart needs client interactivity — extract to a child island if needed */}
      <button className="mt-auto bg-blue-600 text-white rounded px-3 py-1 text-sm">
        Add to cart
      </button>
    </div>
  );
}
