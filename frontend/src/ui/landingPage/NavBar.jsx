import { useEffect, useRef, useState } from "react"
import { useAuth } from "../../context/AuthContext"
import { Link } from "react-router-dom"

const colors = {
  background: '#DFE0E2',
  muted: '#B8BCC3',
  accent: '#787A84',
}

export function Navbar() {
  const [open, setOpen] = useState(false)
  const [navbarHeight, setNavbarHeight] = useState(0)
  const navbarRef = useRef(null)
  const { isAuthenticated, logout } = useAuth()

  useEffect(() => {
    if (navbarRef.current) {
      setNavbarHeight(navbarRef.current.offsetHeight)
      // Set the navbar height as a CSS custom property
      document.documentElement.style.setProperty('--navbar-height', `${navbarRef.current.offsetHeight}px`)
    }
  }, [isAuthenticated])
  
  return (
    <nav
      ref={navbarRef}
      className="w-full max-w-7xl mx-auto mt-4 md:mt-6 rounded-xl shadow-sm"
      style={{ border: `1px solid white` }}
    >
      <div className="flex items-center justify-between px-4 py-3 sm:px-6">
        {/* Left: Logo + Name */}
        <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <img src="/src/assets/skillbridgelogo.png" alt="SkillBridge logo" className="h-9 w-9 rounded-md object-cover" />
          <span className="text-lg font-bold tracking-wide" style={{ color: colors.accent }}>
            SkillBridge
          </span>
        </Link>

        {/* Right: Hamburger */}
                                {isAuthenticated ? (
                          <div className="flex items-center space-x-3">
                            <Link
                              to="/dashboard"
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                            >
                              Dashboard
                            </Link>
                            <button
                              onClick={logout}
                              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                            >
                              Logout
                            </button>
                          </div>
                        ) : (
                          <button
                            aria-label="Toggle menu"
                            className="inline-flex h-10 w-10 items-center justify-center rounded-md transition-colors focus:outline-none focus:ring-2"
                            style={{ border: `1px solid ${colors.muted}`, color: colors.accent }}
                            onClick={() => setOpen((p) => !p)}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                              className="h-5 w-5"
                            >
                              <path d="M3.75 6.75h16.5a.75.75 0 0 0 0-1.5H3.75a.75.75 0 0 0 0 1.5Zm16.5 5.25H3.75a.75.75 0 0 0 0 1.5h16.5a.75.75 0 0 0 0-1.5Zm0 6H3.75a.75.75 0 0 0 0 1.5h16.5a.75.75 0 0 0 0-1.5Z" />
                            </svg>
                          </button>
                        )}
      </div>

      {/* Full-screen overlay menu */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/40"
          onClick={() => setOpen(false)}
          aria-modal="true"
          role="dialog"
        >
          {/* Close button aligned with hamburger position */}
          <div className="absolute inset-x-0 top-0">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3 mt-4 md:mt-6 flex justify-end">
              <button
                aria-label="Close menu"
                className="inline-flex h-10 w-10 items-center justify-center rounded-md transition-colors focus:outline-none focus:ring-2"
                style={{ border: `1px solid ${colors.muted}`, color: colors.accent, backgroundColor: '#FFFFFF' }}
                onClick={(e) => {
                  e.stopPropagation()
                  setOpen(false)
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 mx-auto">
                  <path fillRule="evenodd" d="M6.225 4.811a.75.75 0 0 1 1.06 0L12 9.525l4.715-4.714a.75.75 0 1 1 1.06 1.06L13.06 10.586l4.715 4.715a.75.75 0 1 1-1.06 1.06L12 11.646l-4.715 4.715a.75.75 0 1 1-1.06-1.06l4.714-4.715-4.714-4.714a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>

          {/* Menu content */}
          <div className="flex h-full w-full px-8 py-16" onClick={(e) => e.stopPropagation()}>
            <nav className="flex flex-col justify-evenly h-full max-h-[70vh]">
              <a
                href="#features"
                className="text-3xl md:text-4xl font-semibold text-[#FFFFFF] underline-anim"
              >
                Features
              </a>
              <a
                href="#about"
                className="text-3xl md:text-4xl font-semibold text-[#FFFFFF] underline-anim"
              >
                About
              </a>
              <a
                href="#contact"
                className="text-3xl md:text-4xl font-semibold text-[#FFFFFF] underline-anim"
              >
                Contact
              </a>
                                        {isAuthenticated ? (
                            <>
                              <Link
                                to="/dashboard"
                                className="text-3xl md:text-4xl font-semibold text-[#FFFFFF] underline-anim hover:text-blue-200 transition-colors"
                                onClick={() => setOpen(false)}
                              >
                                Dashboard
                              </Link>
                              <button
                                onClick={() => {
                                  logout();
                                  setOpen(false);
                                }}
                                className="text-3xl md:text-4xl font-semibold text-[#FFFFFF] underline-anim hover:text-red-200 transition-colors text-left"
                              >
                                Logout
                              </button>
                            </>
                          ) : (
                            <Link
                              to="/auth"
                              className="text-3xl md:text-4xl font-semibold text-[#FFFFFF] underline-anim hover:text-blue-200 transition-colors"
                              onClick={() => setOpen(false)}
                            >
                              Sign up
                            </Link>
                          )}
            </nav>
          </div>
        </div>
      )}
    </nav>
  )
}