import { useState } from 'react'
import { Mail, Phone, MapPin, Clock, Send, ArrowRight } from 'lucide-react'

const contactInfo = [
  {
    icon: Mail,
    title: 'Email',
    value: 'support@janseva.org',
    sub: 'We reply within 24 hours',
  },
  {
    icon: Phone,
    title: 'Phone',
    value: '+91 (0612) 302-8001',
    sub: 'Mon – Fri, 9 AM – 6 PM IST',
  },
  {
    icon: MapPin,
    title: 'Address',
    value: 'IIT Patna, Bihta',
    sub: 'Bihar — 801106, India',
  },
  {
    icon: Clock,
    title: 'Working Hours',
    value: 'Mon – Fri: 9 AM – 6 PM',
    sub: 'Sat: 10 AM – 2 PM IST',
  },
]

const subjectOptions = [
  'General Inquiry',
  'NGO Onboarding',
  'Volunteer Registration',
  'Technical Support',
  'Partnership Proposal',
  'Media & Press',
  'Other',
]

export default function Contact() {
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '', subject: '', message: '',
  })
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Simulate submission
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 4000)
    setForm({ firstName: '', lastName: '', email: '', phone: '', subject: '', message: '' })
  }

  return (
    <div className="pt-16 md:pt-[68px]">

      {/* ===== PAGE HEADER ===== */}
      <section className="bg-green-800 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-green-300 font-semibold text-sm uppercase tracking-widest mb-3 inline-block">Reach Out</span>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Get in Touch with Us</h1>
          <p className="text-green-200 text-lg max-w-xl mx-auto">
            Have questions about NGO onboarding, volunteer coordination, or technical support? We're here to help — just a message away.
          </p>
        </div>
      </section>

      {/* ===== MAIN CONTACT SECTION ===== */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">

            {/* LEFT — Form */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-8">
                <h2 className="text-xl font-bold text-green-800 mb-1.5">Have Questions? We're Just a Message Away!</h2>
                <p className="text-gray-400 text-sm mb-7">
                  Fill out the form below and our team will get back to you shortly.
                </p>

                {submitted && (
                  <div className="mb-6 bg-green-50 border border-green-200 text-green-700 rounded-xl px-5 py-4 text-sm font-medium">
                    ✓ Message sent! We'll be in touch within 24 hours.
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1.5">First Name</label>
                      <input
                        id="firstName" name="firstName" type="text"
                        placeholder="Arjun"
                        value={form.firstName} onChange={handleChange}
                        className="input-field" required
                      />
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1.5">Last Name</label>
                      <input
                        id="lastName" name="lastName" type="text"
                        placeholder="Verma"
                        value={form.lastName} onChange={handleChange}
                        className="input-field" required
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                    <input
                      id="email" name="email" type="email"
                      placeholder="arjun@ngo.org"
                      value={form.email} onChange={handleChange}
                      className="input-field" required
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
                    <input
                      id="phone" name="phone" type="tel"
                      placeholder="+91 98765 43210"
                      value={form.phone} onChange={handleChange}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1.5">Subject</label>
                    <select
                      id="subject" name="subject"
                      value={form.subject} onChange={handleChange}
                      className="input-field appearance-none" required
                    >
                      <option value="" disabled>Choose message subject</option>
                      {subjectOptions.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1.5">Message</label>
                    <textarea
                      id="message" name="message"
                      rows={5}
                      placeholder="Tell us how we can help your community..."
                      value={form.message} onChange={handleChange}
                      className="input-field resize-none" required
                    />
                  </div>
                  <button type="submit" className="btn-primary w-full py-3.5 text-base justify-center">
                    Send Message <ArrowRight size={18} />
                  </button>
                </form>
              </div>
            </div>

            {/* RIGHT — Info */}
            <div className="lg:col-span-2 flex flex-col gap-5">
              {/* Info cards */}
              {contactInfo.map((info) => (
                <div key={info.title} className="contact-info-card">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <info.icon size={20} className="text-green-600" strokeWidth={1.8} />
                  </div>
                  <div>
                    <p className="font-semibold text-green-800 text-sm">{info.title}</p>
                    <p className="text-gray-700 text-sm">{info.value}</p>
                    <p className="text-gray-400 text-xs">{info.sub}</p>
                  </div>
                </div>
              ))}

              {/* Quick CTA banner */}
              <div className="bg-green-700 rounded-2xl p-6 mt-1 text-white">
                <h3 className="font-bold text-lg mb-2">Our experts will always help you</h3>
                <p className="text-green-200 text-sm mb-4">
                  Reach out for NGO onboarding, volunteer coordination help, or a custom demo of JanSeva.
                </p>
                <div className="flex items-center gap-2 text-green-200 text-sm">
                  <Mail size={14} />
                  <span>support@janseva.org</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== GOOGLE MAP ===== */}
      <section className="py-0 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="text-center mb-8">
            <span className="section-label mb-2 inline-block">Location</span>
            <h2 className="section-title">Find Us at IIT Patna</h2>
          </div>
          <div className="rounded-2xl overflow-hidden shadow-card border border-gray-100" style={{ height: '400px' }}>
            <iframe
              title="IIT Patna Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3597.1975048024773!2d84.85084581501663!3d25.534869383726366!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3992541c6f26fb2b%3A0x7c61fa8e37b5f0f9!2sIndian%20Institute%20of%20Technology%20Patna!5e0!3m2!1sen!2sin!4v1620000000000!5m2!1sen!2sin"
              width="100%"
              height="100%"
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
