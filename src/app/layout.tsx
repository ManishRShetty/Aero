import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Aero // Face-Controlled Flappy Bird",
  description: "Real-time AI facial expression controlled Flappy Bird powered by ResNet18 FER-2013 deep learning inference.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen flex flex-col bg-cyber-dark text-slate-100 selection:bg-cyber-neon selection:text-slate-950">
        {children}
      </body>
    </html>
  );
}
