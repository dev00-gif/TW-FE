import { asPackets, bulletinKey, field } from './types'
import type { Packet, ServiceCode } from './types'

export const createsBulletins = (code: ServiceCode) =>
  ['DV002', 'DV003', 'DV010', 'DV011'].includes(code)

/** Generate new content identities while retaining the selected devices and content. */
export function newBulletinRequest(code: ServiceCode, input: Packet): Packet {
  const packet = structuredClone(input)
  if (!createsBulletins(code)) return packet
  const key = bulletinKey(
    code === 'DV002' || code === 'DV003' ? 'radio' : 'signage',
  )
  const ids = new Map<string, string>()
  const renew = (bulletin: Packet) => {
    const old = field(bulletin, key)
    if (!ids.has(old)) ids.set(old, `UI-BULLETIN-${crypto.randomUUID()}`)
    bulletin[key] = ids.get(old)
  }
  packet.PlaylistID = `UI-PLAYLIST-${crypto.randomUUID()}`
  if (packet[key] !== undefined) renew(packet)
  else {
    for (const name of ['Bulletins', 'DailyBulletins']) {
      if (Array.isArray(packet[name])) {
        const bulletins = asPackets(packet[name])
        bulletins.forEach(renew)
        packet[name] = bulletins
      }
    }
  }
  return packet
}
