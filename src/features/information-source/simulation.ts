import { createUuid } from '@/utils/uuid'
import { informationSourceService } from './service'
import { asPacket, asPackets, bulletinKey, deviceKey, field } from './types'
import type {
  Channel,
  Packet,
  ProtocolResponse,
  ServiceCode,
  ServiceDefinition,
  SourceDevice,
} from './types'

export type SimulationStep = {
  code: ServiceCode
  title: string
  state: 'running' | 'success' | 'error'
  response?: ProtocolResponse
  error?: string
}

export async function simulateConnection(
  catalog: ServiceDefinition[],
  channel: Channel,
  observe: (steps: SimulationStep[]) => void,
  device?: SourceDevice,
) {
  const steps: SimulationStep[] = []
  const sample = (code: ServiceCode) => {
    const definition = catalog.find((item) => item.code === code)
    if (!definition) throw new Error(`Không tìm thấy dịch vụ ${code}`)
    return structuredClone(definition.example)
  }
  const send = async (code: ServiceCode, payload: Packet, title: string) => {
    const step: SimulationStep = { code, title, state: 'running' }
    steps.push(step)
    observe([...steps])
    try {
      step.response = await informationSourceService.execute(
        code,
        payload,
        `simulation-${createUuid()}`,
      )
      step.state = 'success'
      observe([...steps])
      return step.response
    } catch (error) {
      step.state = 'error'
      step.error = error instanceof Error ? error.message : 'Kết nối thất bại'
      observe([...steps])
      throw error
    }
  }
  const digital = channel === 'signage'
  const dk = deviceKey(channel)
  const externalId =
    device?.externalId ?? `SIM-${digital ? 'SIGNAGE' : 'RADIO'}-${createUuid()}`
  const areaCode = device?.areaCode ?? 'H53.102'
  const areaName = device?.areaName ?? 'Phường Bình Minh'
  const deviceName =
    device?.name ??
    (digital ? 'Bảng điện tử mô phỏng Bình Minh' : 'Cụm loa mô phỏng Bình Minh')
  const now = Math.floor(Date.now() / 1000)
  const status = device
    ? structuredClone(device.status)
    : sample(digital ? 'DV016' : 'DV008')
  Object.assign(status, {
    [dk]: externalId,
    DeviceName: deviceName,
    SourceID: areaCode,
    SourceName: areaName,
    StartedAt: now,
  })
  await send(digital ? 'DV016' : 'DV008', status, 'Thiết bị gửi trạng thái')
  await send('DV018', { [dk]: externalId }, 'Đăng ký các topic MQTT giả lập')
  const schedule = sample(digital ? 'DV010' : 'DV002')
  const scheduleId = `SIM-${createUuid()}`
  const original = asPackets(schedule.Bulletins).at(0)
  if (!original) throw new Error('Thiếu bản tin trong mẫu lịch phát')
  const bulletin = {
    ...original,
    [bulletinKey(channel)]: `SIM-BULLETIN-${createUuid()}`,
    Title: `Bản tin ${digital ? 'điện tử' : 'phát thanh'} mô phỏng lúc ${new Date().toLocaleTimeString('vi-VN')}`,
    ProducedAt: now,
    BroadcastDays: [
      {
        BroadcastDate: now,
        BroadcastWindows: [{ StartTime: now, EndTime: now + 1800 }],
      },
    ],
  }
  Object.assign(schedule, {
    PlaylistID: scheduleId,
    PlaylistName: `Lịch mô phỏng · ${deviceName}`,
    RecipientAreas: [
      {
        DestinationID: areaCode,
        DestinationName: areaName,
        [dk]: [externalId],
      },
    ],
    Bulletins: [bulletin],
    DailyBulletins: [],
  })
  await send(
    digital ? 'DV010' : 'DV002',
    schedule,
    'Hệ thống nguồn gửi bản tin kèm lịch',
  )
  const synced = await send(
    digital ? 'DV020' : 'DV019',
    { [dk]: externalId, SourceID: areaCode },
    'Thiết bị nhận bản tin qua đồng bộ',
  )
  const received = asPacket(synced.Content)
  const receivedSchedule = received
  const receivedBulletin = asPackets(receivedSchedule.Bulletins).at(0)
  if (!field(receivedSchedule, 'PlaylistID') || !receivedBulletin)
    throw new Error('Thiết bị chưa nhận được lịch phát')
  // A device with an emergency playlist receives that playlist first. Log exactly what it received.
  const packetFor = (code: ServiceCode, values: Packet) => {
    const project = (template: unknown, value: unknown): unknown => {
      if (Array.isArray(template)) {
        const items = Array.isArray(value)
          ? value
          : value === undefined
            ? template
            : [value]
        return items.map((item) => project(template[0], item))
      }
      if (template && typeof template === 'object')
        return Object.fromEntries(
          Object.entries(template).map(([key, child]) => [
            key,
            project(child, asPacket(value)[key]),
          ]),
        )
      return value ?? template
    }
    return project(sample(code), values) as Packet
  }
  await send(
    digital ? 'DV014' : 'DV006',
    packetFor(digital ? 'DV014' : 'DV006', {
      ...receivedSchedule,
      SourceID: areaCode,
      SourceName: areaName,
      DestinationID: 'H53',
      DestinationName: 'Tỉnh Tây Ninh',
      Devices: [{ ...status, [dk]: externalId, DeviceName: deviceName }],
      Areas: [{ DestinationID: areaCode, DestinationName: areaName }],
    }),
    'Thiết bị xác nhận đã nhận lịch',
  )
  await send(
    digital ? 'DV013' : 'DV005',
    packetFor(digital ? 'DV013' : 'DV005', {
      ...status,
      ...receivedBulletin,
      [dk]: externalId,
      DeviceName: deviceName,
      SourceID: areaCode,
      SourceName: areaName,
      DestinationID: 'H53',
      DestinationName: 'Tỉnh Tây Ninh',
      StartedAt: Math.floor(Date.now() / 1000),
      ...(digital
        ? {
            Content: Array.isArray(receivedBulletin.Content)
              ? receivedBulletin.Content
              : [receivedBulletin.Content],
          }
        : {}),
    }),
    'Giả lập bắt đầu phát và gửi nhật ký',
  )
  return steps
}
