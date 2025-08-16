import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export const DetailSection = () => {
  const main = useRef(null);
  const scoreRef = useRef(null);

  useGSAP(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: main.current,
        start: 'top top',
        end: '+=200%',
        scrub: 1,
        pin: true,
      },
    });

    // --- Scene 1: Freelance Gamble ---
    tl.from('.freelance-title, .freelance-subtitle', {
      x: -100,
      opacity: 0,
      stagger: 0.2,
      duration: 1,
    })
      .from(
        '.graph-img',
        { x: 100, opacity: 0, duration: 1 },
        '<'
      )
      .to({}, { duration: 0.5 });

    // Transition Scene 1 → Scene 2
    tl.to('.scene-1-content', { opacity: 0, y: -50, duration: 0.5 })
      .to(
        '.scene-2-content',
        { opacity: 1, duration: 0.5 },
        '<'
      );

    // --- Scene 2: Vision intro ---
    tl.from('.vision-title, .vision-subtitle', {
      opacity: 0,
      y: 50,
      stagger: 0.2,
      duration: 0.5,
    }).from(
      '.cibil-meter',
      { scale: 0.8, opacity: 0, duration: 1, ease: 'back.out(1.7)' },
      '-=0.5'
    );

    // --- Score + Needle Animation with Scroll ---
    tl.to(
      { value: 0 },
      {
        value: 900,
        duration: 1,
        ease: 'none',
        onUpdate: function () {
          const score = Math.round(this.targets()[0].value);
          
          // Map score (0–900) to rotation angle (180° → 0°)
          // Using -90° to 90° range for more natural speedometer movement
          const rotation = gsap.utils.mapRange(0, 900, -90, 90, score);

          // Rotate needle with proper transform origin
          gsap.set('.cibil-needle', { 
            rotation, 
            transformOrigin: "center bottom" 
          });

          // Update score text + color dynamically
          if (scoreRef.current) {
            scoreRef.current.textContent = score;

            let r, g;
            if (score <= 450) {
              // Red → Yellow transition
              const t = score / 450;
              r = 255;
              g = Math.round(t * 255);
            } else {
              // Yellow → Green transition
              const t = (score - 450) / 450;
              r = Math.round(255 - t * 255);
              g = 255;
            }
            scoreRef.current.style.fill = `rgb(${r},${g},0)`;
          }
        },
      }
    );
  }, { scope: main });

  return (
    <section
      ref={main}
      className="relative h-screen w-full bg-black text-white flex items-center justify-center overflow-hidden"
    >
      <div className="container mx-auto px-4">

        {/* --- Scene 1: Freelance Gamble --- */}
        <div className="scene-1-content absolute inset-0 flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
          <div className="text-center md:text-left">
            <h2 className="freelance-title text-5xl md:text-6xl font-bold">
              The Freelance Gamble
            </h2>
            <p className="freelance-subtitle text-lg text-gray-400 mt-2">
              Replacing uncertainty with reliability.
            </p>
          </div>
          <img
            src="https://i.imgur.com/2c13BAu.png"
            alt="Graph"
            className="graph-img w-64 md:w-96 rounded-lg shadow-lg"
          />
        </div>

        {/* --- Scene 2: Vision + CIBIL Meter --- */}
        <div className="scene-2-content absolute inset-0 flex flex-col items-center justify-center gap-8 opacity-0">
          <div className="text-center">
            <h2 className="vision-title text-5xl md:text-6xl font-bold">
              Our Vision
            </h2>
            <p className="vision-subtitle text-lg text-gray-400 mt-2">
              The CIBIL Score for Skills.
            </p>
          </div>

          {/* Gauge meter with score below */}
          <div className="flex flex-col items-center">
            <svg 
              viewBox="0 0 200 120" 
              className="cibil-meter w-[300px] md:w-[400px]"
            >
              {/* Gradient from red → yellow → green */}
              <defs>
                <linearGradient id="meterGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#ff4d4d" />
                  <stop offset="50%" stopColor="#fff34d" />
                  <stop offset="100%" stopColor="#4dff4d" />
                </linearGradient>
              </defs>
              
              {/* Semi-circle arc */}
              <path
                d="M20,100 A80,80 0 0,1 180,100"
                fill="none"
                stroke="url(#meterGradient)"
                strokeWidth="10"
                strokeLinecap="round"
              />
              
              {/* Needle (rotates with score) */}
              <line
                className="cibil-needle"
                x1="100"
                y1="100"
                x2="100"
                y2="40"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
              />
              
              {/* Needle center circle */}
              <circle cx="100" cy="100" r="5" fill="white" />
            </svg>
            
            {/* Score display below the meter */}
            <div className="mt-4 text-center">
              <div className="text-gray-400 text-sm">Score</div>
              <div 
                ref={scoreRef}
                className="score-text text-4xl font-bold"
                style={{ color: 'white' }}
              >
                0
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};