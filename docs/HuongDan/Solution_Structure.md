# Solution Structure - Hệ thống Tích hợp, Chia sẻ dữ liệu TTST

## Tổng quan

Tài liệu mô tả cấu trúc Solution của **Hệ thống tích hợp, chia sẻ dữ liệu Trung tâm sáng tạo, khai thác dữ liệu (TTST)**. Hệ thống được thiết kế theo kiến trúc **Microservices** với backend viết bằng **Go (Golang)**, frontend bằng **Next.js (TypeScript)**, giao tiếp qua API Gateway (Kong) và Message Broker (Apache Kafka).

- Backend Go services tuân thủ **Go Standard Project Layout** (`cmd/`, `internal/`, `api/`, `migrations/`). Thư viện dùng chung đặt trong `pkg/`.
- Frontend Next.js tách riêng trong `web/` - không nằm trong `services/` vì khác runtime (Node.js vs Go).

---

## Cây thư mục Solution

```
src/
├── gateway/                                # API Gateway & Load Balancer
│   ├── kong/                               # Kong API Gateway (L7)
│   │   ├── config/                         # Cấu hình Kong (kong.yml, routes, services)
│   │   └── plugins/                        # Custom plugins (JWT, ACL, rate-limit)
│   └── haproxy/                            # HAProxy Load Balancer (L4)
│       └── config/                         # Cấu hình HAProxy + keepalived VIP
│
├── web/                                    # Frontend applications
│   └── portal-spa/                         # [Frontend] Next.js App
│       ├── public/                         # Static assets (favicon, images)
│       └── src/
│           ├── app/                        # App Router (pages, layouts, routes)
│           ├── components/                 # React components tái sử dụng
│           ├── lib/                        # Utilities, helpers, constants
│           ├── hooks/                      # Custom React hooks
│           ├── services/                   # API client, HTTP services
│           ├── stores/                     # State management (Zustand)
│           ├── styles/                     # Global styles (Tailwind CSS)
│           └── types/                      # TypeScript type definitions
│
├── services/                               # Backend Go Microservices
│   │
│   ├── integration-service/                # [Module 1] Quản lý tích hợp dữ liệu
│   │   ├── cmd/
│   │   │   └── server/
│   │   │       └── main.go                 # Entry point
│   │   ├── internal/                       # Private packages (Go enforced)
│   │   │   ├── config/                     # Cấu hình service (env, yaml)
│   │   │   ├── handler/                    # HTTP handlers (request/response)
│   │   │   ├── middleware/                 # Auth, logging, error handling
│   │   │   ├── model/                      # Domain entities & DTOs
│   │   │   ├── repository/                 # Data access layer (PostgreSQL)
│   │   │   ├── service/                    # Business logic layer
│   │   │   ├── kafka/
│   │   │   │   ├── producer/              # Publish messages to Kafka
│   │   │   │   └── consumer/              # Subscribe messages from Kafka
│   │   │   └── redis/                      # Cache & pre-filter trùng lặp
│   │   ├── api/                            # OpenAPI/Swagger specs (*.yaml)
│   │   ├── migrations/                     # SQL migration files
│   │   ├── go.mod                          # Go module definition
│   │   └── Dockerfile
│   │
│   ├── sharing-service/                    # [Module 2] Quản lý chia sẻ dữ liệu
│   │   ├── cmd/server/main.go
│   │   ├── internal/                       # (cấu trúc tương tự integration-service)
│   │   │   ├── config/
│   │   │   ├── handler/
│   │   │   ├── middleware/
│   │   │   ├── model/
│   │   │   ├── repository/
│   │   │   ├── service/
│   │   │   ├── kafka/{producer,consumer}/
│   │   │   └── redis/
│   │   ├── api/
│   │   ├── migrations/
│   │   ├── go.mod
│   │   └── Dockerfile
│   │
│   ├── admin-service/                      # [Module 3] Quản trị hệ thống
│   │   ├── cmd/server/main.go
│   │   ├── internal/
│   │   │   ├── config/
│   │   │   ├── handler/                    # User, Role, Permission CRUD
│   │   │   ├── middleware/
│   │   │   ├── model/                      # User, Role, Permission entities
│   │   │   ├── repository/
│   │   │   ├── service/                    # RBAC, SSO sync logic
│   │   │   └── redis/                      # Session storage
│   │   ├── api/
│   │   ├── migrations/
│   │   ├── go.mod
│   │   └── Dockerfile
│   │
│   ├── audit-service/                      # [Module 4a] Nhật ký kiểm toán
│   │   ├── cmd/server/main.go
│   │   ├── internal/
│   │   │   ├── config/
│   │   │   ├── handler/                    # Query audit logs
│   │   │   ├── middleware/
│   │   │   ├── model/                      # AuditLog entity (immutable)
│   │   │   ├── repository/
│   │   │   ├── service/
│   │   │   └── kafka/consumer/             # Consume từ AUDIT topic
│   │   ├── api/
│   │   ├── migrations/
│   │   ├── go.mod
│   │   └── Dockerfile
│   │
│   ├── masking-service/                    # [Module 4b] Che giấu dữ liệu nhạy cảm
│   │   ├── cmd/server/main.go
│   │   ├── internal/
│   │   │   ├── config/
│   │   │   ├── handler/                    # Masking policy CRUD, transform API
│   │   │   ├── middleware/
│   │   │   ├── model/                      # MaskingPolicy, MaskingRule
│   │   │   ├── repository/
│   │   │   └── service/                    # K-anonymity, tokenization
│   │   ├── api/
│   │   ├── migrations/
│   │   ├── go.mod
│   │   └── Dockerfile
│   │
│   ├── file-downloader-service/            # [Module 4c] Tải xuống/upload tệp
│   │   ├── cmd/server/main.go
│   │   ├── internal/
│   │   │   ├── config/
│   │   │   ├── handler/                    # Download/upload endpoints
│   │   │   ├── middleware/
│   │   │   ├── model/                      # FileMetadata entity
│   │   │   ├── service/                    # Stream download logic
│   │   │   ├── minio/                      # MinIO/S3 client adapter
│   │   │   └── knox/                       # Cloudera CDP Knox adapter
│   │   ├── api/
│   │   ├── migrations/
│   │   ├── go.mod
│   │   └── Dockerfile
│   │
│   └── monitoring-service/                 # [Module 5] Giám sát & báo cáo
│       ├── cmd/server/main.go
│       ├── internal/
│       │   ├── config/
│       │   ├── handler/                    # Dashboard, alert, report endpoints
│       │   ├── middleware/
│       │   ├── model/                      # AlertRule, Dashboard, Report
│       │   ├── repository/
│       │   ├── service/                    # Alert engine, report generation
│       │   └── signoz/                     # SigNoz OpenTelemetry adapter
│       ├── api/
│       ├── migrations/
│       ├── go.mod
│       └── Dockerfile
│
├── pkg/                                    # Shared Go packages (public)
│   ├── auth/                               # JWT validation, OIDC/PKCE client
│   ├── logging/                            # Structured logging (OpenTelemetry)
│   ├── kafka/                              # Kafka producer/consumer wrapper
│   ├── database/                           # PostgreSQL connection pool, helpers
│   ├── redis/                              # Redis client, cache, rate-limit
│   ├── minio/                              # MinIO/S3 client wrapper
│   ├── vault/                              # HashiCorp Vault client
│   ├── httputil/                           # HTTP response writer, pagination
│   ├── errutil/                            # Custom error types, error handling
│   └── go.mod
│
├── stream-processing/                      # Xử lý luồng dữ liệu
│   ├── flink-jobs/                         # Apache Flink jobs (Java 17, Maven)
│   │   ├── pom.xml                         # Maven dependencies & shade plugin
│   │   └── src/
│   │       ├── main/java/vn/ttst/flink/
│   │       │   ├── job/                    # Flink job entry points
│   │       │   │   └── DedupPipelineJob    # Kafka → Dedup → Sink Kho TTST
│   │       │   ├── source/                 # Kafka source factories
│   │       │   ├── operator/               # Stateful operators (dedup, transform)
│   │       │   ├── sink/                   # Sink implementations (JDBC, HDFS/Knox)
│   │       │   ├── schema/                 # Event POJOs (mapping Avro/JSON)
│   │       │   ├── config/                 # Job configuration loader
│   │       │   └── util/                   # Helpers
│   │       ├── main/resources/
│   │       │   └── application.properties  # Default config
│   │       └── test/java/vn/ttst/flink/    # Unit & integration tests
│   └── kafka/
│       ├── config/                         # Kafka broker, topic configurations
│       └── schemas/                        # Avro/JSON schemas (Schema Registry)
│
├── database/                               # Database trung tâm
│   └── postgresql/
│       ├── migrations/                     # Migration scripts dùng chung
│       ├── seeds/                          # Dữ liệu khởi tạo
│       └── schemas/                        # Database schema documentation
│
└── deploy/                                 # Triển khai & vận hành
    ├── docker/                             # Dockerfiles bổ sung
    ├── compose/                            # Docker Compose files
    │   ├── docker-compose.yml              # Compose cho môi trường dev
    │   └── .env.example                    # Biến môi trường mẫu
    ├── scripts/                            # Shell scripts (build, deploy, backup)
    └── config/                             # Cấu hình theo môi trường
        ├── dev/
        ├── staging/
        └── production/
```

