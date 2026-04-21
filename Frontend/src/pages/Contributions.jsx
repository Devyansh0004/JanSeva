import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Heart, DollarSign, Clock, Package } from 'lucide-react'

const API = 'http://localhost:5000/api'

export default function Contributions() {
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(true)
  const token = localStorage.getItem('janseva_token')

  useEffect(() => {
    if (!token) {
      navigate('/login')
      return
    }

    Promise.all([
      fetch(`${API}/contributions/my`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
      fetch(`${API}/contributions/leaderboard`).then((r) => r.json()),
    ])
      .then(([myData, leaderboardData]) => {
        setData(myData.data)
        setLeaderboard(leaderboardData.data || [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [token, navigate])

  if (loading) {
    return (
      <section className="section">
        <div className="container">
          <div className="empty-state">
            <div className="mx-auto mb-4 h-10 w-10 rounded-full border-4 animate-spin" style={{ borderColor: 'rgba(82,183,136,0.18)', borderTopColor: 'var(--green-6)' }} />
            <p>Loading contributions...</p>
          </div>
        </div>
      </section>
    )
  }

  const summaryCards = [
    { icon: DollarSign, label: 'Total Donated', value: `Rs. ${(data?.totalMonetary || 0).toLocaleString('en-IN')}`, color: 'var(--green-6)' },
    { icon: Clock, label: 'Hours Volunteered', value: `${data?.totalHours || 0}h`, color: 'var(--blue-accent)' },
    { icon: Heart, label: 'Activities', value: data?.count || 0, color: 'var(--purple-accent)' },
  ]

  return (
    <div>
      <section className="page-hero">
        <div className="container">
          <div className="page-hero-grid">
            <div className="page-hero-copy">
              <span className="section-label">Impact</span>
              <h1 className="page-title">Track your contributions in a cleaner layout</h1>
              <p className="page-subtitle">
                Review donations, volunteered hours, and contribution history with lighter tables and more readable summary cards.
              </p>
            </div>
            <div className="page-hero-panel">
              <div className="grid gap-4 md:grid-cols-3">
                {summaryCards.map((card) => (
                  <div key={card.label} className="glass-card p-5">
                    <div className="icon-shell" style={{ color: card.color }}>
                      <card.icon size={20} strokeWidth={1.8} />
                    </div>
                    <p className="mt-4 text-xs font-bold uppercase tracking-[0.14em]" style={{ color: 'var(--text-soft)' }}>{card.label}</p>
                    <p className="mt-2 text-2xl font-extrabold tracking-[-0.04em]" style={{ color: card.color, fontFamily: 'Space Grotesk, Manrope, sans-serif' }}>{card.value}</p>
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
            <div className="glass-card overflow-hidden">
              <div className="border-b p-5" style={{ borderColor: 'rgba(45, 106, 79, 0.08)' }}>
                <h2 className="text-xl font-extrabold tracking-[-0.04em]" style={{ color: 'var(--green-8)', fontFamily: 'Space Grotesk, Manrope, sans-serif' }}>Contribution history</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>NGO</th>
                      <th>Amount / Hours</th>
                      <th>Note</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.contributions?.length ? (
                      data.contributions.map((contribution) => (
                        <tr key={contribution._id}>
                          <td>{contribution.type}</td>
                          <td>{contribution.ngo?.name || '-'}</td>
                          <td>
                            {contribution.type === 'monetary'
                              ? `Rs. ${contribution.amount?.toLocaleString('en-IN')}`
                              : contribution.type === 'hours'
                                ? `${contribution.hours}h`
                                : 'Supplies'}
                          </td>
                          <td>{contribution.note || '-'}</td>
                          <td>{contribution.date ? new Date(contribution.date).toLocaleDateString('en-IN') : '-'}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center">No contributions yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="glass-card p-6">
              <div className="mb-5 flex items-center gap-3">
                <div className="icon-shell purple">
                  <Heart size={18} strokeWidth={1.8} />
                </div>
                <div>
                  <p className="eyebrow-note">Leaderboard</p>
                  <h2 className="mt-1 text-xl font-extrabold tracking-[-0.04em]" style={{ color: 'var(--green-8)', fontFamily: 'Space Grotesk, Manrope, sans-serif' }}>
                    Top NGOs by donations
                  </h2>
                </div>
              </div>
              <div className="space-y-3">
                {leaderboard.slice(0, 8).map((item, index) => (
                  <div key={item._id} className="glass-card flex items-center gap-4 p-4">
                    <div className={`rank-badge ${index < 3 ? `rank-${index + 1}` : 'rank-n'}`}>{index + 1}</div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold" style={{ color: 'var(--green-8)' }}>{item.ngo?.name}</p>
                      <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>{item.donors} donors</p>
                    </div>
                    <p className="text-sm font-extrabold tracking-[-0.04em]" style={{ color: 'var(--green-6)', fontFamily: 'Space Grotesk, Manrope, sans-serif' }}>
                      Rs. {(item.totalRaised || 0).toLocaleString('en-IN')}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
