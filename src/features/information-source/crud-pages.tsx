import { createUuid } from '@/utils/uuid'
import { useState } from 'react'
import { Link, useSearch } from '@tanstack/react-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Bell,
  CalendarClock,
  Database,
  FileText,
  Monitor,
  Pencil,
  Plus,
  Search,
  Send,
  Settings2,
  Trash2,
  Eye,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { usePermission } from '@/features/auth/hooks/usePermission'
import { useCurrentUser } from '@/features/auth/hooks/useAuth'
import { toast } from '@/utils/toast'
import { mediaService } from '@/features/admin/media/services/mediaService'
import { resolveMediaUrl } from '@/features/admin/media/utils/mediaUrl'
import {
  Card,
  ChannelBadge,
  DataTable,
  Empty,
  JsonDetails,
  SourcePage,
  StateBadge,
  dateTime,
} from './components'
import { sourceKeys, useServiceCatalog, useWorkspace } from './hooks'
import {
  informationSourceService,
  protocolError,
  redactTokens,
} from './service'
import { asPackets, bulletinKey, deviceKey, field } from './types'
import { sourceCrud } from './crud-service'
import type {
  BusinessInput,
  BusinessRecord,
  ConfigurationInput,
  DataKind,
  ServiceConfiguration,
} from './crud-service'
import type {
  Channel,
  Packet,
  ServiceCode,
  ServiceDefinition,
  ProtocolResponse,
} from './types'

const inputClass =
  'w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10'
