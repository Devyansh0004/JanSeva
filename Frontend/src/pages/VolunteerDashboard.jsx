import { useState, useEffect } from 'react'
import { Calendar, Clock, CheckCircle, AlertTriangle, Building2, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'

const API = 'http://localhost:5000/api'

export default function VolunteerDashboard({ user }) {
  const [profile, setProfile] = useState(null)
  const [events, setEvents] = useState([])
  const [myEvents, setMyEvents] = useState([])
  const [myNGOs, setMyNGOs] = useState([])
  const [allNGOs, setAllNGOs] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddNGO, setShowAddNGO] = useState(false)
  const [searchNGO, setSearchNGO] = useState('')

  const token = localStorage.getItem('janseva_token')
  const headers = { Authorization: `Bearer ${token}` }

  const loadData = async () => {
    try {
      const [profileRes, eventsRes, myEventsRes, ngosRes, allNgosRes] = await Promise.all([
        fetch(`${API}/volunteer/profile`, { headers }).then(res => res.json()),
        fetch(`${API}/campaigns`, { headers }).then(res => res.json()),
        fetch(`${API}/campaigns/my`, { headers }).then(res => res.json()),
        fetch(`${API}/volunteer-ngo/my-ngos`, { headers }).then(res => res.json()),
        fetch(`${API}/ngos`, { headers }).then(res => res.json())
      ])

      if (profileRes.success) setProfile(profileRes.data)
      if (eventsRes.success) setEvents(eventsRes.data)
      if (myEventsRes.success) setMyEvents(myEventsRes.data.map(e => e._id))
      if (ngosRes.success) setMyNGOs(ngosRes.data)
      if (allNgosRes.success) setAllNGOs(allNgosRes.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const registerEvent = async (id) => {
    try {
      const res = await fetch(`${API}/campaigns/${id}/join`, { method: 'POST', headers })
      if (res.ok) {
        setMyEvents(prev => [...prev, id])
      }
    } catch (err) {
      console.error(err)
    }
  }

  const unregisterEvent = async (id) => {
    try {
      const res = await fetch(`${API}/campaigns/${id}/leave`, { method: 'POST', headers })
      const data = await res.json()
      if (res.ok) {
        setMyEvents(prev => prev.filter(eId => eId !== id))
      } else {
        alert(data.message)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const requestJoinNGO = async (ngoId) => {
    try {
      const res = await fetch(`${API}/volunteer-ngo/request`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ ngoId })
      })
      if (res.ok) {
        loadData()
        setShowAddNGO(false)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const getTimeOfDay = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'morning'
    if (hour < 18) return 'afternoon'
    return 'evening'
  }

  const canUnregister = (startDate) => {
    const timeUntilStart = new Date(startDate).getTime() - Date.now()
    return timeUntilStart > 24 * 60 * 60 * 1000
  }

  if (loading) return <div className="p-8 text-center">Loading dashboard...</div>

  const approvedNgoIds = myNGOs
    .filter(req => req.status === 'approved')
    .map(req => typeof req.ngoId === 'object' ? req.ngoId._id : req.ngoId)

  const filteredEvents = events.filter(event => {
    const timeUntilStart = new Date(event.startDate).getTime() - Date.now()
    const isFuture24h = timeUntilStart >= 24 * 60 * 60 * 1000
    const isApprovedNgo = approvedNgoIds.includes(event.ngoId)
    return isFuture24h && isApprovedNgo
  })

  const filteredAllNGOs = allNGOs.filter(ngo => 
    ngo.name.toLowerCase().includes(searchNGO.toLowerCase())
  )

  return (
    <div>
      <section className="page-hero">
        <div className="container">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="page-title">Good {getTimeOfDay()}, {user.name.split(' ')[0]}</h1>
              <p className="page-subtitle">Track your volunteering impact and upcoming events.</p>
            </div>
            <Link to="/volunteer-profile" className="btn-outline">My Profile</Link>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="glass-card p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-muted">Volunteering Hours</p>
                <p className="text-3xl font-bold mt-2" style={{ color: 'var(--green-8)' }}>{profile?.volunteeringHours || 0}</p>
              </div>
              <div className="icon-shell"><Clock size={24} /></div>
            </div>
            <div className="glass-card p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-muted">Surveys Conducted</p>
                <p className="text-3xl font-bold mt-2" style={{ color: 'var(--blue-accent)' }}>{profile?.surveysConducted || 0}</p>
              </div>
              <div className="icon-shell blue"><CheckCircle size={24} /></div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container dashboard-grid">
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Upcoming Events</h2>
            </div>
            
            <div className="space-y-4">
              {filteredEvents.length === 0 ? (
                <p className="text-gray-500">No upcoming events available for your approved NGOs at this time.</p>
              ) : (
                filteredEvents.map(event => {
                const isRegistered = myEvents.includes(event._id)
                const _canUnregister = canUnregister(event.startDate)

                return (
                  <div key={event._id} className={`glass-card p-5 ${event.isEmergency ? 'border-red-400 bg-red-50' : ''}`}>
                    {event.isEmergency && (
                      <div className="mb-2 flex items-center gap-2 text-red-600 font-bold text-sm">
                        <AlertTriangle size={16} /> EMERGENCY DISASTER
                      </div>
                    )}
                    <h3 className="text-xl font-bold mb-2">{event.title}</h3>
                    <p className="text-sm text-gray-600 mb-4">{event.description}</p>
                    
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex gap-4 text-sm font-semibold text-gray-500">
                        <span className="flex items-center gap-1"><Calendar size={16}/> {new Date(event.startDate).toLocaleDateString()}</span>
                        <span className="flex items-center gap-1"><MapPin size={16}/> {event.city}</span>
                      </div>
                      
                      {isRegistered ? (
                        <button 
                          onClick={() => unregisterEvent(event._id)}
                          disabled={!_canUnregister}
                          className={`btn-outline ${!_canUnregister ? 'opacity-50 cursor-not-allowed' : ''}`}
                          title={!_canUnregister ? "Cannot unregister within 24 hours" : ""}
                        >
                          Unregister
                        </button>
                      ) : (
                        <button onClick={() => registerEvent(event._id)} className="btn-primary">
                          Register
                        </button>
                      )}
                    </div>
                  </div>
                )
              }))}
            </div>
          </div>

          <div>
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">NGOs You Volunteer For</h2>
                <button onClick={() => setShowAddNGO(!showAddNGO)} className="text-sm font-bold text-blue-600">
                  {showAddNGO ? 'Cancel' : '+ ADD NGO'}
                </button>
              </div>

              {showAddNGO && (
                <div className="mb-6 p-4 rounded-xl bg-gray-50 border">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold">Select an NGO to join:</h3>
                    <input 
                      type="text" 
                      placeholder="Search NGOs..." 
                      className="text-xs p-2 rounded border border-gray-300 w-48 focus:outline-none focus:border-green-500"
                      value={searchNGO}
                      onChange={(e) => setSearchNGO(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {filteredAllNGOs.length === 0 ? (
                      <p className="text-xs text-gray-500">No NGOs match your search.</p>
                    ) : (
                      filteredAllNGOs.map(ngo => (
                        <div key={ngo._id} className="flex items-center justify-between p-2 hover:bg-white rounded border">
                          <span className="text-sm font-semibold">{ngo.name}</span>
                          <button onClick={() => requestJoinNGO(ngo._id)} className="btn-primary py-1 min-h-0 text-xs">Join</button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {myNGOs.length === 0 ? (
                  <p className="text-sm text-gray-500">You haven't joined any NGOs yet.</p>
                ) : (
                  myNGOs.map(rel => (
                    <div key={rel._id} className="flex items-center p-3 rounded-lg border bg-white">
                      <div className="icon-shell w-10 h-10 mr-3"><Building2 size={18}/></div>
                      <div className="flex-1">
                        <p className="text-sm font-bold">{rel.ngoId.name}</p>
                        <p className="text-xs text-gray-500">{rel.ngoId.city}</p>
                      </div>
                      <div>
                        {rel.status === 'pending' ? (
                          <span className="text-xs font-bold text-yellow-600 bg-yellow-100 px-2 py-1 rounded">Waiting for approval</span>
                        ) : rel.status === 'approved' ? (
                          <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded">Approved</span>
                        ) : (
                          <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded">Rejected</span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
