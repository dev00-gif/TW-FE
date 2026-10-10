import { createUuid } from '@/utils/uuid'
import { useState } from 'react'
import { Link, useSearch } from '@tanstack/react-router'
import {
  Bell,
  CheckCircle2,
  Radio,
  Monitor,
  Send,
  ShieldCheck,
  Cable,
  FileText,
  CalendarClock,
  ArrowRight,
  Play,
  XCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePermission } from '@/features/auth/hooks/usePermission'
import { toast } from '@/utils/toast'
import {
  useReadNotification,
  useRefreshSource,
  useServiceCatalog,
  useWorkspace,
} from './hooks'
import {
  informationSourceService,
  protocolError,
  redactTokens,
} from './service'
import { simulateConnection } from './simulation'
import { createsBulletins, newBulletinRequest } from './request'
import { toEnglishPacket, toVietnamesePacket } from './packet-fields'
import type { SimulationStep } from './simulation'
import { asPackets, bulletinKey, channelName, deviceKey, field } from './types'
import type {
  Channel,
  Packet,
  ProtocolResponse,
  ServiceCode,
  SourceDevice,
  SourcePlaylist,
} from './types'
import {
  Card,
  ChannelBadge,
  DataTable,
  Empty,
  FilterBar,
  JsonDetails,
  SourcePage,
  StateBadge,
  dateTime,
} from './components'

function useFilters() {
  const [search, setSearch] = useState('')
  const [channel, setChannel] = useState('all')
  return {
    search,
    channel,
    bar: (
      <FilterBar
        search={search}
        onSearch={setSearch}
        channel={channel}
        onChannel={setChannel}
      />
    ),
    matches: (row: { channel: Channel }, content: string) =>
      (channel === 'all' || row.channel === channel) &&
      content
        .toLocaleLowerCase('vi')
        .includes(search.trim().toLocaleLowerCase('vi')),
  }
}

