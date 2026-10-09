import { useQuery } from '@tanstack/react-query'
import { auditService } from '../services/auditService'
import type { AuditListInput } from '../services/auditService'

export const auditQueryKeys = {
  all: ['admin', 'audit-logs'] as const,
  list: (input: AuditListInput) => [...auditQueryKeys.all, input] as const,
}

export function useAuditLogs(input: AuditListInput) {
  return useQuery({
    queryKey: auditQueryKeys.list(input),
    queryFn: () => auditService.list(input),
    placeholderData: (previous) => previous,
  })
}
