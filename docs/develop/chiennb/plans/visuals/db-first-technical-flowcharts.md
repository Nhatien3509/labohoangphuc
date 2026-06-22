# DB-First Kong Integration — Technical Flowcharts (ASCII)

Mục tiêu file này: mô tả luồng kỹ thuật theo góc nhìn cấu hình và trạng thái đồng bộ giữa `Admin API` → `PostgreSQL` → `Kong Admin API`, không chỉ mô tả nghiệp vụ mức cao.

## 1. CreateRouteConfig — materialize DB config thành Kong Service + Route

### Config input
- `system_code`
- `action_code`
- `version` (default `v1`)
- `app` (default `integration`)
- `upstream_url`
- `strip_path`

### Derived fields
- `route_path = /api/{version}/{app}/{SYSTEM_CODE}/{ACTION_CODE}`
- `service_name = {version}-{app}-{system_code}-{action_code}`
- `route_name = {service_name}-route`

```text
Client
  |
  | POST /api/v1/route-configs
  | body:{system_code,action_code,version?,app?,upstream_url,strip_path}
  v
HTTP Handler
  |
  | bind + validate required fields
  v
RouteConfigService
  |
  | default version/app if empty
  | build route_path + service_name + route_name
  v
DB TX BEGIN
  |
  +--> RouteConfigRepo.Create
  |      INSERT kong_route_configs
  |      {system_code, action_code, version, app,
  |       upstream_url, route_path, strip_path,
  |       status=PENDING, notify_status=NONE, notify_retries=0}
  |
  +--> KongAdminClient.CreateService
  |      POST /services
  |      payload:{name=service_name,url=upstream_url}
  |      <- kong_service_id
  |
  +--> KongAdminClient.CreateRoute
  |      POST /routes
  |      payload:{
  |        name=route_name,
  |        service.id=kong_service_id,
  |        paths=[route_path],
  |        strip_path=strip_path,
  |        protocols=[http,https]
  |      }
  |      <- kong_route_id
  |
  +--> RouteConfigRepo.Update
  |      UPDATE kong_route_configs
  |      SET {kong_service_id,kong_route_id,status=ACTIVE}
  |
  v
DB TX COMMIT
  |
  +--> HistoryRepo.NextVersion -> version=1
  +--> HistoryRepo.Create
  |      INSERT kong_route_config_history
  |      {config_version=1, change_type=CREATE,
  |       upstream_url, route_path,
  |       kong_service_id, kong_route_id,
  |       snapshot_data=json(cfg)}
  |
  +--> Notifier.Notify (async/best effort)
  |
  v
201 Created
```

### Persisted state
- Table `kong_route_configs`
  - DB source of truth: `system_code`, `action_code`, `version`, `app`, `upstream_url`, `route_path`, `strip_path`
  - sync state: `kong_service_id`, `kong_route_id`, `status`
- Table `kong_route_config_history`
  - snapshot version đầu tiên sau khi materialize thành công

### Kong materialized state
- `Service`
  - `name = service_name`
  - `url = upstream_url`
- `Route`
  - `name = route_name`
  - `paths = [route_path]`
  - `strip_path = strip_path`
  - `protocols = [http, https]`
  - `service.id = kong_service_id`

### Failure / consistency notes
- Nếu `CreateService` fail: DB tx rollback, không có Kong entity hợp lệ.
- Nếu `CreateRoute` fail sau khi đã tạo service: DB tx rollback + `defer` compensate `DeleteService(kong_service_id)`.
- History ghi **ngoài transaction**, nên có thể tồn tại config `ACTIVE` nhưng thiếu bản ghi history nếu best-effort step fail.

---

## 2. UpdateRouteConfig — chỉ sync `upstream_url` về Kong Service

### Config input
- `upstream_url`

