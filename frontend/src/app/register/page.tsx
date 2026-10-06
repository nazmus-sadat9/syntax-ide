"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const API = "http://localhost:5000/api/users";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      sessionStorage.setItem("pendingEmail", data.email);
      router.push("/verify");
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-5 bg-slate-100">
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4">
        <h1 className="text-3xl font-bold">Create your account</h1>
        <input name="name" placeholder="Name" value={form.name} onChange={onChange} required
          className="w-full rounded-md border border-slate-300 bg-white px-3.5 py-2.5 outline-none focus:border-teal-700" />
        <input name="email" type="email" placeholder="Email" value={form.email} onChange={onChange} required
          className="w-full rounded-md border border-slate-300 bg-white px-3.5 py-2.5 outline-none focus:border-teal-700" />
        <input name="password" type="password" placeholder="Password (min 6 characters)" minLength={6} value={form.password} onChange={onChange} required
          className="w-full rounded-md border border-slate-300 bg-white px-3.5 py-2.5 outline-none focus:border-teal-700" />
        {error && <p className="rounded-md bg-red-50 px-3.5 py-2.5 text-sm text-red-700">{error}</p>}
        <button disabled={loading}
          className="w-full rounded-md bg-teal-700 px-4 py-2.5 font-semibold text-white hover:bg-teal-800 disabled:opacity-60">
          {loading ? "Please wait..." : "Create account"}
        </button>
        <p className="text-sm text-slate-600">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-teal-700 underline">Log in</Link>
        </p>
      </form>
    </main>
  );
}
