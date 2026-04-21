export default function TestimonialCard({ quote, name, role, org, initials, color }) {
  const bgColors = {
    'bg-green-600': '#40916C',
    'bg-green-500': '#4CC9F0',
    'bg-green-700': '#2D6A4F',
    'bg-green-400': '#9D4EDD',
  }
  const bg = bgColors[color] || '#40916C'

  return (
    <div className="glass-card flex h-full flex-col justify-between gap-5 p-6">
      <p className="text-sm leading-7 italic" style={{ color: 'var(--text-muted)' }}>
        "{quote}"
      </p>
      <div className="flex items-center gap-3 pt-4" style={{ borderTop: '1px solid rgba(45, 106, 79, 0.08)' }}>
        <div
          className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
          style={{ background: `linear-gradient(135deg, ${bg}, ${bg}dd)` }}
        >
          {initials}
        </div>
        <div>
          <p className="text-sm font-bold" style={{ color: 'var(--green-8)' }}>{name}</p>
          <p className="text-xs" style={{ color: 'var(--text-soft)' }}>
            {role} - {org}
          </p>
        </div>
      </div>
    </div>
  )
}
