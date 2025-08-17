import { HeroSection } from "../ui/landingPage/HeroSection";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Navbar } from "../ui/landingPage/NavBar";
import StorySection from "../ui/landingPage/StorySection";
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
      <StorySection />
    </div>
  );
}
