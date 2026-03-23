import type { Metadata } from "next";
import "./globals.css";
import ErrorBoundary from "./components/ErrorBoundary";
import SessionWatcher from "./components/SessionWatcher";
import VersionCheck from "./components/VersionCheck";
import { checkEnvVars } from "./lib/envCheck";
import OneSignalInit from "./components/OneSignalInit";
import { RamadanProvider } from "./lib/RamadanContext";

checkEnvVars()

export const metadata: Metadata = {
  title: "Weekly Reset",
  description: "Your daily wellness companion — rebuild your health slowly and consistently, for free.",
  icons: {
    icon: "/favicon.ico",
    apple: "/favicon.png",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/favicon.png" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#1a1a18" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Weekly Reset" />
      </head>
      <body>
        <ErrorBoundary>
    <RamadanProvider>
    <OneSignalInit />
          <SessionWatcher />
          <VersionCheck />
          {children}
        </RamadanProvider>
</ErrorBoundary>
```
      </body>
    </html>
  );
}
