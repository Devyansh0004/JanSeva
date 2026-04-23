export default function ServiceCard({ image, title, desc }) {
  return (
    <div className="glass-card flex h-full flex-col overflow-hidden" style={{ padding: 0 }}>
      <div className="relative w-full h-48">
        <img 
          src={image} 
          alt={title} 
          className="w-full h-full object-cover" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-4">
          <h3 className="text-xl font-bold text-white drop-shadow-md">{title}</h3>
        </div>
      </div>
      <div className="p-6">
        <p className="text-sm leading-7" style={{ color: 'var(--text-muted)' }}>{desc}</p>
      </div>
    </div>
  )
}
