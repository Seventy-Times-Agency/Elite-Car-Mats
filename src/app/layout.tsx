import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { FloatingCTA } from "@/components/layout/FloatingCTA";
import { CartProvider } from "@/context/CartContext";

const inter = localFont({
  src: "./fonts/inter-var.woff2",
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Elite Car Mats — Премиальные EVA коврики для авто",
    template: "%s | Elite Car Mats",
  },
  description:
    "Индивидуальные автоковрики из EVA материала премиум-класса. Точная подгонка под вашу модель авто. Доставка по США.",
  keywords: [
    "автоковрики",
    "EVA коврики",
    "коврики в машину",
    "car mats",
    "EVA mats",
    "elite car mats",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <CartProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <FloatingCTA />
        </CartProvider>
      </body>
    </html>
  );
}
