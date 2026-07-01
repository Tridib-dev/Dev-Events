// app/(site)/layout.tsx
import { Suspense } from "react";
import LightRays from "@/components/LightRays";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer/Footer";



export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
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
      <Suspense fallback={null}>
        <Footer />
      </Suspense>
    </>
  );
}