import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import features from "../../services/api/featureCard.json";
import { IoStatsChartOutline } from 'react-icons/io5';
import { IoTrophyOutline } from 'react-icons/io5';
import { FaRobot } from 'react-icons/fa';
import { TbTargetArrow } from 'react-icons/tb';
import { GrUserExpert } from "react-icons/gr";
import { TbBrain } from "react-icons/tb";

gsap.registerPlugin(ScrollTrigger);

const iconMap = {
  target: <TbTargetArrow />,
  bot: <FaRobot />,
  trophy: <IoTrophyOutline />,
  stats: <IoStatsChartOutline />,
  ex: <GrUserExpert />,
  br: <TbBrain />
};

const FeatureCard = ({ title, description, icon }) => (
  <div className="relative w-full h-full rounded-xl overflow-hidden border border-white/10"
    style={{
      // stronger, more opaque gradient background
      background: "linear-gradient(to bottom, rgba(255,255,255,0.15), rgba(255,255,255,0.05))",
      boxShadow: "0 10px 30px rgba(0,0,0,0.35)"
    }}>
    {/* big icon top-left */}
    <div className="absolute top-6 left-6 z-10 text-pink-400 opacity-95 select-none pointer-events-none"
         style={{ fontSize: 'clamp(44px, 6.5vw, 100px)', lineHeight: 1 }}>
      {icon}
    </div>

    {/* subtle frame / inner padding */}
    <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-end">
      <h3 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-white leading-tight mb-3">
        {title}
      </h3>
      <p className="text-base md:text-lg lg:text-xl text-gray-300 leading-relaxed"
          style={{
            maxHeight: "48vh",   
            overflowY: "auto",
            paddingRight: "6px", 
          }}>
        {description}
      </p>
    </div>

    {/* faint border inside for the aesthetic from screenshot */}
    <div className="absolute inset-2 rounded-md pointer-events-none " style={{ border: '1px solid rgba(255,255,255,0.04)', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }} />
  </div>
);

