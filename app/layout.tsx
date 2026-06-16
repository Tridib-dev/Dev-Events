import type { Metadata } from "next";
import { Schibsted_Grotesk,Martian_Mono, Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import LightRays from '@/components/LightRays';
import Navbar from "@/components/Navbar";



const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const SchibstedGrotesk = Schibsted_Grotesk({
  variable: "--font-schibsted-grotesk",
  subsets: ["latin"],
});

const MartianMono = Martian_Mono({
  variable: "--font-martian-mono",
  subsets: ["latin"],
});

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
    <html
      lang="en" className={cn("font-sans", geist.variable)}
    >
      <Navbar/>
      <body className={`${SchibstedGrotesk.variable} ${MartianMono.variable} min-h-screen h-full antialiased`}>
        <div className="absolute inset-0 top-0 z -[-1] min-h-screen">
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
        {children}
      </body>
    </html>
  );
}
