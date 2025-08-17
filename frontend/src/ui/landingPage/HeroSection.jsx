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

export const HeroSection = ({ children }) => {
  const containerRef = useRef(null);
  const splitInstance = useRef(null);

  useGSAP(() => {
    // Check if SplitText is available
    if (typeof SplitText === "undefined") {
      console.warn("SplitText plugin not available");
      return;
    }

    try {
      // Create and store SplitText instance
      splitInstance.current = new SplitText(".hero-title", { 
        type: "chars",
        charsClass: "hero-char" // Add class to each character
      });

      const chars = splitInstance.current.chars;

      gsap.set(chars, {
        yPercent: -150,
        xPercent: () => gsap.utils.random(-100, 100),
        rotation: () => gsap.utils.random(-90, 90),
        opacity: 0,
      });

      const tl = gsap.timeline();
      tl.to(chars, {
        duration: 1.5,
        yPercent: 0,
        xPercent: 0,
        rotation: 0,
        opacity: 1,
        stagger: 0.05,
        ease: "power3.inOut",
      });
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
    } catch (e) {
      console.error("Animation error:", e);
    }

    // Cleanup function
    return () => {
      if (splitInstance.current) {
        splitInstance.current.revert(); // Revert SplitText
      }
    };
  }, { scope: containerRef });

  return (
    <section
      ref={containerRef}
      className="h-screen w-full flex flex-col justify-center items-center text-center text-white p-4 overflow-hidden relative"
    >
      <div className="absolute top-0 left-0 w-full z-20">
        {children}
      </div>

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