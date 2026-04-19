import { Link } from 'react-router-dom'
import { ArrowRight, Target, Eye, Shield, Zap, BarChart2, Users } from 'lucide-react'
import AnimatedCounter from '../components/AnimatedCounter'
import TeamCard from '../components/TeamCard'

const impactMetrics = [
  { value: 200, suffix: '+', label: 'Partner Organizations' },
  { value: 98, suffix: '%', label: 'Resource Optimization' },
  { value: 50, suffix: '+', label: 'Districts Covered' },
  { value: 15000, suffix: '+', label: 'Active Volunteers' },
]

const teamMembers = [
  { name: 'Arjun Verma', role: 'Founder & CEO', initials: 'AV', gradient: 'bg-green-700' },
  { name: 'Neha Gupta', role: 'Chief Technology Officer', initials: 'NG', gradient: 'bg-green-600' },
  { name: 'Rahul Mishra', role: 'Head of Operations', initials: 'RM', gradient: 'bg-green-500' },
  { name: 'Priya Sharma', role: 'Product Designer', initials: 'PS', gradient: 'bg-green-600' },
  { name: 'Vikram Singh', role: 'Data Scientist', initials: 'VS', gradient: 'bg-green-700' },
  { name: 'Anjali Patel', role: 'Community Manager', initials: 'AP', gradient: 'bg-green-500' },
]

const values = [
  {
    icon: Shield, title: 'Transparency',
    desc: 'Every resource allocation decision is logged and auditable — building community trust through openness.'
  },
  {
    icon: Zap, title: 'Rapid Deployment',
    desc: 'Volunteers are matched and dispatched in under 15 minutes, ensuring timely response to urgent needs.'
  },
  {
    icon: BarChart2, title: 'Data-Driven Decisions',
    desc: 'Field data flows into real-time dashboards that help NGO managers allocate resources where they matter most.'
  },
  {
    icon: Users, title: 'Community Empowerment',
    desc: 'Local citizens are active participants — reporting needs, volunteering, and shaping how resources are used.'
  },
]

// About hero SVG
const AboutIllustration = () => (
  <svg viewBox="0 0 400 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
    {/* Curved background */}
    <rect width="400" height="220" rx="16" fill="#1B4332"/>
    {/* Grid overlay */}
    {[0,1,2,3,4,5,6,7,8].map(i => (
      <line key={`h${i}`} x1="0" y1={i*28} x2="400" y2={i*28} stroke="#2D6A4F" strokeWidth="0.5"/>
    ))}
    {[0,1,2,3,4,5,6,7,8,9,10].map(i => (
      <line key={`v${i}`} x1={i*45} y1="0" x2={i*45} y2="220" stroke="#2D6A4F" strokeWidth="0.5"/>
    ))}
    {/* Pie chart circle */}
    <circle cx="80" cy="110" r="55" fill="none" stroke="#40916C" strokeWidth="12"/>
    <circle cx="80" cy="110" r="55" fill="none" stroke="#52B788" strokeWidth="12" strokeDasharray="138 207" strokeDashoffset="0" strokeLinecap="round"/>
    <circle cx="80" cy="110" r="55" fill="none" stroke="#95D5B2" strokeWidth="12" strokeDasharray="70 275" strokeDashoffset="-138" strokeLinecap="round"/>
    <circle cx="80" cy="110" r="38" fill="#1B4332"/>
    <text x="80" y="106" textAnchor="middle" fill="white" fontSize="13" fontWeight="bold">67%</text>
    <text x="80" y="120" textAnchor="middle" fill="#74C69D" fontSize="8">Resolved</text>
    {/* Bar chart */}
    {[80,120,60,150,100,130].map((h, i) => (
      <rect key={i} x={160 + i*35} y={185-h} width="22" height={h} rx="4"
        fill={i%2===0 ? '#40916C' : '#74C69D'} opacity="0.9"/>
    ))}
    <text x="280" y="200" textAnchor="middle" fill="#74C69D" fontSize="9">Monthly Requests</text>
    {/* Floating card */}
    <rect x="290" y="30" width="95" height="52" rx="8" fill="white" opacity="0.96"/>
    <circle cx="308" cy="50" r="9" fill="#52B788"/>
    <text x="308" y="54" textAnchor="middle" fill="white" fontSize="9" fontWeight="bold">✓</text>
    <rect x="322" y="44" width="52" height="6" rx="3" fill="#1B4332"/>
    <rect x="322" y="55" width="38" height="5" rx="2.5" fill="#95D5B2"/>
    <text x="308" y="74" textAnchor="middle" fill="#74C69D" fontSize="8">15,000+ Volunteers</text>
    {/* Title overlay */}
    <text x="200" y="25" textAnchor="middle" fill="white" fontSize="22" fontWeight="bold" letterSpacing="2">ABOUT JANSEVA</text>
    <rect x="130" y="30" width="140" height="2" rx="1" fill="#52B788"/>
  </svg>
)

