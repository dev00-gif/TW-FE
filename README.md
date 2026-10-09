# SOMICS Admin Web

Frontend quản trị cho nền tảng SOMICS. Ứng dụng được xây dựng bằng TanStack Start,
React và TypeScript, kết nối trực tiếp với SOMICS Backend qua REST API.

## Tech stack

- TanStack Start và TanStack Router
- React 19 và TypeScript
- TanStack Query, Form và Table
- Vite 8
- Tailwind CSS 4 và Radix UI
- Axios
- i18next
- Vitest

## Yêu cầu

- Node.js 20 trở lên
- npm
- SOMICS Backend chạy local hoặc có URL môi trường dùng chung

## Cài đặt

```bash
git clone git@github.com:SOMICS-MTV-COMPANY-LIMITED/somics-admin-web.git
cd somics-admin-web
npm install
cp .env.example .env
```

Cấu hình API trong `.env`:

```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

`VITE_API_BASE_URL` phải trỏ đến API prefix đầy đủ của SOMICS Backend.

Workflow `.github/workflows/deploy-dev.yml` lấy `VITE_API_BASE_URL` từ repository
Actions Secret hoặc Variable (ưu tiên Secret). Vào **Settings → Secrets and
variables → Actions**, tạo `VITE_API_BASE_URL` với URL API của môi trường deploy,
bao gồm prefix `/api/v1`. Giá trị trong `.env` trên máy không thay thế cấu hình
Actions này. Sau khi cấu hình, chạy lại workflow bị lỗi.

## Chạy project

```bash
# Development server tại http://localhost:5173
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Test
npm test

# Lint
npm run lint

# Kiểm tra format
npm run check
```

## Kiến trúc

```text
src/
├── components/          # Shared common, form, table và UI primitives
├── config/              # API, app metadata và i18n
├── features/
│   ├── admin/           # Audit, media, posts, users/roles
│   └── auth/            # Auth state, guards, hooks và pages
├── integrations/        # TanStack Query provider
├── layouts/             # Blank và dashboard layouts
├── lib/                 # API client và infrastructure adapters
├── routes/              # Thin TanStack Router route files
├── types/               # Shared frontend types
└── utils/               # Shared pure utilities

shared/                 # Permission, role và module catalogs dùng chung
docs/                   # Tài liệu luồng frontend và API contract
```

### Feature structure

Mỗi feature admin đặt tại `src/features/admin/<feature>`:

```text
src/features/admin/example/
├── components/          # UI dùng trong feature
├── hooks/               # Query, mutation và invalidation
├── i18n/                # en.json và vi.json
├── pages/               # Page composition
├── services/            # SOMICS Backend API adapter
├── types.ts             # API/view-model types
└── utils/               # Pure feature helpers khi cần
```

Route file chỉ khai báo route, permission, metadata và render feature page. Không đặt
query, mutation hoặc business mapping trực tiếp trong `src/routes`.

## API client

`src/lib/apiClient.ts` là adapter chuẩn cho SOMICS Backend:

- Gắn access token vào `Authorization: Bearer <token>`.
- Refresh access token một lần khi nhận HTTP 401.
- Xóa token và phát sự kiện logout nếu refresh thất bại.
- Unwrap response `{ success, message, result, timestamp, path }` và trả về `result`.

Feature service chỉ định nghĩa endpoint và kiểu dữ liệu:

```ts
export const exampleService = {
  list: (params: ListExamplesInput) =>
    api.get<PaginatedExamples>('/examples', params),
  create: (input: CreateExampleInput) =>
    api.post<ExampleRecord>('/examples', input),
}
```

TanStack Query nằm trong feature hook và dùng query key ổn định:

```ts
export const exampleQueryKeys = {
  all: ['admin', 'examples'] as const,
  list: (params: ListExamplesInput) =>
    [...exampleQueryKeys.all, 'list', params] as const,
}
```

## Authentication và authorization

- Access token và refresh token được quản lý bởi `src/lib/apiClient.ts`.
- `AuthBootstrapProvider` khôi phục profile khi ứng dụng khởi động.
- Route dashboard dùng `requirePermission(...)` trong `beforeLoad`.
- UI action dùng permission code từ catalog, không hardcode role để thay thế permission.
- Permission code theo dạng `module.resource.action`, ví dụ `post.post.view`.
- `SUPER_ADMIN` bypass permission; role còn lại dùng permission backend trả về.

## Internationalization

- Ngôn ngữ mặc định: Tiếng Việt.
- Shared translations: `src/config/i18n/locales`.
- Feature translations: `src/features/**/i18n`.
- Visible UI text nên dùng translation keys thay vì hardcode.
- Khi thêm namespace mới, đăng ký cả bản `vi` và `en` trong
  `src/config/i18n/index.ts`.

## UI conventions

- Ưu tiên component dùng chung trong `src/components`.
- Dùng `Panel` cho card/shell, component trong `components/form` cho form và
  `components/table` cho danh sách.
- Page chỉ compose component; query/mutation nằm trong hooks, API call nằm trong
  services.
- Giữ dark-mode parity và responsive behavior.
- Không tạo component dùng chung nếu nó chỉ phục vụ một page; đặt nó cạnh page/feature.

## Verification trước khi bàn giao

```bash
npm test
npm run build
npm run lint
npm run check
git diff --check
```

Nếu một lệnh không chạy được vì giới hạn môi trường, cần báo rõ lệnh, lỗi và phần kiểm
tra thay thế đã thực hiện.

## AI agent skill

Quy chuẩn dành cho AI agent nằm tại:

```text
.agents/skills/somics-admin-web/SKILL.md
```

Skill này mô tả boundary, feature structure, API adapter, query pattern, auth,
permission, i18n, UI conventions và checklist kiểm tra của repository.

## License

Private and proprietary to SOMICS MTV Company Limited.

## Khởi động container production

Docker chạy `docker/start-server.mjs` để mở HTTP server ở `HOST=0.0.0.0`,
`PORT=3000` và phục vụ cả SSR lẫn tài nguyên trong `dist/client`.
`dist/server/server.js` là request handler của TanStack Start, không phải lệnh
khởi động HTTP server. Chạy trực tiếp file này sẽ thoát ngay và khiến container
có chính sách restart khởi động lại liên tục.

Sau khi cập nhật Dockerfile, cần build lại image và deploy lại dịch vụ trên Dokploy.
Nếu đã đặt Command hoặc Entrypoint riêng trong Dokploy/Compose, bỏ ghi đè lệnh cũ
để sử dụng CMD của image.
