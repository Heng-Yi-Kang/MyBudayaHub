import type { Metadata } from "next";
import { Outfit, Playfair_Display } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "MyBudayaHub — Intangible Cultural Heritage Documentation",
  description:
    "Document, preserve, and celebrate intangible cultural heritage with AI-powered imagery. Submit traditions, crafts, and living heritage for posterity.",
  keywords: [
    "intangible cultural heritage",
    "UNESCO",
    "cultural preservation",
    "heritage documentation",
    "AI image generation",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${outfit.variable} ${playfair.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
