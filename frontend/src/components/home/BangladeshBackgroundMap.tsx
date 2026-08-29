"use client";

import { useEffect, useRef, useState } from "react";
import { useScroll } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";

// Key city coordinates mapped relative to Bangladesh bounding box for light-mode radar nodes
const MAJOR_HUBS = [
  { name: "Dhaka", xRel: 0.525, yRel: 0.510, color: "#0d9488" },
  { name: "Chattogram", xRel: 0.720, yRel: 0.720, color: "#0284c7" },
  { name: "Sylhet", xRel: 0.750, yRel: 0.320, color: "#8b5cf6" },
  { name: "Rajshahi", xRel: 0.280, yRel: 0.390, color: "#f59e0b" },
  { name: "Khulna", xRel: 0.400, yRel: 0.680, color: "#10b981" },
  { name: "Barishal", xRel: 0.510, yRel: 0.700, color: "#06b6d4" },
  { name: "Rangpur", xRel: 0.320, yRel: 0.210, color: "#f97316" },
  { name: "Mymensingh", xRel: 0.530, yRel: 0.360, color: "#6366f1" },
];

export function BangladeshBackgroundMap() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isLight = mounted && theme === "light";

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    let animId: number;
    let img = new Image();
    img.crossOrigin = "anonymous";
    img.src = "/images/bangladesh-electric-map.jpg";

    let cleanCanvas: HTMLCanvasElement | null = null;
    let cleanBloomCanvas: HTMLCanvasElement | null = null;
    let lightCanvas: HTMLCanvasElement | null = null;
    let lightBloomCanvas: HTMLCanvasElement | null = null;

    let mouseX = -1000;
    let mouseY = -1000;
    let currentScroll = 0;
    let isVisible = true;

    // Track scroll with throttling
    const unsubscribeScroll = scrollY.on("change", (latest) => {
      currentScroll = latest;
    });

    const handleResize = () => {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    handleResize();
    window.addEventListener("resize", handleResize, { passive: true });

    const handlePointerMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    window.addEventListener("pointermove", handlePointerMove, { passive: true });

    const handleVisibilityChange = () => {
      isVisible = !document.hidden;
      if (isVisible) {
        cancelAnimationFrame(animId);
        animId = requestAnimationFrame(render);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    img.onload = () => {
      // 1. Offscreen canvas for Dark Mode (luminance keying: strips black background)
      cleanCanvas = document.createElement("canvas");
      cleanCanvas.width = img.width;
      cleanCanvas.height = img.height;
      const cleanCtx = cleanCanvas.getContext("2d");
      if (!cleanCtx) return;

      cleanCtx.drawImage(img, 0, 0);
      const darkImgData = cleanCtx.getImageData(0, 0, img.width, img.height);
      const darkData = darkImgData.data;

      for (let i = 0; i < darkData.length; i += 4) {
        const r = darkData[i];
        const g = darkData[i + 1];
        const b = darkData[i + 2];
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;

        if (lum < 28) {
          darkData[i + 3] = 0;
        } else if (lum < 60) {
          const factor = (lum - 28) / (60 - 28);
          darkData[i + 3] = Math.round(255 * factor);
        }
      }
      cleanCtx.putImageData(darkImgData, 0, 0);

      // Pre-render Dark Mode Bloom layer once
      cleanBloomCanvas = document.createElement("canvas");
      cleanBloomCanvas.width = img.width;
      cleanBloomCanvas.height = img.height;
      const darkBloomCtx = cleanBloomCanvas.getContext("2d");
      if (darkBloomCtx) {
        darkBloomCtx.filter = "blur(16px) brightness(1.35)";
        darkBloomCtx.drawImage(cleanCanvas, 0, 0);
        darkBloomCtx.filter = "none";
      }

      // 2. Offscreen canvas for Light Mode (crisp tactical blueprint inversion)
      lightCanvas = document.createElement("canvas");
      lightCanvas.width = img.width;
      lightCanvas.height = img.height;
      const lightCtx = lightCanvas.getContext("2d");
      if (!lightCtx) return;

      lightCtx.drawImage(img, 0, 0);
      const lightImgData = lightCtx.getImageData(0, 0, img.width, img.height);
      const lightData = lightImgData.data;

      for (let i = 0; i < lightData.length; i += 4) {
        const r = lightData[i];
        const g = lightData[i + 1];
        const b = lightData[i + 2];
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;

        if (lum < 32) {
          lightData[i + 3] = 0; // Transparent background
        } else {
          // Colorize electric lines into high-contrast tactical deep teal & slate cyan
          const intensity = Math.min(1, (lum - 32) / 140);
          lightData[i] = Math.round(15 + (13 - 15) * intensity);     // R (deep teal)
          lightData[i + 1] = Math.round(118 + (148 - 118) * intensity); // G (vibrant teal)
          lightData[i + 2] = Math.round(110 + (136 - 110) * intensity); // B
          lightData[i + 3] = Math.round(180 * intensity); // Alpha
        }
      }
      lightCtx.putImageData(lightImgData, 0, 0);

      // Pre-render Light Mode Bloom layer once
      lightBloomCanvas = document.createElement("canvas");
      lightBloomCanvas.width = img.width;
      lightBloomCanvas.height = img.height;
      const lightBloomCtx = lightBloomCanvas.getContext("2d");
      if (lightBloomCtx) {
        lightBloomCtx.filter = "blur(10px)";
        lightBloomCtx.drawImage(lightCanvas, 0, 0);
        lightBloomCtx.filter = "none";
      }
    };

    let startTime = performance.now();

    const render = (time: number) => {
      if (!isVisible) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Calculate scroll fade
      const fadeFactor = Math.max(0, 1 - currentScroll / 850);

      if (fadeFactor > 0.01) {
        const activeCanvas = isLight ? lightCanvas : cleanCanvas;
        const activeBloom = isLight ? lightBloomCanvas : cleanBloomCanvas;

        if (activeCanvas) {
          const elapsed = (time - startTime) / 1000;

          // Smooth breathing glow wave
          const breathingPulse = 0.75 + 0.25 * Math.sin(elapsed * 1.6);
          const microFlicker = Math.random() > 0.96 ? 0.15 : 0;
          const totalBrightness = (breathingPulse + microFlicker) * fadeFactor;

          // Scale & position map
          const scale = Math.min(
            (canvas.width * 0.92) / activeCanvas.width,
            (canvas.height * 0.92) / activeCanvas.height
          );
          const drawW = activeCanvas.width * scale;
          const drawH = activeCanvas.height * scale;
          const drawX = (canvas.width - drawW) / 2;
          const drawY = (canvas.height - drawH) / 2;

          ctx.save();

          if (isLight) {
            // ── LIGHT MODE RENDERING ──
            ctx.globalAlpha = Math.min(1, totalBrightness * 0.85);

            // Layer 1: Pre-rendered soft cyan blueprint glow bloom (0 cost)
            if (activeBloom) {
              ctx.drawImage(activeBloom, drawX, drawY, drawW, drawH);
            }

            // Layer 2: Crisp tactical vector lines
            ctx.drawImage(activeCanvas, drawX, drawY, drawW, drawH);

            // Layer 3: Animated Regional Hub Radar Nodes
            for (let i = 0; i < MAJOR_HUBS.length; i++) {
              const hub = MAJOR_HUBS[i];
              const hx = drawX + drawW * hub.xRel;
              const hy = drawY + drawH * hub.yRel;
              const phase = (elapsed * 2 + i * 0.7) % 3;

              // Expanding radar ring
              ctx.beginPath();
              ctx.arc(hx, hy, 4 + phase * 12, 0, Math.PI * 2);
              ctx.strokeStyle = hub.color;
              ctx.lineWidth = 1.2;
              ctx.globalAlpha = Math.max(0, 1 - phase / 3) * 0.65 * fadeFactor;
              ctx.stroke();

              // Central glowing hub beacon
              ctx.beginPath();
              ctx.arc(hx, hy, 3.5, 0, Math.PI * 2);
              ctx.fillStyle = hub.color;
              ctx.globalAlpha = 0.9 * fadeFactor;
              ctx.fill();
            }

            // Layer 4: Interactive Light Aurora Torch on Cursor
            if (mouseX > 0 && mouseY > 0) {
              const lightFlare = ctx.createRadialGradient(
                mouseX,
                mouseY,
                10,
                mouseX,
                mouseY,
                360
              );
              lightFlare.addColorStop(0, "rgba(13, 148, 136, 0.18)");
              lightFlare.addColorStop(0.45, "rgba(14, 165, 233, 0.08)");
              lightFlare.addColorStop(1, "rgba(244, 247, 251, 0)");

              ctx.globalAlpha = 1;
              ctx.fillStyle = lightFlare;
              ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
          } else {
            // ── DARK MODE RENDERING ──
            ctx.globalAlpha = totalBrightness;
            ctx.globalCompositeOperation = "screen";

            // Layer 1: Pre-rendered ambient soft bloom glow (0 cost)
            if (activeBloom) {
              ctx.drawImage(activeBloom, drawX, drawY, drawW, drawH);
            }

            // Layer 2: Sharp crisp lightning lines
            ctx.drawImage(activeCanvas, drawX, drawY, drawW, drawH);

            // Layer 3: Interactive Mouse Torch (flares up lines near the cursor)
            if (mouseX > 0 && mouseY > 0) {
              const radialGlow = ctx.createRadialGradient(
                mouseX,
                mouseY,
                10,
                mouseX,
                mouseY,
                380
              );
              radialGlow.addColorStop(0, "rgba(202, 86, 237, 0.45)");
              radialGlow.addColorStop(0.4, "rgba(0, 245, 160, 0.18)");
              radialGlow.addColorStop(1, "rgba(0, 0, 0, 0)");

              ctx.fillStyle = radialGlow;
              ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
          }

          ctx.restore();
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      unsubscribeScroll();
    };
  }, [scrollY, isLight]);

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 pointer-events-none z-0 overflow-hidden select-none transition-colors duration-500 ${
        isLight ? "bg-transparent" : "bg-[#02040a]"
      }`}
      aria-hidden="true"
    >
      {/* Light Mode Soft Ambient Gradient Background */}
      {isLight && (
        <div
          className="absolute inset-0 pointer-events-none opacity-60"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% 30%, rgba(13, 148, 136, 0.12) 0%, rgba(14, 165, 233, 0.06) 45%, transparent 80%)",
          }}
        />
      )}

      {/* Dynamic Animated Bangladesh Tactical Map Canvas */}
      <canvas ref={canvasRef} className="w-full h-full block pointer-events-none" />
    </div>
  );
}
