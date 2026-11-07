import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Toaster } from 'react-hot-toast';
import { NavbarLockProvider } from "@/lib/context/navbar-lock-context";
import { auth } from "@/auth";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  fallback: ["system-ui", "sans-serif"],
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  fallback: ["monospace"],
});

export const metadata: Metadata = {
  title: "StackMeet",
  description: "The Hub for Every Dev Event You Mustn't Miss",
};

async function NavbarWithAuth() {
  const session = await auth();

  return (
    <Navbar
      user={
        session?.user
          ? {
            name: session.user.name || null,
            email: session.user.email || null,
          }
          : null
      }
    />
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${jetBrainsMono.variable}`}>
      <body className="flex min-h-screen flex-col antialiased">
        <NavbarLockProvider>
          <Suspense fallback={null}>
            <NavbarWithAuth />
          </Suspense>
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </NavbarLockProvider>
        <Toaster
          position="top-center"
          gutter={10}
          toastOptions={{
            duration: 3200,
            style: {
              background: '#f8fafc',
              color: '#111827',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
            },
            success: {
              iconTheme: { primary: '#59deca', secondary: '#0d161a' },
              style: { border: '1px solid rgba(89, 222, 202, 0.45)' },
            },
            error: {
              iconTheme: { primary: '#f87171', secondary: '#0d161a' },
              style: {
                border: '1px solid rgba(248, 113, 113, 0.45)',
                color: '#f87171',
              },
            },
          }}
        />
      </body>
    </html>
  );
}
