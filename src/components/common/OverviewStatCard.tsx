type OverviewStatCardProps = {
  title: string
  value: number
  note: string
  icon?: React.ReactNode
  tone: string
  showIcon?: boolean
}

export default function OverviewStatCard({
  title,
  value,
  note,
  icon,
  tone,
  showIcon = false,
}: OverviewStatCardProps) {
  return (
    <div className="flex min-w-0 items-center rounded-xl border border-border bg-card px-5 py-5 text-card-foreground shadow-[0_2px_8px_rgba(20,45,90,0.02)]">
      {showIcon && (
        <div
          className={`mr-4 flex h-14 w-14 shrink-0 items-center justify-center rounded-full ${tone}`}
        >
          {icon}
        </div>
      )}
      <div className="min-w-0">
        <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
          {title}
        </p>
        <p className="mt-1 text-2xl font-bold leading-none text-foreground">
          {value}
        </p>
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          {note}
        </p>
      </div>
    </div>
  )
}
