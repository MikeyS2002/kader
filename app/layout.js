import { Bricolage_Grotesque, Instrument_Sans, Spline_Sans_Mono } from "next/font/google";

import { GridOverlay } from "@/components/grid-overlay";
import { Menu } from "@/components/menu";

import "./globals.css";

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
  metadataBase: new URL("https://kader-rho.vercel.app"),
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
      "@id": "https://kader-rho.vercel.app/#organization",
      name: "Kader",
      url: "https://kader-rho.vercel.app",
      logo: "https://kader-rho.vercel.app/icon",
      slogan: "elke studio in beeld",
    },
    {
      "@type": "WebSite",
      name: "Kader",
      url: "https://kader-rho.vercel.app",
      inLanguage: "nl",
      publisher: { "@id": "https://kader-rho.vercel.app/#organization" },
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
      </body>
    </html>
  );
}
