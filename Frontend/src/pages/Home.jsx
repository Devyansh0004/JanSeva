import { Link } from 'react-router-dom'
import {
  ArrowRight, Utensils, HeartPulse, BookOpen, Home as HomeIcon,
  Siren, UserPlus, Users, Building2, ClipboardList, Star
} from 'lucide-react'
import AnimatedCounter from '../components/AnimatedCounter'
import TestimonialCard from '../components/TestimonialCard'

const topServices = [
  { icon: Utensils, title: 'Food Distribution', desc: 'Coordinate food relief efforts to underserved communities in real-time.' },
  { icon: HeartPulse, title: 'Medical Assistance', desc: 'Connect patients with healthcare volunteers and medical camps quickly.' },
  { icon: BookOpen, title: 'Education Support', desc: 'Track tutoring and scholarship needs for children in low-income areas.' },
  { icon: HomeIcon, title: 'Shelter Assistance', desc: 'Match displaced families with available shelter resources and NGO support.' },
  { icon: Siren, title: 'Emergency Response', desc: 'Mobilize rapid volunteer teams for disaster relief and crisis situations.' },
  { icon: UserPlus, title: 'Volunteer Registration', desc: 'Onboard, verify, and deploy volunteers based on skill sets and proximity.' },
]

const impactStats = [
  { value: 10000, suffix: '+', label: 'Volunteers Coordinated' },
  { value: 500, suffix: '+', label: 'NGOs Connected' },
  { value: 25000, suffix: '+', label: 'Requests Managed' },
  { value: 100, suffix: '+', label: 'Communities Served' },
]

const testimonials = [
  {
    quote: 'JanSeva transformed how we coordinate our volunteers. Response time dropped by 60% and community trust has never been higher.',
    name: 'Priya Sharma',
    role: 'Program Director',
    org: 'Sewa Foundation',
    initials: 'PS',
    color: 'bg-green-600',
  },
  {
    quote: 'The data-driven dashboards helped us identify high-priority zones we were missing. A game-changer for field operations.',
    name: 'Rajan Mehta',
    role: 'Field Coordinator',
    org: 'Bihar Relief Network',
    initials: 'RM',
    color: 'bg-green-500',
  },
  {
    quote: 'Volunteer allocation used to take hours. JanSeva does it in minutes. Our teams are more effective and motivated than ever.',
    name: 'Anjali Singh',
    role: 'Executive Director',
    org: 'Jan Kalyan Trust',
    initials: 'AS',
    color: 'bg-green-400',
  },
  {
    quote: 'Finally a platform built for NGOs in India. Simple enough for field workers yet powerful enough for managers.',
    name: 'Dr. Suresh Yadav',
    role: 'Chief Impact Officer',
    org: 'Pragati Sansthan',
    initials: 'SY',
    color: 'bg-green-700',
  },
]

