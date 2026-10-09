import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { simulateConnection } from './simulation'
import { informationSourceService } from './service'
import type { Packet, ServiceCode, ServiceDefinition } from './types'
import examples from './test-data/appendix-examples.json'

vi.mock('./service', () => ({ informationSourceService: { execute: vi.fn() } }))
const execute = vi.mocked(informationSourceService.execute)
const getRandomValues = globalThis.crypto.getRandomValues.bind(
  globalThis.crypto,
)
const definitions: ServiceDefinition[] = Object.entries(examples).map(
  ([code, example]) => ({
    code: code as ServiceCode,
    name: code,
    path: '/',
    channel: 'shared',
    direction: 'device-to-source',
    operation: 'status',
    providerDefined: false,
    required: Object.keys(example),
    example,
  }),
)
const accepted = (Content: unknown) => ({
  SendStatus: 0,
  Description: 'Accepted',
  Content,
  Errors: [],
})

describe('device round trip simulation', () => {
  beforeEach(() => vi.clearAllMocks())
  afterEach(() => vi.unstubAllGlobals())

  it.each(['radio', 'signage'] as const)(
    'completes the %s simulation on HTTP without crypto.randomUUID',
    async (channel) => {
      vi.stubGlobal('crypto', { getRandomValues })
      let schedule: Packet = {}
      execute.mockImplementation(async (code: ServiceCode, packet: Packet) => {
        if (code === 'DV002' || code === 'DV010')
          schedule = structuredClone(packet)
        return accepted(code === 'DV019' || code === 'DV020' ? schedule : {})
      })

      const steps = await simulateConnection(definitions, channel, () => {})
      expect(steps).toHaveLength(6)
      expect(steps.every((step) => step.state === 'success')).toBe(true)
      const requestIds = execute.mock.calls.map(([, , requestId]) => requestId)
      expect(new Set(requestIds).size).toBe(6)
      requestIds.forEach((id) =>
        expect(id).toMatch(
          /^simulation-[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
        ),
      )
    },
  )

  it.each(['radio', 'signage'] as const)(
    'reports the bulletin received from the backend for %s',
    async (channel) => {
      let schedule: Packet = {}
      execute.mockImplementation(async (code: ServiceCode, packet: Packet) => {
        if (code === 'DV002' || code === 'DV010')
          schedule = structuredClone(packet)
        if (code === 'DV019' || code === 'DV020')
          return accepted({
            ...schedule,
            Bulletins: [
              {
                ...(schedule.Bulletins as Packet[])[0],
                Content: 'backend-received-media.mp3',
              },
            ],
          })
        return accepted({})
      })
      const steps = await simulateConnection(definitions, channel, () => {})
      expect(steps.every((step) => step.state === 'success')).toBe(true)
      const log = execute.mock.calls.find(
        ([code]) => code === (channel === 'radio' ? 'DV005' : 'DV013'),
      )
      expect(Object.keys(log?.[1] ?? {}).sort()).toEqual(
        Object.keys(examples[channel === 'radio' ? 'DV005' : 'DV013']).sort(),
      )
      const playlistLog = execute.mock.calls.find(
        ([code]) => code === (channel === 'radio' ? 'DV006' : 'DV014'),
      )
      if (channel === 'signage')
        expect(
          Array.isArray((playlistLog?.[1].Bulletins as Packet[])[0].Content),
        ).toBe(true)
      expect(log?.[1].Content).toEqual(
        channel === 'radio'
          ? 'backend-received-media.mp3'
          : ['backend-received-media.mp3'],
      )
    },
  )

  it('does not invent a playback log when the device receives no playlist', async () => {
    execute.mockResolvedValue(accepted(null))
    await expect(
      simulateConnection(definitions, 'radio', () => {}),
    ).rejects.toThrow('Thiết bị chưa nhận được lịch phát')
    expect(execute.mock.calls.some(([code]) => code === 'DV005')).toBe(false)
  })

  it('reports an emergency playlist received ahead of the newly submitted normal playlist', async () => {
    execute.mockImplementation(async (code) => {
      if (code === 'DV019')
        return accepted({
          ...examples.DV002,
          PlaylistID: 'EMERGENCY-FIRST',
          Bulletins: [
            {
              ...examples.DV002.Bulletins[0],
              BulletinID: 'EMERGENCY-BULLETIN',
              Priority: '1',
            },
          ],
        })
      return accepted({})
    })
    await simulateConnection(definitions, 'radio', () => {})
    const journal = execute.mock.calls.find(([code]) => code === 'DV006')
    const log = execute.mock.calls.find(([code]) => code === 'DV005')
    expect(journal?.[1].PlaylistID).toBe('EMERGENCY-FIRST')
    expect(log?.[1].BulletinID).toBe('EMERGENCY-BULLETIN')
  })

  it('stops before publishing a playlist if device registration fails', async () => {
    execute.mockImplementation(async (code) => {
      if (code === 'DV018') throw new Error('Registration rejected')
      return accepted({})
    })
    await expect(
      simulateConnection(definitions, 'radio', () => {}),
    ).rejects.toThrow('Registration rejected')
    expect(execute.mock.calls.some(([code]) => code === 'DV002')).toBe(false)
  })
})
