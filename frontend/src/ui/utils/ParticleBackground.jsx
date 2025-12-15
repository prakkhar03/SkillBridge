/**
 * ParticleBackground Component
 * ----------------------------
 * A customizable animated particle background for your website.
 * Renders floating dots with optional glow and trail effects.
 *
 * 🔹 Props (all optional, with default values):
 *
 * - backgroundColor (string, default: 'black')
 *   → The base background color behind the particles.
 *
 * - particleColor (string, default: 'rgba(255, 255, 255, 0.8)')
 *   → Color of each particle (dot).
 *   → Supports rgba for transparency control.
 *
 * - glowColor (string, default: 'rgba(224, 78, 202, 0.3)')
 *   → Gradient glow overlay color.
 *   → Set to null or "" if you don’t want the glow effect.
 *
 * - maxParticles (number, default: 300)
 *   → Maximum number of particles allowed on screen.
 *   → The actual number scales with screen size, but never exceeds this.
 *
 * - trailOpacity (number between 0 and 1, default: 0.1)
 *   → Controls how quickly old frames fade.
 *   → Lower = longer trails, Higher = shorter trails.
 *
 * - sizeRange (object: { min: number, max: number }, default: { min: 1, max: 2 })
 *   → Range of particle sizes.
 *
 * - speedRange (object: { min: number, max: number }, default: { min: -0.5, max: 0.5 })
 *   → Range of particle movement speeds.
 *
 * Example Usage:
 * <ParticleBackground
 *   backgroundColor="black"
 *   particleColor="rgba(0, 200, 255, 0.9)"
 *   glowColor="rgba(0, 255, 150, 0.2)"
 *   maxParticles={500}
 *   trailOpacity={0.05}
 *   sizeRange={{ min: 0.5, max: 3 }}
 *   speedRange={{ min: -1, max: 1 }}
 * />
 */

import React, { useRef, useEffect } from "react";

const ParticleBackground = ({
  layer = "overlay", // "overlay" | "behind"
  // Colors
  backgroundColor = "black",                 // used only in "behind" mode
  particleColor = "rgba(255, 255, 255, 0.9)",
  strokeColor = "rgba(255, 255, 255, 0.5)",
  // Counts & motion
  maxParticles = 300,
  sizeRange = [0.8, 2.2],                    // [min, max] radius
  speedFactor = 0.6,                         // particle speed multiplier
  shrinkRate = 0.004,                        // size shrink per frame
  fadeRate = 0.008,                          // alpha fade per frame
  // Trails (behind mode only)
  trailOpacity = 0.12,                       // 0..1, lower = longer trails
}) => {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const rafRef = useRef(null);

  class Particle {
    constructor(width, height) {
      this.reset(width, height);
      this.alpha = Math.random() * 0.9 + 0.1;
    }
    reset(width, height) {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.size = Math.random() * (sizeRange[1] - sizeRange[0]) + sizeRange[0];
      const s = speedFactor;
      this.speedX = (Math.random() - 0.5) * 2 * s;
      this.speedY = (Math.random() - 0.5) * 2 * s;
      this.alpha = Math.random() * 0.9 + 0.1;
    }
    update(width, height) {
      this.x += this.speedX;
      this.y += this.speedY;

      // wrap
      if (this.x < -10) this.x = width + 10;
      if (this.x > width + 10) this.x = -10;
      if (this.y < -10) this.y = height + 10;
      if (this.y > height + 10) this.y = -10;

      // evolve
      this.size = Math.max(sizeRange[0], this.size - shrinkRate);
      this.alpha = Math.max(0, this.alpha - fadeRate);

      if (this.alpha <= 0 || this.size <= sizeRange[0]) {
        this.reset(width, height);
      }
    }
    draw(ctx) {
      if (this.alpha <= 0) return;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = particleColor;
      ctx.globalAlpha = this.alpha;
      ctx.fill();

      // subtle outline on larger dots
      if (this.size > 1.1) {
        ctx.strokeStyle = strokeColor;
        ctx.globalAlpha = this.alpha * 0.08;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const setSize = () => {
      const cssW = window.innerWidth || 1;
      const cssH = window.innerHeight || 1;
      const dpr = Math.max(1, window.devicePixelRatio || 1);

      // CSS size
      canvas.style.width = `${cssW}px`;
      canvas.style.height = `${cssH}px`;
      // buffer size
      canvas.width = Math.round(cssW * dpr);
      canvas.height = Math.round(cssH * dpr);
      // reset then scale
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // (re)seed particles to fit current viewport
      const count = Math.min(Math.floor((cssW * cssH) / 10000), maxParticles);
      const w = cssW;
      const h = cssH;
      if (particlesRef.current.length !== count) {
        particlesRef.current = Array.from({ length: count }, () => new Particle(w, h));
      } else {
        // keep count, just reposition
        particlesRef.current.forEach((p) => p.reset(w, h));
      }
    };

    setSize();

    const animate = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;

      if (layer === "behind") {
        // draw a translucent rect to create the trail
        ctx.globalAlpha = trailOpacity;
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, w, h);
        ctx.globalAlpha = 1;
      } else {
        // overlay mode -> transparent canvas (no trails)
        ctx.clearRect(0, 0, w, h);
      }

      particlesRef.current.forEach((p) => {
        p.update(w, h);
        p.draw(ctx);
      });

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    const onResize = () => {
      cancelAnimationFrame(rafRef.current);
      setSize();
      rafRef.current = requestAnimationFrame(animate);
    };
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [
    layer,
    backgroundColor,
    particleColor,
    strokeColor,
    maxParticles,
    sizeRange[0],
    sizeRange[1],
    speedFactor,
    shrinkRate,
    fadeRate,
    trailOpacity,
  ]);

  // zIndex based on layer choice; pointer-events none so it never blocks clicks.
  const zIndex = layer === "overlay" ? 40 : -1;

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex,
      }}
    >
      <canvas ref={canvasRef} style={{ width: "100%", height: "100%", display: "block" }} />
    </div>
  );
};

export default ParticleBackground;
