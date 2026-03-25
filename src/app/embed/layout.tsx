import type { Metadata } from "next";
import { Inter, Newsreader } from "next/font/google";
import "../globals.css";

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
  robots: {
    index: false,
    follow: false,
  },
};

export default function EmbedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="sk">
      <head>
        <meta name="robots" content="noindex" />
      </head>
      <body className={`${inter.variable} ${newsreader.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
