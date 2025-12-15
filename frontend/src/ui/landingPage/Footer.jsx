import { FaSquareXTwitter } from "react-icons/fa6";
import { FaLinkedin } from "react-icons/fa";
import { FaInstagram } from "react-icons/fa";
import { Link } from "react-router-dom";

const LocationIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
    />
  </svg>
);

export const Footer = () => {
  // Main Footer Component
  return (
    <footer className="relative z-10 border-t border-white/10 bg-deep-violet/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-8">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-neon-cyan to-electric-purple p-0.5">
              <div className="w-full h-full bg-deep-violet rounded-[7px] flex items-center justify-center">
                <span className="text-xl font-bold text-white">S</span>
              </div>
            </div>
            <span className="text-xl font-bold text-white tracking-wide group-hover:text-neon-cyan transition-colors">
              SkillBridge
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-sm font-medium">
            <a href="#" className="text-gray-400 hover:text-neon-cyan transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-gray-400 hover:text-neon-cyan transition-colors">
              Terms & Conditions
            </a>
            <a href="#" className="text-gray-400 hover:text-neon-cyan transition-colors">
              Support
            </a>
          </nav>

          {/* Social Icons */}
          <div className="flex items-center gap-6">
            <a href="#" aria-label="X" className="text-gray-400 hover:text-white hover:scale-110 transition-all text-xl">
              <FaSquareXTwitter />
            </a>
            <a href="#" aria-label="LinkedIn" className="text-gray-400 hover:text-neon-cyan hover:scale-110 transition-all text-xl">
              <FaLinkedin />
            </a>
            <a href="#" aria-label="Instagram" className="text-gray-400 hover:text-hot-pink hover:scale-110 transition-all text-xl">
              <FaInstagram />
            </a>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <p>&copy; 2025 SkillBridge. All rights reserved.</p>
          <div className="flex items-center gap-2 text-gray-400">
            <LocationIcon />
            <span>ABES Engineering College, Ghaziabad</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

