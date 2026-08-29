"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";

export function AuthCinematicBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isLight = mounted && theme === "light";

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    // Drifting upward atmospheric data motes
    interface Particle {
      x: number;
      y: number;
      radius: number;
      alpha: number;
      speedY: number;
      speedX: number;
      pulseSpeed: number;
      pulsePhase: number;
    }

    const particleCount = 45;
    const particles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: 0.6 + Math.random() * 1.5,
        alpha: 0.15 + Math.random() * 0.45,
        speedY: -(0.12 + Math.random() * 0.25),
        speedX: (Math.random() - 0.5) * 0.1,
        pulseSpeed: 0.02 + Math.random() * 0.03,
        pulsePhase: Math.random() * Math.PI * 2,
      });
    }

    // City lights subtle twinkle coordinates
    const cityLights = [
      { xRel: 0.05, yRel: 0.55, size: 1.2, phase: 0 },
      { xRel: 0.08, yRel: 0.62, size: 1.0, phase: 1.2 },
      { xRel: 0.12, yRel: 0.58, size: 1.5, phase: 2.4 },
      { xRel: 0.15, yRel: 0.66, size: 1.1, phase: 0.8 },
      { xRel: 0.19, yRel: 0.52, size: 1.3, phase: 3.1 },
      { xRel: 0.23, yRel: 0.60, size: 1.4, phase: 1.9 },
      { xRel: 0.27, yRel: 0.65, size: 1.0, phase: 4.0 },
      { xRel: 0.31, yRel: 0.57, size: 1.2, phase: 2.8 },
    ];

    let isVisible = true;
    const handleVisibilityChange = () => {
      isVisible = !document.hidden;
      if (isVisible) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = requestAnimationFrame(render);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    let t = 0;

    const render = () => {
      if (!isVisible) return;
      t += 0.016;
      ctx.clearRect(0, 0, width, height);

      // 1. Draw drifting glowing data motes
      for (const p of particles) {
        p.y += p.speedY;
        p.x += p.speedX;
        p.pulsePhase += p.pulseSpeed;

        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        const currentAlpha = p.alpha * (0.6 + 0.4 * Math.sin(p.pulsePhase));
        ctx.fillStyle = isLight
          ? `rgba(13, 148, 136, ${currentAlpha * 0.75})`
          : `rgba(6, 182, 212, ${currentAlpha})`;
        ctx.shadowBlur = isLight ? 6 : 8;
        ctx.shadowColor = isLight ? "rgba(13, 148, 136, 0.8)" : "rgba(6, 182, 212, 0.8)";
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // 2. Draw twinkling city lights
      for (const light of cityLights) {
        const lx = light.xRel * width;
        const ly = light.yRel * height;
        const alpha = 0.25 + 0.5 * Math.sin(t * 1.5 + light.phase);
        ctx.fillStyle = isLight
          ? `rgba(14, 165, 233, ${Math.max(0, alpha * 0.8)})`
          : `rgba(56, 189, 248, ${Math.max(0, alpha)})`;
        ctx.beginPath();
        ctx.arc(lx, ly, light.size, 0, Math.PI * 2);
        ctx.fill();
      }

      // 3. Draw soft flowing wave shimmer across bottom terrain
      const waveY = height * 0.84;
      const waveGradient = ctx.createLinearGradient(0, waveY, width, waveY);
      waveGradient.addColorStop(0, "rgba(6, 182, 212, 0)");
      waveGradient.addColorStop(0.3, isLight ? "rgba(13, 148, 136, 0.12)" : "rgba(14, 165, 233, 0.08)");
      waveGradient.addColorStop(0.7, isLight ? "rgba(14, 165, 233, 0.10)" : "rgba(6, 182, 212, 0.05)");
      waveGradient.addColorStop(1, "rgba(6, 182, 212, 0)");

      ctx.fillStyle = waveGradient;
      ctx.beginPath();
      ctx.moveTo(0, height);
      for (let x = 0; x <= width; x += 20) {
        const yOffset = Math.sin(x * 0.005 + t * 0.8) * 12 + Math.cos(x * 0.008 - t * 0.5) * 8;
        ctx.lineTo(x, waveY + yOffset);
      }
      ctx.lineTo(width, height);
      ctx.closePath();
      ctx.fill();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isLight]);

  if (!mounted) return null;

  return (
    <div
      className={`fixed inset-0 pointer-events-none z-0 overflow-hidden select-none transition-colors duration-500 ${
        isLight ? "bg-transparent" : "bg-[#030712]"
      }`}
    >
      {/* 1. Base Image with Theme Adaptation */}
      <img
        src="/images/auth-bg.png"
        alt="Smart City Network Vault"
        className={`w-full h-full object-cover object-center transition-all duration-500 ${
          isLight
            ? "opacity-25 filter brightness-115 contrast-105"
            : "opacity-90 filter contrast-105"
        }`}
      />

      {/* 2. Light Theme Luminous Ambient Gradient */}
      {isLight && (
        <div
          className="absolute inset-0 pointer-events-none opacity-70"
          style={{
            background:
              "radial-gradient(ellipse 90% 65% at 50% 30%, rgba(13, 148, 136, 0.12) 0%, rgba(14, 165, 233, 0.08) 50%, transparent 85%)",
          }}
        />
      )}

      {/* 3. Left Constellation & Shield Breathing Glow */}
      <motion.div
        animate={{
          opacity: isLight ? [0.2, 0.55, 0.25, 0.6, 0.2] : [0.35, 0.85, 0.45, 0.9, 0.35],
          scale: [1, 1.08, 1, 1.12, 1],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-[44%] left-[16%] -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] rounded-full bg-gradient-to-r from-teal-500/25 via-cyan-500/20 to-blue-500/15 blur-[60px] pointer-events-none"
      />

      {/* 4. Canvas Simulation Layer */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

      {/* 5. Vignette Overlay */}
      <div
        className={`absolute inset-0 pointer-events-none ${
          isLight
            ? "bg-gradient-to-t from-[var(--bg-base)] via-[var(--bg-base)]/20 to-[var(--bg-base)]/50"
            : "bg-gradient-to-t from-black via-transparent to-black/50"
        }`}
      />
    </div>
  );
}
