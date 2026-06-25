import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { Bebas_Neue, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import { LenisProvider } from "@/components/providers/lenis-provider";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Cursor } from "@/components/ui/cursor";
import { ProgressBar } from "@/components/ui/progress-bar";
import { getDesign, getSEO } from "@/lib/store";
import { DesignProvider } from "@/lib/design-context";
import { PageTransition } from "@/components/ui/page-transition";
import { Preloader } from "@/components/ui/preloader";
import { SoundProvider } from "@/components/ui/sound-provider";
import "./globals.css";

export const dynamic = "force-dynamic";

export const viewport: Viewport = {
  themeColor: "#080808",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

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

function buildGoogleFontsUrl(fonts: { display?: string; heading?: string; body?: string; accent?: string }) {
  const families = [...new Set([fonts.display, fonts.heading, fonts.body, fonts.accent].filter(Boolean) as string[])];
  const params = families
    .map((f) => `family=${encodeURIComponent(f)}:wght@300;400;500;700`)
    .join("&");
  return `https://fonts.googleapis.com/css2?${params}&display=swap`;
}

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSEO();
  const canonicalBase = seo.canonicalBaseUrl || "https://rizkyirawan.xyz";
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
      icon: "/favicon.svg",
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
  const design = await getDesign();

  const displayFont = design?.fonts?.display || "Bebas Neue";
  const headingFont = design?.fonts?.heading || "IBM Plex Sans";
  const bodyFont = design?.fonts?.body || "IBM Plex Sans";
  const accentFont = design?.fonts?.accent || "IBM Plex Mono";

  const googleFontsUrl = buildGoogleFontsUrl({ display: displayFont, heading: headingFont, body: bodyFont, accent: accentFont });

  const cssVars = {
    "--signal": design?.colors?.signal ?? "#ff3500",
    "--black": design?.colors?.black ?? "#080808",
    "--white": design?.colors?.white ?? "#f0f0ee",
    "--grey": design?.colors?.grey ?? "#7a7a76",
    "--font-display": `'${displayFont}', sans-serif`,
    "--font-heading": `'${headingFont}', sans-serif`,
    "--font-body": `'${bodyFont}', sans-serif`,
    "--font-mono": `'${accentFont}', monospace`,
    "--border-radius": design?.layout?.borderRadius ?? "4px",
    "--container-max": design?.layout?.containerWidth ?? "1280px",
    "--header-h": design?.layout?.headerHeight ?? "64px",
    "--grid-gap": design?.layout?.gridGap ?? "24px",
  } as React.CSSProperties;

  let pathname = "/";
  try {
    const headersList = await headers();
    pathname = headersList.get("x-invoke-pathname") || headersList.get("x-matched-path") || "/";
  } catch {
    pathname = "/";
  }
  const isAdmin = pathname.startsWith("/admin");

  return (
    <html
      lang="en"
      className={`${bebas.variable} ${ibm.variable} ${ibmMono.variable}`}
      style={cssVars}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href={googleFontsUrl} rel="stylesheet" />
      </head>
      <body className="bg-black text-white antialiased min-h-screen" suppressHydrationWarning>
        <SoundProvider>
          <Preloader />
          <DesignProvider design={design}>
            <LenisProvider>
              <ProgressBar />
              {!isAdmin && <Cursor />}
              <Header />
              <main><PageTransition>{children}</PageTransition></main>
              <Footer />
            </LenisProvider>
          </DesignProvider>
        </SoundProvider>
      </body>
    </html>
  );
}
