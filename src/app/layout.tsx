import type { Metadata } from "next";
import { Inter, Space_Grotesk, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import { LenisProvider } from "@/components/providers/lenis-provider";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { siteConfig } from "@/lib/data";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://rizkyirawan.com"),
  title: {
    default: siteConfig.title,
    template: `%s — ${siteConfig.name}`,
  },
  description: siteConfig.description,
  authors: [{ name: siteConfig.name }],
  creator: siteConfig.name,
  openGraph: {
    type: "website",
    locale: "en_US",
    title: siteConfig.title,
    description: siteConfig.description,
    siteName: siteConfig.name,
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable} ${instrumentSerif.variable} ${jetbrainsMono.variable} antialiased`}
    >
      <body className="grain min-h-screen bg-background text-foreground">
        <LenisProvider>
          <Header />
          <main className="flex min-h-screen flex-col">{children}</main>
          <Footer />
        </LenisProvider>
      </body>
    </html>
  );
}
