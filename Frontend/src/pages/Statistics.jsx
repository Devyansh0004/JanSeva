import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import {
  ClipboardList, CheckCircle2, Users, UserCheck,
  AlertTriangle, Building2, TrendingUp, TrendingDown
} from 'lucide-react'
import StatCard from '../components/StatCard'

const kpiCards = [
  {
    label: 'Requests Received',
    value: '4,821',
    icon: ClipboardList,
    trend: { up: true, value: '12%', label: 'vs last month' },
  },
  {
    label: 'Requests Resolved',
    value: '3,974',
    icon: CheckCircle2,
    trend: { up: true, value: '8%', label: 'vs last month' },
  },
  {
    label: 'Volunteers Available',
    value: '1,342',
    icon: Users,
    trend: { up: true, value: '5%', label: 'vs last month' },
  },
  {
    label: 'Volunteers Assigned',
    value: '1,106',
    icon: UserCheck,
    trend: { up: false, value: '3%', label: 'vs last month' },
  },
  {
    label: 'High Priority Zones',
    value: '18',
    icon: AlertTriangle,
    trend: { up: false, value: '2', label: 'new this week' },
  },
  {
    label: 'NGO Participation Rate',
    value: '82%',
    icon: Building2,
    trend: { up: true, value: '6%', label: 'vs last quarter' },
  },
]

const monthlyData = [
  { month: 'Oct', received: 380, resolved: 310 },
  { month: 'Nov', received: 420, resolved: 350 },
  { month: 'Dec', received: 500, resolved: 410 },
  { month: 'Jan', received: 460, resolved: 400 },
  { month: 'Feb', received: 540, resolved: 480 },
  { month: 'Mar', received: 620, resolved: 550 },
  { month: 'Apr', received: 710, resolved: 600 },
]

const categoryData = [
  { name: 'Food Distribution', value: 28, color: '#2D6A4F' },
  { name: 'Medical Assistance', value: 22, color: '#40916C' },
  { name: 'Education Support', value: 18, color: '#52B788' },
  { name: 'Shelter Assistance', value: 14, color: '#74C69D' },
  { name: 'Emergency Response', value: 10, color: '#95D5B2' },
  { name: 'Other Services', value: 8, color: '#B7E4C7' },
]

const volunteerDistribution = [
  { district: 'Patna', volunteers: 280 },
  { district: 'Gaya', volunteers: 185 },
  { district: 'Muzaff.', volunteers: 162 },
  { district: 'Nalanda', volunteers: 134 },
  { district: 'Bhagalpur', volunteers: 118 },
  { district: 'Darbhanga', volunteers: 97 },
  { district: 'Rohtas', volunteers: 88 },
]

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-card">
        <p className="font-semibold text-green-800 text-sm mb-1">{label}</p>
        {payload.map((p) => (
          <p key={p.name} className="text-xs text-gray-600">
            <span className="font-medium" style={{ color: p.color }}>{p.name}:</span>{' '}
            {typeof p.value === 'number' ? p.value.toLocaleString() : p.value}
          </p>
        ))}
      </div>
    )
  }
  return null
}

const PieCustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-card">
        <p className="font-semibold text-green-800 text-sm">{payload[0].name}</p>
        <p className="text-xs text-gray-500">{payload[0].value}% of total</p>
      </div>
    )
  }
  return null
}

