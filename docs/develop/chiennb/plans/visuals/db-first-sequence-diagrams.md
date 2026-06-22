# Biểu đồ hoạt động DB-First — Kong Integration

## 1. CreateRouteConfig

```mermaid
sequenceDiagram
    participant Client
    participant API as Admin API
    participant DB as PostgreSQL
    participant Kong as Kong Gateway
    participant Notify as Notifier

    Client->>API: POST /route-configs
    API->>API: Validate input

    Note over API,DB: === DB TRANSACTION BEGIN ===
    API->>DB: INSERT kong_route_configs (status=PENDING)
    DB-->>API: OK + cfg.ID

    API->>Kong: CreateService(name, upstream_url)
    alt Kong thất bại
        Kong-->>API: Error
        API->>DB: ROLLBACK
        API->>Kong: Compensate: DeleteService nếu đã tạo
        API-->>Client: 500 Error
    else Kong thành công
        Kong-->>API: kong_service_id
    end

    API->>Kong: CreateRoute(service_id, path, strip_path)
    alt Kong thất bại
        Kong-->>API: Error
        API->>DB: ROLLBACK
        API->>Kong: Compensate: DeleteService
        API-->>Client: 500 Error
    else Kong thành công
        Kong-->>API: kong_route_id
    end

    API->>DB: UPDATE SET status=ACTIVE, kong_service_id, kong_route_id
    Note over API,DB: === DB TRANSACTION COMMIT ===

    Note over API,Notify: --- Best-effort (ngoài transaction) ---
    API->>DB: INSERT history (CREATE, snapshot JSONB)
    API->>Notify: Async goroutine webhook

    API-->>Client: 201 Created
```

---

## 2. UpdateRouteConfig

```mermaid
sequenceDiagram
    participant Client
    participant API as Admin API
    participant DB as PostgreSQL
    participant Kong as Kong Gateway
    participant Notify as Notifier

    Client->>API: PUT /route-configs/:id
    API->>DB: SELECT FROM kong_route_configs WHERE id = :id
    alt Không tìm thấy
        API-->>Client: 404 Not Found
    else Tìm thấy
        DB-->>API: cfg (có kong_service_id)
    end

    API->>Kong: UpdateService(kong_service_id, new_upstream_url)
    alt Thất bại
        API-->>Client: 500 Error
    else Thành công
        Kong-->>API: OK
    end

    API->>DB: UPDATE kong_route_configs SET upstream_url

    Note over API,Notify: --- Best-effort ---
    API->>DB: INSERT history (UPDATE, snapshot)
    API->>Notify: Async ROUTE_UPDATED

    API-->>Client: 200 OK
```

---

## 3. DeleteRouteConfig

```mermaid
sequenceDiagram
    participant Client
    participant API as Admin API
    participant DB as PostgreSQL
    participant Kong as Kong Gateway

    Client->>API: DELETE /route-configs/:id
    API->>DB: SELECT FROM kong_route_configs WHERE id = :id
    alt Không tìm thấy
        API-->>Client: 404 Not Found
    end

    Note over API,Kong: Xóa Kong (best-effort, log warning nếu lỗi)
    API->>Kong: DeleteRoute(kong_route_id)
    Kong-->>API: OK / Warning
    API->>Kong: DeleteService(kong_service_id)
    Kong-->>API: OK / Warning

    Note over API,DB: Xóa DB (history trước do FK constraint)
    API->>DB: DELETE FROM history WHERE config_id = :id
    API->>DB: DELETE FROM kong_route_configs WHERE id = :id

    API-->>Client: 204 No Content
```

---

## 4. RollbackRouteConfig

