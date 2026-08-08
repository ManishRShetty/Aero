import type { Metadata } from "next";
import { Press_Start_2P, VT323 } from "next/font/google";
import "./globals.css";

const pressStart2P = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-pixel",
});

const vt323 = VT323({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-arcade",
});

export const metadata: Metadata = {
  title: "AERO // Pixel Face-Controlled Flappy Bird",
  description: "Light mode 8-bit retro pixel art face-controlled Flappy Bird powered by ResNet18 AI expression inference.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${pressStart2P.variable} ${vt323.variable}`}>
      <body className="min-h-screen flex flex-col bg-sky-100 text-slate-900 font-pixel selection:bg-yellow-300 selection:text-slate-950">
        {children}
      </body>
    </html>
  );
}
