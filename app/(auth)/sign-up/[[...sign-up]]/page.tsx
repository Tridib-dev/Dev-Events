// app/(auth)/sign-up/[[...sign-up]]/page.tsx
import { SignUp } from "@clerk/nextjs";
import { Suspense } from "react";

export default function SignUpPage() {
  return (
    <Suspense fallback={null}>
      <SignUp routing="path" path="/sign-up" />
    </Suspense>
  );
}