```mermaid
sequenceDiagram
    participant Client
    participant API as Admin API
    participant DB as PostgreSQL
    participant Kong as Kong Gateway
    participant Notify as Notifier

    Client->>API: POST /route-configs/:id/rollback
    API->>DB: SELECT FROM kong_route_configs WHERE id = :id

    Note over API,DB: Tra cứu History
    API->>DB: SELECT latest history (MAX version)
    DB-->>API: latestH (version N)
    API->>DB: SELECT previous history (version N-1)
    alt Không có version trước
        API-->>Client: 400 no previous version
    else Tìm được
        DB-->>API: prevH (upstream_url cũ)
    end

    Note over API,Kong: CHỈ rollback upstream_url
    API->>Kong: UpdateService(kong_service_id, prevH.upstream_url)
    Kong-->>API: OK

    API->>DB: UPDATE kong_route_configs SET upstream_url = prevH.upstream_url
    API->>DB: INSERT history (ROLLBACK, version N+1)
    API->>Notify: Async ROUTE_ROLLBACK
    API-->>Client: 200 OK

    Note right of API: Chỉ rollback upstream_url
    Note right of API: KHÔNG rollback plugins
    Note right of API: KHÔNG rollback consumers/keys
```

---

## 5. CreateConsumer + CreateConsumerKey

```mermaid
sequenceDiagram
    participant Client
    participant API as Admin API
    participant DB as PostgreSQL
    participant Kong as Kong Gateway

    Note over Client,Kong: Tạo Consumer
    Client->>API: POST /consumers

    Note over API,DB: === DB TRANSACTION BEGIN ===
    API->>DB: INSERT kong_consumers (status=PENDING)
    DB-->>API: consumer.ID

    API->>Kong: POST /consumers username
    alt Kong thất bại
        API->>DB: ROLLBACK
        API-->>Client: 500 Error
    else Thành công
        Kong-->>API: kong_consumer_id
    end

    API->>DB: UPDATE SET status=ACTIVE, kong_consumer_id
    Note over API,DB: === DB TRANSACTION COMMIT ===
    API-->>Client: 201 Created

    Note over Client,Kong: Cấp API Key
    Client->>API: POST /consumers/:id/keys
    API->>DB: SELECT FROM kong_consumers WHERE id = :id

    Note over API,DB: === DB TRANSACTION BEGIN ===
    API->>DB: INSERT kong_consumer_keys (status=PENDING)

    API->>Kong: POST /consumers/kong_id/key-auth
    alt Kong thất bại
        API->>DB: ROLLBACK
        API-->>Client: 500 Error
    else Thành công
        Kong-->>API: kong_key_id
    end

    API->>DB: UPDATE SET status=ACTIVE, kong_key_id
    Note over API,DB: === DB TRANSACTION COMMIT ===
    API-->>Client: 201 Created

    Note right of API: KHÔNG có history table
    Note right of API: KHÔNG có rollback
    Note right of API: KHÔNG có re-sync
```

---

## 6. AddPluginToRoute

```mermaid
sequenceDiagram
    participant Client
    participant API as Admin API
    participant DB as PostgreSQL
    participant Kong as Kong Gateway

    Client->>API: POST /route-configs/:id/plugins
    API->>DB: SELECT FROM kong_route_configs WHERE id = :id
    alt Không tìm thấy hoặc chưa sync Kong
        API-->>Client: 404 / 400 Error
    end
    DB-->>API: rc (có kong_route_id)

    Note over API,DB: === DB TRANSACTION BEGIN ===
    API->>DB: INSERT kong_route_plugins (status=PENDING)

    API->>Kong: POST /routes/kong_route_id/plugins
    alt Kong thất bại (vd: schema violation)
        API->>DB: ROLLBACK
        API-->>Client: 500 Error
    else Thành công
        Kong-->>API: kong_plugin_id
    end

    API->>DB: UPDATE SET status=ACTIVE, kong_plugin_id
    Note over API,DB: === DB TRANSACTION COMMIT ===
    API-->>Client: 201 Created

    Note right of API: config JSONB: có cột DB nhưng code chưa persist
    Note right of API: KHÔNG có history
    Note right of API: KHÔNG có rollback/detach
    Note right of API: KHÔNG có re-sync
```

---

## Tổng hợp trạng thái hỗ trợ

| Chức năng | DB local | Kong ID | Transaction | History | Rollback | Re-sync |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| Route Config | ✅ | ✅ | ✅ | ✅ | ⚠️ upstream only | ❌ |
| Consumer | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Consumer Key | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Plugin | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Plugin config | ⚠️ cột có, chưa lưu | — | — | ❌ | ❌ | ❌ |
