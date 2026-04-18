// ✅ Server Component — static nav links need no client JS.
//    The dark-mode toggle is a single small client island (NavInteractive).
import NavInteractive from "./NavInteractive";

export default function Nav() {
  return (
    <nav className="bg-white border-b px-4 py-3 flex items-center justify-between">
      <span className="font-bold text-lg">PerfShop</span>
      <div className="flex gap-4 items-center">
        <a href="/" className="hover:underline">Home</a>
        <a href="/products" className="hover:underline">Products</a>
        {/* Only this button needs client JS — keep the island small */}
        <NavInteractive />
      </div>
    </nav>
  );
}
