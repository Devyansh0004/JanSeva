import { Quote } from 'lucide-react'

export default function TestimonialCard({ quote, name, role, org, initials, color }) {
  return (
    <div className="card p-6 border border-gray-100 flex flex-col gap-4 min-w-[280px] md:min-w-0">
      <Quote size={20} className="text-green-300" />
      <p className="text-gray-600 text-sm leading-relaxed italic flex-1">"{quote}"</p>
      <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0 ${color}`}>
          {initials}
        </div>
        <div>
          <p className="font-semibold text-green-800 text-sm">{name}</p>
          <p className="text-gray-400 text-xs">{role}, {org}</p>
        </div>
      </div>
    </div>
  )
}
