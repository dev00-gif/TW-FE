import { api } from '@/lib/apiClient'

export type AuditAction =
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'STATUS_CHANGE'
  | 'PUBLISH'
  | 'UNPUBLISH'
  | 'ASSIGN'
  | 'UNASSIGN'
  | 'LOGIN'
  | 'LOGOUT'
export type AuditListInput = {
  page: number
  limit: number
  search?: string
  module?: string
  action?: AuditAction
  actorUserId?: string
  from?: string
  to?: string
}
export type AuditListResult = {
  items: Array<{
    id: string
    actorUserId: string | null
    action: AuditAction
    module: string
    resource: string
    entityType: string
    entityId: string | null
    createdAt: string
    actor: { id: string; name: string } | null
    entity: { id: string; name: string } | null
  }>
  meta: { page: number; limit: number; total: number; totalPages: number }
}
export const auditService = {
  list: (input: AuditListInput) =>
    api.get<AuditListResult>('/audit-logs', input),
}
