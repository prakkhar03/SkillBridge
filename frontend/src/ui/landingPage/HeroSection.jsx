import { Link } from "react-router-dom";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";

export function HeroSection() {
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const ctaRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(titleRef.current, {
        y: 100,
        opacity: 0,
        duration: 1.2,
        ease: "power4.out",
        delay: 0.2,
      });
      gsap.from(subtitleRef.current, {
        y: 50,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        delay: 0.6,
      });
      gsap.from(ctaRef.current, {
        scale: 0.8,
        opacity: 0,
        duration: 0.8,
        ease: "back.out(1.7)",
        delay: 1,
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[80px] pointer-events-none mix-blend-screen"></div>

      {/* Main Content */}
      <div className="relative z-10 max-w-5xl mx-auto">
        <h1 ref={titleRef} className="text-6xl md:text-8xl font-bold mb-6 tracking-tight leading-tight">
          <span className="block text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
            BRIDGE THE
          </span>
          <span className="aurora-text drop-shadow-[0_0_30px_rgba(0,240,255,0.4)]">
            IMPOSSIBLE
          </span>
        </h1>

        <p ref={subtitleRef} className="text-xl md:text-2xl text-gray-300 mb-10 max-w-2xl mx-auto font-light leading-relaxed">
          Connect with elite talent and visionary projects in a <span className="text-cyan-300 font-medium">decentralized</span> ecosystem.
        </p>

        <div ref={ctaRef} className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <Link to="/auth" className="group relative px-8 py-4 bg-white text-black font-bold rounded-full overflow-hidden transition-transform hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <span className="relative z-10 group-hover:text-white transition-colors">GET STARTED</span>
          </Link>

          <Link to="/about" className="px-8 py-4 rounded-full border border-white/20 hover:bg-white/5 transition-all text-white font-medium backdrop-blur-sm">
            EXPLORE ECOSYSTEM
          </Link>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-10 left-10 hidden md:block animate-bounce">
        <div className="text-xs text-gray-500 tracking-[0.2em]">SCROLL TO DISCOVER</div>
      </div>
    </div>
  );
}