import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Mail, Save, Clock, CheckCircle } from 'lucide-react'

const API = 'http://localhost:5000/api'

export default function VolunteerProfile() {
  const navigate = useNavigate()
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('janseva_user') || '{}'))
  const [profile, setProfile] = useState(null)
  
  const [formData, setFormData] = useState({
    name: user.name || '',
    email: user.email || ''
  })
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const token = localStorage.getItem('janseva_token')
  const headers = { Authorization: `Bearer ${token}` }

  useEffect(() => {
    if (!token) {
      navigate('/login')
      return
    }

    const loadProfile = async () => {
      try {
        const res = await fetch(`${API}/volunteer/profile`, { headers })
        const data = await res.json()
        if (data.success) {
          setProfile(data.data)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadProfile()
  }, [navigate, token])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')
    try {
      setTimeout(() => {
        setMessage('Profile updated successfully!')
        setSaving(false)
        
        // Update local storage
        const updatedUser = { ...user, name: formData.name, email: formData.email }
        localStorage.setItem('janseva_user', JSON.stringify(updatedUser))
        setUser(updatedUser)
      }, 1000)
    } catch (err) {
      setMessage('Failed to update profile.')
      setSaving(false)
    }
  }

  if (loading) return <div className="p-8 text-center">Loading profile...</div>

  return (
    <section className="section">
      <div className="container max-w-2xl">
        <div className="mb-8">
          <span className="section-label mb-4">Settings</span>
          <h1 className="text-3xl font-bold text-gray-900 mt-2">Volunteer Profile</h1>
        </div>

        <div className="grid gap-6 md:grid-cols-2 mb-8">
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

        <div className="glass-card p-8">
          {message && (
            <div className={`mb-6 p-4 rounded-xl text-sm font-bold ${message.includes('success') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input 
                  type="text" 
                  className="input-field input-field-icon" 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input 
                  type="email" 
                  className="input-field input-field-icon" 
                  value={formData.email} 
                  onChange={e => setFormData({...formData, email: e.target.value})} 
                />
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <button type="submit" disabled={saving} className="btn-primary w-full md:w-auto">
                {saving ? 'Saving...' : <><Save size={18} /> Save Changes</>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  )
}
