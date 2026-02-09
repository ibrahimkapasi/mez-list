import type { Metadata, Viewport } from "next";
import { Inter, Poppins, Dancing_Script } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const poppins = Poppins({ 
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins"
});
const dancingScript = Dancing_Script({ 
  subsets: ["latin"],
  variable: "--font-dancing"
});

export const viewport: Viewport = {
  themeColor: "#FF6B9D",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "Mezlist - Our Little Universe",
  description: "Where your dreams are safe with me ✨",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Mezlist",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${poppins.variable} ${dancingScript.variable} font-sans bg-background text-text`}>
        {children}
      </body>
    </html>
  );
}
