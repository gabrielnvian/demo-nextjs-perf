"use client";

// ❌ This heavy component is imported eagerly on the products page - 
// it loads even if the user never scrolls to it.
// It simulates a chart library with a large dependency footprint.

interface Product {
 id: number;
 title: string;
 price: number;
 category: string;
}

interface ChartBar {
 category: string;
 total: number;
 count: number;
}

export default function SalesChart({ data }: { data: Product[] }) {
 // Aggregate sales by category (mimics what a real charting lib would do)
 const byCategory = data.reduce<Record<string, ChartBar>>((acc, p) => {
 if (!acc[p.category]) acc[p.category] = { category: p.category, total: 0, count: 0 };
 acc[p.category].total += p.price;
 acc[p.category].count += 1;
 return acc;
 }, {});

 const bars = Object.values(byCategory);
 const maxTotal = Math.max(...bars.map((b) => b.total), 1);

 return (
 <div className="my-8 p-4 border rounded-lg">
 <h3 className="font-semibold mb-4">Revenue by Category (this month)</h3>
 <div className="space-y-3">
 {bars.map((bar) => (
 <div key={bar.category} className="flex items-center gap-3">
 <span className="w-40 text-sm capitalize truncate">{bar.category}</span>
 <div className="flex-1 bg-gray-100 rounded h-6 relative">
 <div
 className="bg-blue-500 h-full rounded"
 style={{ width: `${(bar.total / maxTotal) * 100}%` }}
 />
 </div>
 <span className="text-sm font-mono w-20 text-right">
 ${bar.total.toFixed(0)}
 </span>
 </div>
 ))}
 </div>
 </div>
 );
}
