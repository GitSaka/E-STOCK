import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gestion de Stock Vivriers - Porto-Novo",
  description: "Application de gestion de stock, micro-crédits et collectes",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased font-sans select-none">
        {children}
      </body>
    </html>
  );
}
