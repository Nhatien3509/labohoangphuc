# Luồng xử lý DB-First — Kong Integration

> Nguyên tắc chung: **Ghi DB trước → Gọi Kong sau → Cập nhật trạng thái**
> Nếu Kong lỗi → DB tự động rollback, không để dữ liệu lệch.

---

## 1. Tạo Route Config mới

```mermaid
flowchart TD
    A[Client gọi POST /route-configs] --> B[Ghi vào DB: status = PENDING]
    B --> C{Tạo Service trên Kong?}
    C -- Thành công --> D{Tạo Route trên Kong?}
    C -- Thất bại --> E[DB Rollback + Xóa Service đã tạo]
    E --> F[Trả lỗi 500]
    D -- Thành công --> G[Cập nhật DB: status = ACTIVE]
    D -- Thất bại --> H[DB Rollback + Xóa Service đã tạo]
    H --> F
    G --> I[Lưu lịch sử thay đổi]
    I --> J[Gửi thông báo webhook]
    J --> K[Trả kết quả 201 Created]
```

---

## 2. Cập nhật Route Config

```mermaid
flowchart TD
    A[Client gọi PUT /route-configs/:id] --> B{Tìm thấy trong DB?}
    B -- Không --> C[Trả lỗi 404]
    B -- Có --> D[Cập nhật upstream trên Kong]
    D --> E{Kong cập nhật thành công?}
    E -- Không --> F[Trả lỗi 500]
    E -- Có --> G[Cập nhật upstream trong DB]
    G --> H[Lưu lịch sử thay đổi]
    H --> I[Gửi thông báo webhook]
    I --> J[Trả kết quả 200 OK]
```

---

## 3. Xóa Route Config

```mermaid
flowchart TD
    A[Client gọi DELETE /route-configs/:id] --> B{Tìm thấy trong DB?}
    B -- Không --> C[Trả lỗi 404]
    B -- Có --> D[Xóa Route trên Kong]
    D --> E[Xóa Service trên Kong]
    E --> F[Xóa lịch sử trong DB]
    F --> G[Xóa config trong DB]
    G --> H[Trả kết quả 204]
```

---

## 4. Rollback Route Config

```mermaid
flowchart TD
    A[Client gọi POST /route-configs/:id/rollback] --> B{Tìm thấy config?}
    B -- Không --> C[Trả lỗi 404]
    B -- Có --> D[Lấy phiên bản mới nhất từ lịch sử]
    D --> E{Có phiên bản cũ hơn?}
    E -- Không --> F[Trả lỗi 400: không có gì để rollback]
    E -- Có --> G[Cập nhật upstream trên Kong về giá trị cũ]
    G --> H[Cập nhật DB về giá trị cũ]
    H --> I[Ghi lịch sử: ROLLBACK]
    I --> J[Trả kết quả 200 OK]

    style G fill:#fff3cd,stroke:#856404
    style H fill:#fff3cd,stroke:#856404
```

> **Lưu ý:** Rollback hiện tại chỉ khôi phục `upstream_url`. Không khôi phục plugin, consumer hay API key.

---

## 5. Tạo Consumer và cấp API Key

```mermaid
flowchart TD
    A[Client gọi POST /consumers] --> B[Ghi consumer vào DB: PENDING]
    B --> C{Tạo consumer trên Kong?}
    C -- Thất bại --> D[DB Rollback]
    D --> E[Trả lỗi 500]
    C -- Thành công --> F[Cập nhật DB: ACTIVE]
    F --> G[Trả kết quả 201]

    G --> H[Client gọi POST /consumers/:id/keys]
    H --> I[Ghi API key vào DB: PENDING]
    I --> J{Tạo key trên Kong?}
    J -- Thất bại --> K[DB Rollback]
    K --> L[Trả lỗi 500]
    J -- Thành công --> M[Cập nhật DB: ACTIVE]
    M --> N[Trả kết quả 201]
```

---

## 6. Gắn Plugin vào Route

```mermaid
flowchart TD
    A[Client gọi POST /route-configs/:id/plugins] --> B{Tìm thấy route config?}
    B -- Không --> C[Trả lỗi 404]
    B -- Có --> D[Ghi plugin vào DB: PENDING]
    D --> E{Gắn plugin trên Kong?}
    E -- Thất bại --> F[DB Rollback]
    F --> G[Trả lỗi 500]
    E -- Thành công --> H[Cập nhật DB: ACTIVE]
    H --> I[Trả kết quả 201]
```

---

## Tổng hợp

| Chức năng | Lưu DB | Đồng bộ Kong | Tự rollback khi lỗi | Lịch sử thay đổi | Rollback thủ công | Khôi phục DB → Kong |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| Route Config | ✅ | ✅ | ✅ | ✅ | ⚠️ chỉ upstream | ❌ |
| Consumer | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| API Key | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Plugin | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
