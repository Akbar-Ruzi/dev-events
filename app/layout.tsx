import type { Metadata } from "next";
import { Schibsted_Grotesk, Martian_Mono } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import LightRays from '@/components/LightRays';
import Navbar from "@/components/Navbar";
import { Toaster } from 'react-hot-toast';
import { NavbarLockProvider } from "@/lib/context/navbar-lock-context";
import { auth } from "@/auth";

const schibstedGrotesk = Schibsted_Grotesk({
  variable: "--font-schibsted-grotesk",
  subsets: ["latin"],
});

const martianMono = Martian_Mono({
  variable: "--font-martian_mono",
  subsets: ["latin"],
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
            role: session.user.role,
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
    <html lang="en">
      <body
        className={`${schibstedGrotesk.variable} ${martianMono.variable} min-h-screen antialiased`}
      >
        <NavbarLockProvider>
          <Suspense fallback={null}>
            <NavbarWithAuth />
          </Suspense>
          <div className="absolute inset-0 top-0 z-[-1] min-h-screen">
            <LightRays
              raysOrigin="top-center-offset"
              raysColor="#5dfeca"
              raysSpeed={0.5}
              lightSpread={0.9}
              rayLength={1.4}
              followMouse={true}
              mouseInfluence={0.02}
              noiseAmount={0.0}
              distortion={0.01}
            />
          </div>
          <main>
            {children}
          </main>
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
