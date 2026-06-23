import type { Metadata } from "next";
import { headers } from "next/headers";
import { Bebas_Neue, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import { LenisProvider } from "@/components/providers/lenis-provider";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Cursor } from "@/components/ui/cursor";
import { AmbientSound } from "@/components/ui/ambient-sound";
import { ProgressBar } from "@/components/ui/progress-bar";
import { getDesign, getSEO } from "@/lib/store";
import { PageTransition } from "@/components/ui/page-transition";
import "./globals.css";

export const dynamic = "force-dynamic";

const bebas = Bebas_Neue({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const ibm = IBM_Plex_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  display: "swap",
});

const ibmMono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

export function generateMetadata(): Metadata {
  const seo = getSEO();
  const canonicalBase = seo.canonicalBaseUrl || "https://rizkyirawan.com";
  return {
    metadataBase: new URL(canonicalBase),
    title: {
      default: seo.siteName,
      template: seo.titleTemplate || `%s — ${seo.siteName}`,
    },
    description: seo.defaultDescription,
    authors: [{ name: seo.siteName }],
    creator: seo.siteName,
    keywords: ["visual artist", "3D design", "motion graphics", "illustration", "portfolio", "Indonesia"],
    openGraph: {
      type: "website",
      locale: "en_US",
      url: canonicalBase,
      title: seo.siteName,
      description: seo.defaultDescription,
      siteName: seo.siteName,
      images: seo.ogImage ? [{ url: seo.ogImage, width: 1200, height: 630 }] : [],
    },
    twitter: seo.twitterHandle ? {
      card: "summary_large_image",
      site: seo.twitterHandle,
      creator: seo.twitterHandle,
    } : { card: "summary_large_image" },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    icons: {
      icon: "/favicon.ico",
      apple: "/apple-touch-icon.png",
    },
    manifest: "/manifest.json",
    appleWebApp: {
      capable: true,
      statusBarStyle: "black-translucent",
      title: seo.siteName,
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const design = getDesign();
  const cssVars = {
    "--signal": design.colors.signal,
    "--black": design.colors.black,
    "--white": design.colors.white,
    "--grey": design.colors.grey,
  } as React.CSSProperties;

  const headersList = await headers();
  const pathname = headersList.get("x-invoke-pathname") || headersList.get("x-matched-path") || "/";
  const isAdmin = pathname.startsWith("/admin");

  return (
    <html
      lang="en"
      className={`${bebas.variable} ${ibm.variable} ${ibmMono.variable}`}
    >
      <body className="bg-black text-white antialiased min-h-screen" style={cssVars} suppressHydrationWarning>
        <LenisProvider>
          <ProgressBar />
          {!isAdmin && <Cursor />}
          {!isAdmin && <AmbientSound />}
          <Header />
          <main><PageTransition>{children}</PageTransition></main>
          <Footer />
        </LenisProvider>
      </body>
    </html>
  );
}
