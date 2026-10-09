import type { SelectHTMLAttributes } from 'react'

type FilterSelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string
  options: Array<string | { value: string; label: string }>
}

export function FilterSelect({
  label,
  options,
  className,
  ...props
}: FilterSelectProps) {
  return (
    <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
      <span className="whitespace-nowrap">{label}</span>
      <span className="relative inline-block shrink-0">
        <select
          {...props}
          className={`h-10 w-[160px] appearance-none rounded-lg border border-input bg-background px-3 pr-11 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 ${className ?? ''}`}
        >
          {options.map((option) => {
            const value = typeof option === 'string' ? option : option.value
            const optionLabel =
              typeof option === 'string' ? option : option.label
            return (
              <option key={value} value={value}>
                {optionLabel}
              </option>
            )
          })}
        </select>
      </span>
    </label>
  )
}
