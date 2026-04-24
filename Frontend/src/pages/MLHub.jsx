import { useState, useEffect, useCallback } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts'
import { MapPin, Users, AlertTriangle, Activity, ChevronRight, Search, Loader2 } from 'lucide-react'

const API = 'http://localhost:5000/api'

const TIER_COLORS = { A: 'bg-green-100 text-green-800', B: 'bg-blue-100 text-blue-800', C: 'bg-yellow-100 text-yellow-800', D: 'bg-gray-100 text-gray-800' }
const CLASS_COLORS = { CRITICAL: 'bg-red-100 text-red-700 border-red-200', HIGH: 'bg-orange-100 text-orange-700 border-orange-200', MEDIUM: 'bg-yellow-100 text-yellow-700 border-yellow-200', LOW: 'bg-green-100 text-green-700 border-green-200' }

export default function MLHub() {
  const [tab, setTab] = useState('rankings')
  const [stats, setStats] = useState(null)
  const [villages, setVillages] = useState([])
  const [volunteers, setVolunteers] = useState([])
  const [deployment, setDeployment] = useState([])
  const [selectedVillage, setSelectedVillage] = useState(null)
  const [smartMatch, setSmartMatch] = useState(null)
  const [loading, setLoading] = useState(false)
  const [domainFilter, setDomainFilter] = useState('all')
  const [volTierFilter, setVolTierFilter] = useState('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch(`${API}/ml/stats`).then(r => r.json()).then(d => { if (d.success) setStats(d.data) })
    fetch(`${API}/ml/village-rankings?limit=50`).then(r => r.json()).then(d => { if (d.success) setVillages(d.data) })
  }, [])

  useEffect(() => {
    if (tab === 'volunteers' && volunteers.length === 0) {
      setLoading(true)
      fetch(`${API}/ml/volunteers/ranked?limit=100`).then(r => r.json()).then(d => { if (d.success) setVolunteers(d.data) }).finally(() => setLoading(false))
    }
    if (tab === 'deployment' && deployment.length === 0) {
      setLoading(true)
      fetch(`${API}/ml/deployment-plan`).then(r => r.json()).then(d => { if (d.success) setDeployment(d.data) }).finally(() => setLoading(false))
    }
  }, [tab])

  const fetchSmartMatch = useCallback((village) => {
    setSelectedVillage(village)
    setTab('smartmatch')
    setSmartMatch(null)
    fetch(`${API}/ml/smart-match/${village.villageId}`).then(r => r.json()).then(d => { if (d.success) setSmartMatch(d.data) })
  }, [])

  const filteredVillages = villages.filter(v => {
    if (search && !v.villageName?.toLowerCase().includes(search.toLowerCase()) && !v.state?.toLowerCase().includes(search.toLowerCase())) return false
    return true
  }).sort((a, b) => {
    const field = domainFilter === 'health' ? 'healthScore' : domainFilter === 'food' ? 'foodScore' : domainFilter === 'education' ? 'educationScore' : domainFilter === 'shelter' ? 'shelterScore' : 'overallVulnerabilityScore'
    return (b[field] || 0) - (a[field] || 0)
  })

  const sectorBarData = stats?.sectorAverages ? [
    { name: 'Health', score: Math.round(stats.sectorAverages.avgHealth || 0) },
    { name: 'Food', score: Math.round(stats.sectorAverages.avgFood || 0) },
    { name: 'Education', score: Math.round(stats.sectorAverages.avgEducation || 0) },
    { name: 'Shelter', score: Math.round(stats.sectorAverages.avgShelter || 0) },
  ] : []

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="page-hero">
        <div className="container">
          <span className="section-label mb-4">ML Intelligence Hub</span>
          <h1 className="page-title">Village Vulnerability & Volunteer Matching</h1>
          <p className="text-gray-500 mt-2">MongoDB-powered scoring, smart matching, and deployment planning</p>
        </div>
      </div>

      <div className="container pb-12">
        {/* Summary Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total Villages', value: stats.totalVillages, color: 'text-blue-600', icon: <MapPin size={20}/> },
              { label: 'Critical Villages', value: stats.criticalVillages, color: 'text-red-600', icon: <AlertTriangle size={20}/> },
              { label: 'Total Volunteers', value: stats.totalVolunteers, color: 'text-green-600', icon: <Users size={20}/> },
              { label: 'Avg Vol. Score', value: `${stats.avgVolunteerScore}/100`, color: 'text-purple-600', icon: <Activity size={20}/> },
            ].map(c => (
              <div key={c.label} className="glass-card p-5 flex items-center gap-4">
                <div className={`${c.color} bg-opacity-10 p-3 rounded-xl`}>{c.icon}</div>
                <div>
                  <p className="text-2xl font-black">{c.value}</p>
                  <p className="text-xs text-gray-500 font-bold">{c.label}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b pb-2 flex-wrap">
          {[['rankings','Village Rankings'],['volunteers','Volunteers'],['smartmatch','Smart Match'],['deployment','Deployment Plan']].map(([t, label]) => (
            <button key={t} onClick={() => setTab(t)}
              className={`font-bold px-4 py-2 rounded-t-lg border-b-2 transition text-sm ${tab === t ? 'border-blue-600 text-blue-600 bg-blue-50' : 'border-transparent text-gray-500 hover:text-gray-800'}`}>
              {label}
            </button>
          ))}
        </div>

        {/* Village Rankings Tab */}
        {tab === 'rankings' && (
          <div>
            {sectorBarData.length > 0 && (
              <div className="glass-card p-6 mb-6">
                <h3 className="font-bold text-lg mb-4">Average Vulnerability Score by Sector</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={sectorBarData}>
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Bar dataKey="score" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            <div className="flex gap-3 mb-4 flex-wrap items-center">
              <div className="relative flex-1 min-w-48">
                <Search size={16} className="absolute left-3 top-3 text-gray-400" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search village or state..." className="input-field pl-9 py-2 text-sm" />
              </div>
              {['all','health','food','education','shelter'].map(d => (
                <button key={d} onClick={() => setDomainFilter(d)}
                  className={`px-3 py-1.5 rounded-full text-sm font-bold transition capitalize border ${domainFilter === d ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400'}`}>
                  {d === 'all' ? 'All' : d}
                </button>
              ))}
            </div>

            {filteredVillages.length === 0 ? (
              <div className="glass-card p-16 text-center text-gray-400">
                <p className="font-bold">No village data yet.</p>
                <p className="text-sm mt-1">Upload survey CSVs from the NGO Dashboard to populate this page.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {filteredVillages.map((v, idx) => (
                  <div key={v.villageId} className="glass-card p-5 cursor-pointer hover:shadow-lg transition" onClick={() => fetchSmartMatch(v)}>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-gray-400">#{idx + 1}</span>
                          <h3 className="font-bold text-lg">{v.villageName || v.villageId}</h3>
                        </div>
                        <p className="text-sm text-gray-500">{v.state} {v.district ? `• ${v.district}` : ''}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className={`text-xs font-bold px-2 py-1 rounded-full border ${CLASS_COLORS[v.vulnerabilityClass] || 'bg-gray-100 text-gray-600'}`}>{v.vulnerabilityClass || 'N/A'}</span>
                        <span className="text-2xl font-black text-blue-700">{v.overallVulnerabilityScore?.toFixed(1)}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-1 mb-2">
                      {[['H', v.healthScore, 'bg-red-400'], ['F', v.foodScore, 'bg-orange-400'], ['E', v.educationScore, 'bg-yellow-400'], ['S', v.shelterScore, 'bg-purple-400']].map(([label, score, color]) => (
                        <div key={label}>
                          <div className="flex justify-between text-xs mb-1"><span className="font-bold text-gray-500">{label}</span><span className="font-mono">{score?.toFixed(0) ?? '—'}</span></div>
                          <div className="h-1.5 bg-gray-100 rounded-full">
                            <div className={`h-1.5 rounded-full ${color}`} style={{ width: `${Math.min(score || 0, 100)}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between mt-2 text-xs">
                      <span className="bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded-full">{v.primaryDomain || 'No domain'}</span>
                      <span className="text-blue-500 font-bold flex items-center gap-1">Smart Match <ChevronRight size={14}/></span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Volunteers Tab */}
        {tab === 'volunteers' && (
          <div>
            <div className="flex gap-2 mb-4 flex-wrap">
              {[['all','All Tiers'],['A','Expert (A)'],['B','Experienced (B)'],['C','Developing (C)'],['D','Novice (D)']].map(([t, label]) => (
                <button key={t} onClick={() => setVolTierFilter(t)}
                  className={`px-3 py-1.5 rounded-full text-sm font-bold border transition ${volTierFilter === t ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-gray-200 hover:border-blue-300'}`}>
                  {label}
                </button>
              ))}
            </div>

            {loading ? <div className="flex justify-center py-16"><Loader2 className="animate-spin text-blue-500" size={32}/></div> : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {volunteers.filter(v => volTierFilter === 'all' || v.tier === volTierFilter).map((v, idx) => (
                  <div key={v._id} className="glass-card p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 text-white flex items-center justify-center font-bold">{(v.name || '?').charAt(0)}</div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold truncate">{v.name || 'Unknown'}</p>
                        <p className="text-xs text-gray-500">{v.location?.city}, {v.location?.state}</p>
                      </div>
                      <span className={`text-xs font-black px-2 py-1 rounded-full ${TIER_COLORS[v.tier] || TIER_COLORS.D}`}>Tier {v.tier}</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-2xl font-black text-blue-700">{v.totalScore?.toFixed(1)}</span>
                      <span className="text-xs text-gray-500">{v.availability}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full mb-3">
                      <div className="h-1.5 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full" style={{ width: `${Math.min(v.totalScore || 0, 100)}%` }} />
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {(v.skills || []).map(s => <span key={s} className="bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded-full font-medium">{s}</span>)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Smart Match Tab */}
        {tab === 'smartmatch' && (
          <div>
            {!selectedVillage ? (
              <div className="glass-card p-16 text-center text-gray-400">
                <MapPin size={48} className="mx-auto mb-4 opacity-30" />
                <p className="font-bold text-lg">Select a village from the Rankings tab</p>
                <p className="text-sm mt-1">Click on any village card to see the top matched volunteers</p>
              </div>
            ) : (
              <div>
                <div className="glass-card p-6 mb-6">
                  <div className="flex items-start justify-between flex-wrap gap-4">
                    <div>
                      <h2 className="text-2xl font-black">{selectedVillage.villageName}</h2>
                      <p className="text-gray-500">{selectedVillage.state}</p>
                      <div className="flex gap-2 mt-2 flex-wrap">
                        <span className={`text-xs font-bold px-3 py-1 rounded-full border ${CLASS_COLORS[selectedVillage.vulnerabilityClass] || ''}`}>{selectedVillage.vulnerabilityClass}</span>
                        <span className="bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1 rounded-full">{selectedVillage.primaryDomain}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-4xl font-black text-blue-700">{selectedVillage.overallVulnerabilityScore?.toFixed(1)}</p>
                      <p className="text-xs text-gray-500 font-bold">Vulnerability Index</p>
                    </div>
                  </div>

                  {/* Radar Chart */}
                  <div className="mt-6">
                    <ResponsiveContainer width="100%" height={280}>
                      <RadarChart data={[
                        { domain: 'Health', value: selectedVillage.healthScore || 0 },
                        { domain: 'Food', value: selectedVillage.foodScore || 0 },
                        { domain: 'Education', value: selectedVillage.educationScore || 0 },
                        { domain: 'Shelter', value: selectedVillage.shelterScore || 0 },
                      ]}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="domain" tick={{ fontSize: 12, fontWeight: 600 }} />
                        <PolarRadiusAxis domain={[0, 100]} tick={false} />
                        <Radar name="Score" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Matched Volunteers */}
                <h3 className="font-black text-xl mb-4">
                  Top {smartMatch?.matched?.length || '...'} Matched Volunteers
                  {smartMatch && <span className="text-sm text-gray-400 font-normal ml-2">from {smartMatch.consideredCount} considered</span>}
                </h3>

                {!smartMatch ? (
                  <div className="flex justify-center py-12"><Loader2 className="animate-spin text-blue-500" size={32}/></div>
                ) : smartMatch.matched.length === 0 ? (
                  <div className="glass-card p-12 text-center text-gray-400">No volunteers scored for this village yet. Run Recompute.</div>
                ) : (
                  <div className="space-y-3">
                    {smartMatch.matched.map((v, idx) => (
                      <div key={v._id} className="glass-card p-4 flex items-center gap-4 flex-wrap">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-blue-500 text-white flex items-center justify-center font-black">{idx + 1}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-bold">{v.name}</p>
                            <span className={`text-xs font-black px-2 py-0.5 rounded-full ${TIER_COLORS[v.tier] || TIER_COLORS.D}`}>Tier {v.tier}</span>
                          </div>
                          <p className="text-xs text-gray-500">{v.location?.city}, {v.location?.state} • {v.availability}</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {(v.matchingSkills || []).map(s => <span key={s} className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-bold">{s}</span>)}
                            {(v.skills || []).filter(s => !v.matchingSkills?.includes(s)).map(s => <span key={s} className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">{s}</span>)}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-black text-blue-700">{v.matchScore?.toFixed(1)}</p>
                          <p className="text-xs text-gray-500">Match Score</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Deployment Plan Tab */}
        {tab === 'deployment' && (
          <div>
            <p className="text-sm text-gray-500 mb-4">Showing CRITICAL and HIGH vulnerability villages with auto-assigned volunteer teams.</p>
            {loading ? <div className="flex justify-center py-16"><Loader2 className="animate-spin text-blue-500" size={32}/></div> :
              deployment.length === 0 ? (
                <div className="glass-card p-16 text-center text-gray-400">
                  <p className="font-bold">No high-priority villages yet.</p>
                  <p className="text-sm mt-1">Upload survey CSVs and run the vulnerability pipeline.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {deployment.map(v => (
                    <div key={v.villageId} className="glass-card p-5">
                      <div className="flex items-center justify-between mb-3 flex-wrap gap-3">
                        <div>
                          <h3 className="font-bold text-lg">{v.villageName}</h3>
                          <p className="text-sm text-gray-500">{v.state} • {v.primaryDomain}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-xs font-bold px-3 py-1 rounded-full border ${CLASS_COLORS[v.vulnerabilityClass] || ''}`}>{v.vulnerabilityClass}</span>
                          <span className="text-2xl font-black text-red-600">{v.overallVulnerabilityScore?.toFixed(1)}</span>
                        </div>
                      </div>
                      <div className="grid md:grid-cols-2 gap-3">
                        {(v.assignedVolunteers || []).map((vol, i) => (
                          <div key={i} className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 text-white flex items-center justify-center font-bold text-sm">{(vol.name || '?').charAt(0)}</div>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-sm truncate">{vol.name}</p>
                              <div className="flex gap-1 flex-wrap mt-0.5">
                                <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${TIER_COLORS[vol.tier] || TIER_COLORS.D}`}>Tier {vol.tier}</span>
                                {(vol.skills || []).slice(0, 2).map(s => <span key={s} className="bg-blue-50 text-blue-700 text-xs px-1.5 py-0.5 rounded">{s}</span>)}
                              </div>
                            </div>
                            <p className="text-sm font-black text-blue-600">{vol.matchScore?.toFixed(1)}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
          </div>
        )}
      </div>
    </div>
  )
}
