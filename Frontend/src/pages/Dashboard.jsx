import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { Users, Building2, ClipboardList, CheckCircle, TrendingUp, MapPin, Trophy, Megaphone, Sparkles, RefreshCw, AlertTriangle } from 'lucide-react'

const API = 'http://localhost:5000/api'

export default function Dashboard() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('janseva_user') || 'null')
  const [overview, setOverview] = useState(null)
  const [catData, setCatData] = useState([])
  const [campaigns, setCampaigns] = useState([])
  const [recommendations, setRecs] = useState([])
  const [lastUpdated, setLastUpdated] = useState(new Date())
  const [loading, setLoading] = useState(true)

  const get = async (url) => {
    try {
      const response = await fetch(url)
      if (response.ok) return (await response.json()).data
      return null
    } catch {
      return null
    }
  }

  const loadData = useCallback(async () => {
    const [overviewData, categoryData, campaignData, recommendationData] = await Promise.all([
      get(`${API}/stats/overview`),
      get(`${API}/stats/requests-by-category`),
      get(`${API}/campaigns?status=Active`),
      get(`${API}/recommendations?limit=3`),
    ])

    if (overviewData) setOverview(overviewData)
    if (categoryData) setCatData(categoryData)
    if (campaignData) setCampaigns(campaignData)
    if (recommendationData) setRecs(recommendationData.recommendations || [])

    setLastUpdated(new Date())
    setLoading(false)
  }, [])

  useEffect(() => {
    loadData()
    const interval = setInterval(loadData, 30000)
    return () => clearInterval(interval)
  }, [loadData])

  if (loading) {
    return (
      <section className="section">
        <div className="container">
          <div className="empty-state">
            <div className="mx-auto mb-4 h-10 w-10 rounded-full border-4 animate-spin" style={{ borderColor: 'rgba(82,183,136,0.18)', borderTopColor: 'var(--green-6)' }} />
            <p>Loading dashboard...</p>
          </div>
        </div>
      </section>
    )
  }

  const statCards = overview
    ? [
        { icon: ClipboardList, label: 'Total Requests', value: overview.requests?.total, color: 'var(--green-6)' },
        { icon: CheckCircle, label: 'Resolved', value: overview.requests?.resolved, color: 'var(--green-5)' },
        { icon: AlertTriangle, label: 'High Priority', value: overview.requests?.highPriority, color: 'var(--purple-accent)' },
        { icon: Building2, label: 'Active NGOs', value: overview.ngos?.verified, color: 'var(--green-7)' },
        { icon: Users, label: 'Volunteers', value: overview.volunteers?.total, color: 'var(--blue-accent)' },
        { icon: TrendingUp, label: 'Resolution Rate', value: `${overview.requests?.resolutionRate}%`, color: 'var(--green-8)' },
      ]
    : []

  return (
    <div>
      <section className="page-hero">
        <div className="container">
          <div className="page-hero-grid">
            <div className="page-hero-copy">
              <span className="section-label">Dashboard</span>
              <h1 className="page-title">Welcome back, {user?.name || 'Guest'}</h1>
              <p className="page-subtitle">
                Monitor requests, active NGOs, and recommendations from a cleaner command center designed to feel lighter and easier to navigate.
              </p>
              <div className="inline-actions mt-8">
                <button onClick={loadData} className="btn-primary">
                  <RefreshCw size={16} />
                  Refresh data
                </button>
                <Link to="/statistics" className="btn-outline">
                  View analytics
                </Link>
              </div>
              <p className="mt-4 text-sm" style={{ color: 'var(--text-soft)' }}>
                Last updated at {lastUpdated.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>

            <div className="page-hero-panel">
              <div className="grid gap-4 md:grid-cols-2">
                {statCards.slice(0, 4).map((stat) => (
                  <div key={stat.label} className="glass-card p-5">
                    <div className="flex items-center justify-between">
                      <div className="icon-shell" style={{ color: stat.color }}>
                        <stat.icon size={20} strokeWidth={1.8} />
                      </div>
                      <p className="text-2xl font-extrabold tracking-[-0.04em]" style={{ color: 'var(--green-8)', fontFamily: 'Space Grotesk, Manrope, sans-serif' }}>
                        {stat.value}
                      </p>
                    </div>
                    <p className="mt-3 text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="cards-grid-3">
            {statCards.map((stat) => (
              <div key={stat.label} className="glass-card p-5">
                <div className="flex items-center justify-between">
                  <div className="icon-shell" style={{ color: stat.color }}>
                    <stat.icon size={20} strokeWidth={1.8} />
                  </div>
                  <p className="text-2xl font-extrabold tracking-[-0.04em]" style={{ color: stat.color, fontFamily: 'Space Grotesk, Manrope, sans-serif' }}>
                    {stat.value}
                  </p>
                </div>
                <p className="mt-3 text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="dashboard-grid mt-6">
            <div className="glass-card p-6">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="eyebrow-note">Request Volume</p>
                  <h2 className="mt-2 text-2xl font-extrabold tracking-[-0.04em]" style={{ color: 'var(--green-8)', fontFamily: 'Space Grotesk, Manrope, sans-serif' }}>
                    Requests by category
                  </h2>
                </div>
                <Link to="/statistics" className="text-sm font-semibold" style={{ color: 'var(--green-6)' }}>
                  Open analytics
                </Link>
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={catData}>
                  <XAxis dataKey="category" tick={{ fontSize: 11, fill: '#5F7F72' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#5F7F72' }} />
                  <Tooltip />
                  <Bar dataKey="resolved" fill="#52B788" radius={[6, 6, 0, 0]} name="Resolved" stackId="a" />
                  <Bar dataKey="pending" fill="#9D4EDD" radius={[6, 6, 0, 0]} name="Pending" stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="glass-card p-6">
              <p className="eyebrow-note">Quick Actions</p>
              <h2 className="mt-2 text-2xl font-extrabold tracking-[-0.04em]" style={{ color: 'var(--green-8)', fontFamily: 'Space Grotesk, Manrope, sans-serif' }}>
                Jump into key workflows
              </h2>
              <div className="mt-6 space-y-3">
                {[
                  { to: '/explore', icon: MapPin, label: 'Find NGOs' },
                  { to: '/top-ngos', icon: Trophy, label: 'Top NGO rankings' },
                  { to: '/campaigns', icon: Megaphone, label: 'Active campaigns' },
                  { to: '/recommendations', icon: Sparkles, label: 'Smart recommendations' },
                ].map((item) => (
                  <Link key={item.to} to={item.to} className="glass-card flex items-center gap-3 p-4">
                    <div className="icon-shell blue h-10 w-10 rounded-xl">
                      <item.icon size={18} strokeWidth={1.8} />
                    </div>
                    <span className="text-sm font-semibold" style={{ color: 'var(--green-8)' }}>{item.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="cards-grid-2 mt-6">
            <div className="glass-card overflow-hidden">
              <div className="flex items-center justify-between border-b p-5" style={{ borderColor: 'rgba(45, 106, 79, 0.08)' }}>
                <div>
                  <p className="eyebrow-note">Campaigns</p>
                  <h3 className="mt-2 text-xl font-extrabold tracking-[-0.04em]" style={{ color: 'var(--green-8)', fontFamily: 'Space Grotesk, Manrope, sans-serif' }}>
                    Active social drives
                  </h3>
                </div>
                <Link to="/campaigns" className="text-sm font-semibold" style={{ color: 'var(--green-6)' }}>View all</Link>
              </div>
              <div className="divide-y" style={{ borderColor: 'rgba(45, 106, 79, 0.08)' }}>
                {campaigns.slice(0, 4).map((campaign) => {
                  const progress = Math.min(Math.round(((campaign.raisedAmount || 0) / (campaign.targetAmount || 1)) * 100), 100)
                  return (
                    <div key={campaign._id} className="p-5">
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <p className="text-sm font-bold" style={{ color: 'var(--green-8)' }}>{campaign.title}</p>
                        <span className="tag-chip">{campaign.category}</span>
                      </div>
                      <div className="progress-track">
                        <div className="progress-fill" style={{ width: `${progress}%`, background: 'linear-gradient(90deg, var(--green-6), var(--blue-accent))' }} />
                      </div>
                      <div className="mt-3 flex items-center justify-between text-xs" style={{ color: 'var(--text-muted)' }}>
                        <span>{campaign.ngoSummary?.name}</span>
                        <span>{campaign.volunteers?.length || 0}/{campaign.volunteerTarget} volunteers</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="glass-card overflow-hidden">
              <div className="flex items-center justify-between border-b p-5" style={{ borderColor: 'rgba(45, 106, 79, 0.08)' }}>
                <div>
                  <p className="eyebrow-note">Recommendations</p>
                  <h3 className="mt-2 text-xl font-extrabold tracking-[-0.04em]" style={{ color: 'var(--green-8)', fontFamily: 'Space Grotesk, Manrope, sans-serif' }}>
                    NGOs worth exploring
                  </h3>
                </div>
                <Link to="/recommendations" className="text-sm font-semibold" style={{ color: 'var(--green-6)' }}>See all</Link>
              </div>

              {recommendations.length > 0 ? (
                <div className="divide-y" style={{ borderColor: 'rgba(45, 106, 79, 0.08)' }}>
                  {recommendations.map((ngo) => (
                    <div key={ngo._id} className="flex items-center gap-4 p-5">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl text-sm font-extrabold text-white" style={{ background: 'linear-gradient(135deg, var(--green-6), var(--green-7))' }}>
                        {ngo.name?.charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold" style={{ color: 'var(--green-8)' }}>{ngo.name}</p>
                        <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>{ngo.city}, {ngo.state}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-semibold" style={{ color: 'var(--text-soft)' }}>Match</p>
                        <p className="text-lg font-extrabold tracking-[-0.04em]" style={{ color: 'var(--blue-accent)', fontFamily: 'Space Grotesk, Manrope, sans-serif' }}>
                          {ngo.matchScore}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6">
                  <div className="empty-state">
                    <p>No recommendations yet.</p>
                    <Link to="/recommendations" className="btn-primary mt-4">
                      Generate recommendations
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
