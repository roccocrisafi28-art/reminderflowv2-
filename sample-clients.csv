"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: "▦" },
  { href: "/settings", label: "Settings", icon: "⚙" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const [collapsed, setCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedCollapsed = localStorage.getItem("rf_sidebar_collapsed") === "true";
    const savedDark = localStorage.getItem("rf_dark_mode") === "true";
    setCollapsed(savedCollapsed);
    setDarkMode(savedDark);
    document.documentElement.classList.toggle("dark", savedDark);
    setMounted(true);
  }, []);

  function toggleCollapsed() {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem("rf_sidebar_collapsed", String(next));
  }

  function toggleDarkMode() {
    const next = !darkMode;
    setDarkMode(next);
    localStorage.setItem("rf_dark_mode", String(next));
    document.documentElement.classList.toggle("dark", next);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  if (!mounted) return null;

  return (
    <aside
      className={`shrink-0 border-r border-line dark:border-[#35333A] h-screen sticky top-0 flex flex-col justify-between py-4 transition-all ${
        collapsed ? "w-16" : "w-56"
      }`}
    >
      <div>
        <div className={`flex items-center gap-2 px-4 mb-6 ${collapsed ? "justify-center px-0" : ""}`}>
          {!collapsed && <span className="font-display text-base">ReminderFlow</span>}
          <button
            onClick={toggleCollapsed}
            className="text-[#8C8A80] hover:text-clay text-sm ml-auto"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? "»" : "«"}
          </button>
        </div>

        <nav className="flex flex-col gap-1 px-2">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors ${
                  active
                    ? "bg-[#F0D9CB] text-clayDark dark:bg-[#35251C] dark:text-[#E8B896]"
                    : "text-[#6B6A63] dark:text-[#A9A69E] hover:bg-[#F3F1EA] dark:hover:bg-[#232128]"
                } ${collapsed ? "justify-center" : ""}`}
                title={collapsed ? item.label : undefined}
              >
                <span>{item.icon}</span>
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="px-2 flex flex-col gap-1">
        <button
          onClick={toggleDarkMode}
          className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-[#6B6A63] dark:text-[#A9A69E] hover:bg-[#F3F1EA] dark:hover:bg-[#232128] transition-colors ${
            collapsed ? "justify-center" : ""
          }`}
          title={collapsed ? "Toggle dark mode" : undefined}
        >
          <span>{darkMode ? "☀" : "☾"}</span>
          {!collapsed && <span>{darkMode ? "Light mode" : "Dark mode"}</span>}
        </button>
        <button
          onClick={handleLogout}
          className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-[#6B6A63] dark:text-[#A9A69E] hover:bg-[#F3F1EA] dark:hover:bg-[#232128] transition-colors ${
            collapsed ? "justify-center" : ""
          }`}
          title={collapsed ? "Log out" : undefined}
        >
          <span>⏻</span>
          {!collapsed && <span>Log out</span>}
        </button>
      </div>
    </aside>
  );
}
