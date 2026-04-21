import { useState } from 'react'
import { Mail, Phone, MapPin, Clock, ArrowRight } from 'lucide-react'

const contactInfo = [
  { icon: Mail, title: 'Email', value: 'support@janseva.org', sub: 'We reply within 24 hours' },
  { icon: Phone, title: 'Phone', value: '+91 (0612) 302-8001', sub: 'Mon - Fri, 9 AM - 6 PM IST' },
  { icon: MapPin, title: 'Address', value: 'IIT Patna, Bihta', sub: 'Bihar - 801106, India' },
  { icon: Clock, title: 'Working Hours', value: 'Mon - Fri: 9 AM - 6 PM', sub: 'Sat: 10 AM - 2 PM IST' },
]

const subjectOptions = ['General Inquiry', 'NGO Onboarding', 'Volunteer Registration', 'Technical Support', 'Partnership Proposal', 'Media & Press', 'Other']

export default function Contact() {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', subject: '', message: '' })
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 4000)
    setForm({ firstName: '', lastName: '', email: '', phone: '', subject: '', message: '' })
  }

  return (
    <div>
      <section className="page-hero">
        <div className="container">
          <div className="page-hero-grid">
            <div className="page-hero-copy">
              <span className="section-label">Reach Out</span>
              <h1 className="page-title">Contact us without fighting the layout</h1>
              <p className="page-subtitle">
                The contact experience is now lighter, more balanced, and easier to scan whether someone is reaching out for support, onboarding, or partnership discussions.
              </p>
            </div>
            <div className="page-hero-panel">
              <div className="grid gap-4 md:grid-cols-2">
                {contactInfo.slice(0, 4).map((info, index) => (
                  <div key={info.title} className="glass-card p-5">
                    <div className={`icon-shell mb-4 ${index === 1 ? 'blue' : index === 3 ? 'purple' : ''}`}>
                      <info.icon size={20} strokeWidth={1.8} />
                    </div>
                    <p className="text-sm font-bold" style={{ color: 'var(--green-8)' }}>{info.title}</p>
                    <p className="mt-2 text-sm" style={{ color: 'var(--text-mid)' }}>{info.value}</p>
                    <p className="mt-1 text-xs" style={{ color: 'var(--text-soft)' }}>{info.sub}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="content-grid">
            <div className="glass-card p-8">
              <h2 className="text-2xl font-extrabold tracking-[-0.04em]" style={{ color: 'var(--green-8)', fontFamily: 'Space Grotesk, Manrope, sans-serif' }}>
                Send us a message
              </h2>
              <p className="mt-3 text-sm" style={{ color: 'var(--text-muted)' }}>
                Questions about NGO onboarding, volunteer coordination, or technical support are all routed here.
              </p>

              {submitted && (
                <div className="mt-6 rounded-2xl px-5 py-4 text-sm font-semibold" style={{ background: '#D8F3DC', border: '1px solid #B7E4C7', color: '#2D6A4F' }}>
                  Message sent. Our team will get back to you shortly.
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="firstName" className="mb-2 block text-sm font-semibold" style={{ color: 'var(--green-8)' }}>First Name</label>
                    <input id="firstName" name="firstName" type="text" value={form.firstName} onChange={handleChange} className="input-field" placeholder="Arjun" required />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="mb-2 block text-sm font-semibold" style={{ color: 'var(--green-8)' }}>Last Name</label>
                    <input id="lastName" name="lastName" type="text" value={form.lastName} onChange={handleChange} className="input-field" placeholder="Verma" required />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="email" className="mb-2 block text-sm font-semibold" style={{ color: 'var(--green-8)' }}>Email</label>
                    <input id="email" name="email" type="email" value={form.email} onChange={handleChange} className="input-field" placeholder="arjun@ngo.org" required />
                  </div>
                  <div>
                    <label htmlFor="phone" className="mb-2 block text-sm font-semibold" style={{ color: 'var(--green-8)' }}>Phone Number</label>
                    <input id="phone" name="phone" type="tel" value={form.phone} onChange={handleChange} className="input-field" placeholder="+91 98765 43210" />
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="mb-2 block text-sm font-semibold" style={{ color: 'var(--green-8)' }}>Subject</label>
                  <select id="subject" name="subject" value={form.subject} onChange={handleChange} className="select-field" required>
                    <option value="" disabled>Choose message subject</option>
                    {subjectOptions.map((subject) => (
                      <option key={subject} value={subject}>{subject}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="mb-2 block text-sm font-semibold" style={{ color: 'var(--green-8)' }}>Message</label>
                  <textarea id="message" name="message" value={form.message} onChange={handleChange} className="input-field" rows={6} placeholder="Tell us how we can help your team or community..." required />
                </div>

                <button type="submit" className="btn-primary w-full">
                  Send Message
                  <ArrowRight size={18} />
                </button>
              </form>
            </div>

            <div className="space-y-4">
              {contactInfo.map((info, index) => (
                <div key={info.title} className="contact-info-card">
                  <div className={`icon-shell ${index === 1 ? 'blue' : index === 3 ? 'purple' : ''}`}>
                    <info.icon size={20} strokeWidth={1.8} />
                  </div>
                  <div>
                    <p className="text-sm font-bold" style={{ color: 'var(--green-8)' }}>{info.title}</p>
                    <p className="mt-1 text-sm" style={{ color: 'var(--text-mid)' }}>{info.value}</p>
                    <p className="mt-1 text-xs" style={{ color: 'var(--text-soft)' }}>{info.sub}</p>
                  </div>
                </div>
              ))}

              <div className="glass-card p-6" style={{ background: 'linear-gradient(135deg, rgba(216,243,220,0.82), rgba(255,255,255,0.96) 70%, rgba(76,201,240,0.12))' }}>
                <p className="eyebrow-note">Support</p>
                <h3 className="mt-3 text-xl font-extrabold tracking-[-0.04em]" style={{ color: 'var(--green-8)', fontFamily: 'Space Grotesk, Manrope, sans-serif' }}>
                  Fast help for NGOs and volunteers
                </h3>
                <p className="mt-3 text-sm leading-7" style={{ color: 'var(--text-muted)' }}>
                  Reach out for onboarding help, a tailored walkthrough, or technical questions about the platform.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section section-soft">
        <div className="container">
          <div className="section-head">
            <span className="section-label">Location</span>
            <h2 className="section-title mt-4">Find us at IIT Patna</h2>
          </div>
          <div className="glass-card overflow-hidden" style={{ minHeight: '420px' }}>
            <iframe
              title="IIT Patna Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3597.1975048024773!2d84.85084581501663!3d25.534869383726366!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3992541c6f26fb2b%3A0x7c61fa8e37b5f0f9!2sIndian%20Institute%20of%20Technology%20Patna!5e0!3m2!1sen!2sin!4v1620000000000!5m2!1sen!2sin"
              width="100%"
              height="420"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>
    </div>
  )
}
