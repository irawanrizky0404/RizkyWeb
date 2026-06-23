"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (res.ok) {
      router.push("/admin");
    } else {
      setError("Invalid credentials");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-5">
      {/* Scanlines */}
      <div className="pointer-events-none fixed inset-0"
        style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)" }} />

      <div className="relative w-full max-w-sm">
        {/* Header */}
        <div className="mb-10">
          <span className="lab text-signal" style={{ fontSize: "0.55rem" }}>FAC.ADM — Admin</span>
          <div className="mt-1 h-px w-5 bg-signal/40" />
          <h1 className="dis text-white mt-4" style={{ fontSize: "clamp(2.5rem, 10vw, 6rem)", lineHeight: 0.88 }}>
            Access<br />Control.
          </h1>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-6">
          <div>
            <label className="lab text-white/30 block mb-2" style={{ fontSize: "0.52rem" }}>Email</label>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-transparent border-b border-rule py-3 lab text-white placeholder:text-white/15 focus:outline-none focus:border-signal transition-colors"
              style={{ fontSize: "0.72rem" }}
              placeholder="your@email.com"
            />
          </div>
          <div>
            <label className="lab text-white/30 block mb-2" style={{ fontSize: "0.52rem" }}>Password</label>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-transparent border-b border-rule py-3 lab text-white placeholder:text-white/15 focus:outline-none focus:border-signal transition-colors"
              style={{ fontSize: "0.72rem" }}
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="lab text-signal" style={{ fontSize: "0.58rem" }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="group mt-2 inline-flex items-center gap-5 border border-signal px-6 py-4 transition-colors hover:bg-signal disabled:opacity-40"
          >
            <span className="lab text-white transition-colors group-hover:text-black" style={{ fontSize: "0.65rem" }}>
              {loading ? "Verifying…" : "Enter archive"}
            </span>
            <span className="lab text-signal transition-all group-hover:translate-x-1 group-hover:text-black">→</span>
          </button>
        </form>

        <div className="mt-12 border-t border-rule pt-4">
          <span className="lab text-white/15" style={{ fontSize: "0.5rem" }}>Rizky Irawan · Admin Panel · FAC.001</span>
        </div>
      </div>
    </div>
  );
}
