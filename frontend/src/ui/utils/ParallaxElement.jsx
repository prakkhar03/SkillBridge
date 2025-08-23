// src/ui/utils/ParallaxElement.jsx
import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Flexible Parallax orb:
 * - Configure `steps` array to define positions per scene and how many viewports (length) each step occupies.
 * - Units supported: 'vw', 'vh', 'px' (strings). You can also use numbers (treated as px).
 *
 * How mapping works:
 * - totalLength = steps.reduce(len)
 * - scrollTrigger.end = `+=${totalLength * 100}%`
 * - For each step (i>0) we .to() orb to steps[i].{x,y} with duration = steps[i].length
 *   so each step's duration maps proportionally to its share of the overall scroll.
 *
 * Tweak `debug` to true to show ScrollTrigger markers and a hot color orb.
 */

export default function ParallaxElement({
  size = 180,
  // default steps — replace these with your scene-by-scene positions
  steps = [
    // The first step acts as the starting position (Hero should animate the orb to this if you want)
    { name: "start", x: "-30vw", y: "20vh", length: 0.8 },

    // Scene-by-scene targets (these will be animated to in order)
    { name: "scene-1", x: "0vw",   y: "10vh", length: 1 },
    { name: "scene-2", x: "20vw",  y: "25vh", length: 1 },
    { name: "scene-3", x: "-15vw", y: "40vh", length: 1.5 },
    { name: "scene-4", x: "10vw",  y: "55vh", length: 1.5 },
  ],
  // ScrollTrigger trigger - use your story wrapper id
  triggerSelector = "#story-section",
  debug = false,
}) {
  const elRef = useRef(null);
  const tlRef = useRef(null);

  useEffect(() => {
    if (!elRef.current) return;
    const orb = elRef.current;
    const scroller = document.querySelector(".lenis") || window;

    // ---- Helpers ----
    const parseValue = (v) => {
      // if number -> px
      if (typeof v === "number") return { value: v, unit: "px" };
      if (typeof v !== "string") return { value: 0, unit: "px" };
      const m = v.match(/^(-?\\d+\\.?\\d*)(px|vw|vh)?$/);
      if (!m) return { value: parseFloat(v) || 0, unit: "px" };
      return { value: parseFloat(m[1]), unit: m[2] || "px" };
    };

    // clamp helper (works roughly on vw/vh pct values)
    const clampVW = (valStr, axis = "x") => {
      // We limit to -45vw .. 45vw horizontally and 0vh .. 85vh vertically by default
      if (typeof valStr !== "string") return valStr;
      if (valStr.endsWith("vw")) {
        const num = parseFloat(valStr);
        const min = -45, max = 45;
        if (num < min || num > max) {
          if (debug) console.warn(`Orb ${axis} value ${valStr} is outside safe range (${min}..${max}vw). Clamping.`);
        }
        return `${Math.max(min, Math.min(max, num))}vw`;
      }
      if (valStr.endsWith("vh")) {
        const num = parseFloat(valStr);
        const min = 0, max = 85;
        if (num < min || num > max) {
          if (debug) console.warn(`Orb ${axis} value ${valStr} is outside safe range (${min}..${max}vh). Clamping.`);
        }
        return `${Math.max(min, Math.min(max, num))}vh`;
      }
      // px or other units — leave as is
      return valStr;
    };

    // ---- Set initial visible state to the first step (so hero intro can animate from here) ----
    const first = steps[0] || { x: "0vw", y: "10vh", length: 1 };
    const initialX = clampVW(first.x ?? "0vw", "x");
    const initialY = clampVW(first.y ?? "10vh", "y");

    gsap.set(orb, {
      x: initialX,
      y: initialY,
      scale: 0,       // hidden initially — Hero will animate it in (or set scale to 1 to show immediately)
      autoAlpha: 0,
      willChange: "transform, opacity",
    });

    // ---- Build timeline & ScrollTrigger mapping from steps ----
    // total length in viewports (1 => 100%),
    const totalLength = steps.reduce((sum, s) => sum + (parseFloat(s.length) || 0), 0) || 1;
    const scrollEnd = `+=${Math.round(totalLength * 100)}%`;

    if (debug) {
      console.log("ParallaxElement steps:", steps, "totalLength:", totalLength, "end:", scrollEnd);
    }

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: triggerSelector,
        start: "top top",
        end: scrollEnd,
        scrub: true,
        pin: false,
        scroller: scroller !== window ? scroller : undefined,
        markers: debug, // show markers when debugging
        invalidateOnRefresh: true,
      },
    });

    // We already set initial to steps[0]. Now animate to steps[1], steps[2], ...
    for (let i = 1; i < steps.length; i++) {
      const step = steps[i];
      const safeX = clampVW(step.x ?? initialX, "x");
      const safeY = clampVW(step.y ?? initialY, "y");
      // duration in timeline = step.length (in viewport units). That's why end uses totalLength*100%
      const duration = Math.max(0.1, parseFloat(step.length) || 1);

      tl.to(orb, {
        x: safeX,
        y: safeY,
        ease: step.ease || "power3.inOut",
        duration,
      }, "+=0"); // chained sequentially
    }

    tlRef.current = tl;

    // Cleanup on unmount
    return () => {
      try {
        if (tlRef.current && tlRef.current.scrollTrigger) tlRef.current.scrollTrigger.kill();
        if (tlRef.current) tlRef.current.kill();
      } catch (e) {
        // ignore
      }
    };
  }, [steps, triggerSelector, size, debug]);

  // ---- Styles: anchor orb at top-left of viewport (0,0). x/y offsets are relative to that.
  // If you'd rather anchor orb to center you can change top/left below and adjust coordinates.
  const wrapperStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    width: `${size}px`,
    height: `${size}px`,
    pointerEvents: "none",
    transform: "translateZ(0)",
    zIndex: 9999,
  };

  return (
    <div
      ref={elRef}
      className="orb"
      style={wrapperStyle}
      aria-hidden
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: "50%",
          // debug: bright color if debug true
          background: debug
            ? "hotpink"
            : "radial-gradient(circle at 30% 30%, rgba(0,255,255,0.9), rgba(0,0,0,0.12))",
          boxShadow: "0 0 60px rgba(0,200,255,0.65)",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}
