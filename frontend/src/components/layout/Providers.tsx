"use client";

import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "@/context/ThemeContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { SmoothScroll } from "./SmoothScroll";

export function Providers({ children }: { children: React.ReactNode }) {
  const googleClientId =
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
    "824497726439-97jvs4d12t3mvt7ttbco5s23qhe0lihq.apps.googleusercontent.com";

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <ThemeProvider>
        <LanguageProvider>
          <SmoothScroll>
            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  background: "var(--bg-elevated)",
                  color: "var(--text-primary)",
                  border: "1px solid var(--border)",
                  boxShadow: "var(--shadow-md)",
                },
              }}
            />
            {children}
          </SmoothScroll>
        </LanguageProvider>
      </ThemeProvider>
    </GoogleOAuthProvider>
  );
}
