import { Camera, MonitorPlay } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { DeviceType } from '../types'

export function DeviceIllustration({
  type,
  className = '',
}: {
  type: DeviceType
  className?: string
}) {
  const { t } = useTranslation('adminDevices')
  if (type !== 'speaker') {
    const Icon = type === 'display' ? MonitorPlay : Camera
    return (
      <div
        className={`grid place-items-center bg-gradient-to-br from-slate-100 to-blue-50 text-slate-500 dark:from-slate-800 dark:to-slate-900 ${className}`}
      >
        <Icon className="size-20" aria-hidden="true" />
      </div>
    )
  }
  return (
    <div
      className={`grid place-items-center bg-gradient-to-br from-slate-100 to-blue-50 dark:from-slate-800 dark:to-slate-900 ${className}`}
    >
      <svg
        viewBox="0 0 240 230"
        role="img"
        aria-label={t(`types.${type}`)}
        className="h-full max-h-60 w-full max-w-60 drop-shadow-lg"
      >
        <defs>
          <linearGradient id="deviceFront" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#d4d9de" />
            <stop offset="0.6" stopColor="#858e99" />
            <stop offset="1" stopColor="#59636e" />
          </linearGradient>
          <linearGradient id="deviceSide" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#777f89" />
            <stop offset="1" stopColor="#3f4852" />
          </linearGradient>
          <linearGradient id="horn" x1="0" y1="0" x2="1" y2="0">
            <stop stopColor="#bdc4ca" />
            <stop offset="0.6" stopColor="#6d7781" />
            <stop offset="1" stopColor="#d9dee2" />
          </linearGradient>
          <pattern
            id="vents"
            width="7"
            height="7"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="3" cy="3" r="1.25" fill="#434d58" />
          </pattern>
        </defs>
        <ellipse
          cx="122"
          cy="212"
          rx="86"
          ry="10"
          fill="#7c8897"
          opacity="0.17"
        />
        <path
          d="M74 35 101 21 171 28 149 42Z"
          fill="#eef1f2"
          stroke="#88919b"
          strokeWidth="2"
        />
        <path
          d="M149 42 171 28 174 186 149 200Z"
          fill="url(#deviceSide)"
          stroke="#53606c"
          strokeWidth="2"
        />
        <path
          d="M74 35 149 42 149 200 74 190Z"
          fill="url(#deviceFront)"
          stroke="#66717c"
          strokeWidth="2"
        />
        <path
          d="M82 48 137 53 137 128 82 123Z"
          fill="url(#vents)"
          stroke="#68727c"
          strokeWidth="1.5"
        />
        <path
          d="M82 139 137 143 137 182 82 178Z"
          fill="url(#vents)"
          stroke="#68727c"
          strokeWidth="1.5"
        />
        <path
          d="M155 56 167 51 167 122 155 126Z"
          fill="url(#vents)"
          opacity="0.75"
        />
        <path
          d="M155 139 168 133 169 175 155 182Z"
          fill="url(#vents)"
          opacity="0.75"
        />
        <path
          d="M78 127 48 136 47 151 81 148Z"
          fill="#69747e"
          stroke="#4d5862"
          strokeWidth="2"
        />
        <path
          d="M46 131 20 119 18 160 47 154Z"
          fill="url(#horn)"
          stroke="#64707b"
          strokeWidth="2"
        />
        <ellipse
          cx="20"
          cy="140"
          rx="9"
          ry="21"
          fill="#46515c"
          stroke="#c6cdd3"
          strokeWidth="3"
        />
        <ellipse cx="21" cy="140" rx="4" ry="12" fill="#747f89" />
        <path
          d="M170 130 198 138 199 151 169 149Z"
          fill="#68737e"
          stroke="#4d5862"
          strokeWidth="2"
        />
        <path
          d="M199 134 224 120 228 160 200 154Z"
          fill="url(#horn)"
          stroke="#64707b"
          strokeWidth="2"
        />
        <ellipse
          cx="226"
          cy="140"
          rx="9"
          ry="21"
          fill="#59646f"
          stroke="#c6cdd3"
          strokeWidth="3"
        />
        <ellipse cx="225" cy="140" rx="4" ry="12" fill="#828c96" />
        <rect
          x="101"
          y="129"
          width="13"
          height="9"
          rx="2"
          fill="#364452"
          stroke="#b8c2ca"
        />
        <circle cx="109" cy="158" r="3" fill="#283542" />
        <path
          d="M110 24 118 11 127 25"
          fill="none"
          stroke="#828d98"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
    </div>
  )
}
