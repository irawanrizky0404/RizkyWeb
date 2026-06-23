"use client";

import { useEffect, useState } from "react";
import { Reveal } from "@/components/ui/reveal";

interface ContactLinksProps {
  email: string;
  social: {
    instagram: string;
    behance: string;
    linkedin: string;
    [key: string]: string;
  };
}

function IndonesiaClock() {
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    function update() {
      const now = new Date();
      setTime(new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Jakarta", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }).format(now));
      setDate(new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Jakarta", weekday: "short", month: "short", day: "numeric" }).format(now));
    }
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="border border-rule px-4 py-3">
      <p className="lab text-white/30 mb-1" style={{ fontSize: "0.5rem" }}>Indonesia · WIB (UTC+7)</p>
      <p className="dis text-signal" style={{ fontSize: "clamp(1.2rem, 3vw, 2rem)", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
        {time || "—"}
      </p>
      <p className="lab text-white/30 mt-1" style={{ fontSize: "0.5rem" }}>{date || "—"}</p>
    </div>
  );
}

const LINKS = [
  { label: "Email", key: "email", href: (v: string) => `mailto:${v}`, display: (v: string) => v },
  { label: "Instagram", key: "instagram", href: (v: string) => v, display: () => "@rizkyirawan44" },
  { label: "Behance", key: "behance", href: (v: string) => v, display: () => "/rizkyirawan" },
  { label: "LinkedIn", key: "linkedin", href: (v: string) => v, display: () => "/in/rizkyirawan" },
];

type FormState = "idle" | "sending" | "success" | "error";

export function ContactLinks({ email, social }: ContactLinksProps) {
  const values: Record<string, string> = { email, ...social };
  const [state, setState] = useState<FormState>("idle");
  const [fields, setFields] = useState({ email: "", subject: "", message: "" });

  function setField(k: keyof typeof fields) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setFields((prev) => ({ ...prev, [k]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState("sending");
    try {
      const res = await fetch("https://formspree.io/f/xrewgrkl", {
        method: "POST",
        headers: { "Accept": "application/json", "Content-Type": "application/json" },
        body: JSON.stringify(fields),
      });
      if (res.ok) {
        setState("success");
        setFields({ email: "", subject: "", message: "" });
      } else {
        setState("error");
      }
    } catch {
      setState("error");
    }
  }

  const inputCls = "w-full bg-transparent border border-rule px-4 py-3 lab text-white placeholder:text-white/20 focus:outline-none focus:border-signal/60 transition-colors";
  const fs = { fontSize: "0.7rem" };

  return (
    <section className="border-t border-rule">
      <div className="grid grid-cols-1 gap-0 md:grid-cols-[1fr_1fr]">

        {/* Left — form */}
        <div className="border-b border-rule px-5 py-10 md:border-b-0 md:border-r md:px-12 md:py-14">
          <Reveal>
            <span className="fac mb-8 block">Direct Message</span>
          </Reveal>

          {state === "success" ? (
            <Reveal>
              <div className="border border-signal px-6 py-10 text-center">
                <p className="dis text-signal mb-3" style={{ fontSize: "clamp(1.5rem, 4vw, 3rem)", lineHeight: 0.9 }}>
                  Transmitted.
                </p>
                <p className="lab text-white/40 mb-6" style={{ fontSize: "0.6rem" }}>
                  Message received — I&apos;ll get back to you soon.
                </p>
                <button
                  onClick={() => setState("idle")}
                  className="lab text-white/30 hover:text-signal transition-colors border-b border-rule pb-0.5"
                  style={{ fontSize: "0.58rem" }}
                >
                  Send another →
                </button>
              </div>
            </Reveal>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <Reveal delay={0.05}>
                <div>
                  <label className="lab text-white/30 block mb-2" style={{ fontSize: "0.55rem" }}>Your Email</label>
                  <input
                    type="email"
                    required
                    value={fields.email}
                    onChange={setField("email")}
                    placeholder="hello@example.com"
                    className={inputCls}
                    style={fs}
                  />
                </div>
              </Reveal>
              <Reveal delay={0.08}>
                <div>
                  <label className="lab text-white/30 block mb-2" style={{ fontSize: "0.55rem" }}>Subject</label>
                  <input
                    type="text"
                    required
                    value={fields.subject}
                    onChange={setField("subject")}
                    placeholder="Project inquiry"
                    className={inputCls}
                    style={fs}
                  />
                </div>
              </Reveal>
              <Reveal delay={0.11}>
                <div>
                  <label className="lab text-white/30 block mb-2" style={{ fontSize: "0.55rem" }}>Message</label>
                  <textarea
                    rows={5}
                    required
                    value={fields.message}
                    onChange={setField("message")}
                    placeholder="Tell me about your project..."
                    className={inputCls}
                    style={{ ...fs, resize: "none" }}
                  />
                </div>
              </Reveal>

              {state === "error" && (
                <p className="lab text-red-400" style={{ fontSize: "0.58rem" }}>
                  Something went wrong — try emailing directly.
                </p>
              )}

              <Reveal delay={0.14}>
                <button
                  type="submit"
                  disabled={state === "sending"}
                  className="group w-full inline-flex items-center justify-between gap-4 border border-signal px-6 py-4 hover:bg-signal transition-colors disabled:opacity-50"
                >
                  <span className="lab text-white group-hover:text-black transition-colors" style={{ fontSize: "0.65rem" }}>
                    {state === "sending" ? "Sending…" : "Send Message"}
                  </span>
                  <span className="lab text-signal group-hover:text-black transition-colors group-hover:translate-x-1 inline-block">→</span>
                </button>
              </Reveal>
            </form>
          )}
        </div>

        {/* Right — links + clock */}
        <div className="px-5 py-10 md:px-12 md:py-14 flex flex-col gap-8">
          <Reveal delay={0.05}>
            <p className="text-white/60 leading-relaxed" style={{ fontSize: "clamp(0.9rem, 1.8vw, 1.2rem)", lineHeight: 1.7 }}>
              Whether you have a fully formed brief or just the seed of an idea — get in touch. Every project begins with a conversation.
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="border-t border-rule">
              {LINKS.map(({ label, key, href, display }) => {
                const val = values[key] || "";
                if (!val) return null;
                return (
                  <a
                    key={key}
                    href={href(val)}
                    target={key !== "email" ? "_blank" : undefined}
                    rel={key !== "email" ? "noopener noreferrer" : undefined}
                    className="group flex items-center justify-between gap-4 border-b border-rule py-4 transition-colors hover:text-signal"
                  >
                    <div>
                      <p className="lab text-white/30 mb-1" style={{ fontSize: "0.5rem" }}>{label}</p>
                      <p className="dis text-white group-hover:text-signal transition-colors" style={{ fontSize: "clamp(0.9rem, 2.5vw, 1.8rem)", lineHeight: 0.9 }}>
                        {display(val)}
                      </p>
                    </div>
                    <span className="lab text-white/25 group-hover:text-signal transition-all group-hover:translate-x-0.5">↗</span>
                  </a>
                );
              })}
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <IndonesiaClock />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
