import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Card Pricy – MTG Price Aggregator",
  description: "Aggregate Magic: The Gathering card prices from multiple marketplaces",
  icons: {
    icon: '/CardPricyLogo.png',
    shortcut: '/CardPricyLogo.png',
    apple: '/CardPricyLogo.png'
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
