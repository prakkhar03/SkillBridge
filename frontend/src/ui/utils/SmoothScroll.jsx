// src/ui/utils/SmoothScroll.jsx
import React, { useEffect, useRef } from "react";
import Lenis from "@studio-freight/lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function SmoothScroll({ children }) {
  const lenisRef = useRef(null);
  const rafIdRef = useRef(null);
  const refreshHandlerRef = useRef(null);

  useEffect(() => {
    // Initialize Lenis
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => 1 - Math.pow(1 - t, 3),
      smoothWheel: true,
      smoothTouch: false,
    });
    lenisRef.current = lenis;

    // Expose lenis instance for other modules (TransitionRoutes etc.)
    if (typeof window !== "undefined") window.__lenis = lenis;

    // RAF loop (store id so we can cancel)
    const raf = (time) => {
      if (lenisRef.current) lenisRef.current.raf(time);
      rafIdRef.current = requestAnimationFrame(raf);
    };
    rafIdRef.current = requestAnimationFrame(raf);

    // Keep ScrollTrigger in sync with Lenis
    lenis.on("scroll", ScrollTrigger.update);

    // Use a wrapper element if present, otherwise fall back to document.scrollingElement
    // (Wrap children with <div id="lenis-wrapper"> in this component return to use wrapper)
    const wrapper = document.querySelector("#lenis-wrapper") || document.scrollingElement || document.body;

    // Scroller proxy for ScrollTrigger
    ScrollTrigger.scrollerProxy(wrapper, {
      scrollTop(value) {
        if (!arguments.length) {
          // getter
          return lenisRef.current ? lenisRef.current.scroll : window.scrollY || 0;
        }
        // setter - make immediate jump to avoid animating - used by ScrollTrigger
        if (lenisRef.current) {
          try {
            lenisRef.current.scrollTo(value, { immediate: true });
          } catch {
            // fallback if API differs
            try { lenisRef.current.scrollTo(value); } catch {}
          }
        } else {
          window.scrollTo(0, value);
        }
      },
      getBoundingClientRect() {
        return {
          top: 0,
          left: 0,
          width: window.innerWidth,
          height: window.innerHeight,
        };
      },
      // pinType should be "transform" when using Lenis (transform-based) else fallback
      pinType: wrapper.style?.transform ? "transform" : "fixed",
    });

    // Handler reference (so we can remove it on cleanup)
    const refreshHandler = () => {
      if (lenisRef.current && typeof lenisRef.current.raf === "function") {
        // trigger a frame so Lenis recalculates sizes
        lenisRef.current.raf(performance.now());
      }
    };
    refreshHandlerRef.current = refreshHandler;

    // Ensure ScrollTrigger refresh causes Lenis to recalc
    ScrollTrigger.addEventListener("refresh", refreshHandler);

    // Initial refresh so ScrollTrigger calculates positions correctly
    ScrollTrigger.refresh();

    // Cleanup
    return () => {
      // stop RAF loop
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);

      // remove scroll listener
      if (lenisRef.current) {
        try {
          lenisRef.current.off?.("scroll", ScrollTrigger.update);
        } catch {}
      }

      // remove refresh handler
      try {
        if (refreshHandlerRef.current) ScrollTrigger.removeEventListener("refresh", refreshHandlerRef.current);
      } catch {}

      // restore defaults (defensive)
      try {
        ScrollTrigger.defaults({ scroller: window });
      } catch {}

      // destroy lenis if API available
      try {
        if (lenisRef.current && typeof lenisRef.current.destroy === "function") {
          lenisRef.current.destroy();
        }
      } catch (e) {
        console.warn("Lenis destroy failed:", e);
      }

      // unset window reference
      if (typeof window !== "undefined") window.__lenis = null;

      lenisRef.current = null;
      rafIdRef.current = null;
      refreshHandlerRef.current = null;
    };
  }, []);

  // IMPORTANT: wrap children with an element with id "lenis-wrapper" so scrollerProxy can target it.
  // This helps ScrollTrigger and pinning behave consistently.
  return <div id="lenis-wrapper">{children}</div>;
}
