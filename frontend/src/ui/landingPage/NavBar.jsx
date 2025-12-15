import { useEffect, useRef, useState } from "react"
import { useAuth } from "../../context/AuthContext"
import { Link } from "react-router-dom"
import { FaBars, FaTimes } from "react-icons/fa"

export function Navbar() {
  const [open, setOpen] = useState(false)
  const { isAuthenticated, logout } = useAuth()

  return (
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 w-[90%] max-w-5xl z-50">
      <div className="glass-pill px-6 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-400 to-purple-600 animate-pulse group-hover:scale-110 transition-transform"></div>
          <span className="text-xl font-bold tracking-wider text-white group-hover:text-cyan-300 transition-colors">
            SkillBridge
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center space-x-8">
          <Link to="/" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">Home</Link>
          <a href="#features" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">Features</a>
          <a href="#about" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">About</a>
        </div>

        {/* Auth Buttons */}
        <div className="hidden md:flex items-center space-x-4">
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="text-cyan-400 hover:text-cyan-300 font-medium text-sm">Dashboard</Link>
              <button onClick={logout} className="text-gray-400 hover:text-white text-sm">Logout</button>
            </>
          ) : (
            <Link to="/auth" className="neon-button px-6 py-2 rounded-full text-sm font-bold tracking-wide">
              JOIN NOW
            </Link>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button onClick={() => setOpen(!open)} className="md:hidden text-white text-xl">
          {open ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {open && (
        <div className="absolute top-full left-0 w-full mt-4 glass-pill p-6 flex flex-col space-y-4 md:hidden animate-fade-in-up">
          <Link to="/" className="text-gray-300 hover:text-white" onClick={() => setOpen(false)}>Home</Link>
          <a href="#features" className="text-gray-300 hover:text-white" onClick={() => setOpen(false)}>Features</a>
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="text-cyan-400" onClick={() => setOpen(false)}>Dashboard</Link>
              <button onClick={() => { logout(); setOpen(false); }} className="text-left text-gray-400">Logout</button>
            </>
          ) : (
            <Link to="/auth" className="neon-button text-center py-2 rounded-full" onClick={() => setOpen(false)}>
              JOIN NOW
            </Link>
          )}
        </div>
      )}
    </nav>
  )
}