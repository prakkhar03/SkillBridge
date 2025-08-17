import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import features from "../../services/api/featureCard.json";
import { IoStatsChartOutline } from 'react-icons/io5';
import { IoTrophyOutline } from 'react-icons/io5';
import { FaRobot } from 'react-icons/fa';
import { TbTargetArrow } from 'react-icons/tb';

gsap.registerPlugin(ScrollTrigger);

const iconMap = {
  target: <TbTargetArrow />,
  bot: <FaRobot />,
  trophy: <IoTrophyOutline />,
  stats: <IoStatsChartOutline />
};

// Consistent card sizing
const FeatureCard = ({ title, description, icon }) => (
  <div className="bg-gray-900 p-10 rounded-2xl border border-gray-700/50 shadow-lg w-full h-[380px] flex flex-col text-left">
    <div className="text-5xl mb-6 text-sky-400">{icon}</div>
    <h3 className="text-2xl font-bold mb-4 text-white">{title}</h3>
    <p className="text-gray-400 text-base leading-relaxed flex-grow">{description}</p>
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
      // Areas you can tweak later
      // ==========================
      // 1) computeEnd base: controls overall pinned scroll length for the entire 4-scene story.
      //    - Larger value -> more scroll space -> slower animations (more readable).
      //    TWEAK HERE: change `base` value or return string directly (e.g. `+=600%`).
      const computeEnd = () => {
        const base = 450; // <-- TWEAK: total base scroll percent for the whole section (in % of viewport height)
        // You can increase base to 550 or 650 for even slower motion.
        return `+=${base}%`;
      };

      // 2) scrub smoothing: set to `true` for 1:1 scroll mapping, or a number like 0.6 for lagged smoothing.
      //    TWEAK HERE: change `scrub` value below (true | 0.6 | 1.2 etc.)
      const scrubSetting = true; // <-- TWEAK: set to `true` (precise) or a numeric value for smoothing

      // 3) Easing presets: you can change easings used throughout.
      //    Example: 'power3.out', 'power2.inOut', 'sine.inOut', 'elastic.out(1, 0.5)'
      //    TWEAK: update easings in timeline tweens below for different feels.

      // Main timeline with scrub setting variable so you can tweak easily
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
      // Scene 1 - timings you can tweak
      // ---------------------
      const scene1 = {
        titleX: -120,
        imgX: 120,
        stagger: 0.35,   // <-- TWEAK: change stagger between title and subtitle
        duration: 1.6,   // <-- TWEAK: change entrance duration for Scene 1
        exitDuration: 1.0
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

      // Pace the exit so it doesn't snap - tweak exitDuration above
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
      // Scene 2 - meter and score (tweak durations here)
      // ---------------------
      const scene2 = {
        titleStagger: 0.35,
        titleDuration: 1.4,
        meterDuration: 1.4,
        scoreDuration: 2.6 // <-- TWEAK: how long the score counts from 0->900
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

      // Score number animation (readable)
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

      // Scene 2 exit
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
        stagger: 0.25,
        duration: 1.2,
        ease: 'power3.out'
      });

      // Hold briefly so the intro copy is readable
      tl.to({}, { duration: 0.6 });

      // Scene 3 exit
      tl.to('.features-intro-title, .features-intro-subtitle', {
        opacity: 0,
        y: -40,
        duration: 0.9,
        ease: 'power2.inOut'
      });

      // ---------------------
      // Scene 4 - Feature Cards (timing & sizes are tweak points)
      // ---------------------
      const cards = gsap.utils.toArray('.feature-card-item');
      const cardsRow = cardsRowRef.current;

      // TWEAK: cardEntrance config
      const cardEntrance = {
        initialOffsetMultiplier: 1.0, // multiplies window.innerWidth for initial offscreen x (1.0 = full width)
        perCardOffset: 120,           // px added per card to push them further right
        stagger: 0.45,                // <-- TWEAK: per-card stagger for entrance
        duration: 1.2,                // <-- TWEAK: entrance duration for each card
        scaleStart: 0.96
      };

      // set initial off-screen positions for cards. Adjust initialOffsetMultiplier or perCardOffset above.
      gsap.set(cards, {
        x: (i) => (window.innerWidth * cardEntrance.initialOffsetMultiplier) + (i * cardEntrance.perCardOffset),
        opacity: 0,
        scale: cardEntrance.scaleStart,
        willChange: 'transform, opacity'
      });

      // Helper: calculates exact slide distance so final card is flush to right edge.
      // TWEAK: gap here should match your CSS gap (gap-10 => 2.5rem => 40px)
      const calculateSlideDistance = () => {
        if (!cardsRow || cards.length === 0) return 0;

        const cardEl = cards[0];
        const cardWidth = cardEl.offsetWidth;
        const gap = 40; // <-- TWEAK: update if you change CSS gap
        const totalRowWidth = (cardWidth * cards.length) + (gap * (cards.length - 1));
        const viewportWidth = cardsRow.parentElement.offsetWidth;

        // translate left by the exact difference so the last card is flush on the right
        return Math.max(0, totalRowWidth - viewportWidth);
      };

      // Card entrance: controlled by cardEntrance values above
      tl.addLabel('cards-enter')
        .to(cards, {
          x: 0,
          opacity: 1,
          scale: 1,
          stagger: cardEntrance.stagger,
          duration: cardEntrance.duration,
          ease: 'power3.out'
        }, 'cards-enter');

      // small readable pause
      tl.to({}, { duration: 0.4 });

      // Horizontal translation: slow and steady. TWEAK: change duration to slow/faster.
      const horizontal = {
        duration: 4.0, // <-- TWEAK: total duration of the horizontal translation (higher = slower)
        ease: 'power1.inOut'
      };

      tl.to(cardsRow, {
        x: () => `-${Math.round(calculateSlideDistance())}`,
        duration: horizontal.duration,
        ease: horizontal.ease
      }, 'cards-enter+=0.6');

      // final hold before unpin/transition
      tl.to({}, { duration: 0.8 });

      // ---------------------
      // Refresh handlers: keep this to ensure layout/timings recalc on resize
      // If you tweak sizes/gaps dynamically, call ScrollTrigger.refresh() after DOM changes.
      // ---------------------
      ScrollTrigger.addEventListener('refreshInit', () => {
        gsap.set(cards, {
          x: (i) => (window.innerWidth * cardEntrance.initialOffsetMultiplier) + (i * cardEntrance.perCardOffset),
          opacity: 0
        });
      });

      ScrollTrigger.addEventListener('refresh', () => {
        // re-evaluate calculateSlideDistance on refresh (no-op necessary here)
      });

      // Optional helper exposed for debugging in console (not required)
      // window.__story_debug = { calculateSlideDistance };

    }, main);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={main} className="relative text-white overflow-hidden">
      <div className="relative h-screen">
        {/* Scene 1 */}
        <div className="scene-1-content absolute inset-0 flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
          <div className="text-center md:text-left">
            <h2 className="freelance-title text-5xl md:text-6xl font-bold">The Freelance Gamble</h2>
            <p className="freelance-subtitle text-lg text-gray-400 mt-2">Replacing uncertainty with reliability.</p>
          </div>
          <img src="https://i.imgur.com/2c13BAu.png" alt="Graph" className="graph-img w-64 md:w-96 rounded-lg shadow-lg" />
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

        {/* Scene 4 - Feature Cards */}
        <div className="absolute inset-0 z-0 flex items-center justify-center px-4">
          <div className="container mx-auto w-full">
            <div ref={cardsViewportRef} className="overflow-hidden w-full">
              <div ref={cardsRowRef} className="flex gap-10 items-stretch justify-start py-10">
                {features.slice(0, 6).map((feature) => {
                  const Icon = iconMap[feature.icon];
                  return (
                    <div 
                      key={feature.id} 
                      className="feature-card-item flex-shrink-0 w-[320px] md:w-[380px] lg:w-[420px]"
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
