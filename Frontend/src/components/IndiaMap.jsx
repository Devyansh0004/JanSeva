import { useState } from 'react'
import { MapPin, Users, Award } from 'lucide-react'

const latLngToSvg = (lat, lng) => {
  const x = ((lng - 68) / (97 - 68)) * 440 + 30
  const y = ((37 - lat) / (37 - 8)) * 540 + 30
  return { x, y }
}

const INDIA_PATH = `M 230 45 C 240 40, 260 35, 270 40 L 290 50 C 300 48, 310 50, 320 55
  L 340 65 C 350 60, 360 58, 370 62 L 385 70 C 395 68, 405 72, 410 80
  L 420 95 C 425 105, 430 115, 425 130 L 420 150 C 425 160, 430 170, 428 185
  L 425 200 C 430 210, 435 225, 430 240 L 420 260 C 415 275, 405 290, 395 305
  L 380 320 C 370 335, 355 350, 340 365 L 320 380 C 305 395, 285 410, 270 425
  L 255 440 C 245 450, 235 460, 225 465 L 210 470 C 200 468, 185 460, 175 450
  L 160 435 C 150 420, 140 405, 135 390 L 130 370 C 125 355, 118 340, 115 325
  L 110 305 C 105 285, 100 265, 98 250 L 95 230 C 90 215, 88 195, 90 180
  L 95 160 C 100 145, 105 130, 115 118 L 130 105 C 140 95, 150 88, 165 80
  L 180 70 C 195 62, 210 55, 230 45 Z`

const STATE_REGIONS = [
  { name: 'Rajasthan', path: 'M 95 130 L 130 105 L 175 100 L 195 130 L 185 170 L 145 185 L 100 170 Z', color: '#B7E4C7' },
  { name: 'Maharashtra', path: 'M 100 250 L 145 230 L 195 235 L 220 270 L 205 310 L 160 320 L 115 300 Z', color: '#95D5B2' },
  { name: 'Uttar Pradesh', path: 'M 175 100 L 230 85 L 290 95 L 300 130 L 265 155 L 195 145 L 185 120 Z', color: '#D8F3DC' },
  { name: 'Madhya Pradesh', path: 'M 145 185 L 195 170 L 260 175 L 270 210 L 230 235 L 165 230 Z', color: '#74C69D' },
  { name: 'Karnataka', path: 'M 155 330 L 200 315 L 225 340 L 215 380 L 175 395 L 150 370 Z', color: '#52B788' },
  { name: 'Tamil Nadu', path: 'M 215 380 L 250 365 L 270 400 L 255 440 L 225 445 L 200 420 Z', color: '#B7E4C7' },
  { name: 'Gujarat', path: 'M 80 180 L 130 170 L 145 210 L 125 245 L 85 240 L 75 210 Z', color: '#D8F3DC' },
  { name: 'Bihar', path: 'M 300 130 L 340 120 L 365 140 L 355 170 L 320 175 L 300 155 Z', color: '#95D5B2' },
  { name: 'West Bengal', path: 'M 340 140 L 380 130 L 395 165 L 380 210 L 350 215 L 340 180 Z', color: '#74C69D' },
  { name: 'Kerala', path: 'M 175 400 L 200 415 L 210 450 L 195 465 L 175 455 L 165 430 Z', color: '#52B788' },
]

