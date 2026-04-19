export default function ServiceCard({ icon: Icon, title, description, color = 'green' }) {
  return (
    <div className="card p-6 flex flex-col items-start gap-4 cursor-pointer group border border-gray-100 hover:border-green-200">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-green-50 group-hover:bg-green-100 transition-colors duration-300 flex-shrink-0`}>
        <Icon size={24} className="text-green-600" strokeWidth={1.8} />
      </div>
      <div>
        <h3 className="font-semibold text-green-800 text-base mb-1.5 group-hover:text-green-600 transition-colors duration-200">
          {title}
        </h3>
        <p className="text-gray-500 text-sm leading-relaxed">{description}</p>
      </div>
    </div>
  )
}
