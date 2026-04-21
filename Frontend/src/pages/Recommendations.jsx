import { useState, useEffect } from 'react'
import { Sparkles, MapPin, Users, Award, Filter } from 'lucide-react'

const API = 'http://localhost:5000/api'
const SKILLS = ['First Aid', 'Cooking', 'Driving', 'Teaching', 'Medical', 'Counselling', 'Construction', 'IT Support', 'Logistics', 'Translation']
const STATES = ['', 'Maharashtra', 'Delhi', 'Bihar', 'Uttar Pradesh', 'Gujarat', 'Karnataka', 'Tamil Nadu', 'Rajasthan', 'West Bengal', 'Telangana', 'Kerala', 'Punjab']

export default function Recommendations() {
  const [recommendations, setRecs] = useState([])
  const [meta, setMeta] = useState(null)
  const [loading, setLoading] = useState(true)
  const [state, setState] = useState('')
  const [skills, setSkills] = useState([])

  const fetchRecs = async (selectedState, selectedSkills) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (selectedState) params.set('state', selectedState)
      if (selectedSkills.length) params.set('skills', selectedSkills.join(','))
      const res = await fetch(`${API}/recommendations?${params}`)
      const data = await res.json()
      setRecs(data.data?.recommendations || [])
      setMeta(data.data?.meta || null)
    } catch {
      setRecs([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRecs('', [])
  }, [])

  const toggleSkill = (skill) => {
    const next = skills.includes(skill) ? skills.filter((item) => item !== skill) : [...skills, skill]
    setSkills(next)
    fetchRecs(state, next)
  }

  const levelColors = { Critical: '#9D4EDD', High: '#4CC9F0', Medium: '#40916C', Low: '#52B788' }

  return (
    <div>
      <section className="page-hero">
        <div className="container">
          <div className="page-hero-grid">
            <div className="page-hero-copy">
              <span className="section-label">AI Matching</span>
              <h1 className="page-title">Smart NGO recommendations with a calmer layout</h1>
              <p className="page-subtitle">
                Fine-tune state and skill signals, then review better-matched NGOs through a cleaner recommendation grid.
              </p>
            </div>
            <div className="page-hero-panel">
              <div className="glass-card p-5">
                <div className="mb-4 flex items-center gap-3">
                  <div className="icon-shell purple">
                    <Filter size={18} strokeWidth={1.8} />
                  </div>
                  <div>
                    <p className="text-sm font-bold" style={{ color: 'var(--green-8)' }}>Customize criteria</p>
                    <p className="text-xs" style={{ color: 'var(--text-soft)' }}>Use skills and location to improve match quality.</p>
                  </div>
                </div>
                <select className="select-field" value={state} onChange={(e) => { setState(e.target.value); fetchRecs(e.target.value, skills) }}>
                  <option value="">Any State</option>
                  {STATES.filter(Boolean).map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
                <div className="mt-4 flex flex-wrap gap-2">
                  {SKILLS.slice(0, 6).map((skill) => (
                    <span key={skill} className="tag-chip">{skill}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="glass-card p-5">
            <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
              <div>
                <label className="mb-2 block text-sm font-semibold" style={{ color: 'var(--green-8)' }}>State</label>
                <select className="select-field" value={state} onChange={(e) => { setState(e.target.value); fetchRecs(e.target.value, skills) }}>
                  <option value="">Any State</option>
                  {STATES.filter(Boolean).map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold" style={{ color: 'var(--green-8)' }}>Skills</label>
                <div className="flex flex-wrap gap-2">
                  {SKILLS.map((skill) => (
                    <button key={skill} onClick={() => toggleSkill(skill)} className={skills.includes(skill) ? 'btn-primary min-h-0 px-4 py-2 text-xs' : 'btn-outline min-h-0 px-4 py-2 text-xs'}>
                      {skill}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {meta && (
              <div className="mt-5 rounded-2xl p-4 text-xs" style={{ background: 'rgba(216, 243, 220, 0.52)', color: 'var(--text-muted)' }}>
                {'Pipeline: match -> addFields -> sort -> limit | State: '}
                <strong style={{ color: 'var(--green-8)' }}>{meta.targetState || 'All'}</strong>
                {' | Focus areas: '}
                <strong style={{ color: 'var(--green-8)' }}>{meta.matchedFocusAreas?.join(', ') || 'All'}</strong>
              </div>
            )}
          </div>

          {loading ? (
            <div className="empty-state mt-6">
              <div className="mx-auto mb-4 h-10 w-10 rounded-full border-4 animate-spin" style={{ borderColor: 'rgba(82,183,136,0.18)', borderTopColor: 'var(--green-6)' }} />
              <p>Loading recommendations...</p>
            </div>
          ) : recommendations.length > 0 ? (
            <div className="cards-grid-3 mt-6">
              {recommendations.map((ngo, index) => (
                <div key={ngo._id} className="glass-card p-5">
                  <div className="mb-4 flex items-start gap-4">
                    <div className="relative">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl text-sm font-extrabold text-white" style={{ background: 'linear-gradient(135deg, var(--green-6), var(--green-7))' }}>
                        {ngo.name?.charAt(0)}
                      </div>
                      {index < 3 && <Sparkles size={12} className="absolute -right-1 -top-1" style={{ color: 'var(--purple-accent)' }} />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="line-clamp-1 text-base font-bold" style={{ color: 'var(--green-8)' }}>{ngo.name}</h3>
                      <p className="mt-1 flex items-center gap-1 text-sm" style={{ color: 'var(--text-muted)' }}>
                        <MapPin size={12} />
                        {ngo.city}, {ngo.state}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs" style={{ color: 'var(--text-soft)' }}>Match</p>
                      <p className="text-2xl font-extrabold tracking-[-0.04em]" style={{ color: 'var(--purple-accent)', fontFamily: 'Space Grotesk, Manrope, sans-serif' }}>
                        {ngo.matchScore}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {ngo.focusAreas?.map((focus) => (
                      <span key={focus} className="tag-chip">{focus}</span>
                    ))}
                  </div>

                  <div className="mt-5 flex items-center justify-between border-t pt-4 text-xs" style={{ borderColor: 'rgba(45, 106, 79, 0.08)', color: 'var(--text-muted)' }}>
                    <span className="flex items-center gap-1">
                      <Users size={13} />
                      {ngo.volunteerCount}
                    </span>
                    <span className="flex items-center gap-1">
                      <Award size={13} />
                      {ngo.impactScore}
                    </span>
                    <span style={{ color: levelColors[ngo.contributionLevel], fontWeight: 700 }}>{ngo.contributionLevel}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state mt-6">
              <Sparkles size={40} className="mx-auto mb-4 opacity-40" />
              <p>No matches found. Try adjusting your criteria.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
