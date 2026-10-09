import { api } from '@/lib/apiClient'
import type { Channel, Packet, ServiceCode } from './types'

export type DataKind =
  | 'devices'
  | 'bulletins'
  | 'playlists'
  | 'commands'
  | 'notifications'
export type ConfigurationInput = {
  serviceCode: ServiceCode
  name: string
  description: string
  enabled: boolean
  requestPacket: Packet
  responsePacket: Packet
  revision?: number
}
export type ServiceConfiguration = ConfigurationInput & {
  id: string
  revision: number
  createdAt: string
  updatedAt: string
}
export type BusinessRecord = {
  id: string
  channel?: Channel
  externalId?: string
  name?: string
  title?: string
  body?: string
  severity?: string
  readAt?: string | null
  serviceCode?: ServiceCode
  payload?: Packet
  status?: Packet
  state?: string
  revision?: number
  createdAt: string
  updatedAt: string
}
export type BusinessInput = {
  channel?: Channel
  packet?: Packet
  revision?: number
  serviceCode?: ServiceCode
  title?: string
  body?: string
  severity?: string
  read?: boolean
}
export type Result<T> = { items: T[]; total: number; limit: number }
export const sourceCrud = {
  configurations: () =>
    api.get<Result<ServiceConfiguration>>(
      '/integration/service-configurations',
    ),
  configuration: (id: string) =>
    api.get<ServiceConfiguration>(`/integration/service-configurations/${id}`),
  saveConfiguration: (input: ConfigurationInput, id?: string) =>
    id
      ? api.patch<ServiceConfiguration>(
          `/integration/service-configurations/${id}`,
          input,
        )
      : api.post<ServiceConfiguration>(
          '/integration/service-configurations',
          input,
        ),
  deleteConfiguration: (id: string) =>
    api.delete<{ deleted: boolean }>(
      `/integration/service-configurations/${id}`,
    ),
  list: (kind: DataKind) =>
    api.get<Result<BusinessRecord>>(`/integration/data/${kind}`),
  detail: (kind: DataKind, id: string) =>
    api.get<BusinessRecord>(`/integration/data/${kind}/${id}`),
  save: (kind: DataKind, input: BusinessInput, id?: string) =>
    id
      ? api.patch<BusinessRecord>(`/integration/data/${kind}/${id}`, input)
      : api.post<BusinessRecord>(`/integration/data/${kind}`, input),
  remove: (kind: DataKind, id: string) =>
    api.delete<{ deleted: boolean }>(`/integration/data/${kind}/${id}`),
}
