'use client';

import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { usePathname } from "next/navigation";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "📊 Processar XML" },
    { href: "/visualizar", label: "📄 Visualizar XML" },
    { href: "/totalizadores", label: "🧮 Totalizadores" },
    { href: '/SomaIndividualXML', label: '💰 Soma Individual' },
  ];

  return (
    <html lang="pt-BR">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased flex min-h-screen`}>
        {/* Sidebar */}
        <aside className="w-64 bg-blue-800 text-white flex flex-col justify-between py-6 px-4 shadow-lg transition-all duration-300">
          <div>
            <h1 className="text-2xl font-bold mb-8 text-center border-b border-blue-600 pb-3">
              Ler XML
            </h1>
            <nav className="flex flex-col gap-4">
              {links.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`
                      py-3 px-4 rounded-lg font-bold text-lg text-white shadow-md transition-all duration-200 transform text-center
                      ${isActive ? "bg-gradient-to-r from-blue-600 to-blue-500 scale-105" : "hover:scale-105 hover:bg-gradient-to-r hover:from-blue-500 hover:to-blue-400"}
                    `}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="text-xs text-center text-blue-200 mt-8">
            © 2025 - Solus Computação
          </div>
        </aside>

        {/* Conteúdo */}
        <main className="flex-1 bg-gray-50 p-8 text-gray-800 overflow-y-auto">
          {children}
        </main>
      </body>
    </html>
  );
}
