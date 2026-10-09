import axios from 'axios'
import { api, apiClient } from '@/lib/apiClient'
import type {
  Packet,
  ProtocolResponse,
  ServiceCode,
  ServiceDefinition,
  Workspace,
} from './types'

export const SERVICE_PATHS: Record<ServiceCode, string> = {
  DV001: '/oauth/token',
  DV002: '/thongtinnguon/ipradio/playlist',
  DV003: '/thongtinnguon/liveIpradio',
  DV004: '/thongtinnguon/ipradio/delete/playlist',
  DV005: '/device/ipradio/log',
  DV006: '/device/ipradio/playlist',
  DV007: '/device/ipradio/delete/playlist',
  DV008: '/device/ipradio/status/add',
  DV009: '/thongtinnguon/ipradio/control',
  DV010: '/thongtinnguon/digitalsignage/playlist',
  DV011: '/thongtinnguon/liveDigitalsignage',
  DV012: '/thongtinnguon/digitalsignage/delete/playlist',
  DV013: '/device/digitalsignage/log',
  DV014: '/device/digitalsignage/playlist',
  DV015: '/device/digitalsignage/delete/playlist',
  DV016: '/device/digitalsignage/status/add',
  DV017: '/thongtinnguon/digitalsignage/control',
  DV018: '/mqtt/dangkythietbi',
  DV019: '/device/ipradio/getplaylist',
  DV020: '/device/digital/getplaylist',
}

export async function executeService<T = unknown>(
  code: ServiceCode,
  payload: Packet,
  idempotencyKey?: string,
): Promise<ProtocolResponse<T>> {
  const { data } = await apiClient.post<ProtocolResponse<T>>(
    SERVICE_PATHS[code],
    payload,
    {
      headers: idempotencyKey
        ? { 'Idempotency-Key': idempotencyKey }
        : undefined,
    },
  )
  if (data.SendStatus !== 0) throw new Error(data.Description)
  return data
}

export const informationSourceService = {
  catalog: () => api.get<ServiceDefinition[]>('/integration/services'),
  workspace: () => api.get<Workspace>('/integration/workspace'),
  markRead: (id: string) =>
    api.patch<{ id: string; read: boolean }>(
      `/integration/notifications/${id}/read`,
    ),
  execute: executeService,
  dv001: <T = unknown>(payload: Packet) => executeService<T>('DV001', payload),
  dv002: (payload: Packet) => executeService('DV002', payload),
  dv003: (payload: Packet) => executeService('DV003', payload),
  dv004: (payload: Packet) => executeService('DV004', payload),
  dv005: (payload: Packet) => executeService('DV005', payload),
  dv006: (payload: Packet) => executeService('DV006', payload),
  dv007: (payload: Packet) => executeService('DV007', payload),
  dv008: (payload: Packet) => executeService('DV008', payload),
  dv009: (payload: Packet) => executeService('DV009', payload),
  dv010: (payload: Packet) => executeService('DV010', payload),
  dv011: (payload: Packet) => executeService('DV011', payload),
  dv012: (payload: Packet) => executeService('DV012', payload),
  dv013: (payload: Packet) => executeService('DV013', payload),
  dv014: (payload: Packet) => executeService('DV014', payload),
  dv015: (payload: Packet) => executeService('DV015', payload),
  dv016: (payload: Packet) => executeService('DV016', payload),
  dv017: (payload: Packet) => executeService('DV017', payload),
  dv018: (payload: Packet) => executeService('DV018', payload),
  dv019: (payload: Packet) => executeService('DV019', payload),
  dv020: (payload: Packet) => executeService('DV020', payload),
}

export function protocolError(error: unknown) {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | (Partial<ProtocolResponse> & { message?: string | string[] })
      | undefined
    return (
      data?.Errors?.map(
        (item) => `${item.Field ? `${item.Field}: ` : ''}${item.Description}`,
      ).join('; ') ||
      data?.Description ||
      (Array.isArray(data?.message)
        ? data.message.join('; ')
        : data?.message) ||
      error.message
    )
  }
  return error instanceof Error
    ? error.message
    : 'Không thể kết nối đến hệ thống'
}

export function redactTokens(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(redactTokens)
  if (value && typeof value === 'object')
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        /token|password/i.test(key) ? '[đã ẩn]' : redactTokens(item),
      ]),
    )
  return value
}
