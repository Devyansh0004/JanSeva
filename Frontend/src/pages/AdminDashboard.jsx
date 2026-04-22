import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'

const API = 'http://localhost:5000/api'

export default function AdminDashboard({ user }) {
  const [pendingNGOs, setPendingNGOs] = useState([])
  const [allNGOs, setAllNGOs] = useState([])
  const [loading, setLoading] = useState(true)

  const token = localStorage.getItem('janseva_token')
  const headers = { Authorization: `Bearer ${token}` }

  const loadData = async () => {
    try {
      const [pendingRes, allRes] = await Promise.all([
        fetch(`${API}/ngos/admin/pending`, { headers }).then(res => res.json()),
        fetch(`${API}/ngos`, { headers }).then(res => res.json())
      ])

      if (pendingRes.success) setPendingNGOs(pendingRes.data)
      if (allRes.success) setAllNGOs(allRes.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleApproval = async (id, action) => {
    try {
      const res = await fetch(`${API}/ngos/admin/${id}/${action}`, { method: 'PATCH', headers })
      if (res.ok) {
        loadData()
      }
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) return <div className="p-8 text-center">Loading dashboard...</div>

  return (
    <div>
      <section className="page-hero">
        <div className="container">
          <div className="flex items-center justify-between">
            <div>
              <span className="section-label mb-4">Admin Dashboard</span>
              <h1 className="page-title">Platform Administration</h1>
              <p className="page-subtitle mt-2">Manage NGOs and platform access.</p>
            </div>
            <div className="icon-shell purple w-16 h-16"><ShieldCheck size={32}/></div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container dashboard-grid">
          <div>
            <div className="glass-card p-6">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                Pending NGO Approvals
              </h2>
              
              <div className="space-y-4">
                {pendingNGOs.length === 0 ? (
                  <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-xl border border-dashed">
                    No NGOs waiting for approval.
                  </div>
                ) : (
                  pendingNGOs.map(ngo => (
                    <div key={ngo._id} className="p-5 border rounded-xl hover:shadow-sm transition bg-white">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-bold text-lg">{ngo.name}</h3>
                          <p className="text-sm text-gray-500">{ngo.city}, {ngo.state}</p>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => handleApproval(ngo._id, 'approve')} className="btn-primary py-1 px-3 min-h-0 text-sm">Approve</button>
                          <button onClick={() => handleApproval(ngo._id, 'reject')} className="btn-danger py-1 px-3 min-h-0 text-sm">Reject</button>
                        </div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded text-sm text-gray-600">
                        {ngo.organizationDetails}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div>
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Approved NGOs</h2>
                <Link to="/explore" className="text-sm font-bold text-green-600">View Map</Link>
              </div>

              <div className="space-y-3">
                {allNGOs.map(ngo => (
                  <div key={ngo._id} className="flex items-center justify-between p-3 border rounded hover:bg-gray-50 transition">
                    <div>
                      <p className="font-bold text-sm">{ngo.name}</p>
                      <p className="text-xs text-gray-500">{ngo.city}, {ngo.state}</p>
                    </div>
                    <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded">Active</span>
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
