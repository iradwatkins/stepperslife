import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ConvexClientProvider } from "@/components/ConvexClientProvider";
import Header from "@/components/Header";
import SessionProvider from "@/components/SessionProvider";
import SyncUserWithConvex from "@/components/SyncUserWithConvex";
import PWARegister from "@/components/PWARegister";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/ThemeProvider";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "SteppersLife - Event Tickets Marketplace",
  description: "Buy and sell event tickets securely",
  manifest: "/manifest.json",
  themeColor: "#8B5CF6",
  viewport: "width=device-width, initial-scale=1, maximum-scale=5",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SessionProvider>
            <ConvexClientProvider>
              <Header />
              <SyncUserWithConvex />
              <PWARegister />
              {children}
              <Toaster />
            </ConvexClientProvider>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
