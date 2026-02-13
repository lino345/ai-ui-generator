import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
 title: "Deterministic AI UI Generator 19",
description: "Multi-step deterministic AI agent that generates and iterates UI components safely.",

};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
    <body
  className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-gradient-to-br from-black via-[#0f0f2d] to-[#1a1a3d] text-white relative overflow-hidden`}
>
  {/* Background Glow Effects */}
  <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-purple-600 opacity-20 blur-3xl rounded-full animate-pulse"></div>
  <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-blue-600 opacity-20 blur-3xl rounded-full animate-pulse"></div>

  <div className="relative z-10">
    {children}
  </div>
</body>

    </html>
  );
}