export default function StorySection() {
  const main = useRef(null);
  const scoreRef = useRef(null);
  const cardsViewportRef = useRef(null);
  const cardsRowRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // ==========================
      // Tweakable global values
      // ==========================
      const computeEnd = () => `+=700%`;
      const scrubSetting = true;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: main.current,
          start: 'top top',
          end: computeEnd,
          scrub: scrubSetting,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true
        }
      });
      // ---------------------
      // Scene 1
      // ---------------------
      const scene1 = {
        titleX: -120,
        imgX: 120,
        stagger: 1,
        duration: 2,
        exitDuration: 1.4
      };

      tl.addLabel('scene1-start')
        .from('.freelance-title, .freelance-subtitle', {
          x: scene1.titleX,
          opacity: 0,
          stagger: scene1.stagger,
          duration: scene1.duration,
          ease: 'power3.out'
        })
        .from('.graph-img', {
          x: scene1.imgX,
          opacity: 0,
          duration: scene1.duration,
          ease: 'power3.out'
        }, '<0.2');

      tl.to('.scene-1-content', {
        opacity: 0,
        y: -60,
        duration: scene1.exitDuration,
        ease: 'power2.inOut'
      })
      .to('.scene-2-content', {
        opacity: 1,
        duration: scene1.exitDuration,
        ease: 'power2.inOut'
      }, '<');

      // ---------------------
      // Scene 2
      // ---------------------
      const scene2 = {
        titleStagger: 0.35,
        titleDuration: 1.4,
        meterDuration: 1.4,
        scoreDuration: 2.6
      };

      tl.from('.vision-title, .vision-subtitle', {
        opacity: 0,
        y: 60,
        stagger: scene2.titleStagger,
        duration: scene2.titleDuration,
        ease: 'power3.out'
      })
      .from('.cibil-meter', {
        scale: 0.82,
        opacity: 0,
        duration: scene2.meterDuration,
        ease: 'elastic.out(1, 0.5)'
      }, '-=0.6');

      tl.to(
        { value: 0 },
        {
          value: 900,
          duration: scene2.scoreDuration,
          ease: 'sine.inOut',
          onUpdate: function () {
            const score = Math.round(this.targets()[0].value);
            const rotation = gsap.utils.mapRange(0, 900, -90, 90, score);

            gsap.set('.cibil-needle', {
              rotation,
              transformOrigin: 'center bottom'
            });

            if (scoreRef.current) {
              scoreRef.current.textContent = score;
              let r, g;
              if (score <= 450) {
                const t = score / 450;
                r = 255;
                g = Math.round(t * 255);
              } else {
                const t = (score - 450) / 450;
                r = Math.round(255 - t * 255);
                g = 255;
              }
              scoreRef.current.style.color = `rgb(${r},${g},0)`;
            }
          }
        }
      );

      tl.to('.scene-2-content', {
        opacity: 0,
        y: -50,
        duration: 1.0,
        ease: 'power2.inOut'
      })
      .set('.scene-3-content', { opacity: 1 })
      .from('.features-intro-title, .features-intro-subtitle', {
        opacity: 0,
        y: 50,
        stagger: 0.5,
        duration: 1.5,
        ease: 'power3.out'
      });

      tl.to({}, { duration: 0.6 });

      tl.to('.features-intro-title, .features-intro-subtitle', {
        opacity: 0,
        y: -40,
        duration: 0.9,
        ease: 'power2.inOut'
      });

      // ---------------------
      // Scene 4 - Feature Cards 
      // ---------------------
      const cards = gsap.utils.toArray('.feature-card-item');
      const cardsRow = cardsRowRef.current;
      const cardsViewport = cardsViewportRef.current;

      // Card sizing / entrance config (tweak these to taste)
      const cardEntrance = {
        initialOffsetMultiplier: 1.0, // full viewport width initial offset
        stagger: 2.0,                // per-card entrance stagger
        duration: 2.5,                // entrance duration for each card
        scaleStart: 0.98
      };

      // Responsive widths are controlled via the element classes in JSX below.
      // We compute real gap using computed styles (so the formula remains correct if you change CSS)
      const getGap = () => {
        if (!cardsRow) return 40;
        const style = getComputedStyle(cardsRow);
        // modern browsers provide gap numeric value; fallback to 40
        const g = parseFloat(style.gap || style.columnGap || 40);
        return isNaN(g) ? 40 : g;
      };

      // Set initial offscreen positions (to the right)
      gsap.set(cards, {
        x: (i) => (window.innerWidth * cardEntrance.initialOffsetMultiplier) + (i * getGap()),
        opacity: 0,
        scale: cardEntrance.scaleStart,
        willChange: 'transform, opacity'
      });

      // Helper: calculate exact slide distance so the last card ends flush with the right edge
      const calculateSlideDistance = () => {
        if (!cardsRow || cards.length === 0) return 0;

        // Use actual measured widths for accuracy
        let totalWidth = 0;
        cards.forEach((c) => {
          totalWidth += c.offsetWidth;
        });

        const gap = getGap();
        const totalRowWidth = totalWidth + (gap * (cards.length - 1));
        // viewport area where cards move
        const viewportWidth = cardsRow.parentElement ? cardsRow.parentElement.offsetWidth : window.innerWidth;

        // If the row is wider than the viewport, translate left by the overflow amount so last card becomes flush
        const overflow = Math.max(0, totalRowWidth - viewportWidth);
        return Math.round(overflow);
      };

      // Card entrance (fade + slide-in)
      tl.addLabel('cards-enter')
        .to(cards, {
          x: 0,
          opacity: 1,
          scale: 1,
          stagger: cardEntrance.stagger,
          duration: cardEntrance.duration,
          ease: 'power3.out'
        }, 'cards-enter');

      // small readable pause after cards appear
      tl.to({}, { duration: 1 });

      // Horizontal translation: slowed down significantly so cards are readable.
      // Duration scales with number of cards for consistent speed across counts.
      const baseDuration = 10.0; // base slowdown value (increase to make slower)
      const perCardExtra = 1.8;  // additional seconds per card
      const horizontalDuration = Math.max(baseDuration, baseDuration + (cards.length - 3) * perCardExtra);

      tl.to(cardsRow, {
        x: () => `-${calculateSlideDistance()}`,
        duration: horizontalDuration,
        ease: 'power1.inOut'
      }, 'cards-enter+=0.8');

      // final hold before unpin / end of this pinned section
      tl.to({}, { duration: 1.8 });

      // Keep calculations robust on refresh
      ScrollTrigger.addEventListener('refreshInit', () => {
        gsap.set(cards, {
          x: (i) => (window.innerWidth * cardEntrance.initialOffsetMultiplier) + (i * getGap()),
          opacity: 0
        });
      });

      // Optional debug helper
      // window.__story_debug = { calculateSlideDistance, getGap };

    }, main);

    return () => ctx.revert();
  }, []);

  return (
    <section id="story-section" ref={main} className="relative text-white overflow-hidden">
      <div className="relative h-screen">
        {/* Scene 1 */}
        <div className="scene-1-content absolute inset-0 flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
          <div className="text-center md:text-left">
            <h2 className="freelance-title text-5xl md:text-6xl font-bold">The Freelance Gamble</h2>
            <p className="freelance-subtitle text-lg text-gray-400 mt-2">Replacing uncertainty with reliability.</p>
          </div>
          <img src="stats.jpeg" alt="Graph" className="graph-img w-64 md:w-96 rounded-lg shadow-lg" />
        </div>

        {/* Scene 2 */}
        <div className="scene-2-content absolute inset-0 flex flex-col items-center justify-center gap-8 opacity-0">
          <div className="text-center">
            <h2 className="vision-title text-5xl md:text-6xl font-bold">Our Vision</h2>
            <p className="vision-subtitle text-lg text-gray-400 mt-2">The CIBIL Score for Skills.</p>
          </div>
          <div className="flex flex-col items-center">
            <svg viewBox="0 0 200 120" className="cibil-meter w-[300px] md:w-[400px]">
              <defs>
                <linearGradient id="meterGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#ff4d4d" />
                  <stop offset="50%" stopColor="#fff34d" />
                  <stop offset="100%" stopColor="#4dff4d" />
                </linearGradient>
              </defs>
              <path d="M20,100 A80,80 0 0,1 180,100" fill="none" stroke="url(#meterGradient)" strokeWidth="10" strokeLinecap="round" />
              <line className="cibil-needle" x1="100" y1="100" x2="100" y2="40" stroke="white" strokeWidth="3" strokeLinecap="round" />
              <circle cx="100" cy="100" r="5" fill="white" />
            </svg>
            <div className="mt-4 text-center">
              <div className="text-gray-400 text-sm">Score</div>
              <div ref={scoreRef} className="score-text text-4xl font-bold" style={{ color: 'white' }}>0</div>
            </div>
          </div>
        </div>

        {/* Scene 3 */}
        <div className="scene-3-content absolute inset-0 z-10 flex flex-col items-center justify-center text-center px-4 opacity-0">
          <h1 className="features-intro-title text-4xl md:text-5xl font-bold text-gray-300">A Smarter Way to Connect</h1>
          <p className="features-intro-subtitle mt-4 text-lg md:text-xl text-slate-400 max-w-3xl mx-auto">AI-powered matching and skill verification for trusted freelancer-client connections.</p>
        </div>

        {/* Scene 4 - Feature Cards (layout updated) */}
        <div className="absolute inset-0 z-0 flex items-center justify-center px-4">
          <div className="container mx-auto w-full">
            <div ref={cardsViewportRef} className="overflow-hidden w-full">
              <div ref={cardsRowRef} className="flex gap-16 items-stretch justify-start py-10">
                {features.slice(0, 6).map((feature) => {
                  const Icon = iconMap[feature.icon];
                  return (
                    <div 
                      key={feature.id} 
                      className="feature-card-item flex-shrink-0 w-[280px] sm:w-[340px] md:w-[420px] lg:w-[520px] h-[480px] md:h-[640px] xl:h-[720px]"
                    >
                      <FeatureCard 
                        title={feature.title} 
                        description={feature.description} 
                        icon={Icon} 
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
