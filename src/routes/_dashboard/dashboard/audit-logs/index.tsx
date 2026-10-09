import { createFileRoute } from '@tanstack/react-router'
import AuditLogsPage from '@/features/admin/audit/pages'
import { requirePermission } from '@/features/auth/guards/requirePermission'

export const Route = createFileRoute('/_dashboard/dashboard/audit-logs/')({
  beforeLoad: ({ context }) =>
    requirePermission('system.audit_log.view', context.queryClient),
  head: () => ({ meta: [{ title: 'Nhật ký hoạt động' }] }),
  component: AuditLogsPage,
})
