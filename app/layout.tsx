"use client";

import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { usePathname } from "next/navigation";
import "./globals.css";
import { FiBarChart2, FiFileText, FiList, FiDollarSign } from 'react-icons/fi';

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
    { href: "/", label: "Total da guia", icon: <FiBarChart2 size={18} /> },
    { href: "/visualizar", label: "Visualizar XML", icon: <FiFileText size={18} /> },
    { href: "/totalInformado", label: "Total Informado", icon: <FiList size={18} /> },
    { href: '/SomaIndividualXML', label: 'Soma Individual', icon: <FiDollarSign size={18} /> },
  ];

  return (
    <html lang="pt-BR">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased flex min-h-screen`}>
        {/* Sidebar */}
  <aside className="w-64 bg-primary text-white flex flex-col justify-between py-6 px-4 shadow-lg transition-all duration-300">
          <div>
            <h1 className="text-2xl font-bold mb-8 text-center border-b border-blue-600 pb-3">
              Ler XML
            </h1>
            <nav className="flex flex-col gap-3">
              {links.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`
                      flex items-center gap-3 py-3 px-4 rounded-lg font-medium text-lg text-white shadow-md transition-all duration-200 transform
                      ${isActive ? 'bg-gradient-to-r from-primary to-accent scale-105' : 'hover:scale-105 hover:bg-primary-light/10 hover:bg-opacity-10'}
                    `}
                  >
                    <span className="opacity-90">{link.icon}</span>
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="text-xs text-center text-accent/80 mt-8">
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
