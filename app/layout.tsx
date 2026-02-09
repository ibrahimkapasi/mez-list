import type { Metadata, Viewport } from "next";
import { Quicksand, Dancing_Script } from "next/font/google";
import "./globals.css";

const quicksand = Quicksand({ 
  subsets: ["latin"], 
  variable: "--font-quicksand",
  weight: ["300", "400", "500", "600", "700"]
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

import { cookies } from "next/headers";
import IdentityCheck from "@/components/IdentityCheck";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const identity = cookieStore.get('mezlist_user')?.value;

  return (
    <html lang="en">
      <body className={`${quicksand.variable} ${dancingScript.variable} font-sans bg-background text-text`}>
        <IdentityCheck existingIdentity={identity} />
        {children}
      </body>
    </html>
  );
}
