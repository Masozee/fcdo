import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Toaster } from "sonner";
import Script from "next/script";
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
      <head>
        {/* Google Analytics - Using next/script for proper loading */}
        <Script 
          src="https://www.googletagmanager.com/gtag/js?id=G-ND2RG57LN5"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-ND2RG57LN5');
          `}
        </Script>
      </head>
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
