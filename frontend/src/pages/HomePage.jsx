import { Link } from 'react-router-dom';

const colors = {
  background: '#DFE0E2',
  muted: '#B8BCC3',
  accent: '#787A84',
};

export default function HomePage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.background }}>
      {/* Landing Page Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-24">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6" style={{ color: colors.accent }}>
            Welcome to SkillBridge
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Connect talented freelancers with amazing clients. Build your career or find the perfect professional for your project.
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
    </div>
  );
}
