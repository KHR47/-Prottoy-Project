"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "@/context/ThemeContext";

export function ReportsCinematicBackground() {
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

    // 1. Drifting atmospheric dust, motes, and cyber sparks
    const particleCount = 75;
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 2.2 + 0.6,
      speedX: (Math.random() - 0.5) * 0.45,
      speedY: -0.25 - Math.random() * 0.6,
      alpha: Math.random() * 0.7 + 0.3,
      phase: Math.random() * Math.PI * 2,
      pulseSpeed: 0.04 + Math.random() * 0.05,
      isSpark: Math.random() > 0.5,
    }));

    // 2. High-Altitude Surveillance Drones flying across the skyline
    const drones = [
      { x: -50, y: height * 0.18, speedX: 1.2, speedY: 0.15, beaconPhase: 0 },
      { x: width * 0.4, y: height * 0.28, speedX: -0.9, speedY: 0.1, beaconPhase: Math.PI },
      { x: width * 0.8, y: height * 0.12, speedX: -1.4, speedY: -0.12, beaconPhase: Math.PI / 2 },
    ];

    // 3. City building window flicker points across isometric grid
    const cityLights = [
      { xRel: 0.04, yRel: 0.19, size: 1.8, phase: 0.5 },
      { xRel: 0.08, yRel: 0.25, size: 2.2, phase: 1.8 },
      { xRel: 0.12, yRel: 0.15, size: 1.9, phase: 3.2 },
      { xRel: 0.16, yRel: 0.28, size: 1.5, phase: 4.1 },
      { xRel: 0.19, yRel: 0.20, size: 2.0, phase: 2.0 },
      { xRel: 0.23, yRel: 0.32, size: 1.7, phase: 5.4 },
      { xRel: 0.06, yRel: 0.42, size: 1.6, phase: 0.9 },
      { xRel: 0.11, yRel: 0.51, size: 2.4, phase: 2.7 },
      { xRel: 0.17, yRel: 0.58, size: 1.8, phase: 4.8 },
      { xRel: 0.05, yRel: 0.72, size: 2.0, phase: 1.2 },
      { xRel: 0.09, yRel: 0.81, size: 1.6, phase: 3.8 },
      { xRel: 0.14, yRel: 0.76, size: 2.2, phase: 5.1 },
      { xRel: 0.21, yRel: 0.85, size: 1.7, phase: 2.3 },
      { xRel: 0.78, yRel: 0.74, size: 1.9, phase: 3.0 },
      { xRel: 0.81, yRel: 0.79, size: 2.2, phase: 1.6 },
      { xRel: 0.84, yRel: 0.72, size: 1.7, phase: 4.2 },
      { xRel: 0.88, yRel: 0.76, size: 2.0, phase: 2.1 },
    ];

    // 4. Exact Pin Coordinates
    const bluePins = [
      { xRel: 0.028, yRel: 0.135, speed: 1.2, offset: 0.0 },
      { xRel: 0.228, yRel: 0.235, speed: 1.1, offset: 0.2 },
      { xRel: 0.312, yRel: 0.378, speed: 1.4, offset: 0.4 },
      { xRel: 0.080, yRel: 0.675, speed: 1.3, offset: 0.6 },
      { xRel: 0.294, yRel: 0.785, speed: 1.0, offset: 0.8 },
    ];

    // 5. Extended Network Routes
    const routeVectors = [
      { from: { xRel: 0.145, yRel: 0.345 }, to: { xRel: 0.228, yRel: 0.235 }, color: "rgba(14, 165, 233, ", speed: 0.9 },
      { from: { xRel: 0.145, yRel: 0.345 }, to: { xRel: 0.312, yRel: 0.378 }, color: "rgba(14, 165, 233, ", speed: 1.1 },
      { from: { xRel: 0.145, yRel: 0.345 }, to: { xRel: 0.230, yRel: 0.612 }, color: "rgba(239, 68, 68, ", speed: 1.2 },
      { from: { xRel: 0.230, yRel: 0.612 }, to: { xRel: 0.340, yRel: 0.620 }, color: "rgba(239, 68, 68, ", speed: 1.4 },
      { from: { xRel: 0.230, yRel: 0.612 }, to: { xRel: 0.294, yRel: 0.785 }, color: "rgba(239, 68, 68, ", speed: 1.0 },
      { from: { xRel: 0.230, yRel: 0.612 }, to: { xRel: 0.080, yRel: 0.675 }, color: "rgba(14, 165, 233, ", speed: 1.15 },
      { from: { xRel: 0.080, yRel: 0.675 }, to: { xRel: 0.146, yRel: 0.848 }, color: "rgba(14, 165, 233, ", speed: 1.05 },
      { from: { xRel: 0.312, yRel: 0.378 }, to: { xRel: 0.480, yRel: 0.820 }, color: "rgba(14, 165, 233, ", speed: 0.85 },
      { from: { xRel: 0.028, yRel: 0.135 }, to: { xRel: 0.145, yRel: 0.345 }, color: "rgba(14, 165, 233, ", speed: 1.2 },
    ];

    let t = 0;

    const render = () => {
      if (!isVisible) return;
      t += 0.016;
      ctx.clearRect(0, 0, width, height);

      // ── 1. Animated Network Routes & Fast Data Packets ──
      for (const route of routeVectors) {
        const x1 = route.from.xRel * width;
        const y1 = route.from.yRel * height;
        const x2 = route.to.xRel * width;
        const y2 = route.to.yRel * height;

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = route.color + (isLight ? "0.28)" : "0.22)");
        ctx.lineWidth = isLight ? 1.8 : 1.2;
        ctx.stroke();

        // Traveling Light Packet
        const progress = ((t * route.speed * 0.4) % 1 + 1) % 1;
        const px = x1 + (x2 - x1) * progress;
        const py = y1 + (y2 - y1) * progress;

        ctx.fillStyle = route.color + (isLight ? "0.95)" : "1)");
        ctx.shadowBlur = isLight ? 8 : 12;
        ctx.shadowColor = route.color + "1)";
        ctx.beginPath();
        ctx.arc(px, py, isLight ? 3 : 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // ── 2. Tactical Blue Incident Radar Pins ──
      for (const pin of bluePins) {
        const px = pin.xRel * width;
        const py = pin.yRel * height;
        const pulse = Math.sin(t * pin.speed + pin.offset);
        const radius = 6 + pulse * 3.5;

        // Expanding Radar Ring
        ctx.beginPath();
        ctx.arc(px, py, radius + 8, 0, Math.PI * 2);
        ctx.strokeStyle = isLight ? "rgba(13, 148, 136, 0.45)" : "rgba(56, 189, 248, 0.4)";
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Glowing Center
        ctx.fillStyle = isLight ? "rgba(13, 148, 136, 0.85)" : "rgba(56, 189, 248, 0.9)";
        ctx.shadowBlur = 10;
        ctx.shadowColor = isLight ? "rgba(13, 148, 136, 0.9)" : "rgba(56, 189, 248, 0.9)";
        ctx.beginPath();
        ctx.arc(px, py, 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // ── 3. High-Altitude Drones with Flashing Beacons ──
      for (const drone of drones) {
        drone.x += drone.speedX;
        drone.y += drone.speedY;

        if (drone.speedX > 0 && drone.x > width + 80) drone.x = -60;
        if (drone.speedX < 0 && drone.x < -80) drone.x = width + 60;

        // Drone body
        ctx.fillStyle = isLight ? "rgba(30, 41, 59, 0.75)" : "rgba(226, 232, 240, 0.8)";
        ctx.beginPath();
        ctx.arc(drone.x, drone.y, 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Drone flashing beacon
        const beaconAlpha = 0.3 + 0.7 * Math.abs(Math.sin(t * 3.5 + drone.beaconPhase));
        ctx.fillStyle = `rgba(239, 68, 68, ${beaconAlpha})`;
        ctx.shadowBlur = 8;
        ctx.shadowColor = "rgba(239, 68, 68, 0.9)";
        ctx.beginPath();
        ctx.arc(drone.x, drone.y, 1.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // ── 4. Twinkling City Building Windows ──
      for (const light of cityLights) {
        const lx = light.xRel * width;
        const ly = light.yRel * height;
        const alpha = 0.2 + 0.6 * Math.sin(t * 1.8 + light.phase);
        ctx.fillStyle = isLight
          ? `rgba(13, 148, 136, ${Math.max(0, alpha * 0.75)})`
          : `rgba(56, 189, 248, ${Math.max(0, alpha)})`;
        ctx.beginPath();
        ctx.arc(lx, ly, light.size, 0, Math.PI * 2);
        ctx.fill();
      }

      // ── 5. Floating Dust & Data Motes ──
      for (const p of particles) {
        p.x += p.speedX;
        p.y += p.speedY;
        p.phase += p.pulseSpeed;

        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        const currentAlpha = p.alpha * (0.6 + 0.4 * Math.sin(p.phase));
        ctx.fillStyle = isLight
          ? `rgba(13, 148, 136, ${currentAlpha * 0.65})`
          : `rgba(56, 189, 248, ${currentAlpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
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
        isLight ? "bg-transparent" : "bg-[#02040a]"
      }`}
      aria-hidden="true"
    >
      {/* 1. Base Reference Photographic Layer with Theme-Adaptive Opacity */}
      <div
        className={`absolute inset-0 bg-cover bg-center bg-no-repeat w-full h-full scale-100 transition-opacity duration-500 ${
          isLight ? "opacity-20 filter brightness-110 contrast-105" : "opacity-90"
        }`}
        style={{
          backgroundImage: "url('/reports-bg.png')",
        }}
      />

      {/* 2. Light Theme Luminous Ambient Gradient */}
      {isLight && (
        <div
          className="absolute inset-0 pointer-events-none opacity-70"
          style={{
            background:
              "radial-gradient(ellipse 90% 65% at 50% 30%, rgba(13, 148, 136, 0.12) 0%, rgba(14, 165, 233, 0.07) 50%, transparent 85%)",
          }}
        />
      )}

      {/* 3. Hyper-Realistic 60 FPS HTML5 Dynamic Canvas Simulation Layer */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ mixBlendMode: isLight ? "normal" : "screen" }}
      />

      {/* 4. Subtle Holographic Scanline Shimmer */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity: isLight ? 0.03 : 0.05,
          backgroundImage: isLight
            ? "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(13, 148, 136, 0.3) 4px)"
            : "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(56, 189, 248, 0.4) 4px)",
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
            ? "bg-gradient-to-r from-transparent via-[var(--bg-base)]/10 to-[var(--bg-base)]/30"
            : "bg-gradient-to-r from-transparent via-[#02040a]/10 to-[#02040a]/30"
        }`}
      />
    </div>
  );
}
