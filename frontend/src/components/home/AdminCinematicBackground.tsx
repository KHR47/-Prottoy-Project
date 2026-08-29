"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";

export function AdminCinematicBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isLight = mounted && theme === "light";

  // Scroll parallax & depth scaling
  const bgScale = useTransform(scrollY, [0, 1000], [1.02, 1.12]);
  const bgY = useTransform(scrollY, [0, 1000], [0, 80]);
  const overlayOpacity = useTransform(scrollY, [0, 400, 1000], [0.45, 0.7, 0.9]);

  // Mouse 3D Parallax Tilt
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { damping: 25, stiffness: 100 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);

  const rotateX = useTransform(smoothMouseY, [-0.5, 0.5], [2, -2]);
  const rotateY = useTransform(smoothMouseX, [-0.5, 0.5], [-2.5, 2.5]);

  // Interactive Cursor Light Position
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
        isLight ? "bg-[#f8fafc]" : "bg-black"
      }`}
      aria-hidden="true"
    >
      {/* Light Theme Radiant Ambient Underlay */}
      {isLight && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 100% 75% at 50% 15%, rgba(245, 158, 11, 0.14) 0%, rgba(139, 92, 246, 0.08) 45%, rgba(248, 250, 252, 0.95) 85%)",
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
        {/* Layer 1: High-Res Executive Admin Matrix Imagery */}
        <motion.img
          src="/images/admin-hero-bg.jpg"
          alt="Executive Admin Command Matrix"
          className={`w-full h-full object-cover object-center select-none pointer-events-none transition-all duration-700 ${
            isLight
              ? "opacity-22 filter contrast-125 brightness-110 saturate-140 mix-blend-multiply"
              : "opacity-100 filter contrast-115 brightness-95 saturate-110"
          }`}
          initial={{ scale: 1.05, opacity: 0 }}
          animate={{ scale: 1, opacity: isLight ? 0.22 : 1 }}
          transition={{ duration: 1.6, ease: "easeOut" }}
        />

        {/* Layer 2: Dotted Holographic Globe Core Horizon Flare */}
        <motion.div
          className={`absolute left-[3%] bottom-[32%] w-[260px] h-[160px] rounded-full pointer-events-none ${
            isLight ? "mix-blend-multiply" : "mix-blend-screen"
          }`}
          animate={{
            opacity: isLight ? [0.4, 0.8, 0.45, 0.85, 0.4] : [0.65, 1, 0.7, 0.95, 0.65],
            scale: [1, 1.1, 0.98, 1.06, 1],
          }}
          transition={{
            duration: 4.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            background: isLight
              ? "radial-gradient(ellipse 80% 50% at 50% 50%, rgba(217, 119, 6, 0.4) 0%, rgba(245, 158, 11, 0.15) 45%, transparent 80%)"
              : "radial-gradient(ellipse 80% 50% at 50% 50%, rgba(251, 191, 36, 0.75) 0%, rgba(217, 119, 6, 0.3) 45%, transparent 80%)",
            filter: "drop-shadow(0 0 20px rgba(245, 158, 11, 0.8))",
          }}
        />

        {/* Layer 3: Orbital Scanner Ring Beacon on Globe */}
        <motion.div
          className="absolute left-[13%] top-[34%] w-8 h-8 rounded-full pointer-events-none mix-blend-screen"
          animate={{
            opacity: [0.2, 1, 0.3, 0.9, 0.2],
            scale: [0.8, 1.5, 0.9, 1.35, 0.8],
          }}
          transition={{
            duration: 3.2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            background: isLight
              ? "radial-gradient(circle, rgba(217, 119, 6, 0.9) 0%, rgba(245, 158, 11, 0.4) 40%, transparent 80%)"
              : "radial-gradient(circle, rgba(255, 255, 255, 1) 0%, rgba(251, 191, 36, 0.9) 40%, transparent 80%)",
            filter: "drop-shadow(0 0 10px rgba(251, 191, 36, 1))",
          }}
        />

        {/* Layer 4: Hexagonal Real-Time Analytics Bar Fluctuations (Top-Right) */}
        <div className="absolute right-[6%] top-[14%] w-[100px] h-[55px] pointer-events-none flex items-end justify-between px-2 gap-1.5 opacity-75">
          {[60, 85, 45, 95, 70, 50].map((height, i) => (
            <motion.div
              key={i}
              className={`w-2 rounded-t ${
                isLight
                  ? "bg-gradient-to-t from-amber-600 to-amber-400"
                  : "bg-gradient-to-t from-amber-600/40 to-amber-300"
              }`}
              animate={{
                height: [`${height * 0.5}%`, `${height}%`, `${height * 0.7}%`],
                opacity: [0.5, 0.95, 0.6],
              }}
              transition={{
                duration: 2 + (i % 3) * 0.5,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
                delay: i * 0.2,
              }}
            />
          ))}
        </div>

        {/* Layer 5: Central Radar Targeting Sweep (Center Right) */}
        <motion.div
          className={`absolute right-[28%] top-[45%] w-24 h-24 rounded-full border pointer-events-none ${
            isLight ? "border-amber-600/30" : "border-amber-500/25"
          }`}
          animate={{
            rotate: 360,
            scale: [0.95, 1.05, 0.95],
          }}
          transition={{
            rotate: { duration: 12, repeat: Infinity, ease: "linear" },
            scale: { duration: 4, repeat: Infinity, ease: "easeInOut" },
          }}
          style={{
            boxShadow: "0 0 15px rgba(245, 158, 11, 0.15)",
          }}
        >
          <div className={`absolute top-1/2 left-1/2 w-1.5 h-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full ${isLight ? "bg-amber-600" : "bg-amber-400"} animate-ping`} />
        </motion.div>

        {/* Layer 6: Security Padlock Shield Golden Radiant Core (Bottom Right) */}
        <motion.div
          className={`absolute right-[5.5%] bottom-[16%] w-[160px] h-[190px] rounded-full pointer-events-none ${
            isLight ? "mix-blend-multiply" : "mix-blend-screen"
          }`}
          animate={{
            opacity: isLight ? [0.3, 0.7, 0.35, 0.75, 0.3] : [0.35, 0.85, 0.45, 0.9, 0.35],
            scale: [0.96, 1.06, 1, 1.08, 0.96],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            background: isLight
              ? "radial-gradient(ellipse 70% 85% at 50% 50%, rgba(217, 119, 6, 0.35) 0%, rgba(245, 158, 11, 0.12) 50%, transparent 80%)"
              : "radial-gradient(ellipse 70% 85% at 50% 50%, rgba(251, 191, 36, 0.45) 0%, rgba(217, 119, 6, 0.15) 50%, transparent 80%)",
          }}
        />

        {/* Layer 7: Ground Track Circuit Light Streaks */}
        <motion.div
          className="absolute left-[2%] bottom-[23%] w-[380px] h-1.5 rounded-full pointer-events-none mix-blend-screen"
          animate={{
            opacity: isLight ? [0.25, 0.7, 0.25] : [0.3, 0.9, 0.3],
            scaleX: [0.92, 1.08, 0.92],
          }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            background: isLight
              ? "linear-gradient(90deg, transparent 0%, rgba(217, 119, 6, 0.7) 45%, rgba(245, 158, 11, 0.5) 70%, transparent 100%)"
              : "linear-gradient(90deg, transparent 0%, rgba(251, 191, 36, 0.95) 45%, rgba(245, 158, 11, 0.8) 70%, transparent 100%)",
            filter: "blur(0.8px) drop-shadow(0 0 12px rgba(251, 191, 36, 0.9))",
          }}
        />

        {/* Layer 8: Floating Golden Atmospheric Motes */}
        <div className="absolute inset-0 pointer-events-none opacity-70 overflow-hidden">
          {[...Array(16)].map((_, i) => (
            <motion.div
              key={i}
              className={`absolute w-1.5 h-1.5 rounded-full ${
                isLight ? "bg-amber-600/70 shadow-[0_0_6px_rgba(217,119,6,0.5)]" : "bg-amber-200/90 shadow-[0_0_8px_rgba(251,191,36,0.8)]"
              }`}
              style={{
                left: `${8 + ((i * 7) % 84)}%`,
                top: `${12 + ((i * 11) % 75)}%`,
              }}
              animate={{
                y: [-25, 25, -25],
                x: [-12, 18, -12],
                opacity: [0.2, 0.85, 0.2],
                scale: [0.8, 1.35, 0.8],
              }}
              transition={{
                duration: 6 + (i % 5),
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.35,
              }}
            />
          ))}
        </div>

        {/* Layer 9: Interactive Command Flashlight / Spotlight Cursor Torch */}
        {cursorPos.isHovering && (
          <div
            className="absolute inset-0 pointer-events-none transition-opacity duration-300"
            style={{
              background: isLight
                ? `radial-gradient(circle 420px at ${cursorPos.x}px ${cursorPos.y}px, rgba(245, 158, 11, 0.12) 0%, rgba(139, 92, 246, 0.04) 45%, transparent 80%)`
                : `radial-gradient(circle 420px at ${cursorPos.x}px ${cursorPos.y}px, rgba(251, 191, 36, 0.18) 0%, rgba(217, 119, 6, 0.06) 45%, transparent 80%)`,
            }}
          />
        )}
      </motion.div>

      {/* Cinematic Vignette & Content Readability Overlay */}
      <motion.div
        style={{ opacity: overlayOpacity }}
        className={`absolute inset-0 pointer-events-none ${
          isLight
            ? "bg-gradient-to-t from-[#f8fafc] via-[#f8fafc]/60 to-[#f8fafc]/80"
            : "bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-950/70"
        }`}
      />

      {/* Edge Radial Mask to keep text crystal-clear */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: isLight
            ? "radial-gradient(ellipse 90% 90% at 50% 45%, rgba(0,0,0,0) 25%, rgba(248,250,252,0.85) 90%)"
            : "radial-gradient(ellipse 90% 90% at 50% 45%, rgba(0,0,0,0) 25%, rgba(2,6,23,0.85) 90%)",
        }}
      />
    </div>
  );
}
