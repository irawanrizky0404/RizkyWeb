"use client";

import { useState } from "react";

type Status = "idle" | "sending" | "sent" | "error";

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [fields, setFields] = useState({ name: "", email: "", subject: "", message: "" });

  function set(k: keyof typeof fields) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setFields((prev) => ({ ...prev, [k]: e.target.value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("https://formspree.io/f/xrewgrkl", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(fields),
      });
      if (res.ok) {
        setStatus("sent");
        setFields({ name: "", email: "", subject: "", message: "" });
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  const inputClass = "w-full bg-transparent border-b border-rule py-3 lab text-white placeholder:text-white/20 focus:outline-none focus:border-signal transition-colors";

  return (
    <form onSubmit={onSubmit} className="border-t border-rule">
      <div className="flex items-center justify-between border-b border-rule px-5 py-3 md:px-12">
        <span className="fac">Transmit</span>
        {status === "sent" && (
          <span className="lab text-signal" style={{ fontSize: "0.58rem" }}>Transmitted ✓</span>
        )}
        {status === "error" && (
          <span className="lab text-white/40" style={{ fontSize: "0.58rem" }}>Failed — try email directly</span>
        )}
      </div>

      <div className="px-5 py-8 md:px-12 md:py-10 flex flex-col gap-8">
        {/* Row: name + email */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div>
            <label className="lab text-white/25 block mb-2" style={{ fontSize: "0.52rem" }}>Name</label>
            <input
              required
              type="text"
              placeholder="Your name"
              value={fields.name}
              onChange={set("name")}
              className={inputClass}
              style={{ fontSize: "0.72rem" }}
            />
          </div>
          <div>
            <label className="lab text-white/25 block mb-2" style={{ fontSize: "0.52rem" }}>Email</label>
            <input
              required
              type="email"
              placeholder="your@email.com"
              value={fields.email}
              onChange={set("email")}
              className={inputClass}
              style={{ fontSize: "0.72rem" }}
            />
          </div>
        </div>

        {/* Subject */}
        <div>
          <label className="lab text-white/25 block mb-2" style={{ fontSize: "0.52rem" }}>Subject</label>
          <input
            type="text"
            placeholder="What's the transmission about?"
            value={fields.subject}
            onChange={set("subject")}
            className={inputClass}
            style={{ fontSize: "0.72rem" }}
          />
        </div>

        {/* Message */}
        <div>
          <label className="lab text-white/25 block mb-2" style={{ fontSize: "0.52rem" }}>Message</label>
          <textarea
            required
            rows={5}
            placeholder="Describe the project, timeline, or just say hello."
            value={fields.message}
            onChange={set("message")}
            className={inputClass}
            style={{ fontSize: "0.72rem", resize: "none" }}
          />
        </div>

        {/* Submit */}
        <div className="flex items-center gap-6">
          <button
            type="submit"
            disabled={status === "sending" || status === "sent"}
            className="group inline-flex items-center gap-5 border border-signal px-6 py-4 transition-colors duration-300 hover:bg-signal disabled:opacity-40 disabled:pointer-events-none"
          >
            <span className="lab text-white transition-colors duration-300 group-hover:text-black" style={{ fontSize: "0.65rem" }}>
              {status === "sending" ? "Sending…" : status === "sent" ? "Sent" : "Send transmission"}
            </span>
            <span className="lab text-signal inline-block transition-all duration-300 group-hover:translate-x-1 group-hover:text-black">→</span>
          </button>

          <span className="lab text-white/20" style={{ fontSize: "0.5rem" }}>
            Response within 24h
          </span>
        </div>
      </div>
    </form>
  );
}