export default function IndiaMap({ ngoLocations = [] }) {
  const [activePin, setActivePin] = useState(null)
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 })

  const handlePinHover = (ngo, svgPos) => {
    setActivePin(ngo)
    setTooltipPos(svgPos)
  }

  const getContribColor = (level) => {
    switch (level) {
      case 'Critical':
        return '#9D4EDD'
      case 'High':
        return '#4CC9F0'
      case 'Medium':
        return '#40916C'
      default:
        return '#52B788'
    }
  }

  return (
    <div className="relative w-full">
      <svg
        viewBox="0 0 480 520"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto"
        style={{ filter: 'drop-shadow(0 18px 30px rgba(45, 106, 79, 0.12))' }}
      >
        <defs>
          <linearGradient id="mapBg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F6FCF7" stopOpacity="1" />
            <stop offset="100%" stopColor="#D8F3DC" stopOpacity="0.95" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <rect x="18" y="18" width="444" height="484" rx="28" fill="url(#mapBg)" />

        {STATE_REGIONS.map((region) => (
          <path
            key={region.name}
            d={region.path}
            fill={region.color}
            fillOpacity="0.55"
            stroke="#40916C"
            strokeWidth="0.5"
            strokeOpacity="0.22"
          />
        ))}

        <path
          d={INDIA_PATH}
          fill="none"
          stroke="#2D6A4F"
          strokeWidth="2"
          strokeLinejoin="round"
          opacity="0.65"
        />

        {Array.from({ length: 12 }).map((_, row) =>
          Array.from({ length: 10 }).map((_, col) => (
            <circle
              key={`dot-${row}-${col}`}
              cx={60 + col * 38}
              cy={50 + row * 40}
              r="0.8"
              fill="#2D6A4F"
              opacity="0.08"
            />
          )),
        )}

        {ngoLocations.map((ngo, idx) => {
          const pos = latLngToSvg(ngo.coordinates?.lat || 20, ngo.coordinates?.lng || 78)
          const isActive = activePin?._id === ngo._id
          const pinColor = getContribColor(ngo.contributionLevel)

          return (
            <g
              key={ngo._id || idx}
              className="map-pin"
              onMouseEnter={() => handlePinHover(ngo, pos)}
              onMouseLeave={() => setActivePin(null)}
              onClick={() => handlePinHover(ngo, pos)}
            >
              <circle
                cx={pos.x}
                cy={pos.y}
                r={isActive ? 14 : 8}
                fill={pinColor}
                opacity={isActive ? 0.2 : 0.15}
              />
              <circle
                cx={pos.x}
                cy={pos.y}
                r={isActive ? 7 : 5}
                fill={pinColor}
                stroke="#ffffff"
                strokeWidth="2"
                filter={isActive ? 'url(#glow)' : 'none'}
                style={{
                  transition: 'all 0.2s ease',
                  transform: isActive ? 'scale(1.2)' : 'scale(1)',
                  transformOrigin: `${pos.x}px ${pos.y}px`,
                }}
              />
              <circle cx={pos.x} cy={pos.y} r="2" fill="#ffffff" opacity="0.9" />
            </g>
          )
        })}

        <g transform="translate(10, 470)">
          <rect x="0" y="0" width="188" height="44" rx="12" fill="white" fillOpacity="0.96" stroke="#B7E4C7" strokeWidth="1" />
          {[
            { label: 'Critical', color: '#9D4EDD' },
            { label: 'High', color: '#4CC9F0' },
            { label: 'Medium', color: '#40916C' },
            { label: 'Low', color: '#52B788' },
          ].map((item, i) => (
            <g key={item.label} transform={`translate(${12 + i * 42}, 14)`}>
              <circle cx="5" cy="5" r="4" fill={item.color} />
              <text x="13" y="9" fontSize="7" fill="#1B4332" fontFamily="Manrope">{item.label}</text>
            </g>
          ))}
          <text x="12" y="38" fontSize="6.5" fill="#5F7F72" fontFamily="Manrope">Contribution Level</text>
        </g>
      </svg>

      {activePin && (
        <div
          className="pointer-events-none absolute z-50"
          style={{
            left: `${(tooltipPos.x / 480) * 100}%`,
            top: `${(tooltipPos.y / 520) * 100 - 2}%`,
            transform: 'translate(-50%, -100%)',
          }}
        >
          <div className="glass-card pointer-events-auto min-w-[220px] p-4" style={{ boxShadow: '0 20px 40px rgba(27, 67, 50, 0.16)' }}>
            <div className="mb-2 flex items-start justify-between gap-2">
              <h4 className="text-sm font-bold leading-tight" style={{ color: 'var(--green-8)' }}>{activePin.name}</h4>
              {activePin.isVerified && (
                <span className="shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-bold" style={{ background: '#D8F3DC', color: '#2D6A4F' }}>
                  Verified
                </span>
              )}
            </div>
            <div className="mb-2 flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
              <MapPin size={11} />
              <span>{activePin.city}, {activePin.state}</span>
            </div>
            <div className="mb-2 grid grid-cols-2 gap-2">
              <div className="rounded-xl p-2 text-center" style={{ background: 'rgba(216, 243, 220, 0.5)' }}>
                <Users size={12} className="mx-auto mb-0.5" style={{ color: 'var(--green-6)' }} />
                <p className="text-xs font-bold" style={{ color: 'var(--green-8)' }}>{activePin.volunteerCount}</p>
                <p className="text-[9px]" style={{ color: 'var(--text-soft)' }}>Volunteers</p>
              </div>
              <div className="rounded-xl p-2 text-center" style={{ background: 'rgba(76, 201, 240, 0.12)' }}>
                <Award size={12} className="mx-auto mb-0.5" style={{ color: 'var(--blue-accent)' }} />
                <p className="text-xs font-bold" style={{ color: 'var(--green-8)' }}>{activePin.impactScore}</p>
                <p className="text-[9px]" style={{ color: 'var(--text-soft)' }}>Impact Score</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1">
              {activePin.focusAreas?.map((area) => (
                <span
                  key={area}
                  className="rounded-full px-2 py-0.5 text-[9px] font-medium"
                  style={{ backgroundColor: 'rgba(64,145,108,0.08)', color: '#2D6A4F' }}
                >
                  {area}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
