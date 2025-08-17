import { useEffect } from "react";
import Lenis from "@studio-freight/lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function SmoothScroll({ children }) {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => 1 - Math.pow(1 - t, 3),
      smoothWheel: true,
      smoothTouch: false,
    });

    // RAF loop for Lenis
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Sync Lenis with GSAP ScrollTrigger
    lenis.on("scroll", ScrollTrigger.update);

    // Set up scroller proxy
    const scrollProxy = {
      scrollTop: {
        get: () => lenis.scroll,
        set: (value) => {
          lenis.scrollTo(value, { immediate: true });
        }
      }
    };

    ScrollTrigger.scrollerProxy(scrollProxy, {
      scrollTop(value) {
        return arguments.length ? (scrollProxy.scrollTop.set(value), scrollProxy.scrollTop.get()) : scrollProxy.scrollTop.get();
      },
      getBoundingClientRect() {
        return { 
          top: 0, 
          left: 0, 
          width: window.innerWidth, 
          height: window.innerHeight 
        };
      },
      pinType: "transform"
    });

    // Refresh ScrollTrigger when the page loads
    ScrollTrigger.addEventListener("refresh", () => lenis.resize());
    ScrollTrigger.refresh();

    return () => {
      lenis.off("scroll", ScrollTrigger.update);
      ScrollTrigger.addEventListener("refresh", () => lenis.resize());
      ScrollTrigger.defaults({ scroller: window });
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}