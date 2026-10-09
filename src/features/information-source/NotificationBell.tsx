import { Bell } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { usePermission } from '@/features/auth/hooks/usePermission'
import { useReadNotification, useWorkspace } from './hooks'
import { dateTime } from './components'

export function NotificationBell() {
  const allowed = usePermission('integration.gateway.view')
  const workspace = useWorkspace()
  const read = useReadNotification()
  if (!allowed) return null
  const count = workspace.data?.counts.unread ?? 0
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative rounded-full"
          aria-label={`Thông báo, ${count} chưa đọc`}
        >
          <Bell size={20} />
          {count > 0 && (
            <span className="absolute -right-1 -top-1 rounded-full bg-red-500 px-1.5 text-[10px] font-semibold text-white">
              {count > 99 ? '99+' : count}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-3">
        <div className="mb-3 flex justify-between text-sm font-semibold">
          <span>Thông báo</span>
          <span className="text-primary">{count} chưa đọc</span>
        </div>
        <div className="max-h-80 overflow-y-auto">
          {workspace.isError ? (
            <p className="p-3 text-sm text-red-600">
              Không thể tải thông báo. Mở trang thông báo để thử lại.
            </p>
          ) : workspace.data?.notifications.length ? (
            workspace.data.notifications.slice(0, 6).map((item) => (
              <button
                key={item.id}
                className="w-full rounded-lg p-3 text-left hover:bg-muted disabled:opacity-60"
                disabled={read.isPending}
                onClick={() => {
                  if (!item.readAt) read.mutate(item.id)
                }}
              >
                <p className="text-sm font-medium">
                  {!item.readAt && (
                    <span className="mr-2 inline-block h-2 w-2 rounded-full bg-primary" />
                  )}
                  {item.title}
                </p>
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                  {item.body}
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {dateTime(item.createdAt)}
                </p>
              </button>
            ))
          ) : (
            <p className="p-4 text-sm text-muted-foreground">
              Chưa có thông báo.
            </p>
          )}
        </div>
        {read.isError && (
          <p className="p-2 text-xs text-red-600">
            Chưa đánh dấu được thông báo. Thử lại.
          </p>
        )}
        <Button asChild variant="outline" className="mt-2 w-full">
          <Link to="/dashboard/notifications">Xem tất cả thông báo</Link>
        </Button>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
