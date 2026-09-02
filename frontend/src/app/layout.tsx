import type { Metadata } from "next";
import { Montserrat, Open_Sans } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const montserrat = Montserrat({ subsets: ["latin"], variable: "--font-heading" });
const openSans = Open_Sans({ subsets: ["latin"], variable: "--font-body" });

export const metadata: Metadata = {
  title: "Bangpho Coffee & Beer — First Specialty Coffee Workspace",
  description:
    "Bangpho's first specialty coffee workspace. 40 THB americano, 100+ Mbps WiFi, craft beer on tap.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${montserrat.variable} ${openSans.variable}`}>
      <head>
        <link rel="stylesheet" href="/scrollcraft.css" />
      </head>
      <body>
        {children}
        <Script src="/scrollcraft.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
