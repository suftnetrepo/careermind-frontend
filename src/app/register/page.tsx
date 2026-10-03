"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthShell from "@/components/auth/AuthShell";
import { api } from "@/lib/api";
import { ArrowRight, Gift, LockKeyhole, Mail, User } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    try {
      await api.auth.register({ name, email, password });
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (result?.error) {
        setError("Account created but login failed. Please log in.");
        router.push("/login");
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      action={
        <p className="text-sm text-slate-500">
          Already a member?{" "}
          <Link href="/login" className="ml-1 font-extrabold text-indigo-600">
            Sign in
          </Link>
        </p>
      }
    >
      <span className="inline-flex justify-center items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-xs font-extrabold text-emerald-700">
        <Gift className="h-4 w-4" />
        Your first interview is free
      </span>
      <h1 className="mt-5 text-4xl font-extrabold tracking-[-.05em] text-slate-950">
        Create your account
      </h1>
      <p className="mt-3 text-base leading-7 text-slate-500">
        Start practising in minutes. No card required for your first interview.
      </p>
      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        {[
          {
            label: "Full name",
            type: "text",
            value: name,
            set: setName,
            placeholder: "Your full name",
            icon: User,
            auto: "name",
          },
          {
            label: "Email address",
            type: "email",
            value: email,
            set: setEmail,
            placeholder: "you@example.com",
            icon: Mail,
            auto: "email",
          },
          {
            label: "Password",
            type: "password",
            value: password,
            set: setPassword,
            placeholder: "At least 8 characters",
            icon: LockKeyhole,
            auto: "new-password",
          },
        ].map((field) => (
          <div key={field.label}>
            <label className="mb-2 block text-xs font-extrabold uppercase tracking-[.12em] text-slate-500">
              {field.label}
            </label>
            <div className="relative">
              <field.icon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                className="min-h-14 w-full rounded-2xl border border-slate-200 bg-white pl-12 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                type={field.type}
                placeholder={field.placeholder}
                value={field.value}
                onChange={(e) => field.set(e.target.value)}
                autoComplete={field.auto}
                required
              />
            </div>
          </div>
        ))}
        {error && (
          <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
            {error}
          </div>
        )}
        <button
          type="submit"
          className="flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 font-extrabold text-white shadow-xl shadow-indigo-200 transition hover:-translate-y-0.5 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? (
            "Creating your account..."
          ) : (
            <>
              Create account <ArrowRight className="h-5 w-5" />
            </>
          )}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link href="/login" className="font-extrabold text-indigo-600">
          Sign in
        </Link>
      </p>
      <p className="mt-3 text-center text-xs leading-5 text-slate-400">
        By creating an account you agree to our{" "}
        <Link href="/terms" className="font-semibold text-indigo-500">
          Terms
        </Link>{" "}
        and{" "}
        <Link href="/privacy" className="font-semibold text-indigo-500">
          Privacy Policy
        </Link>
        .
      </p>
    </AuthShell>
  );
}
