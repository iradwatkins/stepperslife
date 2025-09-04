import type { Metadata } from "next";
import { ConditionalClerkProvider } from "@/components/ConditionalClerkProvider";
import localFont from "next/font/local";
import { Playfair_Display, Dancing_Script } from 'next/font/google';
import "./globals.css";
import { ConvexClientProvider } from "@/components/ConvexClientProvider";
import ConditionalHeader from "@/components/ConditionalHeader";
import PWARegister from "@/components/PWARegister";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/ThemeProvider";
import SyncUserWithConvex from "@/components/SyncUserWithConvex";
import SplashScreen from "@/components/SplashScreen";

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

// Google Fonts for splash screen
const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-playfair',
});

const dancingScript = Dancing_Script({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-dancing',
});

export const metadata: Metadata = {
  title: "SteppersLife - Event Tickets Marketplace",
  description: "Buy and sell event tickets securely",
  manifest: "/manifest.json",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#8B5CF6",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${playfairDisplay.variable} ${dancingScript.variable} antialiased`}
      >
        <ConditionalClerkProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <ConvexClientProvider>
              <SyncUserWithConvex />
              <ConditionalHeader />
              <PWARegister />
              {children}
              <Toaster />
            </ConvexClientProvider>
          </ThemeProvider>
        </ConditionalClerkProvider>
      </body>
    </html>
  );
}