---

## Giải thích Go Standard Project Layout

### Tại sao không dùng `src/`?

Go **không sử dụng** thư mục `src/` bên trong project. Đây là anti-pattern từ thời Go workspace (`GOPATH`). Thay vào đó, Go dùng:

| Thư mục | Ý nghĩa | Go enforcement |
|---|---|---|
| `cmd/` | Chứa `main.go` - entry point cho mỗi binary | Convention |
| `internal/` | Private packages - **Go compiler ngăn** import từ bên ngoài module | **Compiler enforced** |
| `pkg/` | Public packages - có thể import bởi các module khác | Convention |
| `api/` | OpenAPI/Swagger specs, protobuf definitions | Convention |

### Tại sao không dùng `controllers/`, `routes/`?

Go không dùng thuật ngữ MVC. Các quy ước chuẩn:

| Sai (Node.js style) | Đúng (Go style) | Lý do |
|---|---|---|
| `controllers/` | `handler/` | Go HTTP ecosystem dùng `http.Handler` interface |
| `routes/` | Khai báo trong `cmd/` hoặc `handler/` | Routes là wiring, không phải package riêng |
| `models/` (số nhiều) | `model/` (số ít) | Go packages dùng **số ít** |
| `services/` (số nhiều) | `service/` (số ít) | Go packages dùng **số ít** |
| `middlewares/` | `middleware/` | Go packages dùng **số ít** |
| `tests/unit/`, `tests/integration/` | `*_test.go` cùng thư mục | Go test nằm **cạnh source file** |

