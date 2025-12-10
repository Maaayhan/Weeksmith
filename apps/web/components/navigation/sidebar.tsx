"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/actions/sign-out";

const navItems = [
  { href: "/vision", label: "Vision", icon: "🎯" },
  { href: "/plan", label: "Plan", icon: "📋" },
  { href: "/dashboard", label: "This Week", icon: "📅" },
  { href: "/wam", label: "AI WAM", icon: "💬" },
  { href: "/retro", label: "Retro", icon: "📊" },
  { href: "/settings", label: "Settings", icon: "⚙️" },
] as const;

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav" aria-label="Main navigation">
        <div className="sidebar-header">
          <Link href="/dashboard" className="sidebar-logo">
            <span className="sidebar-logo-icon">⚡</span>
            <span className="sidebar-logo-text">Weeksmith</span>
          </Link>
        </div>
        <ul className="sidebar-list">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname?.startsWith(item.href));
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`sidebar-link ${isActive ? "sidebar-link--active" : ""}`}
                  aria-current={isActive ? "page" : undefined}
                >
                  <span className="sidebar-link-icon" aria-hidden="true">
                    {item.icon}
                  </span>
                  <span className="sidebar-link-label">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
        <div className="sidebar-footer">
          <form action={signOut}>
            <button type="submit" className="sidebar-signout">
              <span className="sidebar-link-icon" aria-hidden="true">
                🚪
              </span>
              <span className="sidebar-link-label">Sign out</span>
            </button>
          </form>
        </div>
      </nav>
    </aside>
  );
}