```text
Client
  |
  | PUT /api/v1/route-configs/:id
  | body:{upstream_url}
  v
HTTP Handler
  |
  | parse :id + bind body
  v
RouteConfigService
  |
  +--> RouteConfigRepo.FindByID
  |      SELECT * FROM kong_route_configs WHERE id=?
  |
  +--> validate upstream_url != empty
  |
  +--> if kong_service_id != nil
  |      KongAdminClient.UpdateService
  |      PATCH /services/{kong_service_id}
  |      payload:{url=upstream_url}
  |
  +--> RouteConfigRepo.Update
  |      UPDATE kong_route_configs
  |      SET {upstream_url=..., updated_at=now()}
  |
  +--> HistoryRepo.NextVersion
  +--> HistoryRepo.Create
  |      INSERT history {change_type=UPDATE,
  |       upstream_url, route_path,
  |       kong_service_id, kong_route_id,
  |       snapshot_data=json(cfg)}
  |
  +--> Notifier.NotifyWithEvent("ROUTE_UPDATED")
  |
  v
200 OK
```

### Technical scope thực tế
- Có sync: `kong_route_configs.upstream_url -> Kong Service.url`
- Không sync trong flow này:
  - `route_path`
  - `strip_path`
  - `protocols`
  - plugin config
  - consumer / key-auth

### Consistency notes
- Tên method/comment có thể làm người đọc tưởng update rộng hơn, nhưng code hiện tại chỉ patch `Service.url` tại `srcs/dmst-admin-api/internal/service/route_config_svc.go:186`.
- Nếu `kong_service_id == nil`, DB vẫn có thể update `upstream_url`, tạo nguy cơ drift vì Kong không được patch.

---

## 3. DeleteRouteConfig — xóa Kong entities rồi xóa DB state

```text
Client
  |
  | DELETE /api/v1/route-configs/:id
  v
HTTP Handler
  v
RouteConfigService
  |
  +--> RouteConfigRepo.FindByID
  |      SELECT current config
  |
  +--> if kong_route_id != nil
  |      KongAdminClient.DeleteRoute
  |      DELETE /routes/{kong_route_id}
  |      warning only nếu lỗi
  |
  +--> if kong_service_id != nil
  |      KongAdminClient.DeleteService
  |      DELETE /services/{kong_service_id}
  |      warning only nếu lỗi
  |
  +--> HistoryRepo.DeleteByConfigID
  |      DELETE FROM kong_route_config_history WHERE kong_route_config_id=?
  |
  +--> RouteConfigRepo.Delete
  |      DELETE FROM kong_route_configs WHERE id=?
  |
  v
204 No Content
```

### Consistency notes
- Flow không dùng DB transaction bao toàn bộ delete sequence.
- Delete Kong được xử lý kiểu `warning only`; nếu Kong delete fail nhưng DB delete vẫn chạy, có thể để lại orphan entity trên Kong.
- History bị xóa cứng trước config để tránh FK constraint; sau delete không còn audit trail trong DB.

---

## 4. RollbackRouteConfig — rollback logic hiện chỉ restore `upstream_url`

```text
Client
  |
  | POST /api/v1/route-configs/:id/rollback
  v
HTTP Handler
  v
RouteConfigService
  |
  +--> RouteConfigRepo.FindByID
  |      SELECT current config
  |
  +--> HistoryRepo.FindLatestByConfigID
  |      SELECT latest history version = N
  |
  +--> HistoryRepo.FindPreviousByConfigID
  |      SELECT previous history version = N-1
  |
  +--> if kong_service_id != nil
  |      KongAdminClient.UpdateService
  |      PATCH /services/{kong_service_id}
  |      payload:{url=prev.upstream_url}
  |
  +--> RouteConfigRepo.Update
  |      UPDATE kong_route_configs
  |      SET {
  |        upstream_url = prev.upstream_url,
  |        route_path    = prev.route_path
  |      }
  |
  +--> HistoryRepo.NextVersion -> N+1
  +--> HistoryRepo.Create
  |      INSERT history {change_type=ROLLBACK,
  |       upstream_url, route_path,
  |       kong_service_id, kong_route_id,
  |       snapshot_data=json(cfg)}
  |
  +--> Notifier.NotifyWithEvent("ROUTE_ROLLBACK")
  |
  v
200 OK
```

