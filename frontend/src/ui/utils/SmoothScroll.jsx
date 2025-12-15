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

    // Use document.body as the scroller proxy target for window scrolling
    ScrollTrigger.scrollerProxy(document.body, {
      scrollTop(value) {
        if (arguments.length) {
          lenis.scrollTo(value, { immediate: true });
        }
        return lenis.scroll;
      },
      getBoundingClientRect() {
        return {
          top: 0,
          left: 0,
          width: window.innerWidth,
          height: window.innerHeight,
        };
      },
    });

    // Handler reference (so we can remove it on cleanup)
    const refreshHandler = () => {
      // trigger a frame so Lenis recalculates sizes
      lenis.raf(performance.now());
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
      lenis.off("scroll", ScrollTrigger.update);

      // remove refresh handler
      ScrollTrigger.removeEventListener("refresh", refreshHandler);

      // restore defaults (defensive)
      try {
        ScrollTrigger.defaults({ scroller: window });
      } catch { }

      // destroy lenis if API available
      lenis.destroy();

      // unset window reference
      if (typeof window !== "undefined") window.__lenis = null;

      lenisRef.current = null;
      rafIdRef.current = null;
      refreshHandlerRef.current = null;
    };
  }, []);

  return <>{children}</>;
}
