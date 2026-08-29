"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";

export function TransportCinematicBackground() {
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
      t += 0.02;
      ctx.clearRect(0, 0, width, height);

      // Draw flowing transit light trails across screen
      const routes = [
        { yOffset: height * 0.35, amp: 40, freq: 0.003, speed: 1.2, color: "rgba(37, 99, 235, " },
        { yOffset: height * 0.55, amp: 60, freq: 0.002, speed: -0.9, color: "rgba(14, 165, 233, " },
        { yOffset: height * 0.75, amp: 35, freq: 0.004, speed: 1.5, color: "rgba(13, 148, 136, " },
      ];

      for (let r = 0; r < routes.length; r++) {
        const route = routes[r];
        ctx.beginPath();
        for (let x = 0; x <= width; x += 15) {
          const y = route.yOffset + Math.sin(x * route.freq + t * route.speed) * route.amp;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = route.color + (isLight ? "0.35)" : "0.15)");
        ctx.lineWidth = isLight ? 2 : 1.5;
        ctx.stroke();

        // High-speed light pulse packet
        const packetX = ((t * 220 * (r + 1)) % (width + 200)) - 100;
        const packetY = route.yOffset + Math.sin(packetX * route.freq + t * route.speed) * route.amp;
        ctx.fillStyle = route.color + (isLight ? "0.95)" : "0.95)");
        ctx.shadowBlur = isLight ? 10 : 14;
        ctx.shadowColor = route.color + "1)";
        ctx.beginPath();
        ctx.arc(packetX, packetY, 3, 0, Math.PI * 2);
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
        alt="Transport Network Background"
        className={`w-full h-full object-cover object-center transition-all duration-500 ${
          isLight
            ? "opacity-20 filter brightness-115 hue-rotate-[190deg]"
            : "opacity-70 filter hue-rotate-[190deg] contrast-105"
        }`}
      />

      {isLight && (
        <div
          className="absolute inset-0 pointer-events-none opacity-60"
          style={{
            background:
              "radial-gradient(ellipse 90% 65% at 50% 30%, rgba(37, 99, 235, 0.08) 0%, rgba(14, 165, 233, 0.05) 50%, transparent 85%)",
          }}
        />
      )}

      <motion.div
        animate={{
          opacity: isLight ? [0.1, 0.35, 0.15, 0.4, 0.1] : [0.2, 0.5, 0.25, 0.55, 0.2],
        }}
        transition={{
          duration: 6.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-[40%] left-[25%] -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] rounded-full bg-blue-600/20 blur-[100px] pointer-events-none"
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
