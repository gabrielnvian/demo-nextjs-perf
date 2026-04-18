"use client"; // ❌ this is fine IF the component actually uses client features,
               // but it forces everything rendered after it in the same tree to also be client

interface NavProps {
  onToggleDark: () => void;
  darkMode: boolean;
}

export default function Nav({ onToggleDark, darkMode }: NavProps) {
  return (
    <nav className="bg-white dark:bg-gray-900 border-b px-4 py-3 flex items-center justify-between">
      <span className="font-bold text-lg">PerfShop</span>
      <div className="flex gap-4 items-center">
        <a href="/" className="hover:underline">Home</a>
        <a href="/products" className="hover:underline">Products</a>
        <button
          onClick={onToggleDark}
          className="px-3 py-1 rounded border text-sm"
        >
          {darkMode ? "Light" : "Dark"}
        </button>
      </div>
    </nav>
  );
}
