"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";

export function UtilitiesCinematicBackground() {
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

      // 1. Flowing pipeline arcs
      const pipes = [
        { y: height * 0.38, amp: 30, color: isLight ? "rgba(2, 132, 199, " : "rgba(56, 189, 248, " }, // Water blue
        { y: height * 0.58, amp: 45, color: isLight ? "rgba(217, 119, 6, " : "rgba(245, 158, 11, " }, // Gas amber
        { y: height * 0.78, amp: 25, color: isLight ? "rgba(5, 150, 105, " : "rgba(234, 179, 8, " }, // Electricity emerald
      ];

      for (let p = 0; p < pipes.length; p++) {
        const pipe = pipes[p];
        ctx.beginPath();
        for (let x = 0; x <= width; x += 20) {
          const y = pipe.y + Math.sin(x * 0.003 + t * (0.8 + p * 0.3)) * pipe.amp;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = pipe.color + (isLight ? "0.35)" : "0.14)");
        ctx.lineWidth = isLight ? 2.2 : 2;
        ctx.stroke();

        // Energy pulses traveling along pipes
        const px = ((t * 180 * (p + 1)) % (width + 100)) - 50;
        const py = pipe.y + Math.sin(px * 0.003 + t * (0.8 + p * 0.3)) * pipe.amp;
        ctx.fillStyle = pipe.color + "0.95)";
        ctx.shadowBlur = isLight ? 8 : 10;
        ctx.shadowColor = pipe.color + "1)";
        ctx.beginPath();
        ctx.arc(px, py, 2.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

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
        isLight ? "bg-transparent" : "bg-[#020617]"
      }`}
    >
      <img
        src="/images/auth-bg.png"
        alt="Smart Utilities Network Grid"
        className={`w-full h-full object-cover object-center transition-all duration-500 ${
          isLight
            ? "opacity-20 filter brightness-115 hue-rotate-[45deg]"
            : "opacity-70 filter hue-rotate-[45deg] contrast-105"
        }`}
      />

      {isLight && (
        <div
          className="absolute inset-0 pointer-events-none opacity-60"
          style={{
            background:
              "radial-gradient(ellipse 90% 65% at 50% 30%, rgba(2, 132, 199, 0.08) 0%, rgba(217, 119, 6, 0.05) 50%, transparent 85%)",
          }}
        />
      )}

      <motion.div
        animate={{
          opacity: isLight ? [0.1, 0.35, 0.15, 0.4, 0.1] : [0.2, 0.5, 0.25, 0.55, 0.2],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-[45%] left-[25%] -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-cyan-600/20 blur-[100px] pointer-events-none"
      />

      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

      <div
        className={`absolute inset-0 pointer-events-none ${
          isLight
            ? "bg-gradient-to-t from-[var(--bg-base)] via-transparent to-[var(--bg-base)]/40"
            : "bg-gradient-to-t from-black via-black/40 to-black/60"
        }`}
      />
    </div>
  );
}
