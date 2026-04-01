import type { Metadata } from "next";
import { Inter, Newsreader, Dancing_Script, JetBrains_Mono } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import GdprBanner from "@/components/GdprBanner";
import UmamiAnalytics from "@/components/UmamiAnalytics";
import ThemeProvider from "@/components/ThemeProvider";
import { AuthProvider } from "@/components/AuthProvider";
import { ViewTransition } from "react";
import PageNumber from "@/components/PageNumber";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION, SITE_LOCALE } from "@/lib/site-config";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
});

const dancingScript = Dancing_Script({
  variable: "--font-dancing",
  subsets: ["latin", "latin-ext"],
  weight: ["700"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin", "latin-ext"],
  style: ["normal", "italic"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Polis — Slovenské prieskumy a predikcie",
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    type: "website",
    locale: SITE_LOCALE,
    siteName: SITE_NAME,
    title: "Polis — Slovenské prieskumy a predikcie",
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: "Polis — Slovenské prieskumy a predikcie",
    description: SITE_DESCRIPTION,
  },
};

const SW_REGISTRATION_SCRIPT = `if('serviceWorker'in navigator){window.addEventListener('load',function(){navigator.serviceWorker.register('/sw.js').catch(function(){});})}`;

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
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "WebSite",
                  "@id": `${SITE_URL}/#website`,
                  name: SITE_NAME,
                  url: SITE_URL,
                  description: SITE_DESCRIPTION,
                  inLanguage: "sk",
                  publisher: { "@id": `${SITE_URL}/#organization` },
                },
                {
                  "@type": "Organization",
                  "@id": `${SITE_URL}/#organization`,
                  name: SITE_NAME,
                  url: SITE_URL,
                },
              ],
            }),
          }}
        />
      </head>
      <body className={`${inter.variable} ${newsreader.variable} ${dancingScript.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        <ThemeProvider initialTheme={theme}>
          <AuthProvider>
            <a href="#main-content" className="skip-link">
              Preskočiť na obsah
            </a>
            <Navbar />
            <main id="main-content" style={{ viewTransitionName: "page-content" }}>
              <ViewTransition>{children}</ViewTransition>
            </main>
            <Footer />
            <PageNumber />
            <GdprBanner />
            <UmamiAnalytics />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
