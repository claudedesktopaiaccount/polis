import type { Metadata } from "next";
import { Inter, Newsreader } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import GdprBanner from "@/components/GdprBanner";
import ThemeProvider from "@/components/ThemeProvider";
import { ViewTransition } from "react";
import PageNumber from "@/components/PageNumber";

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
  title: "Polis — Slovenské prieskumy a predikcie",
  description:
    "Agregátor prieskumov, predikcie volieb, koaličný simulátor a tipovanie pre slovenské parlamentné voľby.",
  openGraph: {
    type: "website",
    locale: "sk_SK",
    siteName: "Progressive Tracker",
    title: "Polis — Slovenské prieskumy a predikcie",
    description:
      "Agregátor prieskumov, predikcie volieb, koaličný simulátor a tipovanie pre slovenské parlamentné voľby.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Polis — Slovenské prieskumy a predikcie",
    description:
      "Agregátor prieskumov, predikcie volieb, koaličný simulátor a tipovanie pre slovenské parlamentné voľby.",
  },
};

const SW_REGISTRATION_SCRIPT = `if('serviceWorker'in navigator){window.addEventListener('load',function(){navigator.serviceWorker.register('/sw.js').catch(function(){});})}`;

const LD_JSON = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Progressive Tracker",
  url: "https://progresivne.sk",
  description:
    "Agregátor prieskumov, predikcie volieb, koaličný simulátor a tipovanie pre slovenské parlamentné voľby.",
  inLanguage: "sk",
});

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const theme = (cookieStore.get("theme")?.value as "light" | "dark") || "light";

  return (
    <html lang="sk" className={theme}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#111110" />
        {/* Service worker registration — static string, no user input */}
        <script
          dangerouslySetInnerHTML={{ __html: SW_REGISTRATION_SCRIPT }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: LD_JSON }}
        />
      </head>
      <body className={`${inter.variable} ${newsreader.variable} font-sans antialiased`}>
        <ThemeProvider initialTheme={theme}>
          <Navbar />
          <main style={{ viewTransitionName: "page-content" }}>
            <ViewTransition>{children}</ViewTransition>
          </main>
          <Footer />
          <PageNumber />
          <GdprBanner />
        </ThemeProvider>
      </body>
    </html>
  );
}