### Rollback scope thật sự
- Có rollback trên Kong: `Service.url`
- Có rollback trong DB: `upstream_url`, `route_path`
- Không rollback trên Kong:
  - `Route.paths`
  - `Route.strip_path`
  - plugin bindings/config
  - consumer / key-auth

### Drift risk
- DB set lại `route_path`, nhưng Kong route **không** gọi `UpdateRoute`, nên DB và Kong có thể lệch nhau nếu route path từng thay đổi ở history.
- Snapshot lưu `snapshot_data`, nhưng logic rollback không deserialize full snapshot để restore đầy đủ config object.

---

## 5. CreateConsumer + CreateConsumerKey — DB first cho auth objects

### 5.1 CreateConsumer

#### Config input
- `username`

```text
Client
  |
  | POST /api/v1/consumers
  | body:{username}
  v
HTTP Handler
  v
KongAuthService
  |
  | validate username
  v
DB TX BEGIN
  |
  +--> KongAuthRepo.CreateConsumer
  |      INSERT kong_consumers
  |      {username,status=PENDING}
  |
  +--> KongAdminClient.CreateConsumer
  |      POST /consumers
  |      payload:{username}
  |      <- kong_consumer_id
  |
  +--> tx.Save
  |      UPDATE kong_consumers
  |      SET {kong_consumer_id,status=ACTIVE}
  |
  v
DB TX COMMIT
  |
  v
201 Created
```

### 5.2 CreateConsumerKey

#### Config input
- `key`

```text
Client
  |
  | POST /api/v1/consumers/:id/keys
  | body:{key}
  v
HTTP Handler
  v
KongAuthService
  |
  +--> SELECT kong_consumers WHERE id=?
  |      require kong_consumer_id != nil
  |
  v
DB TX BEGIN
  |
  +--> KongAuthRepo.CreateConsumerKey
  |      INSERT kong_consumer_keys
  |      {kong_consumer_id=<local consumer id>, key_value, status=PENDING}
  |
  +--> KongAdminClient.CreateKeyAuth
  |      POST /consumers/{kong_consumer_id}/key-auth
  |      payload:{key}
  |      <- kong_key_id
  |
  +--> tx.Save
  |      UPDATE kong_consumer_keys
  |      SET {kong_key_id,status=ACTIVE}
  |
  v
DB TX COMMIT
  |
  v
201 Created
```

### Persisted state
- `kong_consumers`
  - `username`, `custom_id?`, `kong_consumer_id`, `status`
- `kong_consumer_keys`
  - `kong_consumer_id` (local FK tới consumer row)
  - `key_value`
  - `kong_key_id`
  - `status`

### Consistency notes
- Không có history.
- Không có rollback.
- Không có re-sync job DB → Kong.
- `key_value` đang được lưu DB dạng plaintext tại `srcs/dmst-admin-api/internal/model/kong_consumer_key.go:12`.

---

## 6. AddPluginToRoute — attach plugin theo route scope

### Config input
- `plugin_name`
- `config` (`map[string]any`, optional ở request nhưng được gửi sang Kong nếu có)