### Test files trong Go

Go **không tách** thư mục `tests/`. Test file đặt cùng thư mục với source:

```
internal/handler/
├── integration.go          # Source code
├── integration_test.go     # Unit test (cùng package)
```

Chạy test: `go test ./internal/handler/...`

---

## Mô tả các thành phần chính

### 1. Gateway (`src/gateway/`)

| Thành phần | Công nghệ | Vai trò |
|---|---|---|
| **HAProxy** | HAProxy L4 + keepalived | Load balancer lớp 4, cung cấp VIP (Virtual IP) |
| **Kong** | Kong OSS L7 | API Gateway - xác thực JWT, ACL, rate-limit, routing |

### 2. Web (`src/web/`)

| Thành phần | Công nghệ | Mô tả |
|---|---|---|
| **portal-spa** | Next.js, TypeScript, Zustand, Tailwind CSS | Giao diện người dùng SPA |

Frontend tách riêng khỏi `services/` vì khác runtime (Node.js) và toolchain (npm/yarn) so với backend Go.

### 3. Services (`src/services/`)

Mỗi Go service được tổ chức theo **3 lớp** trong `internal/`:

| Lớp | Package | Mô tả |
|---|---|---|
| **Handler** | `handler/`, `middleware/` | Tiếp nhận HTTP request, trả response, xác thực |
| **Service** | `service/` | Business logic thuần túy, không phụ thuộc framework |
| **Repository** | `repository/` | Data access layer, tương tác database |

Các adapter hạ tầng (`kafka/`, `redis/`, `minio/`, `knox/`, `signoz/`) nằm cùng cấp trong `internal/`.

#### Danh sách dịch vụ

| Service | Module | Chức năng chính | Hạ tầng phụ thuộc |
|---|---|---|---|
| **integration-service** | Module 1 | Tiếp nhận, xác thực, thu thập dữ liệu | PostgreSQL, Kafka, Redis  |
| **sharing-service** | Module 2 | Đăng ký, phê duyệt, cung cấp API chia sẻ | PostgreSQL, Kafka, Redis |
| **admin-service** | Module 3 | Quản lý user, phân quyền RBAC, SSO sync | PostgreSQL, Redis |
| **audit-service** | Module 4a | Ghi nhận immutable audit logs | PostgreSQL, Kafka |
| **masking-service** | Module 4b | K-anonymity, tokenization dữ liệu | PostgreSQL |
| **file-downloader-service** | Module 4c | Stream download/upload file | MinIO, Knox |
| **monitoring-service** | Module 5 | Dashboard, alert, báo cáo thống kê | PostgreSQL, SigNoz |

### 4. Shared Packages (`src/pkg/`)

Go packages dùng chung, import qua `go.mod` replace directive hoặc Go workspace:

| Package | Mô tả |
|---|---|
| **auth** | JWT token validation, OIDC/PKCE client cho SSO ĐMDC |
| **logging** | Structured logging tích hợp OpenTelemetry |
| **kafka** | Kafka producer/consumer wrapper chuẩn hóa |
| **database** | PostgreSQL connection pool, query helpers |
| **redis** | Redis client, cache utilities, rate-limit helpers |
| **minio** | MinIO/S3 client wrapper cho object storage |
| **vault** | HashiCorp Vault client cho quản lý secrets |
| **httputil** | HTTP response helpers, pagination, request parsing |
| **errutil** | Custom error types, error wrapping, error codes |

