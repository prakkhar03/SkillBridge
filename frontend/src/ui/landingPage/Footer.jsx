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
    <footer className="text-gray-700 font-sans max-w-7xl mx-auto px-4 sm:px-6 py-10 md:py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-6">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <img src="/src/assets/skillbridgelogo.png" alt="SkillBridge logo" className="h-9 w-9 rounded-md object-cover" />
          <span className="text-lg font-bold tracking-wide" style={{ color: "#787A84" }}>
            SkillBridge
          </span>
        </Link>

          {/* Navigation Links */}
          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm font-medium order-first md:order-none">
            <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">
              Terms & Condition
            </a>
          </nav>
          <div className="flex items-center gap-4 text-gray-500">
            <a href="#" aria-label="X" className="hover:text-blue-400 transition-colors text-2xl">
              <FaSquareXTwitter />
            </a>
            <a href="#" aria-label="LinkedIn" className="hover:text-blue-700 transition-colors text-2xl">
              <FaLinkedin />
            </a>
            <a href="#" aria-label="InstaGram" className="hover:text-red-600 transition-colors text-2xl">
              <FaInstagram />
            </a>
          </div>
        </div>
        <hr className="border-t border-gray-600" />
        <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-left gap-4 text-sm text-gray-500 mt-6">
          <p>&copy; 2025 SkillBridge. All rights reserved.</p>
          <div className="flex justify-center items-center gap-2">
            <LocationIcon />
            <span>ABES Engineering College, Ghaziabad</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

