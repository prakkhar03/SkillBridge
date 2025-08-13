import { Link } from "react-router-dom";
import features from "../services/api/featureCard.json"
import { FeatureCard } from "../ui/FeatureCard";
import { IoStatsChartOutline } from "react-icons/io5";
import { IoTrophyOutline } from "react-icons/io5";
import { FaRobot } from "react-icons/fa";
import { TbTargetArrow } from "react-icons/tb";

const colors = {
  background: "#DFE0E2",
  muted: "#B8BCC3",
  accent: "#787A84",
};

const iconMap = {
  "target": <TbTargetArrow />,
  "bot": <FaRobot />,
  "trophy": <IoTrophyOutline />,
  "stats": <IoStatsChartOutline />
};

export default function HomePage() {
  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: colors.background }}
    >
      {/* Landing Page Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-24">
        <div className="text-center">
          <h1
            className="text-4xl md:text-6xl font-bold mb-6"
            style={{ color: colors.accent }}
          >
            Welcome to SkillBridge
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Connect talented freelancers with amazing clients. Build your career
            or find the perfect professional for your project.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/auth"
              className="px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Get Started
            </Link>
            <button className="px-8 py-4 border-2 border-gray-300 text-gray-700 text-lg font-semibold rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-colors">
              Learn More
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 md:py-16">
        <div className="flex border-2 border-slate-300 rounded-lg shadow-xl overflow-hidden" style={{ backgroundColor: "#e9e8e8ff" }}>
          <div className="w-[65%] p-12 text-black flex flex-col justify-center">
            <h1 className="text-3xl md:text-4xl font-bold" style={{ color: "#787A84" }}>The End of the Freelancer Gamble.</h1>
            <br/>
            <p className="mt-4 text-lg text-black" >
              <code className="text-white font-mono p-1 rounded-md" style={{ backgroundColor: "#404F68" }}>SkillBridge</code> is an AI-powered platform that revolutionizes freelancer-client interactions through comprehensive skill verification, intelligent matching, and trust-building mechanisms.<br/><br/>
              <code className="text-white font-mono p-1 rounded-md" style={{ backgroundColor: "#404F68" }}>Our Vision:</code> Become the "CIBIL Score for Skills" - the trusted industry standard for freelancer verification.
            </p>
          </div>
          <div className="w-[35%] rounded-xl h-full p-12"><img className="w-full h-full rounded-xl object-cover" src="stats.jpeg" alt="performance" /></div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 md:py-16">
        <div className="p-4 md:p-6">
          <h1 className="text-4xl md:text-5xl font-bold text-center" style={{ color: "#787A84" }}>
            A Smarter Way to Connect
          </h1>
          <p className="mt-4 text-lg md:text-xl text-center text-slate-600 max-w-3xl mx-auto mb-16">
            AI-powered matching and skill verification for trusted freelancer-client connections.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => {
              const iconNameString = feature.icon;
              const TheActualIconComponent = iconMap[iconNameString];
              return (
                <FeatureCard
                  key={feature.id}
                  title={feature.title}
                  description={feature.description}
                  icon={TheActualIconComponent}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
