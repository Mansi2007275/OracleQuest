import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "@/components/providers";
import { TestnetBanner } from "@/components/testnet-banner";
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
  title: "OracleQuest | Neubrutalist AI Prediction Marketplace",
  description: "Debate, predict, and win on Somnia Network high-throughput EVM prediction markets.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#FFFDF0] text-black font-sans font-semibold">
        <Providers>
          <TestnetBanner />
          {children}
        </Providers>
      </body>
    </html>
  );
}

