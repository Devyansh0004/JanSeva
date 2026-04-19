export default function StatCard({ value, label, icon: Icon, trend }) {
  return (
    <div className="card p-6 flex flex-col gap-3 border border-gray-100">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-500 text-sm font-medium mb-1">{label}</p>
          <p className="text-2xl font-bold text-green-800">{value}</p>
        </div>
        {Icon && (
          <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
            <Icon size={20} className="text-green-500" strokeWidth={1.8} />
          </div>
        )}
      </div>
      {trend && (
        <p className={`text-xs font-medium ${trend.up ? 'text-green-500' : 'text-red-400'}`}>
          {trend.up ? '↑' : '↓'} {trend.value} {trend.label}
        </p>
      )}
    </div>
  )
}
