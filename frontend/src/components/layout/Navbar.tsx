"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { getUser, logout } from "@/lib/auth";
import { NotificationBell } from "./NotificationBell";
import { ThemeToggle } from "./ThemeToggle";
import { LanguageToggle } from "./LanguageToggle";
import { useLanguage } from "@/context/LanguageContext";
import type { Role, User } from "@/types/user";
import { ArrowLeft, Menu, X, User as UserIcon, LogOut, ChevronDown, LogIn, UserPlus } from "lucide-react";

// Checks if a nav item is "active" — either exact match or prefix match for sub-pages
function isLinkActive(pathname: string, href: string): boolean {
  if (href === "/dashboard" || href === "/operator/dashboard") {
    return pathname === href;
  }
  return pathname === href || pathname.startsWith(href + "/");
}

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { t, isBangla } = useLanguage();
  const [user, setUser] = useState<User | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const getNavItems = (): Record<Role, { href: string; label: string }[]> => ({
    guest: [
      { href: "/dashboard", label: t.nav.dashboard },
      { href: "/reports/public", label: t.nav.reports },
      { href: "/lost-found", label: t.nav.lostFound },
      { href: "/housing", label: t.nav.housing },
      { href: "/services", label: t.nav.services },
      { href: "/ghush-reports", label: t.nav.ghush },
      { href: "/parking", label: t.nav.parking },
    ],
    citizen: [
      { href: "/dashboard", label: t.nav.dashboard },
      { href: "/reports", label: t.nav.reports },
      { href: "/lost-found", label: t.nav.lostFound },
      { href: "/housing", label: t.nav.housing },
      { href: "/services", label: t.nav.services },
      { href: "/ghush-reports", label: t.nav.ghush },
      { href: "/parking", label: t.nav.parking },
    ],
    authority: [
      { href: "/authority/dashboard", label: t.nav.dashboard },
      { href: "/authority/reports", label: t.nav.reports },
      { href: "/lost-found", label: t.nav.lostFound },
      { href: "/housing", label: t.nav.housing },
      { href: "/services", label: t.nav.services },
      { href: "/ghush-reports", label: t.nav.ghush },
      { href: "/operator/dashboard", label: "Parking Ops" },
    ],
    officer: [
      { href: "/officer/reports", label: isBangla ? "দায়িত্বপ্রাপ্ত অভিযোগ" : "Assigned Reports" },
      { href: "/ghush-reports", label: t.nav.ghush },
      { href: "/lost-found", label: t.nav.lostFound },
      { href: "/map", label: isBangla ? "ম্যাপ ভিউ" : "City Map" },
    ],
    driver: [
      { href: "/driver/dashboard", label: isBangla ? "আমার ড্যাশবোর্ড" : "My Dashboard" },
    ],
    attendant: [
      { href: "/attendant/dashboard", label: t.nav.dashboard },
      { href: "/attendant/scan", label: isBangla ? "স্ক্যান ও পার্ক" : "Scan & Park" },
    ],
    admin: [
      { href: "/admin/dashboard", label: t.nav.dashboard },
      { href: "/lost-found", label: t.nav.lostFound },
      { href: "/housing", label: t.nav.housing },
      { href: "/services", label: t.nav.services },
      { href: "/ghush-reports", label: t.nav.ghush },
      { href: "/admin/reports", label: t.nav.reports },
      { href: "/admin/users", label: isBangla ? "ব্যবহারকারী" : "Users" },
      { href: "/admin/categories", label: isBangla ? "ক্যাটাগরি" : "Categories" },
      { href: "/admin/districts", label: isBangla ? "জেলা" : "Districts" },
      { href: "/admin/parking", label: t.nav.parking },
    ],
  });

  const links = user ? getNavItems()[user.role] : getNavItems().guest;

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setUser(getUser());
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
    setProfileOpen(false);
  }, [pathname]);

  // Close profile dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleLogout() {
    logout();
    router.push("/login");
  }

  // Determine if back button should show
  const isDashboard =
    pathname.endsWith("/dashboard") ||
    pathname === "/officer/reports" ||
    pathname === "/attendant/dashboard";

  return (
    <>
      <header
        className="sticky top-0 z-50 w-full"
        style={{
          background: "var(--navbar-bg)",
          borderBottom: "1px solid var(--navbar-border)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          transition: "background 0.3s ease, border-color 0.3s ease",
        }}
      >
        <div className="mx-auto w-full max-w-[1520px] px-3 sm:px-5 lg:px-6">
          <div className="flex h-14 sm:h-15 items-center justify-between gap-2 lg:gap-3">

            {/* Left: Back + Logo */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {!isDashboard && (
                <button
                  onClick={() => router.back()}
                  className="flex h-7.5 w-7.5 items-center justify-center rounded-lg transition-all"
                  style={{ color: "var(--text-secondary)" }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLButtonElement).style.background = "var(--bg-hover)";
                    (e.currentTarget as HTMLButtonElement).style.color = "var(--text-primary)";
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                    (e.currentTarget as HTMLButtonElement).style.color = "var(--text-secondary)";
                  }}
                  title="Go back"
                >
                  <ArrowLeft size={15} />
                </button>
              )}

              <Link href={user ? links[0]?.href || "/" : "/"} className="flex items-center gap-2 flex-shrink-0 group">
                {/* Custom High-Tech Prottoy Emblem */}
                <div className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 via-emerald-600 to-cyan-700 p-[1.5px] shadow-sm shadow-teal-500/20 group-hover:shadow-teal-500/40 group-hover:scale-105 transition-all duration-300">
                  <div className="flex h-full w-full items-center justify-center rounded-[9.5px] bg-slate-950/90 backdrop-blur-md">
                    <svg
                      viewBox="0 0 32 32"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-teal-400 group-hover:text-teal-300 transition-colors"
                    >
                      <path
                        d="M16 3L27 8.5V17C27 23.5 22.3 28.2 16 30C9.7 28.2 5 23.5 5 17V8.5L16 3Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="opacity-90"
                      />
                      <path
                        d="M12 16L15 19L21 13"
                        stroke="#2dd4bf"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <circle cx="16" cy="7" r="1.5" fill="#f59e0b" />
                    </svg>
                  </div>
                </div>

                <div className="hidden sm:block">
                  <div className="flex items-center gap-1.5 leading-tight">
                    <span className="text-[13.5px] font-black tracking-tight" style={{ color: "var(--text-primary)" }}>
                      Prottoy
                    </span>
                    <span className="text-[8.5px] font-bold text-teal-400 bg-teal-500/10 border border-teal-500/20 px-1 py-0.2 rounded tracking-wide font-serif">
                      প্রত্যয়
                    </span>
                  </div>
                  <span className="block text-[8.5px] font-medium leading-tight truncate max-w-[110px]" style={{ color: "var(--text-muted)" }}>
                    {!user ? "Civic Grid" :
                     user.role === "authority" ? "Authority Command" :
                     user.role === "admin" ? "Admin Oversight" :
                     user.role === "officer" ? "Field Integrity" :
                     user.role === "driver" ? "Driver App" :
                     user.role === "attendant" ? "Attendant App" :
                     "Citizen Portal"}
                  </span>
                </div>
              </Link>
            </div>

            {/* Center: Desktop Nav links */}
            <nav className="hidden lg:flex items-center gap-1 flex-1 justify-center px-1">
              {links.map((item) => {
                const active = isLinkActive(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    style={
                      active
                        ? { background: "var(--accent-light)", color: "var(--accent)" }
                        : { color: "var(--text-secondary)" }
                    }
                    className={`rounded-lg px-2.5 py-1 text-[12px] xl:text-[12.5px] font-medium transition-all duration-200 whitespace-nowrap ${
                      active ? "font-bold shadow-xs" : "hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Right: Controls */}
            <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
              <LanguageToggle />
              <ThemeToggle />

              {user ? (
                <>
                  <NotificationBell />

                  {/* Profile dropdown */}
                  <div className="relative hidden sm:block flex-shrink-0" ref={profileRef}>
                    <button
                      onClick={() => setProfileOpen(!profileOpen)}
                      className="flex items-center gap-1.5 rounded-lg px-1.5 py-1 transition-all duration-200"
                      style={{
                        borderLeft: "1px solid var(--border-strong)",
                        paddingLeft: "8px",
                        marginLeft: "2px",
                      }}
                      onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = "var(--bg-hover)"}
                      onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = "transparent"}
                    >
                      <div
                        className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-600 text-[10.5px] font-bold text-white flex-shrink-0 shadow-sm"
                      >
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="text-left hidden xl:block max-w-[85px]">
                        <p className="text-[11px] font-bold leading-tight truncate" style={{ color: "var(--text-primary)" }}>
                          {user.name.split(" ")[0]}
                        </p>
                        <p className="text-[9px] capitalize leading-tight" style={{ color: "var(--text-muted)" }}>
                          {user.role}
                        </p>
                      </div>
                      <ChevronDown
                        size={11}
                        className={`transition-transform duration-200 flex-shrink-0 ${profileOpen ? "rotate-180" : ""}`}
                        style={{ color: "var(--text-muted)" }}
                      />
                    </button>

                    {/* Dropdown */}
                    {profileOpen && (
                      <div
                        className="absolute right-0 top-full mt-2 w-48 rounded-xl border shadow-xl overflow-hidden z-50"
                        style={{
                          background: "var(--bg-elevated)",
                          borderColor: "var(--border-strong)",
                          boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
                        }}
                      >
                        {/* User info header */}
                        <div className="px-4 py-3 border-b" style={{ borderColor: "var(--border-strong)" }}>
                          <p className="text-xs font-bold truncate" style={{ color: "var(--text-primary)" }}>
                            {user.name}
                          </p>
                          <p className="text-[10px] truncate mt-0.5" style={{ color: "var(--text-muted)" }}>
                            {user.email}
                          </p>
                        </div>

                        <div className="p-1.5 space-y-0.5">
                          <Link
                            href="/profile"
                            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-semibold w-full text-left transition-all"
                            style={{ color: "var(--text-secondary)" }}
                            onMouseEnter={e => {
                              (e.currentTarget as HTMLAnchorElement).style.background = "var(--bg-hover)";
                              (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-primary)";
                            }}
                            onMouseLeave={e => {
                              (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
                              (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-secondary)";
                            }}
                          >
                            <UserIcon size={15} />
                            {t.nav.profile}
                          </Link>

                          <button
                            onClick={handleLogout}
                            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-semibold w-full text-left transition-all text-rose-500"
                            onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = "rgba(239,68,68,0.08)"}
                            onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = "transparent"}
                          >
                            <LogOut size={15} />
                            {t.nav.logout}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                /* Guest: Sign In / Register buttons */
                <div className="hidden sm:flex items-center gap-2" style={{ borderLeft: "1px solid var(--border-strong)", paddingLeft: "12px", marginLeft: "4px" }}>
                  <Link
                    href="/login"
                    className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition-all"
                    style={{ color: "var(--text-secondary)" }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLAnchorElement).style.background = "var(--bg-hover)";
                      (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-primary)";
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
                      (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-secondary)";
                    }}
                  >
                    <LogIn size={15} />
                    {t.nav.login}
                  </Link>
                  <Link
                    href="/register"
                    className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 transition-all shadow-sm"
                  >
                    <UserPlus size={15} />
                    {t.nav.register}
                  </Link>
                </div>
              )}

              {/* Mobile hamburger */}
              <button
                className="flex lg:hidden h-9 w-9 items-center justify-center rounded-lg transition-all"
                style={{ color: "var(--text-secondary)" }}
                onClick={() => setMobileOpen(!mobileOpen)}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = "var(--bg-hover)";
                  (e.currentTarget as HTMLButtonElement).style.color = "var(--text-primary)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                  (e.currentTarget as HTMLButtonElement).style.color = "var(--text-secondary)";
                }}
                aria-label="Toggle menu"
              >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div
            className="border-t lg:hidden"
            style={{
              background: "var(--navbar-bg)",
              borderColor: "var(--navbar-border)",
            }}
          >
            <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6">
              {/* Mobile nav links */}
              <nav className="space-y-1">
                {links.map((item) => {
                  const active = isLinkActive(pathname, item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      style={
                        active
                          ? { background: "var(--accent-light)", color: "var(--accent)" }
                          : { color: "var(--text-secondary)" }
                      }
                      className={`flex items-center rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${
                        active ? "" : "hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </nav>

              {/* Mobile user controls */}
              {user ? (
                <div className="mt-3 pt-3 border-t space-y-1" style={{ borderColor: "var(--border-strong)" }}>
                  <div className="flex items-center gap-3 px-4 py-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-600 text-xs font-bold text-white">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{user.name}</p>
                      <p className="text-xs capitalize" style={{ color: "var(--text-muted)" }}>{user.role}</p>
                    </div>
                  </div>
                  <Link
                    href="/profile"
                    className="flex items-center gap-2.5 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    <UserIcon size={15} />
                    {t.nav.profile}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2.5 w-full rounded-lg px-4 py-2.5 text-sm font-semibold transition-all text-rose-500"
                    onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = "rgba(239,68,68,0.08)"}
                    onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = "transparent"}
                  >
                    <LogOut size={15} />
                    {t.nav.logout}
                  </button>
                </div>
              ) : (
                <div className="mt-3 pt-3 border-t space-y-2 px-4" style={{ borderColor: "var(--border-strong)" }}>
                  <Link
                    href="/login"
                    className="flex items-center justify-center gap-2 w-full rounded-lg px-4 py-2.5 text-sm font-semibold transition-all border"
                    style={{ color: "var(--text-primary)", borderColor: "var(--border-strong)" }}
                  >
                    <LogIn size={15} />
                    {t.nav.login}
                  </Link>
                  <Link
                    href="/register"
                    className="flex items-center justify-center gap-2 w-full rounded-lg px-4 py-2.5 text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 transition-all"
                  >
                    <UserPlus size={15} />
                    {t.nav.register}
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
}
