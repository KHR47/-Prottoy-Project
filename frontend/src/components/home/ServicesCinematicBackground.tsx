"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "@/context/ThemeContext";

export function ServicesCinematicBackground() {
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

    // 1. Drifting Luxury Golden Embers & Floating Dust Motes
    const emberCount = 65;
    const embers = Array.from({ length: emberCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 2.0 + 0.6,
      speedX: (Math.random() - 0.5) * 0.3,
      speedY: -0.2 - Math.random() * 0.45,
      alpha: Math.random() * 0.65 + 0.25,
      phase: Math.random() * Math.PI * 2,
      pulseSpeed: 0.03 + Math.random() * 0.04,
      isGlitter: Math.random() > 0.6,
    }));

    // 2. City Skyline Twinkling Window Nodes
    const skylineLights = [
      { xRel: 0.03, yRel: 0.72, size: 1.5, phase: 0.4 },
      { xRel: 0.07, yRel: 0.68, size: 1.8, phase: 1.6 },
      { xRel: 0.12, yRel: 0.64, size: 2.2, phase: 3.1 },
      { xRel: 0.16, yRel: 0.67, size: 2.0, phase: 4.8 },
      { xRel: 0.23, yRel: 0.63, size: 2.4, phase: 2.3 },
      { xRel: 0.27, yRel: 0.70, size: 1.9, phase: 5.2 },
      { xRel: 0.31, yRel: 0.75, size: 1.7, phase: 0.9 },
      { xRel: 0.35, yRel: 0.78, size: 1.4, phase: 3.7 },
      { xRel: 0.38, yRel: 0.81, size: 1.2, phase: 2.8 },
      { xRel: 0.14, yRel: 0.75, size: 1.6, phase: 1.1 },
      { xRel: 0.19, yRel: 0.79, size: 1.5, phase: 4.4 },
      { xRel: 0.25, yRel: 0.77, size: 1.8, phase: 3.0 },
    ];

    // 3. Trade Constellation Nodes
    const tradeNodes = [
      { xRel: 0.107, yRel: 0.225, label: "pin", size: 28 },
      { xRel: 0.063, yRel: 0.325, label: "shield", size: 24 },
      { xRel: 0.212, yRel: 0.382, label: "cctv", size: 26 },
      { xRel: 0.142, yRel: 0.490, label: "community", size: 26 },
      { xRel: 0.048, yRel: 0.536, label: "alert", size: 22 },
    ];

    // 4. Interconnecting Golden Circuit Vectors
    const circuits = [
      { from: { xRel: 0.107, yRel: 0.225 }, to: { xRel: 0.063, yRel: 0.325 }, speed: 0.8 },
      { from: { xRel: 0.107, yRel: 0.225 }, to: { xRel: 0.212, yRel: 0.382 }, speed: 0.7 },
      { from: { xRel: 0.063, yRel: 0.325 }, to: { xRel: 0.142, yRel: 0.490 }, speed: 0.9 },
      { from: { xRel: 0.212, yRel: 0.382 }, to: { xRel: 0.142, yRel: 0.490 }, speed: 0.75 },
      { from: { xRel: 0.063, yRel: 0.325 }, to: { xRel: 0.048, yRel: 0.536 }, speed: 0.85 },
      { from: { xRel: 0.142, yRel: 0.490 }, to: { xRel: 0.048, yRel: 0.536 }, speed: 0.95 },
      { from: { xRel: 0.212, yRel: 0.382 }, to: { xRel: 0.380, yRel: 0.480 }, speed: 0.6 },
    ];

    // 5. Global Grid Beacon Light Pillars
    const mapBeacons = [
      { xRel: 0.825, yRel: 0.490, heightMax: 120, phase: 0 },
      { xRel: 0.918, yRel: 0.300, heightMax: 180, phase: 1.5 },
      { xRel: 0.785, yRel: 0.640, heightMax: 90, phase: 3.0 },
      { xRel: 0.965, yRel: 0.560, heightMax: 140, phase: 4.2 },
    ];

    let t = 0;

    const render = () => {
      if (!isVisible) return;
      t += 0.016;
      ctx.clearRect(0, 0, width, height);

      // ── 1. Interconnecting Circuits & Traveling Energy Packets ──
      for (const circuit of circuits) {
        const x1 = circuit.from.xRel * width;
        const y1 = circuit.from.yRel * height;
        const x2 = circuit.to.xRel * width;
        const y2 = circuit.to.yRel * height;

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = isLight ? "rgba(217, 119, 6, 0.25)" : "rgba(234, 179, 8, 0.2)";
        ctx.lineWidth = isLight ? 1.8 : 1.2;
        ctx.stroke();

        const progress = ((t * circuit.speed * 0.4) % 1 + 1) % 1;
        const px = x1 + (x2 - x1) * progress;
        const py = y1 + (y2 - y1) * progress;

        ctx.fillStyle = isLight ? "rgba(217, 119, 6, 0.95)" : "rgba(250, 204, 21, 1)";
        ctx.shadowBlur = isLight ? 8 : 12;
        ctx.shadowColor = isLight ? "rgba(217, 119, 6, 0.9)" : "rgba(250, 204, 21, 0.9)";
        ctx.beginPath();
        ctx.arc(px, py, isLight ? 3 : 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // ── 2. Trade Constellation Pulse Nodes ──
      for (let i = 0; i < tradeNodes.length; i++) {
        const node = tradeNodes[i];
        const nx = node.xRel * width;
        const ny = node.yRel * height;
        const pulse = Math.sin(t * 2 + i * 0.8);
        const ringRadius = 8 + pulse * 4;

        ctx.beginPath();
        ctx.arc(nx, ny, ringRadius + 6, 0, Math.PI * 2);
        ctx.strokeStyle = isLight ? "rgba(217, 119, 6, 0.45)" : "rgba(234, 179, 8, 0.4)";
        ctx.lineWidth = 1.2;
        ctx.stroke();

        ctx.fillStyle = isLight ? "rgba(217, 119, 6, 0.85)" : "rgba(250, 204, 21, 0.9)";
        ctx.shadowBlur = 10;
        ctx.shadowColor = isLight ? "rgba(217, 119, 6, 0.9)" : "rgba(250, 204, 21, 0.9)";
        ctx.beginPath();
        ctx.arc(nx, ny, 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // ── 3. Map Light Pillar Beacons ──
      for (const b of mapBeacons) {
        const bx = b.xRel * width;
        const by = b.yRel * height;
        const currentH = b.heightMax * (0.6 + 0.4 * Math.sin(t * 1.5 + b.phase));

        const beamGrad = ctx.createLinearGradient(bx, by, bx, by - currentH);
        beamGrad.addColorStop(0, isLight ? "rgba(13, 148, 136, 0.45)" : "rgba(234, 179, 8, 0.45)");
        beamGrad.addColorStop(0.7, isLight ? "rgba(13, 148, 136, 0.15)" : "rgba(234, 179, 8, 0.15)");
        beamGrad.addColorStop(1, "transparent");

        ctx.fillStyle = beamGrad;
        ctx.fillRect(bx - 1.5, by - currentH, 3, currentH);

        ctx.fillStyle = isLight ? "rgba(13, 148, 136, 0.9)" : "rgba(250, 204, 21, 0.9)";
        ctx.beginPath();
        ctx.arc(bx, by, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      // ── 4. Skyline Window Lights ──
      for (const light of skylineLights) {
        const lx = light.xRel * width;
        const ly = light.yRel * height;
        const alpha = 0.2 + 0.6 * Math.sin(t * 1.6 + light.phase);
        ctx.fillStyle = isLight
          ? `rgba(217, 119, 6, ${Math.max(0, alpha * 0.7)})`
          : `rgba(250, 204, 21, ${Math.max(0, alpha)})`;
        ctx.beginPath();
        ctx.arc(lx, ly, light.size, 0, Math.PI * 2);
        ctx.fill();
      }

      // ── 5. Floating Luxury Sunlight / Golden Embers ──
      for (const e of embers) {
        e.x += e.speedX;
        e.y += e.speedY;
        e.phase += e.pulseSpeed;

        if (e.y < -10) {
          e.y = height + 10;
          e.x = Math.random() * width;
        }
        if (e.x < -10) e.x = width + 10;
        if (e.x > width + 10) e.x = -10;

        const currentAlpha = e.alpha * (0.6 + 0.4 * Math.sin(e.phase));
        ctx.fillStyle = isLight
          ? `rgba(217, 119, 6, ${currentAlpha * 0.65})`
          : `rgba(250, 204, 21, ${currentAlpha})`;
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.radius, 0, Math.PI * 2);
        ctx.fill();
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
        isLight ? "bg-transparent" : "bg-[#030408]"
      }`}
      aria-hidden="true"
    >
      {/* 1. Base Photographic Trade Reference Layer with Theme-Adaptive Opacity */}
      <div
        className={`absolute inset-0 bg-cover bg-center bg-no-repeat w-full h-full scale-100 transition-opacity duration-500 ${
          isLight ? "opacity-22 filter brightness-115 contrast-105" : "opacity-90"
        }`}
        style={{
          backgroundImage: "url('/services-bg.png')",
        }}
      />

      {/* 2. Light Theme Luminous Ambient Gradient */}
      {isLight && (
        <div
          className="absolute inset-0 pointer-events-none opacity-65"
          style={{
            background:
              "radial-gradient(ellipse 90% 65% at 50% 30%, rgba(217, 119, 6, 0.10) 0%, rgba(13, 148, 136, 0.06) 50%, transparent 85%)",
          }}
        />
      )}

      {/* 3. Dynamic Animated Canvas Simulation */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ mixBlendMode: isLight ? "normal" : "screen" }}
      />

      {/* 4. Luxury Holographic Scanline Grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity: isLight ? 0.03 : 0.04,
          backgroundImage: isLight
            ? "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(217, 119, 6, 0.25) 4px)"
            : "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(234, 179, 8, 0.4) 4px)",
        }}
      />

      {/* 5. Ambient Vignette Overlay */}
      <div
        className={`absolute inset-0 pointer-events-none ${
          isLight
            ? "bg-gradient-to-t from-[var(--bg-base)] via-transparent to-[var(--bg-base)]/40"
            : "bg-gradient-to-t from-[#02040a] via-transparent to-[#02040a]/40"
        }`}
      />
      <div
        className={`absolute inset-0 pointer-events-none ${
          isLight
            ? "bg-gradient-to-r from-[var(--bg-base)]/20 via-transparent to-[var(--bg-base)]/30"
            : "bg-gradient-to-r from-[#02040a]/20 via-transparent to-[#02040a]/30"
        }`}
      />
    </div>
  );
}
