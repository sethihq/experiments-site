import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Instrument_Serif } from "next/font/google";
import { cn } from "@/lib/cn";
import { KeyboardNav } from "@/components/keyboard-nav";
import { CommandMenu } from "@/components/command-menu";
import { ThemeProvider } from "@/components/theme-provider";
import { FloatingControls } from "@/components/settings-panel";
import { siteConfig } from "@/lib/og-utils";
import "./globals.css";

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-serif",
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f5f5" },
    { media: "(prefers-color-scheme: dark)", color: "#080808" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: "Gallery | Experiments",
    template: "%s | Gallery",
  },
  description: siteConfig.description,
  keywords: [
    "WebGL",
    "Three.js",
    "Shaders",
    "Interactive",
    "Experiments",
    "Creative Coding",
    "Generative Art",
    "3D Graphics",
  ],
  authors: [{ name: "Gallery" }],
  creator: "Gallery",
  publisher: "Gallery",
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
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: "Gallery | Experiments",
    description: siteConfig.description,
  },
  twitter: {
    card: "summary_large_image",
    title: "Gallery | Experiments",
    description: siteConfig.description,
    creator: "@gallery",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  manifest: "/manifest.json",
  alternates: {
    canonical: siteConfig.url,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen antialiased",
          GeistSans.className,
          GeistMono.variable,
          instrumentSerif.variable
        )}
        suppressHydrationWarning
      >
        <ThemeProvider>
          <KeyboardNav />
          <CommandMenu />
          {children}
          <FloatingControls />
        </ThemeProvider>
      </body>
    </html>
  );
}