// Inline SVG hero illustration
const HeroIllustration = () => (
  <svg viewBox="0 0 480 360" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full max-h-[380px]">
    {/* Background shapes */}
    <rect x="30" y="40" width="420" height="280" rx="20" fill="#B7E4C7" opacity="0.35"/>
    {/* Building 1 */}
    <rect x="60" y="130" width="70" height="150" rx="6" fill="#2D6A4F"/>
    <rect x="70" y="145" width="14" height="14" rx="2" fill="#95D5B2"/>
    <rect x="92" y="145" width="14" height="14" rx="2" fill="#95D5B2"/>
    <rect x="70" y="170" width="14" height="14" rx="2" fill="#95D5B2"/>
    <rect x="92" y="170" width="14" height="14" rx="2" fill="#95D5B2"/>
    <rect x="70" y="195" width="14" height="14" rx="2" fill="#B7E4C7"/>
    <rect x="92" y="195" width="14" height="14" rx="2" fill="#B7E4C7"/>
    <rect x="80" y="240" width="20" height="40" rx="3" fill="#40916C"/>
    {/* Building 2 */}
    <rect x="150" y="100" width="90" height="180" rx="6" fill="#40916C"/>
    <rect x="162" y="118" width="16" height="16" rx="2" fill="#D8F3DC"/>
    <rect x="186" y="118" width="16" height="16" rx="2" fill="#D8F3DC"/>
    <rect x="208" y="118" width="16" height="16" rx="2" fill="#D8F3DC"/>
    <rect x="162" y="145" width="16" height="16" rx="2" fill="#D8F3DC"/>
    <rect x="186" y="145" width="16" height="16" rx="2" fill="#D8F3DC"/>
    <rect x="208" y="145" width="16" height="16" rx="2" fill="#B7E4C7"/>
    <rect x="162" y="172" width="16" height="16" rx="2" fill="#B7E4C7"/>
    <rect x="186" y="172" width="16" height="16" rx="2" fill="#D8F3DC"/>
    <rect x="208" y="172" width="16" height="16" rx="2" fill="#D8F3DC"/>
    <rect x="175" y="240" width="30" height="40" rx="3" fill="#2D6A4F"/>
    {/* Building 3 */}
    <rect x="260" y="120" width="80" height="160" rx="6" fill="#52B788"/>
    <rect x="272" y="138" width="15" height="15" rx="2" fill="#D8F3DC"/>
    <rect x="294" y="138" width="15" height="15" rx="2" fill="#D8F3DC"/>
    <rect x="316" y="138" width="15" height="15" rx="2" fill="#D8F3DC"/>
    <rect x="272" y="162" width="15" height="15" rx="2" fill="#D8F3DC"/>
    <rect x="294" y="162" width="15" height="15" rx="2" fill="#B7E4C7"/>
    <rect x="316" y="162" width="15" height="15" rx="2" fill="#D8F3DC"/>
    <rect x="285" y="240" width="25" height="40" rx="3" fill="#40916C"/>
    {/* Building 4 */}
    <rect x="360" y="150" width="65" height="130" rx="6" fill="#2D6A4F"/>
    <rect x="372" y="166" width="13" height="13" rx="2" fill="#74C69D"/>
    <rect x="392" y="166" width="13" height="13" rx="2" fill="#74C69D"/>
    <rect x="372" y="188" width="13" height="13" rx="2" fill="#74C69D"/>
    <rect x="392" y="188" width="13" height="13" rx="2" fill="#74C69D"/>
    <rect x="374" y="240" width="20" height="40" rx="3" fill="#40916C"/>
    {/* Ground */}
    <rect x="40" y="278" width="400" height="12" rx="4" fill="#D8F3DC"/>
    {/* Connection lines */}
    <line x1="95" y1="130" x2="195" y2="100" stroke="#40916C" strokeWidth="2" strokeDasharray="5,4" opacity="0.6"/>
    <line x1="240" y1="100" x2="300" y2="120" stroke="#40916C" strokeWidth="2" strokeDasharray="5,4" opacity="0.6"/>
    <line x1="340" y1="120" x2="393" y2="150" stroke="#40916C" strokeWidth="2" strokeDasharray="5,4" opacity="0.6"/>
    {/* People icons */}
    <circle cx="95" cy="118" r="10" fill="#1B4332"/>
    <path d="M88 118C88 114.7 91.1 112 95 112C98.9 112 102 114.7 102 118" stroke="#D8F3DC" strokeWidth="2" fill="none"/>
    <circle cx="95" cy="110" r="4" fill="#D8F3DC"/>
    <circle cx="300" cy="108" r="10" fill="#1B4332"/>
    <path d="M293 108C293 104.7 296.1 102 300 102C303.9 102 307 104.7 307 108" stroke="#D8F3DC" strokeWidth="2" fill="none"/>
    <circle cx="300" cy="100" r="4" fill="#D8F3DC"/>
    {/* Floating badges */}
    <rect x="310" y="58" width="110" height="34" rx="8" fill="white" opacity="0.95" style={{filter:'drop-shadow(0 2px 8px rgba(27,67,50,0.15))'}}/>
    <circle cx="327" cy="75" r="7" fill="#52B788"/>
    <rect x="340" y="68" width="70" height="6" rx="3" fill="#2D6A4F"/>
    <rect x="340" y="79" width="50" height="5" rx="2.5" fill="#95D5B2"/>
    <rect x="60" y="58" width="110" height="34" rx="8" fill="white" opacity="0.95" style={{filter:'drop-shadow(0 2px 8px rgba(27,67,50,0.15))'}}/>
    <circle cx="77" cy="75" r="7" fill="#40916C"/>
    <rect x="90" y="68" width="70" height="6" rx="3" fill="#2D6A4F"/>
    <rect x="90" y="79" width="50" height="5" rx="2.5" fill="#95D5B2"/>
  </svg>
)