export function OverviewPage() {
  const { data } = useWorkspace()
  const metrics = [
    {
      label: 'Bản tin đã nhận',
      value: data?.counts.bulletins,
      icon: FileText,
      color: 'text-blue-600',
    },
    {
      label: 'Lịch phát',
      value: data?.counts.playlists,
      icon: CalendarClock,
      color: 'text-violet-600',
    },
    {
      label: 'Thiết bị',
      value: data?.counts.devices,
      icon: Radio,
      color: 'text-emerald-600',
    },
    {
      label: 'Thông báo chưa đọc',
      value: data?.counts.unread,
      icon: Bell,
      color: 'text-amber-600',
    },
  ]
  return (
    <SourcePage
      title="Tổng quan"
      description="Vận hành cụm thu phát thanh và bảng điện tử qua 20 dịch vụ trong Phụ lục 4. Dữ liệu được cập nhật từ hệ thống mỗi 3 giây."
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{label}</span>
              <Icon size={20} className={color} />
            </div>
            <div className="mt-4 text-3xl font-semibold">{value ?? 0}</div>
          </Card>
        ))}
      </div>
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="mb-2 inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
              DV001–DV020 · Chế độ mô phỏng
            </span>
            <h2 className="text-lg font-semibold">
              Nhận bản tin và theo dõi thông báo
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Giả lập một thiết bị đăng ký topic, nhận lịch và gửi nhật ký bắt
              đầu phát. Mỗi bước đều được lưu lại để đối chiếu.
            </p>
          </div>
          <Button asChild>
            <Link to="/dashboard/integration">
              Mở 20 dịch vụ <ArrowRight size={16} />
            </Link>
          </Button>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-4">
          {[
            { icon: ShieldCheck, text: '1. Xác thực' },
            { icon: Cable, text: '2. Đăng ký kết nối' },
            { icon: Send, text: '3. Nhận bản tin / lịch' },
            { icon: Bell, text: '4. Gửi nhật ký / thông báo' },
          ].map(({ icon: Icon, text }) => (
            <div
              key={text}
              className="flex items-center gap-3 rounded-lg bg-muted/50 p-4 text-sm"
            >
              <Icon size={18} className="text-primary" />
              {text}
            </div>
          ))}
        </div>
      </Card>
      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">Bản tin mới nhận</h2>
            <Link to="/dashboard/bulletins" className="text-sm text-primary">
              Xem tất cả
            </Link>
          </div>
          {data?.bulletins.length ? (
            <div className="divide-y">
              {data.bulletins.slice(0, 5).map((item) => (
                <div key={item.id} className="space-y-2 py-3">
                  <div className="flex gap-2">
                    <ChannelBadge channel={item.channel} />
                    {item.priority === '1' && <StateBadge state="emergency" />}
                  </div>
                  <p className="font-medium">{item.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {dateTime(item.updatedAt)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <Empty />
          )}
        </Card>
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">Hoạt động gần đây</h2>
            <Link
              to="/dashboard/notifications"
              className="text-sm text-primary"
            >
              Thông báo
            </Link>
          </div>
          {data?.notifications.length ? (
            <div className="divide-y">
              {data.notifications.slice(0, 5).map((item) => (
                <div key={item.id} className="py-3">
                  <div className="flex gap-2 text-sm">
                    <span className="font-mono text-xs text-primary">
                      {item.serviceCode}
                    </span>
                    <span className="font-medium">{item.title}</span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {item.body}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {dateTime(item.createdAt)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <Empty />
          )}
        </Card>
      </div>
    </SourcePage>
  )
}

export function ConnectionSimulator({ device }: { device?: SourceDevice }) {
  const catalog = useServiceCatalog()
  const refresh = useRefreshSource()
  const allowed = usePermission('integration.gateway.create')
  const [channel, setChannel] = useState<Channel>(device?.channel ?? 'radio')
  const [steps, setSteps] = useState<SimulationStep[]>([])
  const [running, setRunning] = useState(false)
  const [error, setError] = useState('')
  const run = async () => {
    if (!catalog.data) return
    setRunning(true)
    setError('')
    setSteps([])
    try {
      await simulateConnection(catalog.data, channel, setSteps, device)
      toast.success('Đã nhận bản tin và nhật ký mô phỏng')
    } catch (failure) {
      setError(protocolError(failure))
    } finally {
      setRunning(false)
      await refresh()
    }
  }
  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2 font-semibold">
            <Cable size={18} /> Giả lập kết nối thiết bị
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Thiết bị gửi trạng thái → đăng ký topic → nhận bản tin → xác nhận
            lịch → báo bắt đầu phát.
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Topic MQTT được giả lập qua HTTP. Mỗi lần chạy tạo một bản tin và
            lịch mới.
          </p>
        </div>
        <div className="flex gap-2">
          {!device && (
            <select
              aria-label="Loại thiết bị mô phỏng"
              className="rounded-lg border bg-background px-3 text-sm"
              value={channel}
              onChange={(event) => setChannel(event.target.value as Channel)}
              disabled={running}
            >
              <option value="radio">Cụm loa</option>
              <option value="signage">Bảng điện tử</option>
            </select>
          )}
          <Button
            onClick={() => void run()}
            disabled={running || !catalog.data || !allowed}
          >
            <Play size={15} />
            {running ? 'Đang kết nối…' : 'Chạy giả lập'}
          </Button>
        </div>
      </div>
      {catalog.isError && (
        <p role="alert" className="mt-3 text-sm text-red-600">
          {protocolError(catalog.error)}
        </p>
      )}
      {error && (
        <p role="alert" className="mt-3 text-sm text-red-600">
          {error}
        </p>
      )}
      {steps.length > 0 && (
        <ol className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {steps.map((step, index) => (
            <li key={`${step.code}-${index}`} className="rounded-lg border p-3">
              <div className="flex items-center gap-2 text-sm">
                {step.state === 'success' ? (
                  <CheckCircle2 size={16} className="text-emerald-600" />
                ) : step.state === 'error' ? (
                  <XCircle size={16} className="text-red-600" />
                ) : (
                  <span className="h-3 w-3 animate-pulse rounded-full bg-blue-500" />
                )}
                <span className="font-mono text-xs">{step.code}</span>
                <span>{step.title}</span>
              </div>
              {step.response && (
                <div className="mt-2">
                  <JsonDetails value={step.response} label="Phản hồi" />
                </div>
              )}
            </li>
          ))}
        </ol>
      )}
    </Card>
  )
}

export function ServicesPage() {
  const catalog = useServiceCatalog()
  const refresh = useRefreshSource()
  const allowed = usePermission('integration.gateway.create')
  const searchParams = useSearch({ strict: false })
  const [code, setCode] = useState<ServiceCode>(
    (/^DV0(0[1-9]|1\d|20)$/.test(searchParams.service ?? '')
      ? searchParams.service
      : 'DV002') as ServiceCode,
  )
  const [draft, setDraft] = useState<{
    code: ServiceCode
    text: string
  } | null>(null)
  const [response, setResponse] = useState<ProtocolResponse | null>(null)
  const [receivedBulletinIds, setReceivedBulletinIds] = useState<string[]>([])
  const [randomizeIds, setRandomizeIds] = useState(true)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const active = catalog.data?.find((item) => item.code === code)
  const payloadText =
    draft?.code === code
      ? draft.text
      : JSON.stringify(toVietnamesePacket(active?.example ?? {}), null, 2)
  const send = async () => {
    setError('')
    setResponse(null)
    setReceivedBulletinIds([])
    setBusy(true)
    try {
      const value: unknown = JSON.parse(payloadText)
      if (!value || typeof value !== 'object' || Array.isArray(value))
        throw new Error('Request phải là một JSON object')
      const englishPacket = toEnglishPacket(value as Packet)
      const packet = randomizeIds
        ? newBulletinRequest(code, englishPacket)
        : englishPacket
      if (createsBulletins(code) && randomizeIds) {
        setDraft({
          code,
          text: JSON.stringify(toVietnamesePacket(packet), null, 2),
        })
      }
      const result = await informationSourceService.execute(
        code,
        packet,
        code === 'DV001' ? undefined : createUuid(),
      )
      setResponse(result)
      if (createsBulletins(code)) {
        const key = bulletinKey(
          code === 'DV002' || code === 'DV003' ? 'radio' : 'signage',
        )
        const bulletins =
          packet[key] !== undefined
            ? [packet]
            : [
                ...asPackets(packet.Bulletins),
                ...asPackets(packet.DailyBulletins),
              ]
        setReceivedBulletinIds([
          ...new Set(bulletins.map((item) => field(item, key)).filter(Boolean)),
        ])
      }
      if (code === 'DV001') setDraft(null)
      await refresh()
      toast.success('API đã tiếp nhận request')
    } catch (failure) {
      setError(protocolError(failure))
    } finally {
      setBusy(false)
    }
  }
  return (
    <SourcePage
      actions={
        <Button variant="outline" asChild>
          <Link to="/dashboard/integration/configurations">
            Quản lý cấu hình dịch vụ
          </Link>
        </Button>
      }
      title="20 dịch vụ API"
      description="Chọn dịch vụ, nạp request mẫu và gửi đến hệ thống. Request JSON hiển thị tên trường tiếng Việt theo Phụ lục 4 và tự chuyển sang tiếng Anh khi gửi."
    >
      <ConnectionSimulator />
      {catalog.isError && (
        <p role="alert" className="text-red-600">
          {protocolError(catalog.error)}
        </p>
      )}
      <div className="grid gap-5 xl:grid-cols-[360px_1fr]">
        <Card className="max-h-[760px] overflow-y-auto">
          <h2 className="mb-4 font-semibold">
            Danh mục · {catalog.data?.length ?? 0} dịch vụ
          </h2>
          <div className="space-y-2">
            {catalog.data?.map((item) => (
              <button
                key={item.code}
                onClick={() => {
                  setCode(item.code)
                  setResponse(null)
                  setReceivedBulletinIds([])
                  setError('')
                  setDraft(null)
                }}
                disabled={busy}
                className={`w-full rounded-lg border p-3 text-left transition-colors ${code === item.code ? 'border-primary bg-primary/5' : 'hover:bg-muted'}`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-semibold text-primary">
                    {item.code}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {channelName(item.channel)}
                  </span>
                </div>
                <p className="mt-1 text-sm font-medium">{item.name}</p>
              </button>
            ))}
          </div>
        </Card>
        <Card>
          {active && (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-semibold">
                    {active.code} · {active.name}
                  </h2>
                  <p className="mt-2 break-all font-mono text-xs text-primary">
                    POST {active.path}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setDraft(null)}
                  disabled={busy}
                >
                  Nạp mẫu
                </Button>
              </div>
              {active.providerDefined && (
                <p className="mt-3 text-xs text-muted-foreground">
                  Đường dẫn do nhà cung cấp quy định; đây là đường dẫn triển
                  khai của SOMICS.
                </p>
              )}
              {error && (
                <p
                  role="alert"
                  className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700"
                >
                  {error}
                </p>
              )}
              {response && (
                <div
                  role="status"
                  className="mt-4 space-y-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800"
                >
                  <p className="flex items-center gap-2 font-medium">
                    <CheckCircle2 size={16} />
                    {response.Description}
                  </p>
                  {receivedBulletinIds.length > 0 && (
                    <>
                      <p className="break-words">
                        Đã tiếp nhận {receivedBulletinIds.length} bản tin:{' '}
                        {receivedBulletinIds.join(', ')}. Gửi lại cùng mã sẽ cập
                        nhật bản tin hiện có; nội dung giống nhau giữ nguyên
                        phiên bản.
                      </p>
                      <Button size="sm" variant="outline" asChild>
                        <Link to="/dashboard/bulletins">
                          Xem bản tin vừa gửi <ArrowRight size={14} />
                        </Link>
                      </Button>
                    </>
                  )}
                </div>
              )}
              {createsBulletins(code) && (
                <label className="mt-4 flex items-start gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="mt-1"
                    checked={randomizeIds}
                    disabled={busy}
                    onChange={(event) => setRandomizeIds(event.target.checked)}
                  />
                  <span>
                    <span className="font-medium">Tạo mã mới mỗi lần gửi</span>
                    <span className="mt-1 block text-xs text-muted-foreground">
                      Tự tạo LichPhatID và mã bản tin mới. Tắt để cập nhật bản
                      tin bằng mã đang có.
                    </span>
                  </span>
                </label>
              )}
              <label
                htmlFor="source-request"
                className="mb-2 mt-5 block text-sm font-medium"
              >
                Request JSON
              </label>
              <textarea
                id="source-request"
                autoComplete="off"
                spellCheck={false}
                className="min-h-[360px] w-full rounded-lg border bg-muted/30 p-4 font-mono text-xs leading-6"
                value={payloadText}
                onChange={(event) =>
                  setDraft({ code, text: event.target.value })
                }
                disabled={busy}
              />
              <p className="mt-2 text-xs text-muted-foreground">
                DV008 / DV016 khai báo thiết bị trước khi đăng ký hoặc nhận
                lịch. DV001 dùng mật khẩu của tài khoản hiện có.
              </p>
              <Button
                className="mt-4"
                onClick={() => void send()}
                disabled={busy || (code !== 'DV001' && !allowed)}
              >
                <Send size={15} />
                {busy ? 'Đang gửi…' : 'Gửi request'}
              </Button>
              {response && (
                <div className="mt-5">
                  <pre className="max-h-96 overflow-auto whitespace-pre-wrap break-all rounded-lg bg-muted p-4 font-mono text-xs leading-6">
                    {JSON.stringify(redactTokens(response), null, 2)}
                  </pre>
                </div>
              )}
            </>
          )}
        </Card>
      </div>
    </SourcePage>
  )
}

export function BulletinsPage() {
  const { data } = useWorkspace()
  const filters = useFilters()
  const rows =
    data?.bulletins.filter((item) =>
      filters.matches(
        item,
        `${item.externalId} ${item.title} ${field(item.payload, 'Summary')}`,
      ),
    ) ?? []
  return (
    <SourcePage
      actions={
        <Button variant="outline" asChild>
          <Link to="/dashboard/integration/data" search={{ kind: 'bulletins' }}>
            Quản lý bản tin
          </Link>
        </Button>
      }
      title="Bản tin"
      description="Bản tin trung ương: tạo và biên tập trong Quản lý bản tin. Hệ thống địa phương đồng bộ cả bản nháp, bản đã xuất bản và các thay đổi mỗi phút khi job được bật."
    >
      {filters.bar}
      {rows.length ? (
        <DataTable
          headers={[
            'Bản tin',
            'Kênh',
            'Trạng thái',
            'Ưu tiên',
            'Phiên bản',
            'Nhận lúc',
            'Chi tiết',
          ]}
        >
          {rows.map((item) => (
            <tr key={item.id}>
              <td className="max-w-md">
                <p className="font-medium">{item.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {item.externalId}
                </p>
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                  {field(item.payload, 'Summary')}
                </p>
              </td>
              <td>
                <ChannelBadge channel={item.channel} />
              </td>
              <td>{item.publicationStatus === 'draft' ? 'Bản nháp' : 'Đã xuất bản'}</td>
              <td>
                {item.priority === '1' ? (
                  <StateBadge state="emergency" />
                ) : item.priority === '2' ? (
                  'Ưu tiên'
                ) : (
                  'Thông thường'
                )}
              </td>
              <td>v{item.revision}</td>
              <td className="whitespace-nowrap text-xs">
                {dateTime(item.updatedAt)}
              </td>
              <td>
                <JsonDetails value={item.payload} title={item.title} />
              </td>
            </tr>
          ))}
        </DataTable>
      ) : (
        <Empty />
      )}
      <p className="text-xs text-muted-foreground">
        Hiển thị tối đa {data?.limit ?? 200} bản tin gần nhất · tổng cộng{' '}
        {data?.counts.bulletins ?? 0}.
      </p>
    </SourcePage>
  )
}

export function SchedulesPage() {
  const { data } = useWorkspace()
  const filters = useFilters()
  const refresh = useRefreshSource()
  const allowed = usePermission('integration.gateway.create')
  const [busy, setBusy] = useState('')
  const [error, setError] = useState('')
  const cancel = async (item: SourcePlaylist) => {
    setBusy(item.id)
    setError('')
    try {
      await informationSourceService.execute(
        item.channel === 'radio' ? 'DV004' : 'DV012',
        {
          SourceID: item.payload.SourceID,
          SourceName: item.payload.SourceName,
          PlaylistID: item.externalId,
          PlaylistName: item.payload.PlaylistName ?? 'Lịch khẩn cấp',
          RecipientAreas: item.payload.RecipientAreas,
        },
        createUuid(),
      )
      toast.success('Đã gửi yêu cầu hủy; chờ nhật ký xác nhận từ thiết bị')
      await refresh()
    } catch (failure) {
      setError(protocolError(failure))
    } finally {
      setBusy('')
    }
  }
  const rows =
    data?.playlists.filter((item) =>
      filters.matches(
        item,
        `${item.externalId} ${field(item.payload, 'PlaylistName')}`,
      ),
    ) ?? []
  return (
    <SourcePage
      title="Lịch phát"
      description="Lịch phát và xác nhận của từng thiết bị. Nhận lịch hoặc gửi lệnh hủy chưa đồng nghĩa với đã phát hoặc đã hủy trên thiết bị."
      actions={
        <>
          <Button variant="outline" asChild>
            <Link
              to="/dashboard/integration/data"
              search={{ kind: 'playlists' }}
            >
              Quản lý lịch phát
            </Link>
          </Button>
          <Button asChild>
            <Link to="/dashboard/integration">Gửi lịch mới</Link>
          </Button>
        </>
      }
    >
      {filters.bar}
      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
      {rows.length ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {rows.map((item) => (
            <Card key={item.id}>
              <div className="flex flex-wrap items-center gap-2">
                <ChannelBadge channel={item.channel} />
                <StateBadge state={item.state} />
                <span className="ml-auto text-xs text-muted-foreground">
                  v{item.revision}
                </span>
              </div>
              <h2 className="mt-3 font-semibold">
                {field(item.payload, 'PlaylistName') || 'Lịch khẩn cấp'}
              </h2>
              <p className="mt-1 break-all font-mono text-xs text-muted-foreground">
                {item.externalId}
              </p>
              <div className="mt-3 space-y-1">
                {asPackets(item.payload.Bulletins).map((bulletin, index) => (
                  <p key={index} className="text-sm">
                    {field(bulletin, 'Title')}
                  </p>
                ))}
              </div>
              <div className="mt-4 space-y-2">
                {data?.deliveries
                  .filter(
                    (delivery) =>
                      delivery.playlistId === item.id &&
                      delivery.revision === item.revision,
                  )
                  .map((delivery) => (
                    <div
                      key={delivery.id}
                      className="flex items-center justify-between gap-3 text-xs"
                    >
                      <span>
                        {data.devices.find(
                          (device) => device.id === delivery.deviceId,
                        )?.name ?? delivery.deviceId}
                      </span>
                      <StateBadge state={delivery.state} />
                    </div>
                  ))}
              </div>
              <div className="mt-4 flex gap-2">
                <JsonDetails
                  value={item.payload}
                  label="Nội dung và giờ phát"
                />
                <Button
                  size="sm"
                  variant="outline"
                  disabled={
                    Boolean(busy) ||
                    !allowed ||
                    ['cancelled', 'cancel_requested'].includes(item.state)
                  }
                  onClick={() => void cancel(item)}
                >
                  Hủy lịch
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Empty />
      )}
    </SourcePage>
  )
}

export function DevicesPage() {
  const { data } = useWorkspace()
  const filters = useFilters()
  const allowed = usePermission('integration.gateway.create')
  const refresh = useRefreshSource()
  const [busy, setBusy] = useState('')
  const [error, setError] = useState('')
  const register = async (device: SourceDevice) => {
    setBusy(device.id)
    setError('')
    try {
      await informationSourceService.dv018({
        [deviceKey(device.channel)]: device.externalId,
      })
      toast.success('Đã đăng ký topic MQTT giả lập')
      await refresh()
    } catch (failure) {
      setError(protocolError(failure))
    } finally {
      setBusy('')
    }
  }
  const rows =
    data?.devices.filter((item) =>
      filters.matches(item, `${item.name} ${item.externalId} ${item.areaName}`),
    ) ?? []
  return (
    <SourcePage
      actions={
        <Button variant="outline" asChild>
          <Link to="/dashboard/integration/data" search={{ kind: 'devices' }}>
            Quản lý {'thiết bị'}
          </Link>
        </Button>
      }
      title="Thiết bị"
      description="Trạng thái nhận qua DV008 / DV016. Đăng ký topic qua DV018 hoặc mở thiết bị để giả lập nhận bản tin."
    >
      <ConnectionSimulator />
      {filters.bar}
      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
      {rows.length ? (
        <DataTable
          headers={[
            'Thiết bị',
            'Kênh',
            'Địa bàn',
            'Trạng thái gần nhất',
            'Topic MQTT',
            'Thao tác',
          ]}
        >
          {rows.map((item) => (
            <tr key={item.id}>
              <td>
                <Link
                  to="/dashboard/devices/$deviceId"
                  params={{ deviceId: item.id }}
                  className="font-medium text-primary"
                >
                  {item.name}
                </Link>
                <p className="mt-1 font-mono text-xs text-muted-foreground">
                  {item.externalId}
                </p>
              </td>
              <td>
                <ChannelBadge channel={item.channel} />
              </td>
              <td>
                <p>{item.areaName}</p>
                <p className="text-xs text-muted-foreground">{item.areaCode}</p>
              </td>
              <td>
                <p className="text-xs">
                  {field(item.status, 'ConnectionStatus')}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {dateTime(item.lastSeenAt)}
                </p>
              </td>
              <td className="text-xs">
                {item.mqttRegisteredAt
                  ? 'Đã đăng ký (giả lập)'
                  : 'Chưa đăng ký'}
              </td>
              <td>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={Boolean(busy) || !allowed}
                  onClick={() => void register(item)}
                >
                  Đăng ký topic
                </Button>
              </td>
            </tr>
          ))}
        </DataTable>
      ) : (
        <Empty />
      )}
    </SourcePage>
  )
}

export function DeviceDetailPage({ deviceId }: { deviceId: string }) {
  const workspace = useWorkspace()
  const device = workspace.data?.devices.find((item) => item.id === deviceId)
  return (
    <SourcePage
      title="Chi tiết thiết bị"
      description="Thông tin, tọa độ và trạng thái do thiết bị gửi về."
    >
      {device ? (
        <>
          <Card>
            <div className="flex items-center gap-3">
              {device.channel === 'radio' ? (
                <Radio size={26} />
              ) : (
                <Monitor size={26} />
              )}
              <div>
                <h2 className="text-lg font-semibold">{device.name}</h2>
                <p className="font-mono text-xs text-muted-foreground">
                  {device.externalId}
                </p>
              </div>
              <ChannelBadge channel={device.channel} />
            </div>
            <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-3">
              <div>
                <dt className="text-muted-foreground">Địa bàn</dt>
                <dd className="mt-1">
                  {device.areaName} · {device.areaCode}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">
                  Tọa độ (vĩ độ, kinh độ)
                </dt>
                <dd className="mt-1">
                  {field(device.status, 'Latitude')},{' '}
                  {field(device.status, 'Longitude')}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">
                  Nhận trạng thái lần cuối
                </dt>
                <dd className="mt-1">{dateTime(device.lastSeenAt)}</dd>
              </div>
            </dl>
            <div className="mt-4">
              <JsonDetails value={device.status} label="Trạng thái đầy đủ" />
            </div>
          </Card>
          <ConnectionSimulator device={device} />
        </>
      ) : (
        <Empty>
          Không tìm thấy thiết bị trong 200 thiết bị gần nhất của tài khoản.
        </Empty>
      )}
    </SourcePage>
  )
}

export function NotificationsPage() {
  const { data } = useWorkspace()
  const read = useReadNotification()
  const [unreadOnly, setUnreadOnly] = useState(false)
  const rows =
    data?.notifications.filter((item) => !unreadOnly || !item.readAt) ?? []
  return (
    <SourcePage
      actions={
        <Button variant="outline" asChild>
          <Link
            to="/dashboard/integration/data"
            search={{ kind: 'notifications' }}
          >
            Quản lý {'thông báo'}
          </Link>
        </Button>
      }
      title="Thông báo"
      description="Theo dõi bản tin mới, yêu cầu khẩn cấp và phản hồi từ thiết bị. Danh sách tự cập nhật mỗi 3 giây."
    >
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={unreadOnly}
          onChange={(event) => setUnreadOnly(event.target.checked)}
        />{' '}
        Chỉ hiện chưa đọc ({data?.counts.unread ?? 0})
      </label>
      {read.isError && (
        <p role="alert" className="text-sm text-red-600">
          {protocolError(read.error)}
        </p>
      )}
      {rows.length ? (
        <div className="space-y-3">
          {rows.map((item) => (
            <Card
              key={item.id}
              className={
                item.readAt ? 'opacity-70' : 'border-l-4 border-l-primary'
              }
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex gap-3">
                  <Bell
                    size={20}
                    className={
                      item.severity === 'warning'
                        ? 'text-red-500'
                        : 'text-primary'
                    }
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-primary">
                        {item.serviceCode}
                      </span>
                      <h2 className="text-sm font-semibold">{item.title}</h2>
                      {item.seedTag && (
                        <span className="text-xs text-muted-foreground">
                          Dữ liệu mẫu
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {item.body}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {dateTime(item.createdAt)}
                    </p>
                  </div>
                </div>
                {!item.readAt && (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={read.isPending}
                    onClick={() => read.mutate(item.id)}
                  >
                    Đánh dấu đã đọc
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Empty>Không có thông báo {unreadOnly ? 'chưa đọc' : ''}.</Empty>
      )}
    </SourcePage>
  )
}

export function LogsPage() {
  const { data } = useWorkspace()
  const [code, setCode] = useState('all')
  const rows =
    data?.messages.filter(
      (item) => code === 'all' || item.serviceCode === code,
    ) ?? []
  return (
    <SourcePage
      actions={
        <Button variant="outline" asChild>
          <Link to="/dashboard/integration/data" search={{ kind: 'commands' }}>
            Quản lý {'nhật ký api'}
          </Link>
        </Button>
      }
      title="Nhật ký API"
      description="Gói tin và phản hồi đã lưu, gồm nhật ký phát DV005 / DV013, xác nhận lịch DV006 / DV014 và xác nhận hủy DV007 / DV015."
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <select
          aria-label="Lọc dịch vụ nhật ký"
          className="rounded-lg border bg-background px-3 py-2 text-sm"
          value={code}
          onChange={(event) => setCode(event.target.value)}
        >
          <option value="all">Tất cả dịch vụ</option>
          {Array.from(
            { length: 19 },
            (_, index) => `DV${String(index + 2).padStart(3, '0')}`,
          ).map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
        <span className="text-xs text-muted-foreground">
          {data?.counts.messages ?? 0} gói tin · hiển thị tối đa{' '}
          {data?.limit ?? 200} gói gần nhất
        </span>
      </div>
      {rows.length ? (
        <DataTable
          headers={['Nhận lúc', 'Dịch vụ', 'Nội dung', 'Phản hồi', 'Chi tiết']}
        >
          {rows.map((item) => (
            <tr key={item.id}>
              <td className="whitespace-nowrap text-xs">
                {dateTime(item.createdAt)}
              </td>
              <td className="font-mono text-xs text-primary">
                {item.serviceCode}
                {item.seedTag && (
                  <p className="mt-1 font-sans text-muted-foreground">
                    Dữ liệu mẫu
                  </p>
                )}
              </td>
              <td className="max-w-sm text-sm">
                {field(item.request, 'Title') ||
                  field(item.request, 'PlaylistName') ||
                  field(item.request, 'DeviceName') ||
                  field(item.request, 'SpeakerClusterID') ||
                  field(item.request, 'DigitalSignageID') ||
                  'Gói dữ liệu thiết bị'}
              </td>
              <td className="max-w-xs text-xs">{item.response.Description}</td>
              <td>
                <JsonDetails
                  value={{ Request: item.request, Response: item.response }}
                />
              </td>
            </tr>
          ))}
        </DataTable>
      ) : (
        <Empty>Chưa có nhật ký cho dịch vụ này.</Empty>
      )}
      <Card>
        <h2 className="mb-3 font-semibold">Lệnh điều khiển</h2>
        {data?.commands.length ? (
          <DataTable headers={['Kênh', 'Thiết bị', 'Trạng thái', 'Lệnh']}>
            {data.commands.map((item) => (
              <tr key={item.id}>
                <td>
                  <ChannelBadge channel={item.channel} />
                </td>
                <td className="text-xs">{item.targets.join(', ')}</td>
                <td>
                  <StateBadge state={item.state} />
                </td>
                <td>
                  <JsonDetails value={item.payload} />
                </td>
              </tr>
            ))}
          </DataTable>
        ) : (
          <p className="text-sm text-muted-foreground">
            Chưa gửi lệnh điều khiển DV009 / DV017.
          </p>
        )}
        <p className="mt-3 text-xs text-muted-foreground">
          Lệnh được tiếp nhận và chờ xác nhận; chưa có kết nối với thiết bị vật
          lý.
        </p>
      </Card>
    </SourcePage>
  )
}
