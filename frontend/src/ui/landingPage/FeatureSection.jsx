import React, { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import features from "../../services/api/featureCard.json";
import { IoStatsChartOutline } from "react-icons/io5";
import { IoTrophyOutline } from "react-icons/io5";
import { FaRobot } from "react-icons/fa";
import { TbTargetArrow } from "react-icons/tb";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const FeatureCard = ({ title, description, icon }) => (
  <div className="bg-gray-900 p-8 rounded-2xl border border-gray-700/50 shadow-lg h-full flex flex-col text-left">
    <div className="text-4xl mb-4 text-sky-400">{icon}</div>
    <h3 className="text-2xl font-bold mb-2 text-white">{title}</h3>
    <p className="text-gray-400">{description}</p>
  </div>
);

const iconMap = {
  target: <TbTargetArrow />,
  bot: <FaRobot />,
  trophy: <IoTrophyOutline />,
  stats: <IoStatsChartOutline />
};

export const FeaturesSection = () => {
  const main = useRef(null);

  useGSAP(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: main.current,
          start: 'top top',
          end: '+=300%',         // intro + quick cards + hold
          scrub: true,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        }
      });

      // Ensure cards start off-screen (parallax) with no flash
      const cards = gsap.utils.toArray('.feature-card-item');
      gsap.set(cards, {
        xPercent: (i) => 100 + i * 30, // 100%, 130%, 160%, 190%
        opacity: 0,
        willChange: 'transform'
      });

      // Intro in → hold → out
      tl.from('.features-intro-title, .features-intro-subtitle', {
        opacity: 0,
        y: 40,
        stagger: 0.15,
        duration: 0.5
      })
      .to({}, { duration: 0.25 }) // brief hold
      .to('.features-intro-title, .features-intro-subtitle', {
        opacity: 0,
        y: -40,
        duration: 0.5
      });

      // Cards parallax in (short window), then hold visible
      tl.to(cards, {
        xPercent: 0,
        opacity: 1,
        stagger: 0.3,      // one-by-one
        duration: 0.9,
        ease: 'power3.out' // shape within scrub
      }, "+=0.15")
      .to({}, { duration: 0.6 }); // hold full grid until unpin

      // Optional: recompute initial positions on refresh (responsive)
      ScrollTrigger.addEventListener('refreshInit', () => {
        gsap.set(cards, { xPercent: (i) => 100 + i * 30, opacity: 0 });
      });
    }, main);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={main} id="features" className="relative bg-black text-white overflow-hidden">
      {/* Pin target area */}
      <div className="relative h-screen">

        {/* Intro layer (on top initially) */}
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center px-4">
          <h1 className="features-intro-title text-4xl md:text-5xl font-bold text-gray-300">
            A Smarter Way to Connect
          </h1>
          <p className="features-intro-subtitle mt-4 text-lg md:text-xl text-slate-400 max-w-3xl mx-auto">
            AI-powered matching and skill verification for trusted freelancer-client connections.
          </p>
        </div>

        {/* Cards layer (below intro, will animate in) */}
        <div className="absolute inset-0 z-0 flex items-center justify-center px-4">
          <div className="container mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature) => {
                const Icon = iconMap[feature.icon];
                return (
                  <div key={feature.id} className="feature-card-item">
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
    </section>
  );
};
