"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";

export function LostFoundCinematicBackground() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isLight = mounted && theme === "light";

  // Mouse coords normalized (-1 to 1)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth spring physics for 3D camera parallax tilt
  const springConfig = { damping: 25, stiffness: 80, mass: 0.5 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  // Subtle 3D tilt
  const rotateX = useTransform(smoothY, [-1, 1], [4, -4]);
  const rotateY = useTransform(smoothX, [-1, 1], [-5, 5]);
  const translateX = useTransform(smoothX, [-1, 1], [-12, 12]);
  const translateY = useTransform(smoothY, [-1, 1], [-8, 8]);

  // Torchlight spotlight coordinates
  const [torchPos, setTorchPos] = useState({ x: 50, y: 40 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const xNorm = (e.clientX / innerWidth) * 2 - 1;
      const yNorm = (e.clientY / innerHeight) * 2 - 1;
      mouseX.set(xNorm);
      mouseY.set(yNorm);
      setTorchPos({
        x: (e.clientX / innerWidth) * 100,
        y: (e.clientY / innerHeight) * 100,
      });
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  if (!mounted) return null;

  return (
    <div
      className={`fixed inset-0 pointer-events-none z-0 overflow-hidden select-none transition-colors duration-500 ${
        isLight ? "bg-transparent" : "bg-black"
      }`}
    >
      {/* Light Theme Ambient Atmosphere */}
      {isLight && (
        <div
          className="absolute inset-0 pointer-events-none opacity-60"
          style={{
            background:
              "radial-gradient(ellipse 90% 65% at 50% 30%, rgba(217, 119, 6, 0.08) 0%, rgba(14, 165, 233, 0.06) 50%, transparent 85%)",
          }}
        />
      )}

      {/* 3D Parallax Container */}
      <motion.div
        style={{
          rotateX,
          rotateY,
          x: translateX,
          y: translateY,
          transformPerspective: 1200,
        }}
        className="relative w-full h-full scale-105 origin-center will-change-transform"
      >
        {/* The Base Photo */}
        <img
          src="/images/lost-found-bg.jpg"
          alt="Lost and Found Civic Vault"
          className={`w-full h-full object-cover object-center transition-all duration-500 ${
            isLight
              ? "opacity-25 filter brightness-115 contrast-105"
              : "opacity-80 filter brightness-95 contrast-110"
          }`}
        />

        {/* Ambient Holographic Vault Glow */}
        <motion.div
          animate={{
            opacity: isLight ? [0.25, 0.6, 0.3, 0.65, 0.25] : [0.35, 0.75, 0.4, 0.85, 0.35],
            scale: [1, 1.08, 1, 1.12, 1],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-[28%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] rounded-full bg-gradient-to-r from-amber-500/25 via-orange-400/20 to-yellow-300/15 blur-[75px] pointer-events-none"
        />

        {/* Golden Specular Glimmer on Keys & Phone */}
        <motion.div
          animate={{
            opacity: [0.1, 0.45, 0.15, 0.5, 0.1],
          }}
          transition={{
            duration: 4.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-[70%] left-[53%] -translate-x-1/2 -translate-y-1/2 w-[220px] h-[180px] rounded-full bg-amber-400/25 blur-[50px] pointer-events-none"
        />

        {/* Reflection Glimmer */}
        <motion.div
          animate={{
            opacity: [0.05, 0.3, 0.08, 0.35, 0.05],
          }}
          transition={{
            duration: 5.2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1.5,
          }}
          className="absolute top-[65%] left-[72%] -translate-x-1/2 -translate-y-1/2 w-[180px] h-[220px] rounded-full bg-cyan-400/20 blur-[45px] pointer-events-none"
        />

        {/* Periodic Sweep Light Beam */}
        <motion.div
          animate={{
            x: ["-100%", "200%"],
            opacity: isLight ? [0, 0.2, 0] : [0, 0.35, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            repeatDelay: 5,
            ease: "easeInOut",
          }}
          className={`absolute inset-y-0 w-1/3 skew-x-[-25deg] pointer-events-none ${
            isLight
              ? "bg-gradient-to-r from-transparent via-amber-200/20 to-transparent"
              : "bg-gradient-to-r from-transparent via-amber-200/15 to-transparent mix-blend-overlay"
          }`}
        />

        {/* Interactive Discovery Cursor Tracker */}
        <div
          style={{
            background: isLight
              ? `radial-gradient(circle 380px at ${torchPos.x}% ${torchPos.y}%, rgba(217, 119, 6, 0.12) 0%, rgba(14, 165, 233, 0.04) 45%, transparent 75%)`
              : `radial-gradient(circle 380px at ${torchPos.x}% ${torchPos.y}%, rgba(251, 191, 36, 0.14) 0%, rgba(245, 158, 11, 0.04) 45%, transparent 75%)`,
          }}
          className="absolute inset-0 transition-all duration-75 pointer-events-none"
        />
      </motion.div>

      {/* Cinematic Vignette & Edge Blending */}
      <div
        className={`absolute inset-0 pointer-events-none ${
          isLight
            ? "bg-gradient-to-t from-[var(--bg-base)] via-[var(--bg-base)]/30 to-[var(--bg-base)]/60"
            : "bg-gradient-to-t from-black via-black/40 to-black/70"
        }`}
      />
      <div
        className={`absolute inset-0 pointer-events-none ${
          isLight
            ? "bg-gradient-to-r from-[var(--bg-base)]/50 via-transparent to-[var(--bg-base)]/50"
            : "bg-gradient-to-r from-black/80 via-transparent to-black/80"
        }`}
      />
    </div>
  );
}
