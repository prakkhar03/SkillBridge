import { HeroSection } from "../ui/landingPage/HeroSection";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { DetailSection } from "../ui/landingPage/DetailSection";
import { FeaturesSection } from "../ui/landingPage/FeatureSection";
import { Navbar } from "../ui/landingPage/NavBar";
gsap.registerPlugin(ScrollTrigger);

export default function HomePage() {
  return (
    <div
      className="w-full relative"
      // style={{ backgroundColor: colors.background }}
    >
      {/* Landing Page Content */}
      <HeroSection>
        <Navbar />
      </HeroSection>
  
      <DetailSection />
      <FeaturesSection />
    </div>
  );
}
