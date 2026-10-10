import { describe, expect, it } from 'vitest'
import { toEnglishPacket, toVietnamesePacket } from './packet-fields'

describe('request editor field names', () => {
  it('preserves values and types inside nested objects and arrays', () => {
    const packet = {
      NguonID: 'H53',
      DanhSachBanTin: [
        {
          TieuDe: 'SourceID và NguonID trong nội dung giữ nguyên',
          ThoiGianSanXuat: 1770000892,
          TacGia: { TenDayDu: 'Cán bộ tỉnh', Email: 'cb@tayninh.gov.vn' },
          ThongTinChiTietBanTin: [{ Ten: 'Nguồn tin', GiaTri: 'H53' }],
          NoiDung: ['https://example.com/Content.mp3'],
          Extra: { enabled: true, empty: null, names: ['SourceID', 'NguonID'] },
        },
      ],
      Username: 'root@gmail.com',
      Password: '',
      topic: 'device/H53',
      action: 'subscribe',
    }
    const snapshot = structuredClone(packet)
    const english = toEnglishPacket(packet)
    expect(english).toEqual({
      SourceID: 'H53',
      Bulletins: [
        {
          Title: 'SourceID và NguonID trong nội dung giữ nguyên',
          ProducedAt: 1770000892,
          Author: { FullName: 'Cán bộ tỉnh', Email: 'cb@tayninh.gov.vn' },
          BulletinDetails: [{ Name: 'Nguồn tin', Value: 'H53' }],
          Content: ['https://example.com/Content.mp3'],
          Extra: { enabled: true, empty: null, names: ['SourceID', 'NguonID'] },
        },
      ],
      Username: 'root@gmail.com',
      Password: '',
      topic: 'device/H53',
      action: 'subscribe',
    })
    expect(toVietnamesePacket(english)).toEqual(snapshot)
    expect(packet).toEqual(snapshot)
  })

  it('accepts existing English requests pasted into the editor', () => {
    const packet = { SourceID: 'H53', Bulletins: [{ Title: 'Bản tin' }] }
    expect(toEnglishPacket(packet)).toEqual(packet)
  })

  it('rejects duplicate aliases inside nested arrays', () => {
    expect(() =>
      toEnglishPacket({
        DanhSachBanTin: [{ TieuDe: 'Một', Title: 'Hai' }],
      }),
    ).toThrow('Tên trường bị trùng sau khi chuyển đổi: Title')
  })

  it('preserves unknown keys that match object prototype names', () => {
    const packet = JSON.parse(
      '{"__proto__":{"NguonID":"H53"},"constructor":"value","toString":true}',
    )
    expect(toEnglishPacket(packet)).toEqual(
      JSON.parse(
        '{"__proto__":{"SourceID":"H53"},"constructor":"value","toString":true}',
      ),
    )
    expect(Object.getPrototypeOf(toEnglishPacket(packet))).toBe(
      Object.prototype,
    )
  })
})
