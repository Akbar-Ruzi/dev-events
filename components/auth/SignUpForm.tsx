"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

const SignUpForm = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const name = (form.elements.namedItem("name") as HTMLInputElement).value.trim();
    const email = (form.elements.namedItem("email") as HTMLInputElement).value.trim();
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;
    const phone = (form.elements.namedItem("phone") as HTMLInputElement).value.trim() || undefined;

    setIsSubmitting(true);
    const toastId = toast.loading("Creating account...");

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, phone }),
    });

    const data = await res.json();
    setIsSubmitting(false);

    if (!res.ok) {
      toast.error(data.message || "Signup failed.", { id: toastId });
      return;
    }

    toast.success("Account created! Please sign in.", { id: toastId });
    router.push("/auth/sign-in");
  };

  return (
    <div className="event-form">
      <h1>Create Account</h1>
      <form onSubmit={handleSubmit} noValidate>
        <div className="form-field">
          <label htmlFor="name">Name</label>
          <input type="text" id="name" name="name" required />
        </div>
        <div className="form-field">
          <label htmlFor="email">Email</label>
          <input type="email" id="email" name="email" required />
        </div>
        <div className="form-field">
          <label htmlFor="password">Password</label>
          <input type="password" id="password" name="password" required />
        </div>
        <div className="form-field">
          <label htmlFor="phone">Phone (optional)</label>
          <input type="tel" id="phone" name="phone" />
        </div>
        <button type="submit" className="button-submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create Account"}
        </button>
        <p>
          Already have an account?{" "}
          <Link href="/auth/sign-in">Sign in</Link>
        </p>
      </form>
    </div>
  );
};

export default SignUpForm;