"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useVerify } from "@/app//hooks/useVerify"

const RESEND_SECONDS = 60;

function VerifyForm() {
  const router = useRouter();
  const params = useSearchParams();
  const email = params.get("email") || "";

  const { verifyEmail, resendCode } = useVerify();

  // states
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [cooldown, setCooldown] = useState(RESEND_SECONDS);

  // resend countdown
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  // if no email in parameter then replace the route
  useEffect(() => {
    if (!email) router.replace("/register");
  }, [email, router]);

  // handle the verify otp
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setInfo("");

    // check the code length
    if (code.length !== 6) {
      setError("Enter the 6-digit code");
      return;
    }

    setLoading(true);
    // get the response from server
    const res = await verifyEmail(email, code);
    setLoading(false);

    // if the code is not valid
    if (!res.success) {
      setError(res.message);
      return;
    }
    // if verification is success
    router.push("/");
  };

  // fetch the api for resend code
  const handleResend = async () => {
    setError("");
    setInfo("");

    // send the email to the server
    const res = await resendCode(email);

    // if the response is not success
    if (!res.success) {
      setError(res.message);
      return;
    }
    setInfo("A new code was sent to your email");
    setCooldown(RESEND_SECONDS);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-4">

      {/* The opt form */}
      <form
        onSubmit={handleVerify}
        className="w-full max-w-sm space-y-4 rounded-xl border border-zinc-800 bg-zinc-900 p-6"
      >
        <div>
          <h1 className="text-xl font-semibold text-white">Verify your email</h1>
          <p className="mt-1 text-sm text-zinc-400">
            We sent a 6-digit code to{" "}
            <span className="text-zinc-200">{email}</span>. It expires in 3 minutes.
          </p>
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}
        {info && <p className="text-sm text-green-400">{info}</p>}

        <input
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          placeholder="000000"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
          className="w-full rounded-lg bg-zinc-800 px-4 py-3 text-center text-2xl tracking-[0.5em] text-white placeholder-zinc-600 outline-none focus:ring-2 focus:ring-blue-600"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white disabled:opacity-50"
        >
          {loading ? "Please wait..." : "Verify"}
        </button>

        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-zinc-700" />
          <span className="text-xs text-zinc-500">or</span>
          <div className="h-px flex-1 bg-zinc-700" />
        </div>

        <button
          type="button"
          onClick={handleResend}
          disabled={cooldown > 0}
          className="w-full rounded-lg border border-zinc-700 py-3 text-sm text-zinc-200 disabled:opacity-50"
        >
          {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
        </button>

        <p className="text-center text-sm text-zinc-400">
          Wrong email?{" "}
          <Link href="/register" className="text-blue-400">
            Register again
          </Link>
        </p>
      </form>
    </main>
  );
}

// wrap it with Suspense for control the error and network problem
export default function VerifyPage() {
  return (
    <Suspense fallback={null}>
      <VerifyForm />
    </Suspense>
  );
}
