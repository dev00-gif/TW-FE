import { useState } from 'react'
import type { ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
import {
  RefreshCw,
  Radio,
  Monitor,
  ChevronRight,
  AlertCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { protocolError, redactTokens } from './service'
import { useWorkspace } from './hooks'
import type { Channel } from './types'

export function SourcePage({
  title,
  description,
  children,
  actions,
}: {
  title: string
  description: string
  children: ReactNode
  actions?: ReactNode
}) {
  const workspace = useWorkspace()
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-1 text-sm text-muted-foreground">
            <Link to="/dashboard">Thông tin nguồn</Link>
            <ChevronRight size={14} />
            <span>{title}</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
            {description}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {actions}
          <Button
            variant="outline"
            onClick={() => void workspace.refetch()}
            disabled={workspace.isFetching}
          >
            <RefreshCw size={16} /> Làm mới
          </Button>
        </div>
      </div>
      {workspace.isError && (
        <div
          role="alert"
          className="flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
        >
          <AlertCircle size={18} />
          <span>{protocolError(workspace.error)}</span>
        </div>
      )}
      {workspace.isPending ? (
        <div
          role="status"
          className="rounded-xl border p-10 text-center text-muted-foreground"
        >
          Đang lấy dữ liệu từ hệ thống…
        </div>
      ) : (
        children
      )}
    </div>
  )
}

export function ChannelBadge({ channel }: { channel: Channel }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${channel === 'radio' ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-200' : 'bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-200'}`}
    >
      {channel === 'radio' ? <Radio size={12} /> : <Monitor size={12} />}{' '}
      {channel === 'radio' ? 'Phát thanh' : 'Bảng điện tử'}
    </span>
  )
}

const states: Record<string, string> = {
  scheduled: 'Đã tạo lịch',
  emergency: 'Khẩn cấp',
  queued: 'Chờ đồng bộ',
  received: 'Đã nhận lịch',
  playing: 'Đã báo bắt đầu phát',
  cancel_requested: 'Chờ xác nhận hủy',
  cancelled: 'Đã hủy',
  pending: 'Chờ xác nhận',
}
export function StateBadge({ state }: { state: string }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${state === 'emergency' ? 'bg-red-100 text-red-700' : state === 'cancelled' ? 'bg-slate-100 text-slate-600' : 'bg-amber-50 text-amber-800'}`}
    >
      {states[state] ?? state}
    </span>
  )
}
export function Empty({
  children = 'Chưa có dữ liệu. Chạy giả lập kết nối để nhận bản tin đầu tiên.',
}: {
  children?: ReactNode
}) {
  return (
    <div className="rounded-xl border border-dashed p-12 text-center text-sm text-muted-foreground">
      {children}
    </div>
  )
}
export function Card({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={`rounded-xl border bg-card p-5 shadow-sm ${className}`}>
      {children}
    </div>
  )
}
export function dateTime(value: string | null | undefined) {
  return value
    ? new Date(value).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })
    : '—'
}
export function JsonDetails({
  value,
  title = 'Chi tiết gói tin',
  label = 'Xem gói tin',
}: {
  value: unknown
  title?: string
  label?: string
}) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
        {label}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] overflow-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          <pre className="whitespace-pre-wrap break-all rounded-lg bg-muted p-4 font-mono text-xs leading-6">
            {JSON.stringify(redactTokens(value), null, 2)}
          </pre>
        </DialogContent>
      </Dialog>
    </>
  )
}

export function FilterBar({
  search,
  onSearch,
  channel,
  onChannel,
}: {
  search: string
  onSearch: (value: string) => void
  channel: string
  onChannel: (value: string) => void
}) {
  return (
    <div className="flex flex-wrap gap-3">
      <input
        aria-label="Tìm kiếm"
        placeholder="Tìm tên, mã hoặc nội dung…"
        className="min-w-60 flex-1 rounded-lg border bg-background px-3 py-2 text-sm"
        value={search}
        onChange={(event) => onSearch(event.target.value)}
      />
      <select
        aria-label="Lọc kênh"
        className="rounded-lg border bg-background px-3 py-2 text-sm"
        value={channel}
        onChange={(event) => onChannel(event.target.value)}
      >
        <option value="all">Tất cả kênh</option>
        <option value="radio">Phát thanh</option>
        <option value="signage">Bảng điện tử</option>
      </select>
    </div>
  )
}

export function DataTable({
  headers,
  children,
  rows,
}: {
  headers: string[]
  children?: ReactNode
  rows?: ReactNode[][]
}) {
  return (
    <div className="overflow-x-auto rounded-xl border bg-card">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="bg-muted/50 text-xs text-muted-foreground">
          <tr>
            {headers.map((header) => (
              <th key={header} className="px-4 py-3 font-medium">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y [&_td]:px-4 [&_td]:py-4">
          {rows
            ? rows.map((row, index) => (
                <tr key={index}>
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex}>{cell}</td>
                  ))}
                </tr>
              ))
            : children}
        </tbody>
      </table>
    </div>
  )
}
