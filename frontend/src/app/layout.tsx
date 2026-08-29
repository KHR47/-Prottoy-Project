import type { Metadata } from "next";
import { Geist, Geist_Mono, Hind_Siliguri } from "next/font/google";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import { Providers } from "@/components/layout/Providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const hindSiliguri = Hind_Siliguri({
  variable: "--font-bengali",
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["bengali", "latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Prottoy (প্রত্যয়) — Civic Transparency & Public Verification Grid",
  description: "Bangladesh's unified platform for public issue reporting, anti-corruption whistleblowing, verified housing, civic lost & found, and municipal services.",
};

const themeInitScript = `
(() => {
  try {
    const savedTheme = localStorage.getItem("sc-theme");
    const theme = savedTheme === "dark" || savedTheme === "light" ? savedTheme : "dark";
    document.documentElement.setAttribute("data-theme", theme);

    const savedLang = localStorage.getItem("sc-lang");
    const lang = savedLang === "bn" || savedLang === "en" ? savedLang : "en";
    document.documentElement.setAttribute("lang", lang);
    document.documentElement.setAttribute("data-lang", lang);
  } catch {
    document.documentElement.setAttribute("data-theme", "dark");
  }
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="dark"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${hindSiliguri.variable} antialiased`}
    >
      <body className="min-h-screen flex flex-col">
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: themeInitScript }}
        />
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  );
}
