import { Link } from 'react-router-dom'
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, Youtube, Activity } from 'lucide-react'

const footerLinks = {
  'Quick Links': [
    { label: 'Home', path: '/' },
    { label: 'About Us', path: '/about' },
    { label: 'Statistics', path: '/statistics' },
    { label: 'Services', path: '/services' },
    { label: 'Contact Us', path: '/contact' },
  ],
  Explore: [
    { label: 'Find NGOs', path: '/explore' },
    { label: 'Top NGOs', path: '/top-ngos' },
    { label: 'Campaigns', path: '/campaigns' },
    { label: 'Contributions', path: '/contributions' },
    { label: 'Analytics', path: '/statistics' },
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
    <footer style={{ background: '#0f1f17', borderTop: '1px solid rgba(82,183,136,0.12)' }}>
      <div style={{ maxWidth: '100%', padding: '64px 48px 0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2 xl:grid-cols-4">
            {/* Brand column */}
            <div className="xl:pr-6">
              <div className="mb-5 flex items-center gap-3">
                <div
                  className="grid h-11 w-11 place-items-center rounded-2xl"
                  style={{ background: 'var(--green-6)' }}
                >
                  <Activity size={20} style={{ color: '#d8f3dc' }} />
                </div>
                <div>
                  <p className="text-xl font-extrabold tracking-[-0.05em]" style={{ color: '#ffffff', fontFamily: 'Space Grotesk, Manrope, sans-serif' }}>
                    Jan<span style={{ color: 'var(--green-5)' }}>Seva</span>
                  </p>
                  <p className="text-xs font-bold uppercase tracking-[0.18em]" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    Smarter Social Impact
                  </p>
                </div>
              </div>
              <p className="mb-6 text-sm leading-7" style={{ color: 'rgba(255,255,255,0.5)' }}>
                JanSeva helps NGOs coordinate volunteers, prioritize needs, and deliver measurable community outcomes with clarity.
              </p>
              <div className="flex flex-wrap gap-3">
                {socialLinks.map(({ icon: Icon, href, label }) => (
                  <a
                    key={label}
                    href={href}
                    aria-label={label}
                    className="grid h-10 w-10 place-items-center rounded-xl transition-all duration-200"
                    style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.55)' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--green-6)'; e.currentTarget.style.color = '#fff' }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = 'rgba(255,255,255,0.55)' }}
                  >
                    <Icon size={16} />
                  </a>
                ))}
              </div>
            </div>

            {/* Link columns */}
            {Object.entries(footerLinks).map(([title, links]) => (
              <div key={title}>
                <h3 className="mb-5 text-sm font-extrabold uppercase tracking-[0.16em]" style={{ color: 'var(--green-5)' }}>
                  {title}
                </h3>
                <ul className="space-y-3">
                  {links.map((link) => (
                    <li key={link.label}>
                      <Link
                        className="text-sm transition-colors"
                        style={{ color: 'rgba(255,255,255,0.5)' }}
                        to={link.path}
                        onMouseEnter={(e) => { e.currentTarget.style.color = '#ffffff' }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.5)' }}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* Contact column */}
            <div>
              <h3 className="mb-5 text-sm font-extrabold uppercase tracking-[0.16em]" style={{ color: 'var(--green-5)' }}>
                Contact
              </h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <Mail size={16} className="mt-1 shrink-0" style={{ color: 'var(--green-5)' }} />
                  <span className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>support.janseva@gmail.com</span>
                </li>
                <li className="flex items-start gap-3">
                  <Phone size={16} className="mt-1 shrink-0" style={{ color: 'var(--blue-accent)' }} />
                  <span className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>+91 7404189988</span>
                </li>
                <li className="flex items-start gap-3">
                  <MapPin size={16} className="mt-1 shrink-0" style={{ color: 'var(--red-accent)' }} />
                  <span className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    IIT Patna, Bihta
                    <br />
                    Bihar - 801106, India
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar — full width */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', marginTop: '48px', padding: '20px 48px', background: 'rgba(0,0,0,0.2)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>
            © {new Date().getFullYear()} JanSeva. Built for calm, coordinated community response.
          </p>
          <div className="flex gap-5">
            <a href="#" className="text-sm transition-colors" style={{ color: 'rgba(255,255,255,0.35)' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#ffffff' }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.35)' }}>
              Privacy Policy
            </a>
            <a href="#" className="text-sm transition-colors" style={{ color: 'rgba(255,255,255,0.35)' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#ffffff' }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.35)' }}>
              Terms of Use
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
