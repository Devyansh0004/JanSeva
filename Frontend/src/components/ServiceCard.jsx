export default function ServiceCard({ icon: Icon, title, description }) {
  return (
    <div className="glass-card flex h-full flex-col items-start gap-4 p-6">
      <div className="icon-shell flex-shrink-0">
        <Icon size={22} strokeWidth={1.8} />
      </div>
      <div>
        <h3 className="mb-2 text-lg font-bold" style={{ color: 'var(--green-8)' }}>{title}</h3>
        <p className="text-sm leading-7" style={{ color: 'var(--text-muted)' }}>{description}</p>
      </div>
    </div>
  )
}
