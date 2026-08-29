"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";

// GPS Radar Pin Coordinates mapped to the top-left map in the image
const MAP_PINS = [
  { xRel: 0.045, yRel: 0.215, label: "Terminal A", speed: 1.2, offset: 0.0 },
  { xRel: 0.030, yRel: 0.420, label: "VIP Garage", speed: 1.0, offset: 0.4 },
];

// Vector Navigation Circuit Nodes
const MAP_NODES = [
  { xRel: 0.162, yRel: 0.108, pulseSpeed: 0.8 },
  { xRel: 0.245, yRel: 0.255, pulseSpeed: 1.1 },
  { xRel: 0.068, yRel: 0.308, pulseSpeed: 0.9 },
  { xRel: 0.125, yRel: 0.395, pulseSpeed: 1.3 },
];

// Road Vector Segments connecting map nodes
const MAP_ROUTES = [
  { from: { xRel: 0.162, yRel: 0.108 }, to: { xRel: 0.245, yRel: 0.255 }, speed: 0.7 },
  { from: { xRel: 0.045, yRel: 0.215 }, to: { xRel: 0.068, yRel: 0.308 }, speed: 0.9 },
  { from: { xRel: 0.068, yRel: 0.308 }, to: { xRel: 0.125, yRel: 0.395 }, speed: 0.8 },
  { from: { xRel: 0.125, yRel: 0.395 }, to: { xRel: 0.030, yRel: 0.420 }, speed: 1.0 },
  { from: { xRel: 0.245, yRel: 0.255 }, to: { xRel: 0.125, yRel: 0.395 }, speed: 0.65 },
];

// Distant City Skyline Window Flicker Points (visible between pillars on the right)
const SKYLINE_LIGHTS = [
  { xRel: 0.715, yRel: 0.635, size: 1.4, phase: 0.5 },
  { xRel: 0.730, yRel: 0.645, size: 1.6, phase: 1.8 },
  { xRel: 0.745, yRel: 0.625, size: 1.8, phase: 3.2 },
  { xRel: 0.760, yRel: 0.650, size: 1.5, phase: 4.1 },
  { xRel: 0.780, yRel: 0.615, size: 2.0, phase: 2.0 },
  { xRel: 0.795, yRel: 0.630, size: 1.7, phase: 5.4 },
  { xRel: 0.810, yRel: 0.640, size: 1.3, phase: 0.9 },
];

// Smart Parking Sensor Spots across the parking lot
const SMART_BAYS = [
  { xRel: 0.08, yRel: 0.76, status: "available" },
  { xRel: 0.14, yRel: 0.78, status: "occupied" },
  { xRel: 0.26, yRel: 0.77, status: "available" },
  { xRel: 0.43, yRel: 0.82, status: "available" },
  { xRel: 0.62, yRel: 0.76, status: "occupied" },
  { xRel: 0.74, yRel: 0.81, status: "occupied" },
];