const labels: Record<DataKind, string> = {
  devices: 'Thiết bị',
  bulletins: 'Bản tin',
  playlists: 'Lịch phát',
  commands: 'Lệnh điều khiển',
  notifications: 'Thông báo',
}
const icons = {
  devices: Monitor,
  bulletins: FileText,
  playlists: CalendarClock,
  commands: Settings2,
  notifications: Bell,
}
const kinds = Object.keys(labels) as DataKind[]

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block space-y-2 text-sm font-medium">
      <span>{label}</span>
      {children}
    </label>
  )
}
function JsonEditor({
  label,
  value,
  onChange,
  disabled = false,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}) {
  return (
    <Field label={label}>
      <textarea
        aria-label={label}
        spellCheck={false}
        autoComplete="off"
        disabled={disabled}
        className={`${inputClass} min-h-64 font-mono text-xs leading-6`}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </Field>
  )
}
function parse(text: string): Packet {
  const value: unknown = JSON.parse(text)
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw new Error('JSON phải là một object')
  return value as Packet
}
function ErrorBox({ error }: { error: string }) {
  return error ? (
    <p
      role="alert"
      className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
    >
      {error}
    </p>
  ) : null
}
function DeleteDialog({
  name,
  action,
  close,
}: {
  name: string
  action: () => Promise<unknown>
  close: () => void
}) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !busy) close()
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Xóa {name}?</DialogTitle>
          <DialogDescription>
            Bản ghi sẽ được xóa khỏi dữ liệu quản lý. Kiểm tra tên và các dữ
            liệu đang liên quan trước khi xác nhận.
          </DialogDescription>
        </DialogHeader>
        <ErrorBox error={error} />
        <div className="flex justify-end gap-2">
          <Button variant="outline" disabled={busy} onClick={close}>
            Giữ lại
          </Button>
          <Button
            variant="error"
            disabled={busy}
            onClick={async () => {
              setBusy(true)
              setError('')
              try {
                await action()
                toast.success('Đã xóa bản ghi')
                close()
              } catch (failure) {
                setError(protocolError(failure))
              } finally {
                setBusy(false)
              }
            }}
          >
            <Trash2 size={15} />
            {busy ? 'Đang xóa…' : 'Xác nhận xóa'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function ServiceConfigurationsPage() {
  const user = useCurrentUser()
  const catalog = useServiceCatalog()
  const client = useQueryClient()
  const query = useQuery({
    queryKey: [...sourceKeys.all, 'configurations', user?.id],
    queryFn: sourceCrud.configurations,
    enabled: Boolean(user),
    retry: 1,
  })
  const create = usePermission('integration.gateway.create')
  const update = usePermission('integration.gateway.update')
  const remove = usePermission('integration.gateway.delete')
  const [code, setCode] = useState('all')
  const [search, setSearch] = useState('')
  const [editor, setEditor] = useState<{
    row?: ServiceConfiguration
    code: ServiceCode
    view: boolean
  } | null>(null)
  const [deleting, setDeleting] = useState<ServiceConfiguration | null>(null)
  const [running, setRunning] = useState<ServiceConfiguration | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState('')
  const refresh = () => client.invalidateQueries({ queryKey: sourceKeys.all })
  const open = async (row: ServiceConfiguration, view: boolean) => {
    setLoading(row.id)
    setError('')
    try {
      const current = await sourceCrud.configuration(row.id)
      setEditor({ row: current, code: current.serviceCode, view })
    } catch (failure) {
      setError(protocolError(failure))
    } finally {
      setLoading('')
    }
  }
  const rows =
    query.data?.items.filter(
      (item) =>
        (code === 'all' || item.serviceCode === code) &&
        `${item.name} ${item.description} ${item.serviceCode}`
          .toLowerCase()
          .includes(search.toLowerCase()),
    ) ?? []
  return (
    <SourcePage
      title="Cấu hình 20 dịch vụ"
      description="Tạo, xem, sửa và xóa mẫu request/response. Mỗi dịch vụ có thể có nhiều cấu hình cho các tình huống khác nhau."
      actions={
        <>
          <Button variant="outline" asChild>
            <Link to="/dashboard/integration">
              <Send size={15} />
              Trình gửi API
            </Link>
          </Button>
          {create && (
            <Button
              disabled={!catalog.data}
              onClick={() =>
                setEditor({
                  code: (code === 'all' ? 'DV002' : code) as ServiceCode,
                  view: false,
                })
              }
            >
              <Plus size={16} />
              Thêm cấu hình
            </Button>
          )}
        </>
      }
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-5">
        {catalog.data?.map((service) => (
          <button
            key={service.code}
            onClick={() =>
              setCode(code === service.code ? 'all' : service.code)
            }
            className={`rounded-xl border p-3 text-left transition-colors ${code === service.code ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'bg-background hover:border-primary/40'}`}
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-sm font-semibold text-primary">
                {service.code}
              </span>
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs">
                {query.data?.items.filter(
                  (item) => item.serviceCode === service.code,
                ).length ?? 0}{' '}
                mẫu
              </span>
            </div>
            <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
              {service.name}
            </p>
          </button>
        ))}
      </div>
      <Card>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold">
              Cấu hình đã lưu {code !== 'all' && `· ${code}`}
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              {query.data?.total ?? 0} cấu hình · {rows.length} trong bộ lọc
            </p>
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Search
                className="absolute left-3 top-2.5 text-muted-foreground"
                size={16}
              />
              <input
                aria-label="Tìm cấu hình"
                className={`${inputClass} pl-9`}
                placeholder="Tìm tên, mã dịch vụ…"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
            <Button variant="outline" onClick={() => setCode('all')}>
              Tất cả
            </Button>
            <Button variant="outline" onClick={() => void query.refetch()}>
              Làm mới
            </Button>
          </div>
        </div>
        <ErrorBox
          error={error || (query.isError ? protocolError(query.error) : '')}
        />
        {query.isPending ? (
          <p className="p-8 text-center text-sm text-muted-foreground">
            Đang tải cấu hình…
          </p>
        ) : rows.length ? (
          <DataTable
            headers={[
              'Dịch vụ / cấu hình',
              'Trạng thái',
              'Cập nhật',
              'Thao tác',
            ]}
            rows={rows.map((row) => [
              <div key="name">
                <span className="font-mono text-xs font-semibold text-primary">
                  {row.serviceCode}
                </span>
                <p className="mt-1 font-medium">{row.name}</p>
                <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                  {row.description}
                </p>
              </div>,
              <span
                key="state"
                className={`rounded-full px-2.5 py-1 text-xs ${row.enabled ? 'bg-emerald-50 text-emerald-700' : 'bg-muted text-muted-foreground'}`}
              >
                {row.enabled ? 'Đang bật' : 'Đã tắt'}
              </span>,
              <div key="time">
                {dateTime(row.updatedAt)}
                <p className="mt-1 text-xs text-muted-foreground">
                  Phiên bản {row.revision}
                </p>
              </div>,
              <div key="actions" className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={loading === row.id}
                  onClick={() => void open(row, true)}
                  aria-label={`Xem ${row.name}`}
                >
                  <Eye size={14} />
                </Button>
                {update && (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={loading === row.id}
                    onClick={() => void open(row, false)}
                    aria-label={`Sửa ${row.name}`}
                  >
                    <Pencil size={14} />
                  </Button>
                )}
                {create && (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={!row.enabled}
                    onClick={() => setRunning(row)}
                  >
                    <Send size={14} />
                    Gửi thử
                  </Button>
                )}
                {remove && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600"
                    onClick={() => setDeleting(row)}
                    aria-label={`Xóa ${row.name}`}
                  >
                    <Trash2 size={14} />
                  </Button>
                )}
              </div>,
            ])}
          />
        ) : (
          <Empty>
            Chưa có cấu hình trong bộ lọc. Chọn dịch vụ và thêm mẫu
            request/response đầu tiên.
          </Empty>
        )}
      </Card>
      {editor && catalog.data && (
        <ConfigurationEditor
          key={editor.row?.id ?? editor.code}
          catalog={catalog.data}
          initialCode={editor.code}
          row={editor.row}
          view={editor.view}
          close={() => setEditor(null)}
          saved={refresh}
        />
      )}
      {deleting && (
        <DeleteDialog
          name={deleting.name}
          action={async () => {
            await sourceCrud.deleteConfiguration(deleting.id)
            await refresh()
          }}
          close={() => setDeleting(null)}
        />
      )}
      {running && (
        <RunConfiguration
          row={running}
          close={() => setRunning(null)}
          saved={refresh}
        />
      )}
    </SourcePage>
  )
}

