import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import SignUpForm from "@/components/auth/SignUpForm";

async function RedirectIfSignedIn() {
  const session = await auth();
  if (session?.user) redirect("/");
  return null;
}

export default function SignUpPage() {
  return (
    <>
      <Suspense fallback={null}>
        <RedirectIfSignedIn />
      </Suspense>

      <div className="auth-page">
        <SignUpForm />
      </div>
    </>
  );
}