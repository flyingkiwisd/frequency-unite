import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { isClerkConfigured } from "@/lib/config";
import { ClerkProvider } from "@clerk/nextjs";
import { AuthProvider } from "@/lib/supabase/AuthProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Frequency Unite | Steward Operating System",
  description: "The operating system powering Frequency's conscious investing ecosystem — envision, fund, and implement the world we want to leave to our children.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const body = (
    <body
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      <AuthProvider>
        {children}
      </AuthProvider>
    </body>
  );

  if (isClerkConfigured) {
    return (
      <ClerkProvider>
        <html lang="en" className="dark">
          {body}
        </html>
      </ClerkProvider>
    );
  }

  return (
    <html lang="en" className="dark">
      {body}
    </html>
  );
}
