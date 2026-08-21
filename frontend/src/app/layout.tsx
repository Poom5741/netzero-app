import type { Metadata, Viewport } from "next";
import { Inter, Sarabun } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const sarabun = Sarabun({
  variable: "--font-sarabun",
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "NetZeroCarbon",
  description: "ผู้ช่วยเกษตรกรโครงการคาร์บอนเครดิตนาข้าว AWD",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" className={`${inter.variable} ${sarabun.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