function ConfigurationEditor({
  catalog,
  initialCode,
  row,
  view,
  close,
  saved,
}: {
  catalog: ServiceDefinition[]
  initialCode: ServiceCode
  row?: ServiceConfiguration
  view: boolean
  close: () => void
  saved: () => Promise<unknown>
}) {
  const initial = catalog.find((item) => item.code === initialCode)!
  const [code, setCode] = useState(initialCode)
  const [name, setName] = useState(row?.name ?? `${initialCode} · Mẫu mới`)
  const [description, setDescription] = useState(
    row?.description ?? initial.name,
  )
  const [enabled, setEnabled] = useState(row?.enabled ?? true)
  const [request, setRequest] = useState(
    JSON.stringify(row?.requestPacket ?? initial.example, null, 2),
  )
  const [response, setResponse] = useState(
    JSON.stringify(
      row?.responsePacket ?? initial.responseExample ?? {},
      null,
      2,
    ),
  )
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const active = catalog.find((item) => item.code === code)!
  const submit = async () => {
    setBusy(true)
    setError('')
    try {
      const input: ConfigurationInput = {
        serviceCode: code,
        name,
        description,
        enabled,
        requestPacket: parse(request),
        responsePacket: parse(response),
        ...(row ? { revision: row.revision } : {}),
      }
      await sourceCrud.saveConfiguration(input, row?.id)
      await saved()
      toast.success(row ? 'Đã cập nhật cấu hình' : 'Đã tạo cấu hình')
      close()
    } catch (failure) {
      setError(protocolError(failure))
    } finally {
      setBusy(false)
    }
  }
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !busy) close()
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-auto sm:max-w-5xl">
        <DialogHeader>
          <DialogTitle>
            {view
              ? 'Chi tiết cấu hình'
              : row
                ? 'Sửa cấu hình dịch vụ'
                : 'Thêm cấu hình dịch vụ'}
          </DialogTitle>
          <DialogDescription>
            Request và response dùng tên trường tiếng Anh theo Phụ lục 4.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Dịch vụ">
            <select
              aria-label="Dịch vụ"
              className={inputClass}
              value={code}
              disabled={view || busy}
              onChange={(event) => {
                const selected = event.target.value as ServiceCode
                const service = catalog.find((item) => item.code === selected)!
                setCode(selected)
                setName(`${selected} · Mẫu mới`)
                setDescription(service.name)
                setRequest(JSON.stringify(service.example, null, 2))
                setResponse(
                  JSON.stringify(service.responseExample ?? {}, null, 2),
                )
              }}
            >
              {catalog.map((service) => (
                <option value={service.code} key={service.code}>
                  {service.code} · {service.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Tên cấu hình">
            <input
              aria-label="Tên cấu hình"
              className={inputClass}
              maxLength={120}
              value={name}
              disabled={view || busy}
              onChange={(event) => setName(event.target.value)}
            />
          </Field>
        </div>
        <Field label="Mô tả">
          <input
            className={inputClass}
            value={description}
            maxLength={2000}
            disabled={view || busy}
            onChange={(event) => setDescription(event.target.value)}
          />
        </Field>
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-muted/50 p-3">
          <code className="text-xs">POST {active.path}</code>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={enabled}
              disabled={view || busy}
              onChange={(event) => setEnabled(event.target.checked)}
            />
            Bật cấu hình để gửi thử
          </label>
        </div>
        <p className="text-xs text-muted-foreground">
          Để Password trống trong mẫu lưu. Nhập mật khẩu khi gửi thử DV001.
        </p>
        <div className="grid gap-4 lg:grid-cols-2">
          <JsonEditor
            label="Request JSON mẫu"
            value={request}
            onChange={setRequest}
            disabled={view || busy}
          />
          <JsonEditor
            label="Response JSON mẫu"
            value={response}
            onChange={setResponse}
            disabled={view || busy}
          />
        </div>
        <ErrorBox error={error} />
        <div className="flex justify-end gap-2">
          <Button variant="outline" disabled={busy} onClick={close}>
            {view ? 'Đóng' : 'Hủy'}
          </Button>
          {!view && (
            <Button
              disabled={busy || !name.trim()}
              onClick={() => void submit()}
            >
              {busy ? 'Đang lưu…' : 'Lưu cấu hình'}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function RunConfiguration({
  row,
  close,
  saved,
}: {
  row: ServiceConfiguration
  close: () => void
  saved: () => Promise<unknown>
}) {
  const [request, setRequest] = useState(
    JSON.stringify(row.requestPacket, null, 2),
  )
  const [response, setResponse] = useState<ProtocolResponse | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !busy) close()
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Gửi thử · {row.name}</DialogTitle>
          <DialogDescription>
            Sửa dữ liệu cho lần gửi này. Request nhập tại đây chỉ được dùng khi
            gửi API.
          </DialogDescription>
        </DialogHeader>
        <JsonEditor
          label="Request gửi thử"
          value={request}
          onChange={setRequest}
          disabled={busy}
        />
        <ErrorBox error={error} />
        <Button
          disabled={busy}
          onClick={async () => {
            setBusy(true)
            setError('')
            setResponse(null)
            try {
              setResponse(
                await informationSourceService.execute(
                  row.serviceCode,
                  parse(request),
                  row.serviceCode === 'DV001' ? undefined : createUuid(),
                ),
              )
              await saved()
              toast.success('API đã tiếp nhận request')
            } catch (failure) {
              setError(protocolError(failure))
            } finally {
              setBusy(false)
            }
          }}
        >
          <Send size={15} />
          {busy ? 'Đang gửi…' : 'Gửi request'}
        </Button>
        {response && (
          <pre className="max-h-80 overflow-auto rounded-lg bg-muted p-4 text-xs">
            {JSON.stringify(redactTokens(response), null, 2)}
          </pre>
        )}
      </DialogContent>
    </Dialog>
  )
}

export function BusinessDataPage() {
  const searchParams = useSearch({ strict: false })
  const initial = kinds.includes(searchParams.kind as DataKind)
    ? (searchParams.kind as DataKind)
    : 'bulletins'
  const [kind, setKind] = useState<DataKind>(initial)
  const [search, setSearch] = useState('')
  const [editor, setEditor] = useState<{
    row?: BusinessRecord
    view: boolean
  } | null>(null)
  const [deleting, setDeleting] = useState<BusinessRecord | null>(null)
  const [loading, setLoading] = useState('')
  const [error, setError] = useState('')
  const user = useCurrentUser()
  const client = useQueryClient()
  const catalog = useServiceCatalog()
  const workspace = useWorkspace()
  const query = useQuery({
    queryKey: [...sourceKeys.all, 'data', kind, user?.id],
    queryFn: () => sourceCrud.list(kind),
    enabled: Boolean(user),
    retry: 1,
  })
  const create = usePermission('integration.gateway.create'),
    update = usePermission('integration.gateway.update'),
    remove = usePermission('integration.gateway.delete')
  const refresh = () => client.invalidateQueries({ queryKey: sourceKeys.all })
  const open = async (row: BusinessRecord, view: boolean) => {
    setLoading(row.id)
    setError('')
    try {
      setEditor({ row: await sourceCrud.detail(kind, row.id), view })
    } catch (failure) {
      setError(protocolError(failure))
    } finally {
      setLoading('')
    }
  }
  const rows =
    query.data?.items.filter((row) =>
      `${row.name ?? row.title ?? field(row.payload ?? {}, 'PlaylistName')} ${row.externalId ?? row.serviceCode ?? ''}`
        .toLowerCase()
        .includes(search.toLowerCase()),
    ) ?? []
  return (
    <SourcePage
      title="Quản lý dữ liệu nghiệp vụ"
      description="Thêm, xem, sửa và xóa dữ liệu. Lịch phát tạo tại đây được cấp cho thiết bị đồng bộ và sinh thông báo."
      actions={
        <>
          <Button variant="outline" asChild>
            <Link to="/dashboard/integration/configurations">
              <Settings2 size={15} />
              Cấu hình dịch vụ
            </Link>
          </Button>
          {create && (
            <Button
              disabled={!catalog.data}
              onClick={() => setEditor({ view: false })}
            >
              <Plus size={15} />
              Thêm {labels[kind].toLowerCase()}
            </Button>
          )}
        </>
      }
    >
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {kinds.map((resource) => {
          const Icon = icons[resource]
          return (
            <button
              key={resource}
              onClick={() => {
                setKind(resource)
                setSearch('')
                setError('')
              }}
              className={`rounded-xl border p-4 text-left ${kind === resource ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'bg-background hover:border-primary/40'}`}
            >
              <Icon size={20} className="text-primary" />
              <p className="mt-3 text-sm font-medium">{labels[resource]}</p>
              <p className="mt-1 text-2xl font-semibold">
                {workspace.data?.counts[resource] ?? 0}
              </p>
            </button>
          )
        })}
      </div>
      <Card>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 font-semibold">
            <Database size={18} />
            {labels[kind]} · {query.data?.total ?? 0}
          </h2>
          <div className="flex gap-2">
            <input
              aria-label="Tìm dữ liệu"
              className={inputClass}
              placeholder="Tìm tên hoặc mã…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <Button variant="outline" onClick={() => void query.refetch()}>
              Làm mới
            </Button>
          </div>
        </div>
        <ErrorBox
          error={error || (query.isError ? protocolError(query.error) : '')}
        />
        {query.isPending ? (
          <p className="p-10 text-center text-sm text-muted-foreground">
            Đang tải dữ liệu…
          </p>
        ) : rows.length ? (
          <DataTable
            headers={[
              'Tên / mã',
              'Kênh / dịch vụ',
              'Trạng thái / phiên bản',
              'Cập nhật',
              'Thao tác',
            ]}
            rows={rows.map((row) => [
              <div key="name">
                <p className="font-medium">
                  {(row.name ??
                    row.title ??
                    field(row.payload ?? {}, 'PlaylistName')) ||
                    row.externalId ||
                    'Bản ghi'}
                </p>
                <p className="mt-1 font-mono text-xs text-muted-foreground">
                  {row.externalId ?? row.serviceCode}
                </p>
              </div>,
              row.channel ? (
                <ChannelBadge key="channel" channel={row.channel} />
              ) : (
                <span key="channel" className="font-mono text-xs">
                  {row.serviceCode}
                </span>
              ),
              <div key="state">
                {row.state ? (
                  <StateBadge state={row.state} />
                ) : (
                  <span className="text-xs text-muted-foreground">
                    {kind === 'notifications'
                      ? row.readAt
                        ? 'Đã đọc'
                        : 'Chưa đọc'
                      : `Phiên bản ${row.revision ?? '—'}`}
                  </span>
                )}
              </div>,
              dateTime(row.updatedAt),
              <div key="actions" className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={loading === row.id}
                  aria-label={`Xem ${row.name ?? row.title ?? row.externalId}`}
                  onClick={() => void open(row, true)}
                >
                  <Eye size={14} />
                </Button>
                {update && (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={loading === row.id}
                    aria-label={`Sửa ${row.name ?? row.title ?? row.externalId}`}
                    onClick={() => void open(row, false)}
                  >
                    <Pencil size={14} />
                  </Button>
                )}
                {remove && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600"
                    aria-label={`Xóa ${row.name ?? row.title ?? row.externalId}`}
                    onClick={() => setDeleting(row)}
                  >
                    <Trash2 size={14} />
                  </Button>
                )}
              </div>,
            ])}
          />
        ) : (
          <Empty>
            Chưa có {labels[kind].toLowerCase()} trong bộ lọc. Bấm Thêm để tạo
            bản ghi.
          </Empty>
        )}
        <p className="mt-4 text-xs text-muted-foreground">
          Hiển thị tối đa {query.data?.limit ?? 200} bản ghi gần nhất.
        </p>
      </Card>
      {editor && catalog.data && (
        <BusinessEditor
          key={`${kind}-${editor.row?.id ?? 'new'}`}
          kind={kind}
          catalog={catalog.data}
          row={editor.row}
          view={editor.view}
          workspace={workspace.data}
          close={() => setEditor(null)}
          saved={refresh}
        />
      )}
      {deleting && (
        <DeleteDialog
          name={
            deleting.name ??
            deleting.title ??
            deleting.externalId ??
            labels[kind].toLowerCase()
          }
          action={async () => {
            await sourceCrud.remove(kind, deleting.id)
            await refresh()
          }}
          close={() => setDeleting(null)}
        />
      )}
    </SourcePage>
  )
}

function BusinessEditor({
  kind,
  catalog,
  row,
  view,
  workspace,
  close,
  saved,
}: {
  kind: DataKind
  catalog: ServiceDefinition[]
  row?: BusinessRecord
  view: boolean
  workspace: ReturnType<typeof useWorkspace>['data']
  close: () => void
  saved: () => Promise<unknown>
}) {
  const canUpload = usePermission('media.library.create')
  const canViewMedia = usePermission('media.library.view')
  const sample = (channel: Channel): Packet => {
    if (kind === 'notifications') return {}
    const code =
      kind === 'devices'
        ? channel === 'radio'
          ? 'DV008'
          : 'DV016'
        : kind === 'commands'
          ? channel === 'radio'
            ? 'DV009'
            : 'DV017'
          : channel === 'radio'
            ? 'DV002'
            : 'DV010'
    const value = structuredClone(
      catalog.find((item) => item.code === code)!.example,
    )
    const freshId = `UI-${createUuid()}`
    if (kind === 'devices') {
      value[deviceKey(channel)] = freshId
      value.DeviceName = 'Thiết bị mới'
      value.StartedAt = Math.floor(Date.now() / 1000)
    }
    if (kind === 'bulletins')
      return {
        ...asPackets(value.Bulletins)[0],
        [bulletinKey(channel)]: freshId,
        Title: 'Bản tin mới',
      }
    if (kind === 'playlists') {
      value.PlaylistID = freshId
      value.PlaylistName = 'Lịch phát mới'
    }
    const device = workspace?.devices.find((item) => item.channel === channel)
    if (device) {
      value.RecipientAreas = [
        {
          DestinationID: device.areaCode,
          DestinationName: device.areaName,
          [deviceKey(channel)]: [device.externalId],
        },
      ]
      if (kind === 'commands')
        value.Devices = { [deviceKey(channel)]: [device.externalId] }
    }
    return value
  }
  const [channel, setChannel] = useState<Channel>(row?.channel ?? 'radio')
  const [packetText, setPacketText] = useState(
    JSON.stringify(
      row?.status ?? row?.payload ?? sample(row?.channel ?? 'radio'),
      null,
      2,
    ),
  )
  const [title, setTitle] = useState(row?.title ?? 'Thông báo mới')
  const [body, setBody] = useState(row?.body ?? '')
  const [severity, setSeverity] = useState(row?.severity ?? 'info')
  const [serviceCode, setServiceCode] = useState<ServiceCode>(
    row?.serviceCode ?? 'DV002',
  )
  const [read, setRead] = useState(Boolean(row?.readAt))
  const [busy, setBusy] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadedName, setUploadedName] = useState('')
  const pending = busy || uploading
  const [error, setError] = useState('')
  let packet: Packet = {}
  try {
    packet = parse(packetText)
  } catch {
    /* Keep text editable until valid JSON is entered. */
  }
  const change = (key: string, value: unknown) => {
    try {
      setPacketText(
        JSON.stringify({ ...parse(packetText), [key]: value }, null, 2),
      )
      setError('')
    } catch {
      setError('Sửa JSON hợp lệ trước khi thay đổi các trường trên form')
    }
  }
  const uploadMp3 = async (file: File) => {
    setError('')
    if (!/\.mp3$/i.test(file.name)) {
      setError('Vui lòng chọn tệp âm thanh có đuôi .mp3')
      return
    }
    if (!file.size) {
      setError('Tệp MP3 không được rỗng')
      return
    }
    try {
      const value = parse(packetText)
      setUploading(true)
      const media = await mediaService.upload(file)
      setPacketText(
        JSON.stringify(
          { ...value, Content: resolveMediaUrl(media.url) },
          null,
          2,
        ),
      )
      setUploadedName(file.name)
    } catch (failure) {
      setError(protocolError(failure))
    } finally {
      setUploading(false)
    }
  }
  const textFields =
    kind === 'devices'
      ? [
          [deviceKey(channel), 'Mã thiết bị'],
          ['DeviceName', 'Tên thiết bị'],
          ['SourceID', 'Mã địa bàn'],
          ['SourceName', 'Tên địa bàn'],
        ]
      : kind === 'bulletins'
        ? [
            [bulletinKey(channel), 'Mã bản tin'],
            ['Title', 'Tiêu đề'],
            ['Summary', 'Nội dung tóm tắt'],
            ['Duration', 'Thời lượng (HH:mm:ss)'],
          ]
        : kind === 'playlists'
          ? [
              ['PlaylistID', 'Mã lịch'],
              ['PlaylistName', 'Tên lịch'],
            ]
          : []
  const submit = async () => {
    setBusy(true)
    setError('')
    try {
      const input: BusinessInput =
        kind === 'notifications'
          ? { serviceCode, title, body, severity, read }
          : {
              channel,
              packet: parse(packetText),
              ...(row?.revision ? { revision: row.revision } : {}),
            }
      await sourceCrud.save(kind, input, row?.id)
      await saved()
      toast.success(row ? 'Đã cập nhật dữ liệu' : 'Đã tạo dữ liệu')
      close()
    } catch (failure) {
      setError(protocolError(failure))
    } finally {
      setBusy(false)
    }
  }
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !pending) close()
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>
            {view ? 'Chi tiết' : row ? 'Sửa' : 'Thêm'}{' '}
            {labels[kind].toLowerCase()}
          </DialogTitle>
          <DialogDescription>
            {kind === 'bulletins'
              ? 'Bản tin được quản lý độc lập. Cập nhật bản tin đang dùng sẽ tạo phiên bản lịch mới để thiết bị đồng bộ.'
              : kind === 'playlists'
                ? 'Chọn thiết bị đã khai báo để cấp lịch đồng bộ.'
                : 'Dữ liệu được lưu trong không gian của tài khoản đang đăng nhập.'}
          </DialogDescription>
        </DialogHeader>
        {kind === 'notifications' ? (
          <>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Dịch vụ liên quan">
                <select
                  className={inputClass}
                  value={serviceCode}
                  disabled={view || pending}
                  onChange={(event) =>
                    setServiceCode(event.target.value as ServiceCode)
                  }
                >
                  {catalog.map((item) => (
                    <option key={item.code} value={item.code}>
                      {item.code} · {item.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Mức thông báo">
                <select
                  className={inputClass}
                  value={severity}
                  disabled={view || pending}
                  onChange={(event) => setSeverity(event.target.value)}
                >
                  <option value="info">Thông tin</option>
                  <option value="success">Thành công</option>
                  <option value="warning">Cảnh báo</option>
                </select>
              </Field>
            </div>
            <Field label="Tiêu đề">
              <input
                aria-label="Tiêu đề"
                className={inputClass}
                value={title}
                maxLength={500}
                disabled={view || pending}
                onChange={(event) => setTitle(event.target.value)}
              />
            </Field>
            <Field label="Nội dung">
              <textarea
                aria-label="Nội dung"
                className={`${inputClass} min-h-28`}
                value={body}
                maxLength={10000}
                disabled={view || pending}
                onChange={(event) => setBody(event.target.value)}
              />
            </Field>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={read}
                disabled={view || pending}
                onChange={(event) => setRead(event.target.checked)}
              />
              Đánh dấu đã đọc
            </label>
          </>
        ) : (
          <>
            <Field label="Kênh">
              <select
                className={inputClass}
                value={channel}
                disabled={Boolean(row) || view || pending}
                onChange={(event) => {
                  const next = event.target.value as Channel
                  setChannel(next)
                  setUploadedName('')
                  setPacketText(JSON.stringify(sample(next), null, 2))
                }}
              >
                <option value="radio">Phát thanh</option>
                <option value="signage">Bảng điện tử</option>
              </select>
            </Field>
            <div className="grid gap-4 md:grid-cols-2">
              {textFields.map(([key, label]) => (
                <Field key={key} label={`${label} · ${key}`}>
                  <input
                    aria-label={label}
                    className={inputClass}
                    value={field(packet, key)}
                    disabled={
                      view ||
                      pending ||
                      (Boolean(row) && /ID$/.test(key) && key !== 'SourceID')
                    }
                    onChange={(event) => change(key, event.target.value)}
                  />
                </Field>
              ))}
            </div>
            {kind === 'bulletins' && (
              <Field label="Mức ưu tiên">
                <select
                  className={inputClass}
                  value={field(packet, 'Priority')}
                  disabled={view || pending}
                  onChange={(event) => change('Priority', event.target.value)}
                >
                  <option value="1">1 · Khẩn cấp</option>
                  <option value="2">2 · Ưu tiên</option>
                  <option value="3">3 · Thông thường</option>
                </select>
              </Field>
            )}
            {kind === 'bulletins' && channel === 'radio' && (
              <div className="space-y-3 rounded-lg border border-dashed p-4">
                {!view && (
                  <>
                    <Field label="Tệp âm thanh MP3">
                      <input
                        type="file"
                        accept=".mp3,audio/mpeg"
                        aria-label="Tệp âm thanh MP3"
                        className={`${inputClass} file:mr-3 file:rounded-md file:border-0 file:bg-primary/10 file:px-3 file:py-1 file:text-primary`}
                        disabled={pending || !canUpload || !canViewMedia}
                        onChange={(event) => {
                          const file = event.target.files?.[0]
                          event.target.value = ''
                          if (file) void uploadMp3(file)
                        }}
                      />
                    </Field>
                    <p className="text-xs text-muted-foreground" role="status">
                      {uploading
                        ? 'Đang tải tệp MP3 lên…'
                        : uploadedName
                          ? `Đã tải lên: ${uploadedName}`
                          : 'Chọn tệp để tải lên Media. Đường dẫn tự điền vào Content.'}
                    </p>
                    {(!canUpload || !canViewMedia) && (
                      <p className="text-xs text-muted-foreground">
                        Cần quyền xem và thêm Media để tải tệp lên.
                      </p>
                    )}
                  </>
                )}
                <Field label="Đường dẫn âm thanh · Content">
                  <input
                    aria-label="Đường dẫn âm thanh"
                    className={inputClass}
                    value={field(packet, 'Content')}
                    disabled={view || pending}
                    onChange={(event) => {
                      setUploadedName('')
                      change('Content', event.target.value)
                    }}
                  />
                </Field>
                {(/\.mp3(?:[?#]|$)/i.test(field(packet, 'Content')) ||
                  uploadedName) && (
                  <audio
                    aria-label="Nghe thử bản tin"
                    className="w-full"
                    controls
                    preload="none"
                    src={resolveMediaUrl(field(packet, 'Content'))}
                  />
                )}
              </div>
            )}
            {(kind === 'playlists' || kind === 'commands') && !view && (
              <Field label="Thiết bị nhận">
                <select
                  aria-label="Thiết bị nhận"
                  className={inputClass}
                  disabled={pending}
                  defaultValue=""
                  onChange={(event) => {
                    const device = workspace?.devices.find(
                      (item) => item.id === event.target.value,
                    )
                    if (!device) return
                    const value = parse(packetText)
                    value.RecipientAreas = [
                      {
                        DestinationID: device.areaCode,
                        DestinationName: device.areaName,
                        [deviceKey(channel)]: [device.externalId],
                      },
                    ]
                    if (kind === 'commands')
                      value.Devices = {
                        [deviceKey(channel)]: [device.externalId],
                      }
                    setPacketText(JSON.stringify(value, null, 2))
                  }}
                >
                  <option value="">
                    Chọn thiết bị hoặc sửa danh sách trong JSON
                  </option>
                  {workspace?.devices
                    .filter((device) => device.channel === channel)
                    .map((device) => (
                      <option key={device.id} value={device.id}>
                        {device.name} · {device.externalId}
                      </option>
                    ))}
                </select>
              </Field>
            )}
            {kind === 'playlists' && !view && (
              <Field label="Bản tin đã lưu">
                <select
                  aria-label="Bản tin đã lưu"
                  className={inputClass}
                  defaultValue=""
                  disabled={pending}
                  onChange={(event) => {
                    const bulletin = workspace?.bulletins.find(
                      (item) => item.id === event.target.value,
                    )
                    if (!bulletin) return
                    const value = parse(packetText)
                    value.Bulletins = [
                      { ...asPackets(value.Bulletins)[0], ...bulletin.payload },
                    ]
                    value.DailyBulletins = []
                    setPacketText(JSON.stringify(value, null, 2))
                  }}
                >
                  <option value="">
                    Chọn bản tin hoặc chỉnh mẫu trong JSON
                  </option>
                  {workspace?.bulletins
                    .filter((bulletin) => bulletin.channel === channel)
                    .map((bulletin) => (
                      <option key={bulletin.id} value={bulletin.id}>
                        {bulletin.title} · {bulletin.externalId}
                      </option>
                    ))}
                </select>
              </Field>
            )}
            <JsonEditor
              label="Gói dữ liệu JSON (tên trường tiếng Anh)"
              value={packetText}
              onChange={setPacketText}
              disabled={view || pending}
            />
          </>
        )}
        {row && (
          <p className="text-xs text-muted-foreground">
            Tạo: {dateTime(row.createdAt)} · Cập nhật: {dateTime(row.updatedAt)}{' '}
            {row.revision && `· Phiên bản ${row.revision}`}
          </p>
        )}
        <ErrorBox error={error} />
        <div className="flex justify-end gap-2">
          <Button variant="outline" disabled={pending} onClick={close}>
            {view ? 'Đóng' : 'Hủy'}
          </Button>
          {!view && (
            <Button disabled={pending} onClick={() => void submit()}>
              {uploading ? 'Đang tải tệp…' : busy ? 'Đang lưu…' : 'Lưu dữ liệu'}
            </Button>
          )}
        </div>
        {view && row && <JsonDetails value={row} label="Xem toàn bộ bản ghi" />}
      </DialogContent>
    </Dialog>
  )
}
