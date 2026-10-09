import { describe, expect, it } from 'vitest'
import requests from './test-data/appendix-examples.json'
import { createsBulletins, newBulletinRequest } from './request'
import { asPackets, bulletinKey } from './types'
import type { Packet, ServiceCode } from './types'

const bulletins = (packet: Packet, key: string) =>
  packet[key] !== undefined
    ? [packet]
    : [...asPackets(packet.Bulletins), ...asPackets(packet.DailyBulletins)]

describe('new bulletin request identities', () => {
  it.each(['DV002', 'DV003', 'DV010', 'DV011'] as const)(
    '%s creates fresh playlist/bulletin IDs for each send without changing content or targets',
    (code) => {
      const original = structuredClone(requests[code])
      const first = newBulletinRequest(code, original)
      const second = newBulletinRequest(code, first)
      const key = bulletinKey(
        code === 'DV002' || code === 'DV003' ? 'radio' : 'signage',
      )
      expect(first.PlaylistID).not.toBe(original.PlaylistID)
      expect(second.PlaylistID).not.toBe(first.PlaylistID)
      expect(first.RecipientAreas).toEqual(original.RecipientAreas)
      const before = bulletins(original, key),
        after = bulletins(first, key),
        next = bulletins(second, key)
      after.forEach((item, index) => {
        expect(item[key]).not.toBe(before[index][key])
        expect(next[index][key]).not.toBe(item[key])
        expect(item.Content).toEqual(before[index].Content)
        expect(item.Title).toEqual(before[index].Title)
      })
      expect(original).toEqual(requests[code])
    },
  )

  it('retains matching identities for the same bulletin within a request', () => {
    const input = structuredClone(requests.DV002)
    input.DailyBulletins[0].BulletinID = input.Bulletins[0].BulletinID
    const output = newBulletinRequest('DV002', input)
    expect(asPackets(output.DailyBulletins)[0].BulletinID).toBe(
      asPackets(output.Bulletins)[0].BulletinID,
    )
  })

  it.each([
    'DV001',
    'DV004',
    'DV005',
    'DV008',
    'DV018',
    'DV019',
    'DV020',
  ] as ServiceCode[])(
    '%s keeps existing identifiers needed for auth, device status, logs and sync',
    (code) => {
      expect(createsBulletins(code)).toBe(false)
      expect(newBulletinRequest(code, requests[code])).toEqual(requests[code])
    },
  )
})
