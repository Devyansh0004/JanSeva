import { Link } from 'react-router-dom'
import { UserPlus, Building2, ClipboardList, Siren, Package, FileSearch, BarChart2, Cpu, ArrowRight, CheckCircle2 } from 'lucide-react'

const services = [
  { icon: UserPlus, title: 'Volunteer Registration', desc: 'Capture skills, availability, and location in one structured onboarding flow.', features: ['Skill-based profiling', 'ID verification', 'Geo-tagging', 'Automated assignment'] },
  { icon: Building2, title: 'NGO Collaboration', desc: 'Connect verified partner organizations and streamline how joint initiatives are managed.', features: ['Partner discovery', 'Resource sharing', 'Joint campaigns', 'Unified reporting'] },
  { icon: ClipboardList, title: 'Need Reporting', desc: 'Collect structured community reports and route them into a consistent response workflow.', features: ['Multi-channel intake', 'Auto-categorization', 'Priority scoring', 'Real-time feed'] },
  { icon: Siren, title: 'Emergency Coordination', desc: 'Activate rapid-response coordination for high-priority situations with clear status tracking.', features: ['One-click alerts', 'Rapid mobilization', 'Status tracking', 'Post-event reports'] },
  { icon: Package, title: 'Resource Tracking', desc: 'Monitor donation and delivery flows with cleaner accountability across the entire pipeline.', features: ['Inventory management', 'Donation ledger', 'Delivery tracking', 'Audit trail'] },
  { icon: FileSearch, title: 'Field Survey Management', desc: 'Design and analyze surveys that surface local needs without adding reporting chaos.', features: ['Custom survey builder', 'Offline support', 'Auto-analysis', 'Export to CSV/PDF'] },
  { icon: BarChart2, title: 'Community Analytics', desc: 'Understand service coverage, trends, and underserved zones in a more readable interface.', features: ['Interactive dashboards', 'Zone heatmaps', 'Trend analysis', 'KPI monitoring'] },
  { icon: Cpu, title: 'Smart Allocation Engine', desc: 'Use skill and priority signals to guide better volunteer-to-need matching across regions.', features: ['AI matching', 'Priority scoring', 'Capacity planning', 'Impact forecasting'] },
]

export default function Services() {
  return (
    <div>
      <section className="page-hero">
        <div className="container">
          <div className="page-hero-grid">
            <div className="page-hero-copy">
              <span className="section-label">Services</span>
              <h1 className="page-title">A full NGO operations toolkit with cleaner structure</h1>
              <p className="page-subtitle">
                JanSeva brings volunteer workflows, reporting, analytics, and emergency coordination into one modern, light-themed platform.
              </p>
            </div>
            <div className="page-hero-panel">
              <div className="grid gap-4 md:grid-cols-2">
                {[
                  { label: 'Modules', value: '8+' },
                  { label: 'Use cases', value: 'Multi-team' },
                  { label: 'Setup flow', value: '3 steps' },
                  { label: 'Readability', value: 'Improved' },
                ].map((item) => (
                  <div key={item.label} className="glass-card p-5">
                    <p className="text-xs font-bold uppercase tracking-[0.14em]" style={{ color: 'var(--text-soft)' }}>{item.label}</p>
                    <p className="mt-3 text-2xl font-extrabold tracking-[-0.04em]" style={{ color: 'var(--green-8)', fontFamily: 'Space Grotesk, Manrope, sans-serif' }}>{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="cards-grid-2">
            {services.map((service) => (
              <div key={service.title} className="glass-card p-6">
                <div className="flex flex-col gap-5 md:flex-row md:items-start">
                  <div className="icon-shell">
                    <service.icon size={22} strokeWidth={1.8} />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold" style={{ color: 'var(--green-8)' }}>{service.title}</h2>
                    <p className="mt-3 text-sm leading-7" style={{ color: 'var(--text-muted)' }}>{service.desc}</p>
                    <div className="mt-5 flex flex-wrap gap-2">
                      {service.features.map((feature) => (
                        <span key={feature} className="tag-chip">
                          <CheckCircle2 size={12} />
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-soft">
        <div className="container">
          <div className="glass-card p-8 md:p-10">
            <div className="content-grid">
              <div>
                <span className="section-label">Getting Started</span>
                <h2 className="section-title mt-5">Three steps to onboard your organization</h2>
                <p className="section-subtitle mt-4">
                  The refactor makes this flow easier to understand visually, while keeping the product’s core capabilities unchanged.
                </p>
              </div>
              <div className="space-y-4">
                {[
                  { step: '01', title: 'Register your organization', desc: 'Create a verified account and set up your team profile.' },
                  { step: '02', title: 'Configure your workflows', desc: 'Enable the modules you need for operations, intake, and coordination.' },
                  { step: '03', title: 'Launch and monitor impact', desc: 'Start receiving reports, matching volunteers, and tracking results.' },
                ].map((item) => (
                  <div key={item.step} className="glass-card p-5">
                    <div className="mb-3 flex items-center gap-3">
                      <div className="icon-shell blue h-10 w-10 rounded-xl">
                        <span className="text-sm font-extrabold">{item.step}</span>
                      </div>
                      <h3 className="text-lg font-bold" style={{ color: 'var(--green-8)' }}>{item.title}</h3>
                    </div>
                    <p className="text-sm leading-7" style={{ color: 'var(--text-muted)' }}>{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="light-panel mx-auto max-w-4xl p-8 text-center md:p-12" style={{ background: 'linear-gradient(135deg, rgba(216,243,220,0.88), rgba(255,255,255,0.96) 58%, rgba(76,201,240,0.12))' }}>
            <span className="section-label">Custom Setup</span>
            <h2 className="section-title mt-5">Need a configuration tailored to your NGO?</h2>
            <p className="section-subtitle mx-auto mt-4 max-w-2xl">
              We can help map JanSeva to your operational model while preserving the same clean experience across staff, volunteers, and leadership teams.
            </p>
            <div className="inline-actions mt-8 justify-center">
              <Link to="/contact" className="btn-primary">
                Talk to Us
                <ArrowRight size={16} />
              </Link>
              <Link to="/statistics" className="btn-outline">
                View Impact Data
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
