import { HeroSection } from "../ui/landingPage/HeroSection";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import StorySection from "../ui/landingPage/StorySection";
import ParallaxElement from "../ui/utils/ParallaxElement";
gsap.registerPlugin(ScrollTrigger);

export default function HomePage() {
  return (
    <div
      className="w-full relative"
      // style={{ backgroundColor: colors.background }}
    >
      {/* Landing Page Content */}
      {/* <ParallaxElement /> */}
      <HeroSection />
      <StorySection />
    </div>
  );
}
