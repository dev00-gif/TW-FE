# Posts API

Tài liệu cho các API lấy bài viết, lọc theo danh mục và lấy chi tiết bài viết.

Các endpoint HTTP dùng API key giống nhóm Marketing. API public chỉ trả về bài viết đã `PUBLISHED`, `PUBLIC` và chưa bị xoá mềm.

## Danh sách API

| Function                   | Method | Mục đích                            | Phân trang |
| -------------------------- | ------ | ----------------------------------- | ---------- |
| `getPublicPosts`           | `GET`  | Lấy tất cả bài viết public          | Có         |
| `getPublicPostsByCategory` | `GET`  | Lấy bài viết theo `categorySlug`    | Có         |
| `getPublicPostBySlug`      | `GET`  | Lấy chi tiết một bài viết theo slug | Không      |
| `getAdminPosts`            | `GET`  | Lấy bài viết trong trang quản trị   | Có         |
| `getAdminPost`             | `GET`  | Lấy chi tiết bài viết theo ID       | Không      |

HTTP endpoints:

| Method | Endpoint                                 | Mục đích                                        |
| ------ | ---------------------------------------- | ----------------------------------------------- |
| `GET`  | `/api/v1/posts`                          | Lấy bài viết, hỗ trợ lọc danh mục và phân trang |
| `GET`  | `/api/v1/posts/categories/:categorySlug` | Lấy bài viết theo danh mục, có phân trang       |
| `GET`  | `/api/v1/posts/:slug`                    | Lấy chi tiết bài viết public                    |

Header bắt buộc:

```http
x-api-key: <API_KEY>
```

## cURL dùng cho Postman

Thay `{{BASE_URL}}` bằng địa chỉ SOMICS Backend và `{{API_KEY}}` bằng API key hợp lệ.

### Lấy tất cả bài viết

```bash
curl --request GET \
  --url '{{BASE_URL}}/api/v1/posts?page=1&limit=10' \
  --header 'x-api-key: {{API_KEY}}'
```

### Lấy bài viết theo danh mục

```bash
curl --request GET \
  --url '{{BASE_URL}}/api/v1/posts/categories/tin-tuc?page=1&limit=10' \
  --header 'x-api-key: {{API_KEY}}'
```

### Lấy chi tiết bài viết

```bash
curl --request GET \
  --url '{{BASE_URL}}/api/v1/posts/seed-ozoxship-express-tin-tuc-1' \
  --header 'x-api-key: {{API_KEY}}'
```

## Public API

### Lấy tất cả bài viết

```ts
GET /api/v1/posts?page=1&limit=10
```

### Lấy theo danh mục

```ts
GET /api/v1/posts/categories/tin-tuc?page=1&limit=10
```

### Chi tiết bài viết

```ts
GET / api / v1 / posts / seed - ozoxship - express - tin - tuc - 1
```

## Admin API

### Danh sách bài viết

`getAdminPosts` yêu cầu quyền `post.post.view`. Có thể lọc theo ID danh mục, trạng thái và tìm kiếm tiêu đề.

```ts
getAdminPosts({
  data: {
    page: 1,
    limit: 10,
    search: '',
    categoryId: '00000000-0000-0000-0000-000000000000',
    status: 'PUBLISHED',
  },
})
```

Các field `search`, `status` và `categoryId` là tùy chọn. Không truyền filter sẽ lấy tất cả bài viết chưa bị xoá mềm.

### Chi tiết bài viết trong Admin

```ts
getAdminPost({
  data: { id: '00000000-0000-0000-0000-000000000000' },
})
```

## Input phân trang và filter

| Field          | Kiểu                 | Mặc định |                     Giới hạn | Mô tả                                 |
| -------------- | -------------------- | -------: | ---------------------------: | ------------------------------------- |
| `page`         | `number`             |      `1` |              Số nguyên dương | Trang hiện tại.                       |
| `limit`        | `number`             |     `10` | `1–30` public, `1–100` admin | Số bài viết mỗi trang.                |
| `categorySlug` | `string`             |        — |            Tối thiểu 1 ký tự | Slug danh mục public.                 |
| `categoryId`   | `UUID`               |        — |                  UUID hợp lệ | ID danh mục, chỉ dùng cho Admin.      |
| `status`       | `DRAFT \| PUBLISHED` |        — |                         Enum | Trạng thái, chỉ dùng cho Admin.       |
| `search`       | `string`             |     `''` |                            — | Tìm theo tiêu đề, chỉ dùng cho Admin. |

## Response danh sách

```json
{
  "items": [
    {
      "id": "00000000-0000-0000-0000-000000000000",
      "title": "Hướng dẫn sử dụng OzoXship Express",
      "slug": "huong-dan-su-dung-ozoxship-express",
      "excerpt": "Hướng dẫn nhanh cho người dùng.",
      "content": "<p>Nội dung bài viết</p>",
      "image": "/images/post-cover.png",
      "publishedAt": "2026-08-25T08:00:00.000Z",
      "categories": [{ "name": "Tin tức", "slug": "tin-tuc" }]
    }
  ],
  "categories": [
    {
      "id": "00000000-0000-0000-0000-000000000000",
      "name": "Tin tức",
      "slug": "tin-tuc",
      "imageUrl": null
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1,
    "hasPrevious": false,
    "hasNext": false
  }
}
```

## Response chi tiết

Chi tiết public trả về nội dung đầy đủ cùng danh mục liên kết:

```json
{
  "id": "00000000-0000-0000-0000-000000000000",
  "title": "Hướng dẫn sử dụng OzoXship Express",
  "slug": "huong-dan-su-dung-ozoxship-express",
  "excerpt": "Hướng dẫn nhanh cho người dùng.",
  "content": "<p>Nội dung đầy đủ</p>",
  "status": "PUBLISHED",
  "visibility": "PUBLIC",
  "featuredImage": "/images/post-cover.png",
  "categories": [],
  "publishedAt": "2026-08-25T08:00:00.000Z"
}
```

## Quy tắc lọc

- Public chỉ trả về bài viết có `status = PUBLISHED`, `visibility = PUBLIC`, `deletedAt = null`.
- `categorySlug` lọc qua quan hệ `post_category_links`.
- Kết quả được sắp xếp theo `publishedAt` giảm dần.
- Nếu không có bài viết phù hợp, `items` là mảng rỗng và `meta.total` bằng `0`.

## URL ảnh

Field `image` trong response public luôn được trả về dưới dạng URL đầy đủ:

- Nếu `featuredImage` đã là `http://` hoặc `https://`, hệ thống giữ nguyên URL.
- Nếu là path tương đối như `/images/post-cover.png`, hệ thống ghép base URL theo thứ tự:
  `CMC_CDN_BASE_URL` → `CDN_BASE_URL` → `VITE_CDN_BASE_URL` → `APP_URL`.

Ví dụ response sẽ trả về:

```json
{
  "image": "https://cdn.example.com/images/post-cover.png"
}
```
