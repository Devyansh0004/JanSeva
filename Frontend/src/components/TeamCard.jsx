export default function TeamCard({ name, role, initials, gradient }) {
  return (
    <div className="card p-5 flex flex-col items-center text-center gap-3 border border-gray-100">
      {/* Avatar */}
      <div
        className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0 ${gradient}`}
      >
        {initials}
      </div>
      <div>
        <p className="font-semibold text-green-800 text-sm">{name}</p>
        <p className="text-gray-500 text-xs mt-0.5">{role}</p>
      </div>
    </div>
  )
}
