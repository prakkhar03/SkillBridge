// src/ui/landingPage/HeroSection.jsx
import React, { useRef } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { SplitText } from "gsap/SplitText";

// Register GSAP plugins
gsap.registerPlugin(useGSAP, SplitText);

const SkillBridgeTitle = () => (
  <h1
    className="hero-title text-[80px] sm:text-[100px] font-bold tracking-wider
      text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-white
      [-webkit-text-stroke:1px_white] [paint-order:stroke_fill]"
  >
    SKILLBRIDGE
  </h1>
);

export const HeroSection = () => {
  const containerRef = useRef(null);
  const splitInstance = useRef(null);
// inside HeroSection (replace your useGSAP callback with this)

useGSAP(() => {
  if (typeof SplitText === "undefined") {
    console.warn("SplitText plugin not available");
    return;
  }

  try {
    splitInstance.current = new SplitText(".hero-title", {
      type: "chars",
      charsClass: "hero-char",
    });

    const chars = splitInstance.current.chars;

    gsap.set(chars, {
      yPercent: -150,
      xPercent: () => gsap.utils.random(-100, 100),
      rotation: () => gsap.utils.random(-90, 90),
      opacity: 0,
    });

    const tl = gsap.timeline();

    // Title characters animation
    tl.to(chars, {
      duration: 1.5,
      yPercent: 0,
      xPercent: 0,
      rotation: 0,
      opacity: 1,
      stagger: 0.05,
      ease: "power3.inOut",
    });

    // subtitle/desc/buttons animation
    tl.from(
      ".hero-subtitle, .hero-description, .hero-buttons",
      {
        duration: 1,
        opacity: 0,
        y: 20,
        stagger: 0.2,
        ease: "power2.out",
      },
      "-=0.5"
    );

    // --- ORB: animate the global .orb element (use direct DOM lookup) ---
    const animateOrbIfFound = () => {
      const orbEl = document.querySelector(".orb");
      if (!orbEl) return false;

      tl.to(
        orbEl,
        {
          duration: 1.2,
          scale: 1,
          autoAlpha: 1,
          x: "0vw",   // final hero-position X (relative to ParallaxElement's origin)
          y: "10vh",  // final hero-position Y
          ease: "elastic.out(1, 0.75)",
          overwrite: "auto",
        },
        "-=0.9"
      );

      return true;
    };

    // try immediate; otherwise try next frame (handles mount ordering)
    if (!animateOrbIfFound()) {
      // If the orb isn't mounted yet, try next paint—this is safe & simple
      requestAnimationFrame(() => {
        animateOrbIfFound();
      });
    }

  } catch (e) {
    console.error("Animation error:", e);
  }

  return () => {
    if (splitInstance.current) {
      splitInstance.current.revert();
    }
  };
}, { scope: containerRef });


  return (
    <section
      ref={containerRef}
      className="w-full flex flex-col justify-center items-center text-center text-white p-4 overflow-hidden relative"
      style={{
        // Use the CSS variable set by navbar to calculate height
        minHeight: "calc(100vh - var(--navbar-height, 0px))",
        paddingTop: "clamp(1rem, 2vw, 1.5rem)",
        paddingBottom: "clamp(1rem, 2vw, 1.5rem)",
      }}
    >
      <div className="max-w-5xl mx-auto">
        <p className="hero-subtitle text-lg sm:text-xl text-gray-400 mb-2">
          Welcome to
        </p>
        <div className="my-4">
          <SkillBridgeTitle />
        </div>
        <p className="hero-description text-base sm:text-lg text-gray-300 max-w-2xl mx-auto mb-8">
          A new era of collaborative learning and professional growth. Connect,
          learn, and build your future.
        </p>
        <div className="hero-buttons flex flex-col sm:flex-row justify-center items-center gap-4">
          <Link
            to="/auth"
            className="w-full sm:w-auto px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Get Started
          </Link>
          <button className="w-full sm:w-auto px-8 py-3 bg-transparent border border-gray-500 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors">
            Learn More
          </button>
        </div>
      </div>
    </section>
  );
};