import type { Metadata, Viewport } from "next";
import { ServiceWorkerRegistrar } from "@/components/pwa/ServiceWorkerRegistrar";
import { OfflineIndicator } from "@/components/pwa/OfflineIndicator";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#0d2854",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "Weather Nourie · Live Atmospheric & Forecast App",
  description:
    "Live atmospheric telemetry, regional radar and wind flow, ECMWF vs GFS consensus, air quality, and outdoor planning windows.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "NourieWx",
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/pwa-192x192.png", sizes: "192x192", type: "image/png" },
    ],
    shortcut: "/favicon.svg",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ServiceWorkerRegistrar />
        {children}
        <OfflineIndicator />
      </body>
    </html>
  );
}
