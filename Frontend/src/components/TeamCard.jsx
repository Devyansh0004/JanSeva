export default function TeamCard({ name, role, initials, gradient }) {
  const bgMap = {
    'bg-green-700': '#2D6A4F',
    'bg-green-600': '#40916C',
    'bg-green-500': '#4CC9F0',
  }
  const bg = bgMap[gradient] || '#40916C'

  return (
    <div className="glass-card p-6 text-center">
      <div
        className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full text-lg font-bold"
        style={{ background: `linear-gradient(135deg, ${bg}, ${bg}cc)`, color: '#ffffff' }}
      >
        {initials}
      </div>
      <p className="text-base font-bold" style={{ color: 'var(--green-8)' }}>{name}</p>
      <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>{role}</p>
    </div>
  )
}