### 5. Stream Processing (`src/stream-processing/`)

Flink jobs viết bằng **Java 17**, build bằng **Maven**, đóng gói fat JAR qua `maven-shade-plugin`.

**Luồng xử lý chính (DedupPipelineJob):**

```
KafkaSource ──→ DedupOperator (stateful) ──→ TtstWarehouseSink
  (consume)     (keyed state, TTL dedup)      (JDBC / HDFS Knox)
```

| Package | Vai trò |
|---|---|
| `job/` | Entry point cho mỗi Flink job (`main()`) |
| `source/` | Kafka source factory (brokers, deserialization, offset) |
| `operator/` | Stateful operators - dedup dùng Flink keyed state + TTL |
| `sink/` | Sink ghi vào Kho TTST (JdbcSink, HDFS qua Knox) |
| `schema/` | Event POJOs mapping với Avro/JSON schemas |
| `config/` | Load cấu hình từ `application.properties` / env vars |

| Thành phần | Công nghệ | Vai trò |
|---|---|---|
| **Kafka Config** | Apache Kafka (KRaft) | Message broker, topic management |
| **Kafka Schemas** | Schema Registry (Avro/JSON) | Quản lý schema cho messages |

### 6. Database (`src/database/`)

Quản lý tập trung các migration scripts và seed data cho PostgreSQL 18 (Patroni HA).

### 7. Deploy (`src/deploy/`)

Cấu hình triển khai theo 3 môi trường: **dev**, **staging**, **production**.

---

## Luồng dữ liệu chính

```
┌──────────────┐     ┌──────────┐     ┌─────────────────────┐     ┌───────┐     ┌───────┐     ┌───────────┐
│ Nguồn dữ liệu│────▶│  Kong    │────▶│ integration-service │────▶│ Kafka │────▶│ Flink │────▶│ Warehouse │
│ (~200 APIs)   │     │ Gateway  │     │ (xác thực, metadata)│     │       │     │ (ETL) │     │ (CDP)     │
└──────────────┘     └──────────┘     └─────────────────────┘     └───────┘     └───────┘     └───────────┘
                                                                                                    │
                     ┌──────────┐     ┌─────────────────────┐                                       │
                     │  Kong    │◀────│  sharing-service    │◀──────────────────────────────────────┘
                     │ Gateway  │     │ (API chia sẻ)       │
                     └──────────┘     └─────────────────────┘
                          │
                          ▼
                  ┌───────────────┐
                  │ Hệ thống      │
                  │ tiêu thụ      │
                  └───────────────┘
```

---

## Quy ước đặt tên (Go conventions)

| Đối tượng | Quy ước | Ví dụ |
|---|---|---|
| Thư mục service | `kebab-case` | `integration-service` |
| Go package | **lowercase, số ít, không gạch** | `handler`, `model`, `service` |
| Go file | `snake_case.go` | `integration_handler.go` |
| Go test file | `*_test.go` cùng thư mục | `integration_handler_test.go` |
| Go struct | `PascalCase` | `IntegrationJob`, `DataSource` |
| Go interface | `PascalCase` + suffix `-er` | `Repository`, `Publisher` |
| Database migration | `YYYYMMDDHHMMSS_description.sql` | `20260429120000_create_users.sql` |
| Kafka topic | `ttst.<domain>.<event>` | `ttst.integration.data-received` |
| Environment variables | `UPPER_SNAKE_CASE` | `DB_HOST`, `KAFKA_BROKERS` |

---

## Hạ tầng công nghệ

| Thành phần | Công nghệ | Phiên bản | Ghi chú |
|---|---|---|---|
| Backend | **Go (Golang)** | 1.23 | Microservices |
| API Gateway | Kong OSS | 3.x | L7 routing, JWT/ACL/rate-limit |
| Load Balancer | HAProxy | - | L4, keepalived VIP |
| Database | PostgreSQL | 18 | Patroni HA, pgBackRest backup |
| Cache/Session | Redis | 7.x | Sentinel mode |
| Message Broker | Apache Kafka | KRaft mode | 3-broker cluster, Schema Registry |
| Stream Processing | Apache Flink | - | JobManager + 3 TaskManagers |
| Object Storage | MinIO | - | S3-compatible, erasure coding |
| Secrets Manager | HashiCorp Vault | - | HA mode (Raft consensus) |
| Observability | SigNoz | HA | OpenTelemetry native (logs/metrics/traces) |
| Frontend | Next.js | 15.x | App Router, TypeScript, Zustand, Tailwind CSS |
| Container | Docker Compose/Swarm | - | 40 VMs total |
