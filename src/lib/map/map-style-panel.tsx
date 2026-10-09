import { Check, ChevronUp, Layers3 } from 'lucide-react'
import { useState } from 'react'
import type { MapTileStyle } from './styles'

const mapStyles = [
  { label: 'LIGHT', image: '/images/map/light.jpg', value: 'light' as const },
  { label: 'DARK', image: '/images/map/dark.jpg', value: 'dark' as const },
  {
    label: 'SATELLITE',
    image: '/images/map/satellite.jpg',
    value: 'satellite' as const,
  },
]

export function MapStylePanel({
  mapStyle,
  onStyleChange,
  onOpenChange,
  embedded = false,
}: {
  mapStyle: MapTileStyle
  onStyleChange: (value: MapTileStyle) => void
  onOpenChange?: (open: boolean) => void
  embedded?: boolean
}) {
  const [open, setOpen] = useState(false)
  const selectMapStyle = (value: MapTileStyle) => {
    onStyleChange(value)
    setOpen(false)
  }

  return (
    <div
      className={`group z-20 h-8 w-8 shrink-0 ${embedded ? 'relative' : 'absolute top-3 right-3 transition-[width] duration-300 hover:w-[370px] focus-within:w-[370px]'} ${!embedded && open ? 'w-[370px]' : ''}`}
      onMouseEnter={() => onOpenChange?.(true)}
      onMouseLeave={() => onOpenChange?.(false)}
      onFocus={() => onOpenChange?.(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget))
          onOpenChange?.(false)
      }}
    >
      <div
        className={`flex items-end gap-2 rounded-2xl bg-transparent ${embedded ? 'p-0' : 'p-1'}`}
      >
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-white p-0 text-slate-600 shadow-[0_3px_10px_rgba(44,77,128,0.18)] transition-opacity group-hover:opacity-0 group-focus-within:opacity-0 ${open ? 'opacity-0' : ''}`}
          aria-label="Mở kiểu bản đồ"
        >
          <Layers3 className="h-4 w-4" />
        </button>
        <div
          className={`absolute top-0 right-0 flex gap-2 rounded-2xl border border-slate-200 bg-white/90 p-2 shadow-[0_5px_16px_rgba(44,77,128,0.18)] backdrop-blur transition-all duration-200 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:translate-y-0 group-focus-within:opacity-100 ${open ? 'pointer-events-auto translate-y-0 opacity-100' : 'pointer-events-none translate-y-2 opacity-0'}`}
        >
          {mapStyles.map(({ label, value, image }) => {
            const selected = mapStyle === value
            return (
              <button
                key={label}
                type="button"
                onClick={() => selectMapStyle(value)}
                className={`relative h-[72px] w-[102px] shrink-0 overflow-hidden rounded-xl border bg-white p-1 transition-transform hover:-translate-y-0.5 ${selected ? 'border-blue-500' : 'border-white'}`}
              >
                <span className="relative block h-full w-full overflow-hidden rounded-lg">
                  <img
                    src={image}
                    alt={`${label} map style`}
                    className="block h-full w-full object-cover"
                  />
                  <span className="relative top-[45px] mx-auto flex w-fit items-center whitespace-nowrap rounded-md bg-white/95 px-2 py-0.5 text-[10px] font-semibold text-[#344052] shadow-sm">
                    {label}
                  </span>
                </span>
                {selected && (
                  <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-white">
                    <Check className="h-2.5 w-2.5" />
                  </span>
                )}
              </button>
            )
          })}
        </div>
        <span
          className={`pointer-events-none absolute top-[86px] right-0 w-full items-center justify-center gap-1 whitespace-nowrap text-[10px] text-slate-600 group-hover:flex ${open ? 'flex' : 'hidden'}`}
        >
          <ChevronUp className="h-3 w-3" /> Click để chọn kiểu bản đồ
        </span>
      </div>
    </div>
  )
}
