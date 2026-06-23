"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { AdminBodyClass } from "@/components/admin/admin-body-class";

const navItems = [
  { label: "Dashboard", href: "/admin" },
  { label: "Works", href: "/admin/works" },
  { label: "Journal", href: "/admin/journal" },
  { label: "Services", href: "/admin/services" },
  { label: "CV", href: "/admin/cv" },
  { label: "Upload & Media", href: "/admin/upload" },
  { label: "Design", href: "/admin/design" },
  { label: "AI Tools", href: "/admin/tools" },
  { label: "Settings", href: "/admin/settings" },
  { label: "Activity", href: "/admin/activity" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  if (pathname === "/admin/login") return <><AdminBodyClass />{children}</>;

  async function logout() {
    setLoggingOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
  }

  return (
    <div className="min-h-screen bg-black text-white flex">
      <AdminBodyClass />
      {/* Sidebar */}
      <aside className="w-52 shrink-0 border-r border-rule flex flex-col">
        {/* Logo */}
        <div className="border-b border-rule px-5 py-5">
          <span className="lab text-signal" style={{ fontSize: "0.55rem" }}>FAC.ADM</span>
          <p className="dis text-white mt-1" style={{ fontSize: "1.4rem", lineHeight: 0.9 }}>Admin</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
          {navItems.map((item) => {
            const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className="lab px-3 py-2 rounded-sm transition-colors"
                style={{
                  fontSize: "0.62rem",
                  color: active ? "#080808" : "rgba(240,240,238,0.4)",
                  background: active ? "#ff3500" : "transparent",
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
            className="lab text-white/25 hover:text-white transition-colors block mb-3"
            style={{ fontSize: "0.52rem" }}
          >
            ↗ View site
          </a>
          <button
            onClick={logout}
            disabled={loggingOut}
            className="lab text-white/25 hover:text-signal transition-colors"
            style={{ fontSize: "0.52rem" }}
          >
            {loggingOut ? "Logging out…" : "Log out"}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 min-h-0 overflow-auto">
        {children}
      </main>
    </div>
  );
}
