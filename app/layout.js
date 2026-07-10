import { Bricolage_Grotesque, Instrument_Sans, Spline_Sans_Mono } from "next/font/google";
import Script from "next/script";

import { GridOverlay } from "@/components/grid-overlay";
import { Menu } from "@/components/menu";

import { SITE_URL } from "@/lib/site";

import "./globals.css";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

// Display — koppen & wordmark
const bricolage = Bricolage_Grotesque({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["300", "400", "600", "700", "800"],
  display: "swap",
});

// Body — lopende tekst & interface
const instrument = Instrument_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

// Data — specs, prijzen, labels
const splineMono = Spline_Sans_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Kader — elke studio in beeld",
    template: "%s — Kader",
  },
  description:
    "Kader is de plek waar makers hun volgende studio vinden: foto, video en podcast, op één kaart, zonder gedoe.",
  applicationName: "Kader",
  openGraph: {
    siteName: "Kader",
    locale: "nl_NL",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
  },
};

const SITE_JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "Kader",
      url: SITE_URL,
      logo: `${SITE_URL}/icon`,
      slogan: "elke studio in beeld",
    },
    {
      "@type": "WebSite",
      name: "Kader",
      url: SITE_URL,
      inLanguage: "nl",
      publisher: { "@id": `${SITE_URL}/#organization` },
    },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="nl"
      className={`${bricolage.variable} ${instrument.variable} ${splineMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        {children}
        <Menu />
        <GridOverlay />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(SITE_JSON_LD) }}
        />
        {GA_ID ? (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_ID}');`}
            </Script>
          </>
        ) : null}
      </body>
    </html>
  );
}
