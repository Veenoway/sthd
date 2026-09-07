import type { Metadata } from "next";
import { Red_Hat_Mono, Red_Hat_Text } from "next/font/google";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import "./globals.css";

const sans = Red_Hat_Text({
  variable: "--font-redhat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const mono = Red_Hat_Mono({
  variable: "--font-redhat-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Deployr",
    template: "%s · Deployr",
  },
  description:
    "Treasury-funded infrastructure for launching memecoins. Tweet a ticker — Deployr deploys it on Robinhood Chain, Solana, Base, or Ethereum. Zero markup.",
  metadataBase: new URL("https://deployr.tech"),
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${sans.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
