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
  { icon: Shield, title: 'Transparency', desc: 'Every resource allocation decision is visible, explainable, and easier for stakeholders to trust.' },
  { icon: Zap, title: 'Rapid Deployment', desc: 'Urgent requests move through a faster, clearer workflow so volunteers can respond without confusion.' },
  { icon: BarChart2, title: 'Data-Led Planning', desc: 'Teams use live insights to understand underserved areas and make smarter operational decisions.' },
  { icon: Users, title: 'Community Empowerment', desc: 'Local citizens, volunteers, and NGO teams collaborate through one connected platform experience.' },
]

export default function About() {
  return (
    <div>
      <section className="page-hero">
        <div className="container">
          <div className="page-hero-grid">
            <div className="page-hero-copy">
              <span className="section-label">Our Story</span>
              <h1 className="page-title">Designed to reduce friction in social impact work</h1>
              <p className="page-subtitle">
                JanSeva started with a simple observation: communities often need help urgently, yet volunteers, NGOs, and resources are spread across disconnected systems. We built a calmer coordination layer to close that gap.
              </p>
              <div className="inline-actions mt-8">
                <Link to="/contact" className="btn-primary">
                  Get Involved
                  <ArrowRight size={16} />
                </Link>
                <Link to="/services" className="btn-outline">
                  Explore Services
                </Link>
              </div>
            </div>

            <div className="page-hero-panel">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="soft-card p-5">
                  <p className="text-xs font-bold uppercase tracking-[0.14em]" style={{ color: 'var(--text-soft)' }}>Coverage growth</p>
                  <p className="mt-3 text-4xl font-extrabold tracking-[-0.04em]" style={{ color: 'var(--green-8)', fontFamily: 'Space Grotesk, Manrope, sans-serif' }}>
                    67%
                  </p>
                  <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>More structured coverage across districts through better NGO coordination.</p>
                </div>
                <div className="glass-card p-5">
                  <p className="text-xs font-bold uppercase tracking-[0.14em]" style={{ color: 'var(--text-soft)' }}>Operating model</p>
                  <div className="mt-4 space-y-3">
                    {['Needs intake', 'Volunteer match', 'Impact reporting'].map((item) => (
                      <div key={item} className="rounded-2xl px-4 py-3" style={{ background: 'rgba(216, 243, 220, 0.42)' }}>
                        <p className="text-sm font-semibold" style={{ color: 'var(--green-8)' }}>{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-4 glass-card p-5">
                <div className="grid gap-4 md:grid-cols-3">
                  {[
                    { label: 'Regions served', value: '50+' },
                    { label: 'Verified partners', value: '200+' },
                    { label: 'Volunteer network', value: '15k+' },
                  ].map((item) => (
                    <div key={item.label}>
                      <p className="text-xs font-bold uppercase tracking-[0.14em]" style={{ color: 'var(--text-soft)' }}>{item.label}</p>
                      <p className="mt-2 text-2xl font-extrabold tracking-[-0.04em]" style={{ color: 'var(--green-8)', fontFamily: 'Space Grotesk, Manrope, sans-serif' }}>
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="cards-grid-2">
            <div className="glass-card p-8">
              <div className="icon-shell mb-5">
                <Target size={24} strokeWidth={1.8} />
              </div>
              <h2 className="text-2xl font-extrabold tracking-[-0.04em]" style={{ color: 'var(--green-8)', fontFamily: 'Space Grotesk, Manrope, sans-serif' }}>
                Our mission
              </h2>
              <p className="mt-4 text-sm leading-7" style={{ color: 'var(--text-muted)' }}>
                Eliminate the gap between community needs and available support by giving NGOs, volunteers, and field workers one intelligent coordination platform.
              </p>
            </div>
            <div className="glass-card p-8" style={{ background: 'linear-gradient(180deg, rgba(216,243,220,0.68), rgba(255,255,255,0.96))' }}>
              <div className="icon-shell purple mb-5">
                <Eye size={24} strokeWidth={1.8} />
              </div>
              <h2 className="text-2xl font-extrabold tracking-[-0.04em]" style={{ color: 'var(--green-8)', fontFamily: 'Space Grotesk, Manrope, sans-serif' }}>
                Our vision
              </h2>
              <p className="mt-4 text-sm leading-7" style={{ color: 'var(--text-muted)' }}>
                Build a future where no urgent local need goes unmet because coordination, visibility, or access to volunteers broke down.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section section-soft">
        <div className="container">
          <div className="section-head">
            <span className="section-label">Core Values</span>
            <h2 className="section-title mt-4">The principles shaping the platform</h2>
          </div>
          <div className="cards-grid-4">
            {values.map((value, index) => (
              <div key={value.title} className="glass-card p-6">
                <div className={`icon-shell mb-5 ${index === 1 ? 'blue' : index === 3 ? 'purple' : ''}`}>
                  <value.icon size={22} strokeWidth={1.8} />
                </div>
                <h3 className="text-lg font-bold" style={{ color: 'var(--green-8)' }}>{value.title}</h3>
                <p className="mt-3 text-sm leading-7" style={{ color: 'var(--text-muted)' }}>{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <span className="section-label">Proof</span>
            <h2 className="section-title mt-4">Measured impact, cleaner presentation</h2>
          </div>
          <div className="stats-grid">
            {impactMetrics.map((metric) => (
              <div key={metric.label} className="glass-card metric-card text-center">
                <div className="metric-value">
                  <AnimatedCounter value={metric.value} suffix={metric.suffix} />
                </div>
                <p className="metric-label">{metric.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-tint">
        <div className="container">
          <div className="section-head">
            <span className="section-label">Team</span>
            <h2 className="section-title mt-4">The people behind JanSeva</h2>
            <p className="section-subtitle mt-4">A cross-functional team focused on operational clarity, not just software features.</p>
          </div>
          <div className="cards-grid-3">
            {teamMembers.map((member) => (
              <TeamCard key={member.name} {...member} />
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="light-panel mx-auto max-w-4xl p-8 text-center md:p-12" style={{ background: 'linear-gradient(135deg, rgba(216,243,220,0.88), rgba(255,255,255,0.96) 58%, rgba(157,78,221,0.08))' }}>
            <span className="section-label">Join Us</span>
            <h2 className="section-title mt-5">If you work in community impact, we built this for you</h2>
            <p className="section-subtitle mx-auto mt-4 max-w-2xl">
              Whether you are an NGO leader, a volunteer coordinator, or an individual looking to help, JanSeva is now presented with a calmer and more professional experience across the site.
            </p>
            <div className="inline-actions mt-8 justify-center">
              <Link to="/services" className="btn-primary">
                Explore Services
                <ArrowRight size={18} />
              </Link>
              <Link to="/contact" className="btn-outline">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