export default function Statistics() {
  return (
    <div className="pt-16 md:pt-[68px]">

      {/* ===== PAGE HEADER ===== */}
      <section className="bg-green-800 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="text-green-300 font-semibold text-sm uppercase tracking-widest mb-3 inline-block">Data Intelligence</span>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Platform Statistics</h1>
          <p className="text-green-200 text-lg max-w-2xl">
            Real-time insights into community needs, volunteer deployment, and resource allocation across all active districts.
          </p>
        </div>
      </section>

      {/* ===== KPI CARDS ===== */}
      <section className="py-12 bg-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {kpiCards.map((card) => (
              <StatCard key={card.label} {...card} />
            ))}
          </div>
        </div>
      </section>

      {/* ===== CHARTS ===== */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

          {/* Monthly Requests — Line Chart */}
          <div className="card p-6 border border-gray-100">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="font-semibold text-green-800 text-lg">Monthly Service Requests</h2>
                <p className="text-gray-400 text-sm mt-0.5">Received vs Resolved — last 7 months</p>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-green-700 inline-block" />Received</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-green-400 inline-block" />Resolved</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={monthlyData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0fdf4" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone" dataKey="received" name="Received"
                  stroke="#2D6A4F" strokeWidth={2.5} dot={{ r: 4, fill: '#2D6A4F' }} activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone" dataKey="resolved" name="Resolved"
                  stroke="#74C69D" strokeWidth={2.5} dot={{ r: 4, fill: '#74C69D' }} activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Bottom row: Pie + Bar */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* Resource Allocation — Pie Chart */}
            <div className="card p-6 border border-gray-100">
              <div className="mb-6">
                <h2 className="font-semibold text-green-800 text-lg">Resource Allocation by Category</h2>
                <p className="text-gray-400 text-sm mt-0.5">Percentage share of total service requests</p>
              </div>
              <div className="flex flex-col md:flex-row items-center gap-6">
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%" cy="50%"
                      innerRadius={60} outerRadius={95}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<PieCustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 min-w-[160px]">
                  {categoryData.map((cat) => (
                    <div key={cat.name} className="flex items-center gap-2.5">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                      <span className="text-gray-600 text-xs">{cat.name}</span>
                      <span className="ml-auto text-xs font-semibold text-green-700">{cat.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Volunteer Distribution — Bar Chart */}
            <div className="card p-6 border border-gray-100">
              <div className="mb-6">
                <h2 className="font-semibold text-green-800 text-lg">Volunteer Distribution</h2>
                <p className="text-gray-400 text-sm mt-0.5">Active volunteers per district</p>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={volunteerDistribution} margin={{ top: 0, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0fdf4" vertical={false} />
                  <XAxis dataKey="district" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="volunteers" name="Volunteers" radius={[4, 4, 0, 0]}>
                    {volunteerDistribution.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={index % 2 === 0 ? '#2D6A4F' : '#52B788'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Urgent Need Heatmap Preview */}
          <div className="card p-6 border border-gray-100">
            <div className="mb-6">
              <h2 className="font-semibold text-green-800 text-lg">Urgent Need Heatmap Preview</h2>
              <p className="text-gray-400 text-sm mt-0.5">Priority zones requiring immediate volunteer deployment</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {[
                { zone: 'Patna Urban', level: 'critical', requests: 142 },
                { zone: 'Gaya Rural', level: 'high', requests: 98 },
                { zone: 'Muzaffarpur', level: 'high', requests: 87 },
                { zone: 'Nalanda', level: 'medium', requests: 63 },
                { zone: 'Bhagalpur', level: 'medium', requests: 54 },
                { zone: 'Darbhanga', level: 'low', requests: 41 },
                { zone: 'Rohtas', level: 'low', requests: 38 },
                { zone: 'Jamui', level: 'medium', requests: 56 },
                { zone: 'Sitamarhi', level: 'high', requests: 79 },
                { zone: 'Samastipur', level: 'low', requests: 30 },
                { zone: 'Begusarai', level: 'medium', requests: 45 },
                { zone: 'Vaishali', level: 'critical', requests: 115 },
              ].map((zone) => {
                const configs = {
                  critical: { bg: 'bg-green-800', text: 'text-white', badge: 'CRITICAL' },
                  high: { bg: 'bg-green-600', text: 'text-white', badge: 'HIGH' },
                  medium: { bg: 'bg-green-200', text: 'text-green-800', badge: 'MED' },
                  low: { bg: 'bg-green-50', text: 'text-green-600', badge: 'LOW' },
                }
                const c = configs[zone.level]
                return (
                  <div key={zone.zone} className={`${c.bg} ${c.text} rounded-xl p-3 text-center transition-transform duration-200 hover:scale-105 cursor-default`}>
                    <p className="text-[10px] font-bold tracking-wider opacity-70 mb-1">{c.badge}</p>
                    <p className="text-sm font-semibold leading-tight">{zone.zone}</p>
                    <p className="text-xl font-bold mt-1">{zone.requests}</p>
                    <p className="text-[10px] opacity-70 mt-0.5">pending</p>
                  </div>
                )
              })}
            </div>
            {/* Legend */}
            <div className="flex flex-wrap gap-5 mt-5 pt-4 border-t border-gray-100">
              {[
                { label: 'Critical (100+)', color: 'bg-green-800' },
                { label: 'High (75-99)', color: 'bg-green-600' },
                { label: 'Medium (40-74)', color: 'bg-green-200' },
                { label: 'Low (<40)', color: 'bg-green-50 border border-green-200' },
              ].map((l) => (
                <span key={l.label} className="flex items-center gap-2 text-xs text-gray-500">
                  <span className={`w-3 h-3 rounded ${l.color} inline-block`} />
                  {l.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
