import type { Metadata } from "next";
import { ConditionalClerkProvider } from "@/components/ConditionalClerkProvider";
import { AuthProvider } from "@/components/AuthContext";
import localFont from "next/font/local";
import "./globals.css";
import { ConvexClientProvider } from "@/components/ConvexClientProvider";
import ConditionalHeader from "@/components/ConditionalHeader";
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ConditionalClerkProvider>
          <AuthProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <ConvexClientProvider>
                <ConditionalHeader />
                <PWARegister />
                {children}
                <Toaster />
              </ConvexClientProvider>
            </ThemeProvider>
          </AuthProvider>
        </ConditionalClerkProvider>
      </body>
    </html>
  );
}