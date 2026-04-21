import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, User, ArrowRight, Shield } from 'lucide-react'

const Signup = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'user' })
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('http://localhost:5000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'Something went wrong')
      localStorage.setItem('janseva_token', data.data.token)
      localStorage.setItem('janseva_user', JSON.stringify(data.data.user))
      navigate('/dashboard')
      window.location.reload()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="section">
      <div className="container">
        <div className="content-grid">
          <div className="light-panel p-8 md:p-12" style={{ background: 'linear-gradient(135deg, rgba(216,243,220,0.92), rgba(255,255,255,0.96) 58%, rgba(157,78,221,0.1))' }}>
            <span className="section-label">Create Account</span>
            <h1 className="page-title mt-5">Join a platform built to feel calm and capable</h1>
            <p className="page-subtitle">
              Sign up as a citizen, volunteer, or NGO representative and enter the refreshed JanSeva experience without changing the backend workflows behind it.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {[
                { label: 'Roles supported', value: '3' },
                { label: 'Onboarding flow', value: 'Simpler' },
                { label: 'Theme', value: 'Light SaaS' },
              ].map((item) => (
                <div key={item.label} className="glass-card p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.12em]" style={{ color: 'var(--text-soft)' }}>{item.label}</p>
                  <p className="mt-2 text-lg font-extrabold tracking-[-0.04em]" style={{ color: 'var(--green-8)', fontFamily: 'Space Grotesk, Manrope, sans-serif' }}>{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card p-8">
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full" style={{ background: 'linear-gradient(135deg, var(--purple-accent), #7C3AED)' }}>
                <Shield className="h-8 w-8" style={{ color: '#ffffff' }} />
              </div>
              <h2 className="text-2xl font-extrabold tracking-[-0.04em]" style={{ color: 'var(--green-8)', fontFamily: 'Space Grotesk, Manrope, sans-serif' }}>
                Create your account
              </h2>
              <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>Set up your role and start contributing through JanSeva.</p>
            </div>

            {error && (
              <div className="mb-6 rounded-2xl px-4 py-3 text-sm font-medium" style={{ background: 'rgba(157,78,221,0.1)', border: '1px solid rgba(157,78,221,0.16)', color: 'var(--purple-accent)' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold" style={{ color: 'var(--green-8)' }}>Full Name</label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <User className="h-5 w-5" style={{ color: 'var(--text-soft)' }} />
                  </div>
                  <input type="text" required className="input-field pl-11" placeholder="John Doe" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold" style={{ color: 'var(--green-8)' }}>Email Address</label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <Mail className="h-5 w-5" style={{ color: 'var(--text-soft)' }} />
                  </div>
                  <input type="email" required className="input-field pl-11" placeholder="you@email.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold" style={{ color: 'var(--green-8)' }}>Password</label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <Lock className="h-5 w-5" style={{ color: 'var(--text-soft)' }} />
                  </div>
                  <input type="password" required className="input-field pl-11" placeholder="Create a password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold" style={{ color: 'var(--green-8)' }}>I want to join as</label>
                <select className="select-field" value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })}>
                  <option value="user">Citizen / General User</option>
                  <option value="volunteer">Volunteer</option>
                  <option value="ngo">NGO Representative</option>
                </select>
              </div>
              <button type="submit" disabled={loading} className="btn-mustard w-full">
                {loading ? 'Creating account...' : 'Create Account'}
                {!loading && <ArrowRight className="h-5 w-5" />}
              </button>
            </form>

            <div className="mt-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
              Already have an account? <Link to="/login" className="font-semibold" style={{ color: 'var(--green-6)' }}>Log in here</Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Signup
