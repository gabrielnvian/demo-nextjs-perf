"use client"; // ❌ entire layout is a client component because of this one line

import { useState } from "react";
import Nav from "./components/Nav";
import "./globals.css";

export default function RootLayout({
 children,
}: {
 children: React.ReactNode;
}) {
 // Dark mode toggle lives here - forces "use client" on the root layout,
 // which cascades to every child rendered inside it.
 const [darkMode, setDarkMode] = useState(false);

 return (
 <html lang="en" className={darkMode ? "dark" : ""}>
 <body>
 <Nav onToggleDark={() => setDarkMode((d) => !d)} darkMode={darkMode} />
 <main className="container mx-auto px-4 py-8">{children}</main>
 </body>
 </html>
 );
}
