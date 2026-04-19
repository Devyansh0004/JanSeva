import { Link } from 'react-router-dom'
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, Youtube } from 'lucide-react'

const footerLinks = {
  'Quick Links': [
    { label: 'Home', path: '/' },
    { label: 'About Us', path: '/about' },
    { label: 'Statistics', path: '/statistics' },
    { label: 'Services', path: '/services' },
    { label: 'Contact Us', path: '/contact' },
  ],
  'Services': [
    { label: 'Volunteer Registration', path: '/services' },
    { label: 'Need Reporting', path: '/services' },
    { label: 'Emergency Coordination', path: '/services' },
    { label: 'NGO Collaboration', path: '/services' },
    { label: 'Resource Tracking', path: '/services' },
  ],
}

const socialLinks = [
  { icon: Facebook, href: '#', label: 'Facebook' },
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Instagram, href: '#', label: 'Instagram' },
  { icon: Linkedin, href: '#', label: 'LinkedIn' },
  { icon: Youtube, href: '#', label: 'YouTube' },
]

export default function Footer() {
  return (
    <footer className="bg-green-700 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-10 border-b border-green-600">

          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
                  <path d="M12 3C8.5 3 6 5.5 6 9C6 11.2 7.1 13.1 9 14.2C9 14.2 8.2 16 7.5 18H16.5C15.8 16 15 14.2 15 14.2C16.9 13.1 18 11.2 18 9C18 5.5 15.5 3 12 3Z" fill="#D8F3DC"/>
                  <path d="M12 7C10.9 7 10 7.9 10 9C10 9.8 10.5 10.5 11.2 10.8C11.2 10.8 10.8 11.8 10.5 13H13.5C13.2 11.8 12.8 10.8 12.8 10.8C13.5 10.5 14 9.8 14 9C14 7.9 13.1 7 12 7Z" fill="#40916C"/>
                </svg>
              </div>
              <span className="text-xl font-bold tracking-tight">JanSeva</span>
            </div>
            <p className="text-green-100 text-sm leading-relaxed mb-5">
              Empowering communities through smart volunteer coordination and data-driven resource allocation for greater social impact.
            </p>
            <div className="flex gap-3">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-8 h-8 bg-green-600 hover:bg-green-400 rounded-lg flex items-center justify-center transition-colors duration-200"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links & Services */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="font-semibold text-sm uppercase tracking-wider text-green-200 mb-4">{title}</h3>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.path}
                      className="text-green-100 hover:text-white text-sm transition-colors duration-200 hover:translate-x-0.5 inline-block"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider text-green-200 mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <Mail size={16} className="text-green-300 mt-0.5 flex-shrink-0" />
                <span className="text-green-100 text-sm">support@janseva.org</span>
              </li>
              <li className="flex items-start gap-3">
                <Phone size={16} className="text-green-300 mt-0.5 flex-shrink-0" />
                <span className="text-green-100 text-sm">+91 (0612) 302-8001</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin size={16} className="text-green-300 mt-0.5 flex-shrink-0" />
                <span className="text-green-100 text-sm">IIT Patna, Bihta,<br/>Bihar — 801106</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-green-200 text-sm">
            © {new Date().getFullYear()} JanSeva. All rights reserved.
          </p>
          <div className="flex gap-5">
            <a href="#" className="text-green-300 hover:text-white text-sm transition-colors duration-200">Privacy Policy</a>
            <a href="#" className="text-green-300 hover:text-white text-sm transition-colors duration-200">Terms of Use</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
