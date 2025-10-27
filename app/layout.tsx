import type { Metadata } from "next";
import localFont from "next/font/local";
import { SessionProvider } from "./providers";
import { ThemeProvider } from "./components/ThemeProvider";
import { Header } from "./components/Header";
import "./globals.css";

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
  title: "SteppersLife - Chicago Steppin Community Platform",
  description:
    "One platform for restaurants, events, stores, classes, and services in the Chicago Steppin community",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icons/light-icon-72x72.png", sizes: "72x72", type: "image/png" },
      {
        url: "/icons/light-icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        url: "/icons/light-icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    apple: [
      {
        url: "/icons/light-icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const fbAppId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || '1234567890';

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta property="fb:app_id" content={fbAppId} />
      </head>
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
            <Header />
            {children}
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
