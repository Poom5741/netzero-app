import type { Metadata, Viewport } from "next";
import "./globals.css";

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
    <html lang="th" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Fira+Sans:wght@300;400;500;600;700&family=Noto+Sans+Thai:wght@300;400;500;600;700&family=Fira+Mono:wght@400;500&family=Material+Symbols+Outlined&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-full flex flex-col font-sans" style={{ fontFamily: '"Fira Sans", "Noto Sans Thai", "Fira Mono", system-ui, sans-serif' }}>{children}</body>
    </html>
  );
}