export default function Home() {
  return (
    <div className="pt-16 md:pt-[68px]">

      {/* ===== HERO ===== */}
      <section className="bg-green-50 min-h-[calc(100vh-68px)] flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            {/* Left */}
            <div className="animate-fade-up">
              <span className="section-label mb-4 inline-block">
                Smart Resource Allocation
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-[3.25rem] font-bold text-green-800 leading-[1.15] mb-6">
                Smart Volunteer Coordination for{' '}
                <span className="text-green-500">Greater Social Impact</span>
              </h1>
              <p className="section-subtitle mb-8 max-w-xl">
                Helping NGOs and local communities organize needs, allocate volunteers efficiently, and create measurable social change through data-driven resource management.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/services" className="btn-primary text-base px-7 py-3.5">
                  Get Started <ArrowRight size={18} />
                </Link>
                <Link to="/about" className="btn-secondary text-base px-7 py-3.5">
                  Learn More
                </Link>
              </div>
              {/* Mini trust bar */}
              <div className="flex items-center gap-6 mt-10 pt-8 border-t border-green-200">
                <div className="flex -space-x-2">
                  {['bg-green-600','bg-green-500','bg-green-700','bg-green-400'].map((c, i) => (
                    <div key={i} className={`w-8 h-8 rounded-full border-2 border-white ${c} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                      {['R','A','P','S'][i]}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1 mb-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={13} className="text-green-500 fill-green-400" />
                    ))}
                  </div>
                  <p className="text-gray-500 text-xs">Trusted by <span className="font-semibold text-green-700">500+ NGOs</span> across India</p>
                </div>
              </div>
            </div>

            {/* Right — Illustration */}
            <div className="hidden lg:flex justify-center items-center">
              <div className="w-full max-w-[500px] bg-white rounded-2xl shadow-card p-6 border border-green-100">
                <HeroIllustration />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== TOP REQUESTED SERVICES ===== */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="section-label mb-3 inline-block">What We Offer</span>
            <h2 className="section-title mb-4">Top Requested Services</h2>
            <p className="section-subtitle max-w-2xl mx-auto">
              From food distribution to emergency response, JanSeva coordinates the services communities need most — efficiently and transparently.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {topServices.map((service) => (
              <div
                key={service.title}
                className="card p-6 flex flex-col items-start gap-4 group border border-gray-100 hover:border-green-200 cursor-pointer"
              >
                <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center group-hover:bg-green-100 transition-colors duration-300 flex-shrink-0">
                  <service.icon size={24} className="text-green-600" strokeWidth={1.8} />
                </div>
                <div>
                  <h3 className="font-semibold text-green-800 text-base mb-1.5 group-hover:text-green-600 transition-colors duration-200">
                    {service.title}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{service.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link to="/services" className="btn-secondary inline-flex">
              View All Services <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ===== IMPACT STATS ===== */}
      <section className="py-20 bg-green-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-green-300 font-semibold text-sm uppercase tracking-widest mb-3 inline-block">Our Reach</span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Impact at Scale</h2>
            <p className="text-green-200 text-lg max-w-xl mx-auto">
              Numbers that reflect real lives changed through organized community action.
            </p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {impactStats.map((stat) => (
              <div
                key={stat.label}
                className="bg-green-600 rounded-xl p-6 text-center border border-green-500 hover:border-green-300 hover:bg-green-500 transition-all duration-300"
              >
                <div className="text-4xl font-bold text-white mb-2">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </div>
                <p className="text-green-200 text-sm font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="py-20 bg-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="section-label mb-3 inline-block">Process</span>
            <h2 className="section-title mb-4">How JanSeva Works</h2>
            <p className="section-subtitle max-w-xl mx-auto">
              A simple, transparent process that connects communities with the right help at the right time.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-10 left-[calc(33%+24px)] right-[calc(33%+24px)] h-0.5 bg-green-200" />
            {[
              { step: '01', icon: ClipboardList, title: 'Report Community Needs', desc: 'Field workers and citizens submit need reports via digital forms or SMS — organized automatically by JanSeva.' },
              { step: '02', icon: Users, title: 'Smart Volunteer Matching', desc: 'Our algorithm identifies the best-fit volunteers based on skills, location, and availability in real time.' },
              { step: '03', icon: Building2, title: 'NGO Coordination & Tracking', desc: 'NGO managers monitor service delivery, track fulfillment rates, and generate impact reports from a central dashboard.' },
            ].map((item) => (
              <div key={item.step} className="flex flex-col items-center text-center gap-4 relative">
                <div className="w-20 h-20 bg-white rounded-2xl border border-green-200 flex items-center justify-center shadow-card relative z-10">
                  <item.icon size={30} className="text-green-600" strokeWidth={1.6} />
                </div>
                <span className="text-green-400 font-bold text-xs tracking-widest">{item.step}</span>
                <h3 className="font-semibold text-green-800 text-base">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed max-w-xs">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="section-label mb-3 inline-block">Community Trust</span>
            <h2 className="section-title mb-4">Voices from the Field</h2>
            <p className="section-subtitle max-w-xl mx-auto">
              Real feedback from the NGOs, coordinators, and volunteers who rely on JanSeva every day.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {testimonials.map((t) => (
              <TestimonialCard key={t.name} {...t} />
            ))}
          </div>
        </div>
      </section>

      {/* ===== HOME CTA ===== */}
      <section className="py-20 bg-green-700">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Amplify Your Social Impact?
          </h2>
          <p className="text-green-200 text-lg mb-8">
            Join hundreds of NGOs and thousands of volunteers who are making communities stronger — smarter.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/services" className="btn-primary bg-white text-green-700 hover:bg-green-50 shadow-none px-7 py-3.5">
              Get Started <ArrowRight size={18} />
            </Link>
            <Link to="/contact" className="btn-outline-white px-7 py-3.5">
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