```text
Client
  |
  | POST /api/v1/route-configs/:id/plugins
  | body:{plugin_name, config?}
  v
HTTP Handler
  v
KongAuthService
  |
  +--> SELECT kong_route_configs WHERE id=?
  |      require kong_route_id != nil
  |
  v
DB TX BEGIN
  |
  +--> KongAuthRepo.CreateRoutePlugin
  |      INSERT kong_route_plugins
  |      {kong_route_config_id, plugin_name, status=PENDING}
  |      NOTE: struct có field Config JSONB nhưng service hiện không set p.Config
  |
  +--> KongAdminClient.AddPluginToRoute
  |      POST /routes/{kong_route_id}/plugins
  |      payload:{name=plugin_name, config=config}
  |      <- kong_plugin_id
  |
  +--> tx.Save
  |      UPDATE kong_route_plugins
  |      SET {kong_plugin_id,status=ACTIVE}
  |
  v
DB TX COMMIT
  |
  v
201 Created
```

### Persisted state
- `kong_route_plugins`
  - `kong_route_config_id`
  - `plugin_name`
  - `kong_plugin_id`
  - `status`
  - `config` column tồn tại nhưng flow hiện tại chưa ghi payload config vào DB row

### Consistency notes
- Kong nhận `config`, DB hiện không persist `config` tương ứng → drift by design.
- Không có history plugin.
- Không có rollback / detach plugin.
- Không có re-sync plugin from DB snapshot.

---

## 7. Field mapping summary — DB config vs Kong entity

```text
┌──────────────────────────────────────┬──────────────────────────────┬──────────────────────────────┬──────────────────────────────┐
│ DB / Input field                     │ Kong target                  │ Sync flow                    │ Notes                        │
├──────────────────────────────────────┼──────────────────────────────┼──────────────────────────────┼──────────────────────────────┤
│ system_code + action_code            │ Route.name / Route.paths     │ Create only                  │ dùng để build route_path     │
│ version + app                        │ Service.name / Route.name    │ Create only                  │ default nếu request thiếu    │
│ upstream_url                         │ Service.url                  │ Create / Update / Rollback   │ field sync tốt nhất hiện tại │
│ route_path                           │ Route.paths[0]               │ Create only                  │ rollback DB có, Kong không   │
│ strip_path                           │ Route.strip_path             │ Create only                  │ update/rollback chưa sync    │
│ kong_service_id                      │ Service.id                   │ persisted after create       │ dùng cho patch/delete        │
│ kong_route_id                        │ Route.id                     │ persisted after create       │ dùng cho plugin/delete       │
│ consumer.username                    │ Consumer.username            │ Create only                  │ conflict handled ở Kong side │
│ consumer_key.key_value               │ key-auth.key                 │ Create only                  │ DB đang lưu plaintext        │
│ route_plugin.plugin_name             │ Plugin.name                  │ Create only                  │ route scope                  │
│ route_plugin.config                  │ Plugin.config                │ Kong only / DB partial       │ cột DB có nhưng chưa set     │
└──────────────────────────────────────┴──────────────────────────────┴──────────────────────────────┴──────────────────────────────┘
```

---

## 8. Support matrix — technical capability status

```text
┌─────────────────┬────────┬──────────┬─────────────┬──────────┬────────────────────┬──────────────────────────────┐
│ Capability      │ Lưu DB │ Kong ID  │ Transaction │ History  │ Rollback           │ Re-sync / Drift control      │
├─────────────────┼────────┼──────────┼─────────────┼──────────┼────────────────────┼──────────────────────────────┤
│ Route Config    │   ✅   │   ✅     │     ✅      │   ✅     │ ⚠️ upstream only   │ ❌ không có resync job        │
│ Consumer        │   ✅   │   ✅     │     ✅      │   ❌     │ ❌                 │ ❌                            │
│ Consumer Key    │   ✅   │   ✅     │     ✅      │   ❌     │ ❌                 │ ❌                            │
│ Route Plugin    │   ✅   │   ✅     │     ✅      │   ❌     │ ❌                 │ ❌                            │
│ Plugin Config   │   ⚠️   │   —      │     —       │   ❌     │ ❌                 │ ❌ DB không giữ full payload  │
└─────────────────┴────────┴──────────┴─────────────┴──────────┴────────────────────┴──────────────────────────────┘
```