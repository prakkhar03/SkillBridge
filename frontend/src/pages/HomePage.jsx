import { HeroSection } from "../ui/landingPage/HeroSection";
import FeaturesSection from "../ui/landingPage/FeaturesSection";
import HowItWorksSection from "../ui/landingPage/HowItWorksSection";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function HomePage() {
  return (
    <div className="w-full relative overflow-hidden">
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
    </div>
  );
}
