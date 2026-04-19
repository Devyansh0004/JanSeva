import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'

const navLinks = [
  { label: 'Home', path: '/' },
  { label: 'About Us', path: '/about' },
  { label: 'Statistics', path: '/statistics' },
  { label: 'Services', path: '/services' },
  { label: 'Contact Us', path: '/contact' },
]

const Logo = () => (
  <Link to="/" className="flex items-center gap-2.5 group">
    <div className="w-9 h-9 bg-green-600 rounded-lg flex items-center justify-center group-hover:bg-green-700 transition-colors duration-200 flex-shrink-0">
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
        <path d="M12 3C8.5 3 6 5.5 6 9C6 11.2 7.1 13.1 9 14.2C9 14.2 8.2 16 7.5 18H16.5C15.8 16 15 14.2 15 14.2C16.9 13.1 18 11.2 18 9C18 5.5 15.5 3 12 3Z" fill="#D8F3DC"/>
        <path d="M12 7C10.9 7 10 7.9 10 9C10 9.8 10.5 10.5 11.2 10.8C11.2 10.8 10.8 11.8 10.5 13H13.5C13.2 11.8 12.8 10.8 12.8 10.8C13.5 10.5 14 9.8 14 9C14 7.9 13.1 7 12 7Z" fill="#40916C"/>
      </svg>
    </div>
    <span className="text-xl font-bold text-green-800 tracking-tight group-hover:text-green-600 transition-colors duration-200">
      JanSeva
    </span>
  </Link>
)

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 16)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setIsOpen(false)
  }, [location.pathname])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white shadow-md border-b border-gray-100'
          : 'bg-white/95 backdrop-blur-sm border-b border-gray-100'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-[68px]">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Logo />
          </div>

          {/* Desktop Nav Links — centered */}
          <div className="hidden md:flex items-center justify-center gap-1 flex-1 px-8">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                    isActive
                      ? 'text-green-600 bg-green-50'
                      : 'text-gray-600 hover:text-green-600 hover:bg-green-50'
                  }`}
                >
                  {link.label}
                </Link>
              )
            })}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-3 flex-shrink-0">
            <Link
              to="/contact"
              className="text-green-600 border border-green-300 hover:border-green-500 hover:bg-green-50 font-semibold text-sm px-5 py-2 rounded-lg transition-all duration-200"
            >
              Login
            </Link>
            <Link
              to="/contact"
              className="btn-primary text-sm px-5 py-2"
            >
              Sign Up
            </Link>
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg text-gray-600 hover:text-green-600 hover:bg-green-50 transition-colors duration-200"
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
          >
            {isOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="bg-white border-t border-gray-100 px-4 pt-3 pb-5 space-y-1">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`block px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                  isActive
                    ? 'text-green-700 bg-green-50 font-semibold'
                    : 'text-gray-600 hover:text-green-600 hover:bg-green-50'
                }`}
              >
                {link.label}
              </Link>
            )
          })}
          <div className="flex flex-col gap-2 pt-3 border-t border-gray-100">
            <Link
              to="/contact"
              className="block text-center text-green-600 border border-green-300 font-semibold text-sm px-4 py-2.5 rounded-lg hover:bg-green-50 transition-all duration-200"
            >
              Login
            </Link>
            <Link
              to="/contact"
              className="block text-center btn-primary text-sm"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
