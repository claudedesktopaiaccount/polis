import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import GdprBanner from "@/components/GdprBanner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  title: "Progressive Tracker — Slovenské prieskumy a predikcie",
  description:
    "Agregátor prieskumov, predikcie volieb, koaličný simulátor a tipovanie pre slovenské parlamentné voľby.",
  openGraph: {
    type: "website",
    locale: "sk_SK",
    siteName: "Progressive Tracker",
    title: "Progressive Tracker — Slovenské prieskumy a predikcie",
    description:
      "Agregátor prieskumov, predikcie volieb, koaličný simulátor a tipovanie pre slovenské parlamentné voľby.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sk">
      <body className={`${inter.variable} font-sans antialiased bg-[#FAFAFA] text-neutral-800`}>
        <Navbar />
        <main>{children}</main>
        <Footer />
        <GdprBanner />
      </body>
    </html>
  );
}
