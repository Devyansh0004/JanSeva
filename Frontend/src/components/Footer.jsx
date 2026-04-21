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
  Services: [
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
    <footer
      style={{
        marginTop: 'auto',
        background: 'linear-gradient(180deg, rgba(216,243,220,0.22), rgba(255,255,255,0.9) 20%, #ffffff 100%)',
        borderTop: '1px solid rgba(45, 106, 79, 0.1)',
      }}
    >
      <div className="container section-sm">
        <div className="glass-card p-8 md:p-10">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2 xl:grid-cols-4">
            <div className="xl:pr-6">
              <div className="mb-5 flex items-center gap-3">
                <div
                  className="grid h-11 w-11 place-items-center rounded-2xl"
                  style={{ background: 'linear-gradient(135deg, var(--green-6), var(--green-7))' }}
                >
                  <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                    <path d="M12 3C8.5 3 6 5.5 6 9C6 11.2 7.1 13.1 9 14.2C9 14.2 8.2 16 7.5 18H16.5C15.8 16 15 14.2 15 14.2C16.9 13.1 18 11.2 18 9C18 5.5 15.5 3 12 3Z" fill="#D8F3DC" />
                    <path d="M12 7C10.9 7 10 7.9 10 9C10 9.8 10.5 10.5 11.2 10.8C11.2 10.8 10.8 11.8 10.5 13H13.5C13.2 11.8 12.8 10.8 12.8 10.8C13.5 10.5 14 9.8 14 9C14 7.9 13.1 7 12 7Z" fill="#1B4332" />
                  </svg>
                </div>
                <div>
                  <p className="text-xl font-extrabold tracking-[-0.05em]" style={{ color: 'var(--green-8)', fontFamily: 'Space Grotesk, Manrope, sans-serif' }}>
                    JanSeva
                  </p>
                  <p className="text-xs font-bold uppercase tracking-[0.18em]" style={{ color: 'var(--text-soft)' }}>
                    Smarter Social Impact
                  </p>
                </div>
              </div>
              <p className="mb-5 text-sm leading-7" style={{ color: 'var(--text-muted)' }}>
                JanSeva helps NGOs coordinate volunteers, prioritize needs, and deliver measurable community outcomes with clarity.
              </p>
              <div className="flex flex-wrap gap-3">
                {socialLinks.map(({ icon: Icon, href, label }) => (
                  <a
                    key={label}
                    href={href}
                    aria-label={label}
                    className="grid h-10 w-10 place-items-center rounded-2xl transition-all duration-200"
                    style={{ background: 'rgba(216, 243, 220, 0.8)', color: 'var(--green-7)' }}
                  >
                    <Icon size={16} />
                  </a>
                ))}
              </div>
            </div>

            {Object.entries(footerLinks).map(([title, links]) => (
              <div key={title}>
                <h3 className="mb-4 text-sm font-extrabold uppercase tracking-[0.16em]" style={{ color: 'var(--green-7)' }}>
                  {title}
                </h3>
                <ul className="space-y-3">
                  {links.map((link) => (
                    <li key={link.label}>
                      <Link className="text-sm transition-colors" style={{ color: 'var(--text-muted)' }} to={link.path}>
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            <div>
              <h3 className="mb-4 text-sm font-extrabold uppercase tracking-[0.16em]" style={{ color: 'var(--green-7)' }}>
                Contact
              </h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <Mail size={16} className="mt-1 shrink-0" style={{ color: 'var(--green-6)' }} />
                  <span className="text-sm" style={{ color: 'var(--text-muted)' }}>support@janseva.org</span>
                </li>
                <li className="flex items-start gap-3">
                  <Phone size={16} className="mt-1 shrink-0" style={{ color: 'var(--green-6)' }} />
                  <span className="text-sm" style={{ color: 'var(--text-muted)' }}>+91 (0612) 302-8001</span>
                </li>
                <li className="flex items-start gap-3">
                  <MapPin size={16} className="mt-1 shrink-0" style={{ color: 'var(--green-6)' }} />
                  <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    IIT Patna, Bihta
                    <br />
                    Bihar - 801106, India
                  </span>
                </li>
              </ul>
            </div>
          </div>

          <div className="my-8 h-px w-full" style={{ background: 'rgba(45, 106, 79, 0.1)' }} />

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm" style={{ color: 'var(--text-soft)' }}>
              © {new Date().getFullYear()} JanSeva. Built for calm, coordinated community response.
            </p>
            <div className="flex gap-5">
              <a href="#" className="text-sm" style={{ color: 'var(--text-muted)' }}>Privacy Policy</a>
              <a href="#" className="text-sm" style={{ color: 'var(--text-muted)' }}>Terms of Use</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
