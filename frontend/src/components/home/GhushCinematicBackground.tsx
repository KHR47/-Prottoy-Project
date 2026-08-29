"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";

export function GhushCinematicBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isLight = mounted && theme === "light";

  // Scroll parallax & fade
  const bgScale = useTransform(scrollY, [0, 1000], [1.05, 1.15]);
  const bgY = useTransform(scrollY, [0, 1000], [0, 120]);
  const overlayOpacity = useTransform(scrollY, [0, 400, 1000], [0.65, 0.85, 0.95]);

  // Mouse 3D Parallax Tilt
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { damping: 25, stiffness: 120 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);

  const rotateX = useTransform(smoothMouseY, [-0.5, 0.5], [2, -2]);
  const rotateY = useTransform(smoothMouseX, [-0.5, 0.5], [-3, 3]);

  // Interactive Cursor Torch Position
  const [cursorPos, setCursorPos] = useState({ x: -1000, y: -1000, isHovering: false });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const normalizedX = e.clientX / innerWidth - 0.5;
      const normalizedY = e.clientY / innerHeight - 0.5;
      mouseX.set(normalizedX);
      mouseY.set(normalizedY);

      setCursorPos({
        x: e.clientX,
        y: e.clientY,
        isHovering: true,
      });
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 pointer-events-none z-0 overflow-hidden select-none transition-colors duration-500 ${
        isLight ? "bg-transparent" : "bg-black"
      }`}
      aria-hidden="true"
    >
      {/* Light Mode Soft Ambient Gradient Background */}
      {isLight && (
        <div
          className="absolute inset-0 pointer-events-none opacity-65"
          style={{
            background:
              "radial-gradient(ellipse 90% 65% at 50% 30%, rgba(245, 158, 11, 0.10) 0%, rgba(13, 148, 136, 0.06) 50%, transparent 85%)",
          }}
        />
      )}

      {/* 3D Parallax Viewport */}
      <motion.div
        style={{
          scale: bgScale,
          y: bgY,
          rotateX,
          rotateY,
          transformPerspective: 1200,
        }}
        className="relative w-full h-full min-h-screen flex items-center justify-center will-change-transform"
      >
        {/* Layer 1: High-Res Cinematic Image with Theme Adaptation */}
        <motion.img
          src="/images/acc-bribery-raid.jpg"
          alt="ACC Anti-Corruption Raid"
          className={`w-full h-full object-cover object-center select-none pointer-events-none transition-all duration-500 ${
            isLight
              ? "opacity-25 filter contrast-105 brightness-110 saturate-90"
              : "opacity-100 filter contrast-110 brightness-90 saturate-105"
          }`}
          initial={{ scale: 1.08, opacity: 0 }}
          animate={{ scale: 1.02, opacity: isLight ? 0.25 : 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />

        {/* Layer 2: Animated Warm Desk Lamp Glow Flicker */}
        <motion.div
          className={`absolute left-[3%] top-[35%] w-[320px] h-[320px] rounded-full pointer-events-none ${
            isLight ? "mix-blend-multiply" : "mix-blend-color-dodge"
          }`}
          animate={{
            opacity: isLight ? [0.35, 0.6, 0.4, 0.65, 0.35] : [0.65, 0.9, 0.7, 0.95, 0.6],
            scale: [1, 1.06, 0.98, 1.04, 1],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            background: isLight
              ? "radial-gradient(circle, rgba(245, 158, 11, 0.35) 0%, rgba(217, 119, 6, 0.15) 45%, transparent 75%)"
              : "radial-gradient(circle, rgba(255, 190, 90, 0.75) 0%, rgba(255, 140, 0, 0.3) 45%, rgba(0, 0, 0, 0) 75%)",
          }}
        />

        {/* Layer 3: Cold Backlight Surge from the ACC Doorway */}
        <motion.div
          className="absolute left-[14%] top-[2%] w-[260px] h-[480px] pointer-events-none"
          animate={{
            opacity: isLight ? [0.2, 0.5, 0.25, 0.55, 0.2] : [0.35, 0.75, 0.4, 0.85, 0.35],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            times: [0, 0.3, 0.55, 0.8, 1],
            ease: "easeInOut",
          }}
          style={{
            background: isLight
              ? "radial-gradient(ellipse 60% 80% at 50% 30%, rgba(13, 148, 136, 0.35) 0%, rgba(14, 165, 233, 0.12) 50%, transparent 80%)"
              : "radial-gradient(ellipse 60% 80% at 50% 30%, rgba(200, 230, 255, 0.6) 0%, rgba(100, 160, 240, 0.2) 50%, rgba(0, 0, 0, 0) 80%)",
          }}
        />

        {/* Layer 4: ACC Badge Shimmering Glint */}
        <motion.div
          className="absolute left-[24.5%] top-[34%] w-12 h-14 rounded-md pointer-events-none"
          animate={{
            opacity: [0.2, 0.9, 0.3, 1, 0.2],
            scale: [0.95, 1.1, 1, 1.15, 0.95],
          }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
            times: [0, 0.2, 0.5, 0.7, 1],
            ease: "easeInOut",
          }}
          style={{
            background: isLight
              ? "radial-gradient(circle, rgba(217, 119, 6, 0.85) 0%, rgba(245, 158, 11, 0.35) 50%, transparent 100%)"
              : "radial-gradient(circle, rgba(255, 255, 255, 0.95) 0%, rgba(255, 215, 0, 0.5) 50%, rgba(0, 0, 0, 0) 100%)",
          }}
        />

        {/* Layer 5: Evidence Suspense Pulse */}
        <motion.div
          className="absolute right-[22%] top-[55%] w-48 h-32 rounded-full pointer-events-none"
          animate={{
            opacity: [0.15, 0.5, 0.15],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            background: isLight
              ? "radial-gradient(circle, rgba(217, 119, 6, 0.3) 0%, rgba(239, 68, 68, 0.1) 50%, transparent 80%)"
              : "radial-gradient(circle, rgba(255, 215, 0, 0.4) 0%, rgba(255, 100, 50, 0.15) 50%, rgba(0, 0, 0, 0) 80%)",
          }}
        />

        {/* Layer 6: Dynamic Floating Evidence Motes */}
        <div className="absolute inset-0 pointer-events-none opacity-50 overflow-hidden">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className={`absolute w-1.5 h-1.5 rounded-full ${
                isLight ? "bg-amber-600/70" : "bg-amber-200/80 blur-[0.5px]"
              }`}
              style={{
                left: `${15 + ((i * 7) % 75)}%`,
                top: `${20 + ((i * 11) % 65)}%`,
              }}
              animate={{
                y: [-20, 20, -20],
                x: [-10, 15, -10],
                opacity: [0.2, 0.8, 0.2],
                scale: [0.8, 1.3, 0.8],
              }}
              transition={{
                duration: 5 + (i % 4),
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.4,
              }}
            />
          ))}
        </div>

        {/* Layer 7: Interactive Investigator Torch / Flashlight Spotlight */}
        {cursorPos.isHovering && (
          <div
            className="absolute inset-0 pointer-events-none transition-opacity duration-300"
            style={{
              background: isLight
                ? `radial-gradient(circle 380px at ${cursorPos.x}px ${cursorPos.y}px, rgba(13, 148, 136, 0.14) 0%, rgba(245, 158, 11, 0.06) 45%, transparent 80%)`
                : `radial-gradient(circle 380px at ${cursorPos.x}px ${cursorPos.y}px, rgba(255, 255, 255, 0.18) 0%, rgba(255, 180, 80, 0.08) 45%, rgba(0, 0, 0, 0) 80%)`,
            }}
          />
        )}
      </motion.div>

      {/* Cinematic Vignette & Scroll Darkening Overlay */}
      <motion.div
        style={{ opacity: overlayOpacity }}
        className={`absolute inset-0 pointer-events-none ${
          isLight
            ? "bg-gradient-to-t from-[var(--bg-base)] via-[var(--bg-base)]/40 to-[var(--bg-base)]/60"
            : "bg-gradient-to-t from-black via-slate-950/70 to-black/60"
        }`}
      />

      {/* Edge Vignette Mask */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: isLight
            ? "radial-gradient(ellipse 85% 85% at 50% 50%, rgba(0,0,0,0) 30%, rgba(244,247,251,0.6) 90%)"
            : "radial-gradient(ellipse 85% 85% at 50% 50%, rgba(0,0,0,0) 30%, rgba(0,0,0,0.85) 90%)",
        }}
      />
    </div>
  );
}
