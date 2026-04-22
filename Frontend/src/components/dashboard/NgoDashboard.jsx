import { useState, useEffect } from 'react'

export default function NgoDashboard({ token, user }) {
  const [data, setData] = useState(null)
  
  useEffect(() => {
    fetch('http://localhost:5000/api/dashboard/ngo', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(res => { if (res.success) setData(res.data) })
  }, [token])

  const respondToRequest = async (requestId, status) => {
    const res = await fetch('http://localhost:5000/api/dashboard/respond-affiliation', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ requestId, status })
    })
    if (res.ok) {
      window.location.reload()
    }
  }

  if (!data) return <p className="p-8 text-center">Loading NGO Dashboard...</p>

  const { ngo, pendingRequests, approvedVolunteers } = data;

  if (!ngo.isVerified) {
    return (
      <div className="container py-12 text-center max-w-lg mt-12 glass-card p-8 border-yellow-200" style={{ background: 'rgba(255, 252, 235, 0.5)' }}>
        <h2 className="text-2xl font-bold mb-4 text-yellow-700">Waiting of approval from admin side</h2>
        <p className="text-gray-600 mb-6 font-medium">
          Welcome to JanSeva, <b>{ngo.name}</b>! Your account has been registered, but it is currently <span className="text-yellow-600 font-bold">waiting for verification</span>.
        </p>
        <p className="text-sm text-gray-500">
          We manually verify organizations to ensure a safe environment. Please check back later or contact support if you have questions.
        </p>
      </div>
    )
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <div className="container py-8">
      <h1 className="page-title mb-8">{getGreeting()}, {ngo.name}</h1>
      
      <div className="glass-card mb-8 p-6">
        <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--green-8)' }}>Pending Volunteer Requests</h2>
        {pendingRequests.length === 0 ? (
          <p className="text-sm text-gray-500">No pending requests.</p>
        ) : (
          <div className="space-y-4">
            {pendingRequests.map(req => (
              <div key={req._id} className="flex justify-between items-center p-4 border rounded-xl" style={{ borderColor: 'rgba(82,183,136,0.2)' }}>
                <div>
                  <p className="font-bold">{req.volunteerId.name}</p>
                  <p className="text-sm text-gray-500">{req.volunteerId.email}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => respondToRequest(req._id, 'Approved')} className="btn-primary py-1 px-3 text-sm">Approve</button>
                  <button onClick={() => respondToRequest(req._id, 'Rejected')} className="btn-outline py-1 px-3 text-sm border-red-200 text-red-600">Reject</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="glass-card p-6">
        <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--green-8)' }}>Your Affiliated Volunteers</h2>
        {approvedVolunteers.length === 0 ? (
          <p className="text-sm text-gray-500">No active volunteers.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {approvedVolunteers.map(vol => (
              <div key={vol._id} className="p-4 rounded-xl" style={{ background: 'rgba(216,243,220,0.3)' }}>
                <p className="font-bold">{vol.volunteerId.name}</p>
                <p className="text-sm text-gray-600">{vol.volunteerId.email}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
