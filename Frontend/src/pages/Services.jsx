import { Link } from 'react-router-dom'
import {
  UserPlus, Building2, ClipboardList, Siren, Package, FileSearch,
  BarChart2, Cpu, ArrowRight, CheckCircle2
} from 'lucide-react'

const services = [
  {
    icon: UserPlus,
    title: 'Volunteer Registration',
    desc: 'Streamlined onboarding for volunteers — capture skills, availability, and location. Verify identity and deploy rapidly when needs arise.',
    features: ['Skill-based profiling', 'ID verification', 'Geo-tagging', 'Automated assignment'],
  },
  {
    icon: Building2,
    title: 'NGO Collaboration',
    desc: 'Connect your NGO with a verified network of partner organizations. Coordinate joint initiatives and share resources across districts.',
    features: ['Partner discovery', 'Resource sharing', 'Joint campaigns', 'Unified reporting'],
  },
  {
    icon: ClipboardList,
    title: 'Need Reporting',
    desc: 'Enable citizens and field workers to submit structured community need reports via mobile or web — organized instantly by category and urgency.',
    features: ['Multi-channel intake', 'Auto-categorization', 'Priority scoring', 'Real-time feed'],
  },
  {
    icon: Siren,
    title: 'Emergency Coordination',
    desc: 'Trigger rapid-response protocols the moment a crisis is detected. Automatically mobilize the nearest available volunteers and NGO units.',
    features: ['One-click alerts', 'Rapid mobilization', 'Status tracking', 'Post-event reports'],
  },
  {
    icon: Package,
    title: 'Resource Tracking',
    desc: 'Monitor the flow of food, medicine, and materials from donation to delivery. Ensure full accountability at every stage of distribution.',
    features: ['Inventory management', 'Donation ledger', 'Delivery tracking', 'Audit trail'],
  },
  {
    icon: FileSearch,
    title: 'Field Survey Management',
    desc: 'Design, deploy, and analyze field surveys to capture ground-level community data. Turn raw responses into actionable intelligence within hours.',
    features: ['Custom survey builder', 'Offline support', 'Auto-analysis', 'Export to CSV/PDF'],
  },
  {
    icon: BarChart2,
    title: 'Community Analytics',
    desc: 'Visualize service coverage, identify underserved zones, and track progress against social impact goals — all in one clean dashboard.',
    features: ['Interactive dashboards', 'Zone heatmaps', 'Trend analysis', 'KPI monitoring'],
  },
  {
    icon: Cpu,
    title: 'Smart Allocation Engine',
    desc: 'Our AI-assisted engine matches volunteer skills and capacity to the highest-priority community needs in real time, maximizing efficiency.',
    features: ['AI matching', 'Priority scoring', 'Capacity planning', 'Impact forecasting'],
  },
]

export default function Services() {
  return (
    <div className="pt-16 md:pt-[68px]">

      {/* ===== PAGE HEADER ===== */}
      <section className="bg-green-800 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="text-green-300 font-semibold text-sm uppercase tracking-widest mb-3 inline-block">What We Offer</span>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Our Services</h1>
          <p className="text-green-200 text-lg max-w-2xl">
            A comprehensive set of tools designed for every stakeholder in the social impact ecosystem — from field volunteers to NGO directors.
          </p>
        </div>
      </section>

      {/* ===== SERVICES GRID ===== */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-5">
            {services.map((service) => (
              <div
                key={service.title}
                className="card p-7 border border-gray-100 hover:border-green-200 group"
              >
                <div className="flex items-start gap-5">
                  <div className="w-13 h-13 w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-green-100 transition-colors duration-300">
                    <service.icon size={24} className="text-green-600" strokeWidth={1.8} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="font-semibold text-green-800 text-lg mb-2 group-hover:text-green-600 transition-colors duration-200">
                      {service.title}
                    </h2>
                    <p className="text-gray-500 text-sm leading-relaxed mb-4">{service.desc}</p>
                    <div className="flex flex-wrap gap-2">
                      {service.features.map((f) => (
                        <span
                          key={f}
                          className="inline-flex items-center gap-1 text-xs bg-green-50 text-green-700 border border-green-100 px-2.5 py-1 rounded-md font-medium"
                        >
                          <CheckCircle2 size={11} />
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* How to access callout */}
          <div className="mt-10 bg-green-50 rounded-2xl p-8 border border-green-100 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="font-bold text-green-800 text-xl mb-2">Need a Custom Solution?</h3>
              <p className="text-gray-500 text-sm max-w-lg">
                Our team works closely with NGOs to tailor the JanSeva platform for your specific operational needs — from district-level deployments to multi-state rollouts.
              </p>
            </div>
            <Link to="/contact" className="btn-primary flex-shrink-0 px-7 py-3.5">
              Talk to Us <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ===== HOW TO GET STARTED ===== */}
      <section className="py-16 bg-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="section-label mb-3 inline-block">Getting Started</span>
          <h2 className="section-title mb-12">Three Steps to Onboard</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Register Your Organisation', desc: 'Create a verified NGO or volunteer account in minutes. No complex paperwork.' },
              { step: '2', title: 'Configure Your Services', desc: 'Select the modules your team needs and customize them to your workflow.' },
              { step: '3', title: 'Go Live & Make Impact', desc: 'Start receiving need reports, assigning volunteers, and measuring outcomes — instantly.' },
            ].map((item) => (
              <div key={item.step} className="card p-7 border border-gray-100 text-left">
                <div className="w-10 h-10 bg-green-600 text-white font-bold text-lg rounded-xl flex items-center justify-center mb-4">
                  {item.step}
                </div>
                <h3 className="font-semibold text-green-800 mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="py-16 bg-green-700">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Start Coordinating Smarter Today
          </h2>
          <p className="text-green-200 text-lg mb-8">
            Join the growing network of communities using data to drive real social change.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/contact" className="btn-primary bg-white text-green-700 hover:bg-green-50 shadow-none px-7 py-3.5">
              Get Started Free <ArrowRight size={18} />
            </Link>
            <Link to="/statistics" className="btn-outline-white px-7 py-3.5">
              View Impact Data
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
