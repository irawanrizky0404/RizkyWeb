"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { AdminBodyClass } from "@/components/admin/admin-body-class";

const navItems = [
  { label: "Dashboard", href: "/admin" },
  { label: "Content", href: "/admin/content" },
  { label: "Works", href: "/admin/works" },
  { label: "Personal Works", href: "/admin/personal-works" },
  { label: "Labs", href: "/admin/labs" },
  { label: "Journal", href: "/admin/journal" },
  { label: "Services", href: "/admin/services" },
  { label: "CV & Tools", href: "/admin/cv" },
  { label: "Upload", href: "/admin/upload" },
  { label: "Design", href: "/admin/design" },
  { label: "AI Tools", href: "/admin/tools" },
  { label: "Settings", href: "/admin/settings" },
  { label: "Activity", href: "/admin/activity" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  if (pathname === "/admin/login") return <><AdminBodyClass />{children}</>;

  async function logout() {
    setLoggingOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col md:flex-row">
      <AdminBodyClass />

      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between border-b border-rule px-5 py-4 bg-black sticky top-0 z-50">
        <div>
          <span className="lab text-signal" style={{ fontSize: "0.55rem" }}>FAC.ADM</span>
          <p className="dis text-white" style={{ fontSize: "1.3rem", lineHeight: 0.9 }}>Admin</p>
        </div>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="lab text-white/50 hover:text-white p-2"
          style={{ fontSize: "1.5rem" }}
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile Navigation Overlay */}
      {menuOpen && (
        <>
          {/* Backdrop - click anywhere to close */}
          <div
            className="md:hidden fixed inset-0 top-[72px] bg-black/95 z-40 cursor-pointer"
            onClick={() => setMenuOpen(false)}
          />
          {/* Menu Panel */}
          <div className="md:hidden fixed inset-x-0 top-[72px] bottom-0 bg-black z-50 flex flex-col">
            <nav className="flex-1 px-5 py-4 flex flex-col gap-1.5 overflow-auto">
              {navItems.map((item) => {
                const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className="lab px-5 py-3 rounded-sm transition-colors"
                    style={{
                      fontSize: "0.72rem",
                      color: active ? "var(--black)" : "color-mix(in srgb, var(--white) 60%, transparent)",
                      background: active ? "var(--signal)" : "transparent",
                    }}
                  >
                    {item.label}
                  </Link>
                );
              })}
              <div className="border-t border-rule mt-4 pt-4">
                <a
                  href="/"
                  target="_blank"
                  className="lab text-white/40 hover:text-white transition-colors block py-2"
                  style={{ fontSize: "0.65rem" }}
                >
                  ↗ View site
                </a>
                <button
                  onClick={logout}
                  disabled={loggingOut}
                  className="lab text-white/40 hover:text-signal transition-colors py-2"
                  style={{ fontSize: "0.65rem" }}
                >
                  {loggingOut ? "Logging out…" : "Log out"}
                </button>
              </div>
            </nav>
          </div>
        </>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-52 shrink-0 border-r border-rule flex-col">
        {/* Logo */}
        <div className="border-b border-rule px-5 py-5">
          <span className="lab text-signal" style={{ fontSize: "0.55rem" }}>FAC.ADM</span>
          <p className="dis text-white mt-1" style={{ fontSize: "1.4rem", lineHeight: 0.9 }}>Admin</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-auto">
          {navItems.map((item) => {
            const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className="lab px-3 py-2 rounded-sm transition-colors cursor-pointer"
                style={{
                  fontSize: "0.62rem",
                  color: active ? "var(--black)" : "color-mix(in srgb, var(--white) 40%, transparent)",
                  background: active ? "var(--signal)" : "transparent",
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-rule px-5 py-4">
          <a
            href="/"
            target="_blank"
            className="lab text-white/25 hover:text-white transition-colors block mb-3 cursor-pointer"
            style={{ fontSize: "0.52rem" }}
          >
            ↗ View site
          </a>
          <button
            onClick={logout}
            disabled={loggingOut}
            className="lab text-white/25 hover:text-signal transition-colors cursor-pointer"
            style={{ fontSize: "0.52rem" }}
          >
            {loggingOut ? "Logging out…" : "Log out"}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-h-0 overflow-auto">
        {children}
      </main>
    </div>
  );
}
