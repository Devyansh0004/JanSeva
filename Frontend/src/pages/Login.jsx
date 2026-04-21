import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, ArrowRight, Activity } from 'lucide-react'

const Login = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
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

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:5000/api/auth/google'
  }

  return (
    <section className="section">
      <div className="container">
        <div className="content-grid">
          <div className="light-panel p-8 md:p-12" style={{ background: 'linear-gradient(135deg, rgba(216,243,220,0.92), rgba(255,255,255,0.96) 58%, rgba(76,201,240,0.12))' }}>
            <span className="section-label">Welcome Back</span>
            <h1 className="page-title mt-5">Sign in to your JanSeva workspace</h1>
            <p className="page-subtitle">
              Access your dashboard, track contributions, and coordinate support through the refreshed, lighter interface.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {[
                { label: 'Volunteer workflows', value: 'Active' },
                { label: 'Live updates', value: '30s sync' },
                { label: 'Impact visibility', value: 'Cleaner' },
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
              <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full" style={{ background: 'linear-gradient(135deg, var(--green-6), var(--green-7))' }}>
                <Activity className="h-8 w-8" style={{ color: '#D8F3DC' }} />
              </div>
              <h2 className="text-2xl font-extrabold tracking-[-0.04em]" style={{ color: 'var(--green-8)', fontFamily: 'Space Grotesk, Manrope, sans-serif' }}>
                Log in
              </h2>
              <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>Use your account to continue where your team left off.</p>
            </div>

            {error && (
              <div className="mb-6 rounded-2xl px-4 py-3 text-sm font-medium" style={{ background: 'rgba(157,78,221,0.1)', border: '1px solid rgba(157,78,221,0.16)', color: 'var(--purple-accent)' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
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
                <div className="mb-2 flex items-center justify-between">
                  <label className="block text-sm font-semibold" style={{ color: 'var(--green-8)' }}>Password</label>
                  <a href="#" className="text-xs font-semibold" style={{ color: 'var(--blue-accent)' }}>Forgot password?</a>
                </div>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <Lock className="h-5 w-5" style={{ color: 'var(--text-soft)' }} />
                  </div>
                  <input type="password" required className="input-field pl-11" placeholder="Enter your password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? 'Logging in...' : 'Sign In'}
                {!loading && <ArrowRight className="h-5 w-5" />}
              </button>
            </form>

            <div className="mt-6 pt-6" style={{ borderTop: '1px solid rgba(45, 106, 79, 0.08)' }}>
              <button onClick={handleGoogleLogin} className="btn-outline w-full">
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </button>
            </div>

            <div className="mt-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
              Do not have an account? <Link to="/signup" className="font-semibold" style={{ color: 'var(--green-6)' }}>Create one</Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Login
