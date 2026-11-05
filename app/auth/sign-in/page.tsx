import { Suspense } from "react";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import SignInForm from "@/components/auth/SignInForm";

async function RedirectIfSignedIn() {
    const session = await auth();
    if (session?.user) redirect("/");
    return null;
}

export default function SignInPage() {
    return (
        <>
            <Suspense fallback={null}>
                <RedirectIfSignedIn />
            </Suspense>
            <div className="auth-page">
                <SignInForm />
            </div>
        </>
    );
}