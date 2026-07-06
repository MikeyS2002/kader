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
  title: "Kader — elke studio in beeld",
  description:
    "Kader is de plek waar makers hun volgende studio vinden: foto, video en podcast, op één kaart, zonder gedoe.",
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
      </body>
    </html>
  );
}
