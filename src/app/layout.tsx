import type { Metadata } from "next";
import { Inter, Newsreader } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import GdprBanner from "@/components/GdprBanner";
import ThemeProvider from "@/components/ThemeProvider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin", "latin-ext"],
  style: ["normal", "italic"],
  weight: ["400", "500", "600", "700"],
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const theme = (cookieStore.get("theme")?.value as "light" | "dark") || "light";

  return (
    <html lang="sk" className={theme}>
      <body className={`${inter.variable} ${newsreader.variable} font-sans antialiased`}>
        <ThemeProvider initialTheme={theme}>
          <Navbar />
          <main>{children}</main>
          <Footer />
          <GdprBanner />
        </ThemeProvider>
      </body>
    </html>
  );
}
