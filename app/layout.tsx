import type { Metadata } from "next";
import "./globals.css";
import { cn } from "@/lib/utils";
import LightRays from "@/components/LightRays";
import Navbar from "@/components/Navbar";
import { Toaster } from "sonner";
import { Suspense } from "react";


export const metadata: Metadata = {
  title: "Welcome to Dev Event",
  description: "The Hub For Every Dev Event That You Mustn't Miss !",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans")}>
      <body className="min-h-screen h-full antialiased">
        <Toaster richColors position="top-center" />
        <Suspense fallback={null}>
          <Navbar />
        </Suspense>
        <div className="absolute inset-0 top-0 z-[-1] min-h-screen">
          <LightRays
            raysOrigin="top-center-offset"
            raysColor="#06B6D4"
            raysSpeed={0.5}
            lightSpread={0.9}
            rayLength={3}
            followMouse={true}
            mouseInfluence={0.02}
            noiseAmount={0.01}
            distortion={0.01}
            className="custom-rays"
            pulsating={false}
            fadeDistance={1}
            saturation={1}
          />
        </div>
        <main>{children}</main>
      </body>
    </html>
  );
}
