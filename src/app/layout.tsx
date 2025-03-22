import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Indonesia's Strategic Dependency",
  description: "Explore Indonesia's trade, investment, and supply chain risks with this CSIS dashboard, highlighting key sectors, economic partners, and resilience strategies.",
  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://isdp.csis.or.id",
    siteName: "Indonesia's Strategic Dependency",
    title: "Indonesia's Strategic Dependency",
    description: "Explore Indonesia's trade, investment, and supply chain risks with this CSIS dashboard, highlighting key sectors, economic partners, and resilience strategies.",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Indonesia's Strategic Dependency"
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Indonesia's Strategic Dependency",
    description: "Explore Indonesia's trade, investment, and supply chain risks with this CSIS dashboard, highlighting key sectors, economic partners, and resilience strategies.",
    images: ["/logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground text-base`}
      >
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
        </div>
        <Toaster position="top-right" />
        <SpeedInsights />
      </body>
    </html>
  );
}
