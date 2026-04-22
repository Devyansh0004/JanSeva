import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import VolunteerDashboard from './VolunteerDashboard'
import NGODashboard from './NGODashboard'
import AdminDashboard from './AdminDashboard'

export default function Dashboard() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const userData = localStorage.getItem('janseva_user')
    const token = localStorage.getItem('janseva_token')

    if (!userData || !token) {
      navigate('/login')
      return
    }

    setUser(JSON.parse(userData))
    setLoading(false)
  }, [navigate])

  if (loading) {
    return <div className="p-12 text-center text-gray-500">Loading your workspace...</div>
  }

  // Route to the appropriate dashboard based on role
  switch (user?.role) {
    case 'volunteer':
      return <VolunteerDashboard user={user} />
    case 'ngo':
      return <NGODashboard user={user} />
    case 'admin':
      return <AdminDashboard user={user} />
    default:
      // Fallback for regular users
      return (
        <section className="section text-center">
          <div className="container max-w-lg">
            <div className="glass-card p-12">
              <h2 className="text-2xl font-bold mb-4">Welcome to JanSeva</h2>
              <p className="text-gray-600 mb-6">
                You are currently logged in as a citizen. Explore our platform to find active campaigns and NGOs in your area.
              </p>
              <button onClick={() => navigate('/explore')} className="btn-primary">
                Explore NGOs
              </button>
            </div>
          </div>
        </section>
      )
  }
}
