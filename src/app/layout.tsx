import type { Metadata } from "next";
import localFont from "next/font/local";
import "./../styles/globals.css";

const circularStd = localFont({
  src: [
    { path: "../fonts/Circular-Std-Book.ttf", weight: "400", style: "normal" },
    { path: "../fonts/Circular-Std-Bold.ttf", weight: "700", style: "normal" },
  ],
  variable: "--font-circular",
  display: "swap",
  preload: true,
});

const siteUrl = "https://seusite.com";

export const metadata: Metadata = {
  title: "Painel Admin | Transforme sua Carreira Farmacêutica",
  authors: [{ name: "Marco Morais" }],
  metadataBase: new URL(siteUrl),
  alternates: { canonical: "/" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={circularStd.variable} suppressHydrationWarning>
      <body className="font-sans antialiased bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100 transition-colors duration-200">
        {children}
      </body>
    </html>
  );
}
