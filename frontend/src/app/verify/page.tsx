"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

export default function VerifyPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = sessionStorage.getItem("pendingEmail");
    if (!saved) router.replace("/register");
    else setEmail(saved);
  }, [router]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/users/verify-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Something went wrong");

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      sessionStorage.removeItem("pendingEmail");
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    setError("");
    setInfo("");
    try {
      await fetch(`${API}/api/users/resend-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setInfo("A new code is on its way.");
    } catch {
      setError("Could not resend the code. Try again.");
    }
  };

  return (
    <main className="min-h-dvh flex items-center justify-center px-5">
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4">
        <h1 className="text-3xl font-bold">Check your email</h1>
        <p className="text-slate-600">Enter the 6-digit code we sent to {email}.</p>

        <input
          className="w-full rounded-md border-2 border-slate-300 py-3 text-center text-3xl font-bold tracking-[0.5em] outline-none focus:border-teal-700"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          placeholder="000000"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
          required
        />

        {error && <p className="text-sm text-red-600">{error}</p>}
        {info && <p className="text-sm text-teal-700">{info}</p>}

        <button
          disabled={loading || code.length < 6}
          className="w-full rounded-md bg-teal-700 py-2.5 font-semibold text-white disabled:opacity-60"
        >
          {loading ? "Please wait..." : "Verify email"}
        </button>

        <p className="text-sm text-slate-600">
          Didn't get it?{" "}
          <button type="button" onClick={resend} className="font-semibold text-teal-700 underline">
            Resend code
          </button>
        </p>
      </form>
    </main>
  );
}
