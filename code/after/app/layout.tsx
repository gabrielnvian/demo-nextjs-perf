// ✅ No "use client" — this is a Server Component.
//    Dark mode toggle is extracted to a small client island (NavInteractive).
import Nav from "./components/Nav";
import "./globals.css";

export const metadata = {
  title: "PerfShop",
  description: "A performance-optimized Next.js storefront",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Nav />
        <main className="container mx-auto px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
