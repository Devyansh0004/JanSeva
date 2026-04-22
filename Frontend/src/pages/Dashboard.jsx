import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminDashboard from '../components/dashboard/AdminDashboard'
import NgoDashboard from '../components/dashboard/NgoDashboard'
import VolunteerDashboard from '../components/dashboard/VolunteerDashboard'

export default function Dashboard() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const token = localStorage.getItem('janseva_token')

  useEffect(() => {
    const rawUser = localStorage.getItem('janseva_user')
    if (!token || !rawUser) {
      navigate('/login')
      return
    }
    setUser(JSON.parse(rawUser))
  }, [navigate, token])

  if (!user) return null

  return (
    <div className="bg-[#fbfffc] min-h-screen">
      {user.role === 'admin' && <AdminDashboard token={token} user={user} />}
      {user.role === 'ngo' && <NgoDashboard token={token} user={user} />}
      {user.role === 'volunteer' && <VolunteerDashboard token={token} user={user} />}
      {user.role === 'user' && (
        <div className="container py-12 text-center">
          <h2 className="text-2xl font-bold">Please update your account role in settings.</h2>
        </div>
      )}
    </div>
  )
}