export function ParkingCinematicBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Mouse Physics for 3D Camera Parallax
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { damping: 28, stiffness: 90, mass: 0.5 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  const rotateX = useTransform(smoothY, [-1, 1], [3, -3]);
  const rotateY = useTransform(smoothX, [-1, 1], [-4, 4]);
  const translateX = useTransform(smoothX, [-1, 1], [-10, 10]);
  const translateY = useTransform(smoothY, [-1, 1], [-6, 6]);

  const [torchPos, setTorchPos] = useState({ x: 50, y: 50, active: false });

  useEffect(() => {
    setMounted(true);

    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const xNorm = (e.clientX / innerWidth) * 2 - 1;
      const yNorm = (e.clientY / innerHeight) * 2 - 1;
      mouseX.set(xNorm);
      mouseY.set(yNorm);
      setTorchPos({
        x: (e.clientX / innerWidth) * 100,
        y: (e.clientY / innerHeight) * 100,
        active: true,
      });
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

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

    // Drifting atmospheric dust motes catching amber reflections
    const moteCount = 50;
    const motes = Array.from({ length: moteCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.8 + 0.5,
      speedX: (Math.random() - 0.5) * 0.25,
      speedY: -0.15 - Math.random() * 0.35,
      alpha: Math.random() * 0.6 + 0.2,
      phase: Math.random() * Math.PI * 2,
      pulseSpeed: 0.03 + Math.random() * 0.03,
    }));

    let t = 0;

    const render = () => {
      if (!isVisible) return;
      t += 0.016;
      ctx.clearRect(0, 0, width, height);

      // ── 1. Top-Left Roadway Network Vectors & Traveling Light Packets ──
      for (const route of MAP_ROUTES) {
        const x1 = route.from.xRel * width;
        const y1 = route.from.yRel * height;
        const x2 = route.to.xRel * width;
        const y2 = route.to.yRel * height;

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = isLight ? "rgba(217, 119, 6, 0.3)" : "rgba(245, 158, 11, 0.22)";
        ctx.lineWidth = isLight ? 1.8 : 1.2;
        ctx.stroke();

        // Traveling Vehicle / Data Packet
        const progress = ((t * route.speed * 0.35) % 1 + 1) % 1;
        const px = x1 + (x2 - x1) * progress;
        const py = y1 + (y2 - y1) * progress;

        ctx.fillStyle = isLight ? "rgba(217, 119, 6, 0.95)" : "rgba(251, 191, 36, 1)";
        ctx.shadowBlur = isLight ? 8 : 12;
        ctx.shadowColor = isLight ? "rgba(217, 119, 6, 0.9)" : "rgba(251, 191, 36, 0.9)";
        ctx.beginPath();
        ctx.arc(px, py, isLight ? 3 : 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // ── 2. Top-Left Map Radar Pins with Radiating Halos ──
      for (const pin of MAP_PINS) {
        const px = pin.xRel * width;
        const py = pin.yRel * height;
        const pulse = Math.sin(t * pin.speed + pin.offset);
        const radius = 8 + pulse * 4;

        // Expanding Radar Ring
        ctx.beginPath();
        ctx.arc(px, py, radius + 8, 0, Math.PI * 2);
        ctx.strokeStyle = isLight ? "rgba(217, 119, 6, 0.45)" : "rgba(245, 158, 11, 0.4)";
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Second Outer Ripple
        ctx.beginPath();
        ctx.arc(px, py, radius + 16, 0, Math.PI * 2);
        ctx.strokeStyle = isLight ? "rgba(217, 119, 6, 0.2)" : "rgba(245, 158, 11, 0.15)";
        ctx.lineWidth = 1;
        ctx.stroke();

        // Central Glowing Core
        ctx.fillStyle = isLight ? "rgba(217, 119, 6, 0.9)" : "rgba(251, 191, 36, 0.95)";
        ctx.shadowBlur = 12;
        ctx.shadowColor = isLight ? "rgba(217, 119, 6, 0.9)" : "rgba(251, 191, 36, 0.95)";
        ctx.beginPath();
        ctx.arc(px, py, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // ── 3. Map Intersection Pulse Nodes ──
      for (let i = 0; i < MAP_NODES.length; i++) {
        const node = MAP_NODES[i];
        const nx = node.xRel * width;
        const ny = node.yRel * height;
        const alpha = 0.35 + 0.45 * Math.sin(t * node.pulseSpeed + i);

        ctx.fillStyle = isLight
          ? `rgba(217, 119, 6, ${alpha * 0.85})`
          : `rgba(245, 158, 11, ${alpha})`;
        ctx.shadowBlur = 8;
        ctx.shadowColor = "rgba(245, 158, 11, 0.8)";
        ctx.beginPath();
        ctx.arc(nx, ny, 2.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // ── 4. Right Pillar (P) Sign Neon Breathing Aura ──
      const pX = 0.858 * width;
      const pY = 0.465 * height;
      const pPulse = 0.75 + 0.25 * Math.sin(t * 2);

      const pGlow = ctx.createRadialGradient(pX, pY, 5, pX, pY, 80);
      pGlow.addColorStop(0, isLight ? `rgba(217, 119, 6, ${0.45 * pPulse})` : `rgba(245, 158, 11, ${0.55 * pPulse})`);
      pGlow.addColorStop(0.5, isLight ? `rgba(217, 119, 6, ${0.15 * pPulse})` : `rgba(245, 158, 11, ${0.2 * pPulse})`);
      pGlow.addColorStop(1, "transparent");

      ctx.fillStyle = pGlow;
      ctx.beginPath();
      ctx.arc(pX, pY, 80, 0, Math.PI * 2);
      ctx.fill();

      // ── 5. Overhead Yellow Neon Light Beam Shimmer & Electrical Micro-Flicker ──
      const beamX1 = 0.74 * width;
      const beamY1 = 0.37 * height;
      const beamX2 = 0.99 * width;
      const beamY2 = 0.23 * height;
      const flicker = Math.random() > 0.97 ? 0.4 : 1;

      ctx.beginPath();
      ctx.moveTo(beamX1, beamY1);
      ctx.lineTo(beamX2, beamY2);
      ctx.strokeStyle = isLight
        ? `rgba(217, 119, 6, ${0.55 * flicker})`
        : `rgba(254, 240, 138, ${0.75 * flicker})`;
      ctx.lineWidth = isLight ? 2.5 : 2;
      ctx.shadowBlur = isLight ? 10 : 16;
      ctx.shadowColor = isLight ? "rgba(217, 119, 6, 0.8)" : "rgba(250, 204, 21, 0.9)";
      ctx.stroke();
      ctx.shadowBlur = 0;

      // ── 6. Boom Barrier Gate Status LED Indicator ──
      const gateX = 0.695 * width;
      const gateY = 0.715 * height;
      const gateAlpha = 0.5 + 0.5 * Math.sin(t * 3);

      ctx.fillStyle = isLight
        ? `rgba(16, 185, 129, ${gateAlpha * 0.9})`
        : `rgba(52, 211, 153, ${gateAlpha})`;
      ctx.shadowBlur = 12;
      ctx.shadowColor = "rgba(16, 185, 129, 0.95)";
      ctx.beginPath();
      ctx.arc(gateX, gateY, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // ── 7. Horizontal LiDAR Scanning Beam sweeping across the parking lot ──
      const lidarScanY = ((t * 45) % (height * 0.4)) + height * 0.6;
      const lidarGrad = ctx.createLinearGradient(0, lidarScanY - 20, 0, lidarScanY + 20);
      lidarGrad.addColorStop(0, "transparent");
      lidarGrad.addColorStop(0.5, isLight ? "rgba(13, 148, 136, 0.12)" : "rgba(16, 185, 129, 0.09)");
      lidarGrad.addColorStop(1, "transparent");

      ctx.fillStyle = lidarGrad;
      ctx.fillRect(0, lidarScanY - 20, width, 40);

      ctx.strokeStyle = isLight ? "rgba(13, 148, 136, 0.35)" : "rgba(16, 185, 129, 0.25)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, lidarScanY);
      ctx.lineTo(width, lidarScanY);
      ctx.stroke();

      // ── 8. Smart Bay Status Sensor Beacons ──
      for (let i = 0; i < SMART_BAYS.length; i++) {
        const bay = SMART_BAYS[i];
        const bx = bay.xRel * width;
        const by = bay.yRel * height;
        const isFree = bay.status === "available";
        const bPulse = 0.4 + 0.4 * Math.sin(t * 2 + i);

        ctx.fillStyle = isFree
          ? isLight ? `rgba(13, 148, 136, ${bPulse * 0.9})` : `rgba(52, 211, 153, ${bPulse})`
          : isLight ? `rgba(225, 29, 72, ${bPulse * 0.9})` : `rgba(244, 63, 94, ${bPulse})`;
        ctx.shadowBlur = 8;
        ctx.shadowColor = isFree ? "rgba(16, 185, 129, 0.8)" : "rgba(244, 63, 94, 0.8)";
        ctx.beginPath();
        ctx.arc(bx, by, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // ── 9. Distant City Skyline Twinkling Window Lights ──
      for (const light of SKYLINE_LIGHTS) {
        const lx = light.xRel * width;
        const ly = light.yRel * height;
        const alpha = 0.2 + 0.6 * Math.sin(t * 1.8 + light.phase);

        ctx.fillStyle = isLight
          ? `rgba(217, 119, 6, ${Math.max(0, alpha * 0.75)})`
          : `rgba(253, 230, 138, ${Math.max(0, alpha)})`;
        ctx.beginPath();
        ctx.arc(lx, ly, light.size, 0, Math.PI * 2);
        ctx.fill();
      }

      // ── 10. Drifting Atmospheric Amber Dust Motes ──
      for (const m of motes) {
        m.x += m.speedX;
        m.y += m.speedY;
        m.phase += m.pulseSpeed;

        if (m.y < -10) {
          m.y = height + 10;
          m.x = Math.random() * width;
        }
        if (m.x < -10) m.x = width + 10;
        if (m.x > width + 10) m.x = -10;

        const currentAlpha = m.alpha * (0.6 + 0.4 * Math.sin(m.phase));
        ctx.fillStyle = isLight
          ? `rgba(217, 119, 6, ${currentAlpha * 0.6})`
          : `rgba(251, 191, 36, ${currentAlpha})`;
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.radius, 0, Math.PI * 2);
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
        isLight ? "bg-transparent" : "bg-[#030407]"
      }`}
      aria-hidden="true"
    >
      {/* 3D Parallax Tilt Viewport */}
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
        {/* Layer 1: High-Definition Base Reference Image */}
        <img
          src="/images/parking-bg.png"
          alt="Smart City Garage & Navigation Grid"
          className={`w-full h-full object-cover object-center transition-all duration-500 ${
            isLight
              ? "opacity-30 filter brightness-110 contrast-105 saturate-95"
              : "opacity-95 filter brightness-100 contrast-110 saturate-105"
          }`}
        />

        {/* Layer 2: Ambient Golden Pillar Bounce Glow Flare */}
        <motion.div
          animate={{
            opacity: isLight ? [0.2, 0.45, 0.25, 0.5, 0.2] : [0.35, 0.75, 0.45, 0.8, 0.35],
            scale: [1, 1.06, 1, 1.08, 1],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-[48%] right-[12%] -translate-x-1/2 -translate-y-1/2 w-[380px] h-[380px] rounded-full bg-gradient-to-r from-amber-500/25 via-yellow-400/20 to-orange-500/15 blur-[80px] pointer-events-none"
        />

        {/* Layer 3: Wet Asphalt Floor Reflection Shimmer */}
        <motion.div
          animate={{
            opacity: isLight ? [0.15, 0.4, 0.2, 0.45, 0.15] : [0.25, 0.6, 0.3, 0.65, 0.25],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute bottom-[8%] right-[24%] w-[420px] h-[180px] rounded-full bg-gradient-to-t from-amber-500/20 via-yellow-400/15 to-transparent blur-[60px] pointer-events-none"
        />

        {/* Layer 4: Interactive Headlight / LiDAR Cursor Torch */}
        {torchPos.active && (
          <div
            style={{
              background: isLight
                ? `radial-gradient(circle 380px at ${torchPos.x}% ${torchPos.y}%, rgba(217, 119, 6, 0.14) 0%, rgba(13, 148, 136, 0.05) 45%, transparent 75%)`
                : `radial-gradient(circle 380px at ${torchPos.x}% ${torchPos.y}%, rgba(251, 191, 36, 0.18) 0%, rgba(245, 158, 11, 0.06) 45%, transparent 75%)`,
            }}
            className="absolute inset-0 transition-all duration-75 pointer-events-none"
          />
        )}
      </motion.div>

      {/* Layer 5: Light Theme Ambient Luminous Atmosphere */}
      {isLight && (
        <div
          className="absolute inset-0 pointer-events-none opacity-65"
          style={{
            background:
              "radial-gradient(ellipse 90% 65% at 50% 30%, rgba(217, 119, 6, 0.10) 0%, rgba(13, 148, 136, 0.06) 50%, transparent 85%)",
          }}
        />
      )}

      {/* Layer 6: Dynamic 60 FPS HTML5 Canvas Simulation */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ mixBlendMode: isLight ? "normal" : "screen" }}
      />

      {/* Layer 7: Subtle Holographic Scanline Grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity: isLight ? 0.025 : 0.04,
          backgroundImage: isLight
            ? "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(217, 119, 6, 0.25) 4px)"
            : "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(245, 158, 11, 0.4) 4px)",
        }}
      />

      {/* Layer 8: Ambient Vignette Overlay */}
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
            : "bg-gradient-to-r from-[#02040a]/30 via-transparent to-[#02040a]/40"
        }`}
      />
    </div>
  );
}
