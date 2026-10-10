import englishFields from './data/english-fields.json'
import type { Packet } from './types'

const vietnameseFields = Object.fromEntries(
  Object.entries(englishFields).map(([vietnamese, english]) => [
    english,
    vietnamese,
  ]),
)

function translateFields(
  value: unknown,
  names: Record<string, string>,
): unknown {
  if (Array.isArray(value))
    return value.map((item) => translateFields(item, names))
  if (!value || typeof value !== 'object') return value

  const seen = new Set<string>()
  return Object.fromEntries(
    Object.entries(value).map(([key, child]) => {
      const name = Object.hasOwn(names, key.trim()) ? names[key.trim()] : key
      if (seen.has(name))
        throw new Error(`Tên trường bị trùng sau khi chuyển đổi: ${name}`)
      seen.add(name)
      return [name, translateFields(child, names)]
    }),
  )
}

/** Use Appendix 4 field names in the request editor. */
export const toVietnamesePacket = (packet: Packet): Packet =>
  translateFields(packet, vietnameseFields) as Packet

/** Restore the English API contract before generating IDs and sending. */
export const toEnglishPacket = (packet: Packet): Packet =>
  translateFields(packet, englishFields) as Packet
