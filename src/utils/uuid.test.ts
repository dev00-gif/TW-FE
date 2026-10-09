import { afterEach, describe, expect, it, vi } from 'vitest'
import { createUuid } from './uuid'

const getRandomValues = globalThis.crypto.getRandomValues.bind(
  globalThis.crypto,
)
const uuidV4 =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/

afterEach(() => vi.unstubAllGlobals())

describe('createUuid', () => {
  it('uses the native UUID generator when available', () => {
    const id = '2e3f851b-c95a-4a62-bb19-030e1c44602a'
    const randomUUID = vi.fn(() => id)
    vi.stubGlobal('crypto', { randomUUID })

    expect(createUuid()).toBe(id)
    expect(randomUUID).toHaveBeenCalledOnce()
  })

  it('creates distinct UUID v4 values without randomUUID, as on HTTP origins', () => {
    vi.stubGlobal('crypto', { getRandomValues })

    const first = createUuid()
    const second = createUuid()
    expect(first).toMatch(uuidV4)
    expect(second).toMatch(uuidV4)
    expect(second).not.toBe(first)
  })
})