export default function About() {
  return (
    <div className="pt-16 md:pt-[68px]">

      {/* ===== ABOUT BANNER ===== */}
      <section className="bg-green-800 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-green-300 font-semibold text-sm uppercase tracking-widest mb-4 inline-block">Our Story</span>
              <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-5">
                About JanSeva
              </h1>
              <p className="text-green-200 text-lg leading-relaxed mb-6">
                JanSeva was born from the frustration of seeing communities in need while volunteers and resources remained uncoordinated. We set out to build the infrastructure that connects those who need help with those who can provide it.
              </p>
              <Link to="/contact" className="btn-primary bg-white text-green-700 hover:bg-green-50">
                Get Involved <ArrowRight size={16} />
              </Link>
            </div>
            <div className="rounded-2xl overflow-hidden border border-green-700 shadow-card">
              <AboutIllustration />
            </div>
          </div>
        </div>
      </section>

      {/* ===== MISSION & VISION ===== */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            <div className="bg-green-50 rounded-2xl p-8 border border-green-100">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-5">
                <Target size={24} className="text-green-600" strokeWidth={1.8} />
              </div>
              <h2 className="text-2xl font-bold text-green-800 mb-4">Our Mission</h2>
              <p className="text-gray-600 leading-relaxed">
                To eliminate the gap between community needs and available social resources by providing NGOs, volunteers, and field workers with a single, intelligent coordination platform — making every rupee of aid more effective and every hour of volunteer time more impactful.
              </p>
            </div>
            <div className="bg-green-700 rounded-2xl p-8 border border-green-600">
              <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center mb-5">
                <Eye size={24} className="text-green-100" strokeWidth={1.8} />
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">Our Vision</h2>
              <p className="text-green-100 leading-relaxed">
                A future where no community need goes unmet due to lack of coordination. We envision a network of empowered NGOs and active volunteers covering every district of India — guided by transparent, real-time data from the ground up.
              </p>
            </div>
          </div>

          {/* Values */}
          <div className="text-center mb-12">
            <span className="section-label mb-3 inline-block">What Drives Us</span>
            <h2 className="section-title mb-4">Our Core Values</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {values.map((v) => (
              <div key={v.title} className="card p-6 border border-gray-100 hover:border-green-200">
                <div className="w-11 h-11 bg-green-50 rounded-xl flex items-center justify-center mb-4">
                  <v.icon size={22} className="text-green-600" strokeWidth={1.8} />
                </div>
                <h3 className="font-semibold text-green-800 mb-2">{v.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== IMPACT METRICS ===== */}
      <section className="py-20 bg-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="section-label mb-3 inline-block">Proven Results</span>
            <h2 className="section-title mb-4">Impact Metrics</h2>
            <p className="section-subtitle max-w-xl mx-auto">
              Measured outcomes that demonstrate the real difference JanSeva is making across communities.
            </p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {impactMetrics.map((m) => (
              <div key={m.label} className="card p-7 text-center border border-gray-100 hover:border-green-200">
                <div className="text-4xl font-bold text-green-600 mb-2">
                  <AnimatedCounter value={m.value} suffix={m.suffix} />
                </div>
                <p className="text-green-800 font-medium text-sm">{m.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== OUR TEAM ===== */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="section-label mb-3 inline-block">Our Team</span>
            <h2 className="section-title mb-4">The People Behind JanSeva</h2>
            <p className="section-subtitle max-w-xl mx-auto">
              A dedicated team of technologists, social workers, and community builders committed to civic impact.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {teamMembers.map((member) => (
              <TeamCard key={member.name} {...member} />
            ))}
          </div>
        </div>
      </section>

      {/* ===== ABOUT CTA ===== */}
      <section className="py-20 bg-green-700">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Create Social Impact?
          </h2>
          <p className="text-green-200 text-lg mb-8">
            Whether you're an NGO looking to scale operations or an individual who wants to volunteer, JanSeva is built for you.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/services" className="btn-primary bg-white text-green-700 hover:bg-green-50 shadow-none px-7 py-3.5">
              Explore Services <ArrowRight size={18} />
            </Link>
            <Link to="/contact" className="btn-outline-white px-7 py-3.5">
              Get in Touch
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
