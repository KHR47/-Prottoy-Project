"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getUser } from "@/lib/auth";
import type { Role, User } from "@/types/user";

/**
 * Protects a page by ensuring the logged-in user has one of the allowed roles.
 * Redirects to `redirectTo` (default: "/login") if not authenticated or wrong role.
 *
 * Usage:
 *   const { user, isReady } = useRequireRole(["admin"]);
 *   if (!isReady) return null;  // show nothing while checking
 */
export function useRequireRole(
  allowedRoles: Role[],
  redirectTo = "/login",
): { user: User | null; isReady: boolean } {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isReady, setIsReady] = useState(false);
  const allowedRolesKey = allowedRoles.join("|");

  useEffect(() => {
    let isActive = true;
    const allowed = allowedRolesKey.split("|") as Role[];

    queueMicrotask(() => {
      if (!isActive) return;

      const currentUser = getUser();

      if (!currentUser) {
        router.replace(redirectTo);
        return;
      }

      if (!allowed.includes(currentUser.role)) {
        if (currentUser.role === "citizen") router.replace("/dashboard");
        else if (currentUser.role === "officer") router.replace("/officer/reports");
        else if (currentUser.role === "authority") router.replace("/authority/dashboard");
        else if (currentUser.role === "driver") router.replace("/driver/dashboard");
        else if (currentUser.role === "attendant") router.replace("/attendant/dashboard");
        else router.replace("/admin/dashboard");
        return;
      }

      setUser(currentUser);
      setIsReady(true);
    });

    return () => {
      isActive = false;
    };
  }, [allowedRolesKey, redirectTo, router]);

  return { user, isReady };
}

/**
 * Non-redirecting auth hook for guest-friendly pages.
 * Returns the user if logged in, or null for guests. Never redirects.
 *
 * Usage:
 *   const { user, isGuest, isReady } = useOptionalAuth();
 */
export function useOptionalAuth(): {
  user: User | null;
  isGuest: boolean;
  isReady: boolean;
} {
  const [user, setUser] = useState<User | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let isActive = true;

    queueMicrotask(() => {
      if (!isActive) return;
      const currentUser = getUser();
      setUser(currentUser);
      setIsReady(true);
    });

    return () => {
      isActive = false;
    };
  }, []);

  return { user, isGuest: isReady && !user, isReady };
}

/**
 * Redirects to login with a ?redirect= param so the user can return after signing in.
 * Use this for protecting actions (not pages).
 */
export function useAuthRedirect() {
  const router = useRouter();
  const pathname = usePathname();

  return function redirectToLogin() {
    router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
  };
}
