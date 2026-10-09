export type Packet = Record<string, unknown>
export type Channel = 'radio' | 'signage'
export type ServiceCode =
  | 'DV001'
  | 'DV002'
  | 'DV003'
  | 'DV004'
  | 'DV005'
  | 'DV006'
  | 'DV007'
  | 'DV008'
  | 'DV009'
  | 'DV010'
  | 'DV011'
  | 'DV012'
  | 'DV013'
  | 'DV014'
  | 'DV015'
  | 'DV016'
  | 'DV017'
  | 'DV018'
  | 'DV019'
  | 'DV020'
export type ProtocolResponse<T = unknown> = {
  SendStatus: number
  Description: string
  Content: T
  Errors?: { Field: string; Description: string }[]
}
export type ServiceDefinition = {
  code: ServiceCode
  name: string
  path: string
  channel: Channel | 'shared'
  direction: 'auth' | 'source-to-device' | 'device-to-source'
  operation: string
  providerDefined: boolean
  required: string[]
  example: Packet
  responseExample?: Packet
  requestVariants?: Packet[]
}
type Row = {
  id: string
  createdAt: string
  updatedAt: string
  seedTag?: string | null
}
export type SourceDevice = Row & {
  channel: Channel
  externalId: string
  name: string
  areaCode: string
  areaName: string
  status: Packet
  lastSeenAt: string | null
  mqttRegisteredAt: string | null
}
export type SourcePlaylist = Row & {
  channel: Channel
  externalId: string
  payload: Packet
  state: string
  revision: number
}
export type SourceBulletin = Row & {
  channel: Channel
  externalId: string
  title: string
  priority: string
  payload: Packet
  revision: number
}
export type SourceMessage = Row & {
  serviceCode: ServiceCode
  request: Packet
  response: ProtocolResponse
}
export type SourceNotification = Row & {
  serviceCode: ServiceCode
  messageId: string | null
  title: string
  body: string
  severity: 'info' | 'success' | 'warning'
  readAt: string | null
}
export type Workspace = {
  devices: SourceDevice[]
  playlists: SourcePlaylist[]
  bulletins: SourceBulletin[]
  messages: SourceMessage[]
  notifications: SourceNotification[]
  commands: (Row & {
    channel: Channel
    state: string
    targets: string[]
    payload: Packet
  })[]
  deliveries: (Row & {
    deviceId: string
    playlistId: string
    revision: number
    state: string
  })[]
  counts: Record<
    | 'devices'
    | 'playlists'
    | 'bulletins'
    | 'messages'
    | 'notifications'
    | 'commands'
    | 'unread',
    number
  >
  limit: number
  mode: 'http-simulation'
}

export const field = (packet: Packet, key: string) =>
  typeof packet[key] === 'string' || typeof packet[key] === 'number'
    ? String(packet[key])
    : ''
export const channelName = (channel: Channel | 'shared') =>
  channel === 'radio'
    ? 'Phát thanh'
    : channel === 'signage'
      ? 'Bảng điện tử'
      : 'Dùng chung'
export const deviceKey = (channel: Channel) =>
  channel === 'radio' ? 'SpeakerClusterID' : 'DigitalSignageID'
export const bulletinKey = (channel: Channel) =>
  channel === 'radio' ? 'BulletinID' : 'PublicBulletinID'
export const asPacket = (value: unknown): Packet =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Packet)
    : {}
export const asPackets = (value: unknown): Packet[] =>
  Array.isArray(value) ? value.map(asPacket) : []
