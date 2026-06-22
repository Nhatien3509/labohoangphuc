# labohoangpuc

Bộ khung (skeleton) microservices — backend Go + frontend Next.js — dẫn xuất từ kiến trúc
hệ thống tích hợp & chia sẻ dữ liệu. **Đã loại bỏ toàn bộ business logic**, chỉ giữ lại:

- **Bộ khung** thư mục của tất cả các service và tầng hạ tầng.
- **Phần dùng chung (common)**: `src/pkg/*` (Go), `portal-spa/src/common` + `src/api` (FE),
  gateway, database, stream-processing, gateway config…
- **1 tính năng mẫu mỗi phía** để tham chiếu khi phát triển feature mới:
  - Backend: `src/services/sharing-service` (vertical slice: handler → repository → model → client).
  - Frontend: route `admin/categories` (Feature Slice: `_apis` / `_components` / `_lib` + `page.tsx`).

---

## Cấu trúc

```
src/
├── services/          # Go microservices — đều là skeleton (cmd + internal/config),
│   │                  #   trừ sharing-service giữ nguyên làm feature mẫu
│   ├── admin-service/         (skeleton)
│   ├── audit-service/         (skeleton)
│   ├── file-downloader-service/ (skeleton)
│   ├── integration-service/   (skeleton)
│   ├── masking-service/       (skeleton)
│   ├── monitoring-service/    (skeleton)
│   ├── mock_datasource/       (skeleton — đã bỏ toàn bộ mock CSV)
│   └── sharing-service/       ★ FEATURE MẪU (giữ nguyên)
├── pkg/               # 9 Go package dùng chung (giữ nguyên)
├── gateway/           # Kong / HAProxy config (skeleton)
├── database/          # migrations / schemas / seeds (skeleton)
├── stream-processing/ # Flink jobs + Kafka config (khung)
└── web/portal-spa/    # Next.js SPA — giữ khung + common + 1 feature mẫu (admin/categories)
```

## Mỗi service skeleton gồm gì

```
<service>/
├── go.mod, go.sum, Dockerfile, README.md, .env.example
├── cmd/<entry>/main.go        # nạp config rồi log khởi động (rỗng feature)
├── internal/config/config.go  # đọc PORT, DB_* từ env
├── internal/<layer>/.gitkeep  # handler/service/repository/model/... giữ khung, để trống
└── migrations/.gitkeep
```

## Chạy thử

Backend — mọi service biên dịch được ngay:

```bash
cd src/services/<service> && go build ./...
```

Frontend:

```bash
cd src/web/portal-spa
npm install
npm run dev        # http://localhost:4800  → / redirect sang /admin/categories
```

## Thêm feature mới

- **Backend**: nhân bản cấu trúc của `sharing-service` (hoặc thêm code vào các thư mục
  `internal/{handler,service,repository,model}` đang để `.gitkeep`).
- **Frontend**: nhân bản thư mục `src/app/[locale]/(dashboard)/admin/categories`, rồi thêm
  một mục vào `MENU` trong `src/common/components/layout/AppSidebar.tsx`.

> Ghi chú: tên Go module của từng service vẫn giữ nguyên như bản gốc để không phải sửa
> import nội bộ. Đổi tên module nếu cần khi bạn tách service ra repo riêng.
