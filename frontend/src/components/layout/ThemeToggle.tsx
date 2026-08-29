"use client";

import { useTheme } from "@/context/ThemeContext";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const { toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle color theme"
      title="Toggle color theme"
      className="theme-toggle-btn"
    >
      <span className="theme-toggle-track">
        <span className="theme-toggle-thumb">
          <Sun className="theme-toggle-icon theme-toggle-sun" />
          <Moon className="theme-toggle-icon theme-toggle-moon" />
        </span>
      </span>
    </button>
  );
}
