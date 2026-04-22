import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, User, ArrowRight, Shield, Eye, EyeOff } from 'lucide-react'

const Signup = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'volunteer' })
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showPwd, setShowPwd] = useState(false)

  const getStrength = (pass) => {
    let s = 0;
    if (pass.length > 7) s += 1;
    if (/[A-Z]/.test(pass)) s += 1;
    if (/[a-z]/.test(pass)) s += 1;
    if (/[0-9]/.test(pass)) s += 1;
    if (/[^A-Za-z0-9]/.test(pass)) s += 1;
    return s;
  }
  const strength = getStrength(formData.password)
  const strengthLabels = ['Weak', 'Weak', 'Fair', 'Good', 'Strong', 'Excellent']
  const strengthColors = ['bg-red-500', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500', 'bg-green-600']

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
                  <input type="text" required className="input-field input-field-icon" placeholder="John Doe" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold" style={{ color: 'var(--green-8)' }}>Email Address</label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <Mail className="h-5 w-5" style={{ color: 'var(--text-soft)' }} />
                  </div>
                  <input type="email" required className="input-field input-field-icon" placeholder="you@email.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold" style={{ color: 'var(--green-8)' }}>Password</label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <Lock className="h-5 w-5" style={{ color: 'var(--text-soft)' }} />
                  </div>
                  <input type={showPwd ? "text" : "password"} required className="input-field input-field-icon pr-10" placeholder="Create a password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
                  <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-600">
                    {showPwd ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {formData.password && (
                  <div className="mt-2">
                    <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
                      <div className={`h-full ${strengthColors[strength]} transition-all duration-300`} style={{ width: `${(strength / 5) * 100}%` }}></div>
                    </div>
                    <p className={`mt-1 text-xs font-medium ${strength < 3 ? 'text-red-500' : strength < 5 ? 'text-orange-500' : 'text-green-600'}`}>
                      Password strength: {strengthLabels[strength]}
                    </p>
                  </div>
                )}
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold" style={{ color: 'var(--green-8)' }}>I want to join as</label>
                <select className="select-field" value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })}>
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
