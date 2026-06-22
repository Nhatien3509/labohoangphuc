# Trace Logging Guide

## Overview

Logs trong HTTP requests sẽ tự động có `trace_id` từ OTel span. Áp dụng cho cả `admin-service` và `integration-service`.

| Layer | Helper | trace_id |
|-------|--------|----------|
| HTTP Handler | `logger.FromGin(c)` | ✅ |
| Service method | `logger.WithCtx(s.log, ctx)` | ✅ |
| Async goroutine | capture span trước khi launch | ✅ |
| Cron / Background job | `otel.Tracer("cron").Start(ctx, ...)` | ✅ (trace riêng) |

> `trace_id` không hiện trên stdout — chỉ thấy trên SigNoz (khi `OTEL_ENABLED=true`).

---

## Các kiểu log và destination

| Cách dùng | SigNoz | system_logs DB | audit_logs DB |
|---|---|---|---|
| `log.Info/Warn` | ✅ | ❌ | ❌ |
| `log.Error/Fatal` | ✅ | ✅ auto | ❌ |
| `logger.LogSystem(ctx, "INFO", msg, ...)` | ✅ | ✅ explicit | ❌ |
| `auditSvc.LogAction(ctx, LogEntry{...})` | ✅ | ❌ | ✅ |

**Hai bảng DB:**
- **`system_logs`**: lỗi kỹ thuật tự động (Error/Fatal) + event quan trọng chỉ định (LogSystem). Columns: `id, service_name, level, message, trace_id, created_at`
- **`audit_logs`**: business events (WHO did WHAT). Columns: `id, trace_id, action, resource, resource_id, actor_id, actor_name, actor_ip, old_value, new_value, created_at`

---

## Cơ chế hoạt động

```
[HTTP Request]
    ↓
[otelgin.Middleware] → extract W3C traceparent header (nếu có) → tạo span → gắn vào c.Request.Context()
    ↓
[logger.Middleware] → Log.With(ContextField(c.Request.Context())) → lưu vào gin context
    ↓
[Handler] → logger.FromGin(c) → log có trace_id ✅
    ↓
[Service] → logger.WithCtx(s.log, ctx) → log có trace_id ✅
```

`otelzap` bridge tự động extract span từ context khi ghi log lên OTLP (SigNoz).

---

## Pattern 1: HTTP Handler

```go
func (h *MyHandler) MyEndpoint(c *gin.Context) {
    log := logger.FromGin(c)  // ✅ logger đã có span context

    log.Info("handler start", zap.String("id", c.Param("id")))

    result, err := h.myService.DoSomething(c.Request.Context(), c.Param("id"))
    if err != nil {
        log.Error("service failed", zap.Error(err))  // ✅ auto ghi vào system_logs DB
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    log.Info("handler success")
    c.JSON(http.StatusOK, result)
}
```

---

## Pattern 2: Service Method

```go
func (s *myService) DoSomething(ctx context.Context, id string) (interface{}, error) {
    log := logger.WithCtx(s.log, ctx)  // ✅ wrap logger với ctx

    log.Info("fetching", zap.String("id", id))

    result, err := s.repo.GetByID(id)
    if err != nil {
        log.Error("query failed", zap.Error(err))
        return nil, err
    }

    log.Info("success")
    return result, nil
}
```

> `logger.WithCtx(l, ctx)` là shorthand cho `l.With(logger.ContextField(ctx))`.  
> Dùng `logger.WithCtx` — không dùng `logger.ContextField` trực tiếp.

---

## Pattern 3: LogSystem — ghi system_logs DB có chỉ định

Dùng khi muốn một INFO/WARN event quan trọng được lưu vào `system_logs` DB (không chỉ SigNoz):

```go
func (h *Handler) Sync(c *gin.Context) {
    log := logger.FromGin(c)

    result, err := h.TriggerSync(c.Request.Context(), &reqBody)
    if err != nil {
        log.Error("trigger failed", zap.Error(err))  // auto vào system_logs
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    // ✅ Ghi INFO vào cả SigNoz lẫn system_logs DB
    logger.LogSystem(c.Request.Context(), "INFO", "sync trigger thành công",
        zap.String("action", model.ActionTriggerSync),
    )
    c.JSON(http.StatusAccepted, gin.H{"status": "accepted"})
}
```

`level` nhận: `"INFO"`, `"WARN"`, `"ERROR"`, `"DEBUG"`.

---

## Pattern 4: auditSvc.LogAction — ghi audit_logs DB

Dùng cho business events cần audit trail (ai làm gì, lúc nào):

```go
func (h *KafkaHandler) CreateTopic(c *gin.Context) {
    log := logger.FromGin(c)

    // ... xử lý logic ...

    // ✅ Ghi SigNoz + audit_logs DB
    h.auditSvc.LogAction(c.Request.Context(), service.LogEntry{
        Action:     model.ActionCreateKafkaTopic,
        Resource:   model.ResourceKafkaTopic,
        ResourceID: req.Name,
        ActorID:    c.GetString("user_id"),
        ActorName:  c.GetString("user_name"),
        ActorIP:    c.ClientIP(),
    })

    log.Info("topic created", zap.String("name", req.Name))
    c.JSON(http.StatusCreated, result)
}
```

---

## Pattern 5: Async Goroutine (fire-and-forget)

Vấn đề: request context bị cancel ngay sau khi response trả về, goroutine sẽ mất span.

```go
func (h *Handler) TriggerAsync(c *gin.Context) {
    log := logger.FromGin(c)

    // ✅ Capture span TRƯỚC khi launch goroutine
    reqSpan := trace.SpanFromContext(c.Request.Context())

    go func() {
        // ✅ Attach span vào background context
        spanCtx := trace.ContextWithSpan(context.Background(), reqSpan)
        jobCtx, cancel := context.WithTimeout(spanCtx, 4*time.Hour)
        defer cancel()

        if err := h.svc.Run(jobCtx, params); err != nil {
            log.Error("async job failed", zap.Error(err))  // ✅ log capture từ closure
            return
        }
        log.Info("async job done")
    }()

    c.JSON(http.StatusAccepted, gin.H{"status": "accepted"})
}
```

**Quan trọng**:
- `reqSpan` phải được capture trước `go func()` — trong scope của handler
- `log` từ `logger.FromGin(c)` được capture bởi closure → goroutine logs cũng có trace_id
- `jobCtx` derive từ `spanCtx` → tất cả service methods gọi qua `jobCtx` cũng có trace_id

---

## Pattern 6: Cron / Scheduled Job

Cron không có HTTP request context, nhưng vẫn có thể tạo trace riêng.

```go
_, err := c.AddFunc(schedule, func() {
    // ✅ Tạo span mới cho cron run
    ctx, span := otel.Tracer("cron").Start(context.Background(), "my-cron-job")
    defer span.End()

    log := logger.Log.With(logger.ContextField(ctx))
    log.Info("cron started")

    // ✅ Truyền ctx → inject traceparent khi gọi HTTP sang service khác
    result, err := handler.TriggerSync(ctx, nil)
    if err != nil {
        log.Error("cron failed", zap.Error(err))
        return
    }
    log.Info("cron completed", zap.Any("result", result))
})
```

Cron sẽ có trace_id riêng. Nếu cron gọi sang service khác qua HTTP (có `otel.GetTextMapPropagator().Inject(ctx, header)`), service đó sẽ tạo child span → cùng trace_id.

---

## Cross-Service Tracing

Khi service A gọi service B qua HTTP:

**Service A (caller)**:
```go
otel.GetTextMapPropagator().Inject(ctx, propagation.HeaderCarrier(req.Header))
// → inject header: traceparent: 00-<trace_id>-<span_id>-01
```

**Service B (callee)**:
```go
r.Use(otelgin.Middleware(cfg.ServiceName))  // extract traceparent → tạo child span
r.Use(logger.Middleware())                  // wrap logger với span context
```

Kết quả: SigNoz hiển thị cả 2 service trong cùng 1 trace view.

---

## Checklist

### HTTP Handler:
- [ ] `log := logger.FromGin(c)` ở đầu method
- [ ] Dùng `log.Info/Error/Warn` thay `h.log`
- [ ] Truyền `c.Request.Context()` khi gọi service
- [ ] `log.Error(...)` → tự động vào system_logs DB
- [ ] `logger.LogSystem(ctx, "INFO", ...)` nếu cần ghi INFO vào system_logs DB
- [ ] `h.auditSvc.LogAction(ctx, ...)` cho business audit events

### Service Method:
- [ ] Signature có `ctx context.Context` là tham số đầu tiên
- [ ] `log := logger.WithCtx(s.log, ctx)` ở đầu method
- [ ] Dùng `log.Info/Error/Warn` thay `s.log`

### Async Goroutine:
- [ ] `reqSpan := trace.SpanFromContext(c.Request.Context())` trước `go func()`
- [ ] `spanCtx := trace.ContextWithSpan(context.Background(), reqSpan)` trong goroutine
- [ ] `jobCtx` derive từ `spanCtx`
- [ ] Dùng `log` captured từ closure (không dùng `h.log` bên trong goroutine)

### Cron Job:
- [ ] `ctx, span := otel.Tracer("cron").Start(context.Background(), "job-name")`
- [ ] `defer span.End()`
- [ ] `log := logger.Log.With(logger.ContextField(ctx))`
- [ ] Truyền `ctx` xuống tất cả calls

---

## Common Mistakes

```go
// ❌ Handler dùng h.log trực tiếp
func (h *Handler) Endpoint(c *gin.Context) {
    h.log.Info("start")  // no trace_id
}

// ❌ Service không nhận ctx
func (s *Service) Do(param string) error {
    s.log.Error("failed")  // no trace_id
}

// ❌ Goroutine dùng h.log (thay vì log từ closure)
go func() {
    h.log.Error("failed")  // no trace_id
}()

// ❌ Cron dùng context.Background() không có span
logger.Log.Info("cron start")  // no trace_id

// ❌ logger.LogSystem dùng sai — không truyền ctx
logger.LogSystem(context.Background(), "INFO", "done")  // trace_id = ""
```

```go
// ✅ Handler dùng FromGin
log := logger.FromGin(c)
log.Info("start")  // has trace_id

// ✅ Service dùng WithCtx
log := logger.WithCtx(s.log, ctx)
log.Error("failed")  // has trace_id + auto ghi system_logs DB

// ✅ Goroutine capture log từ handler scope
log := logger.FromGin(c)
reqSpan := trace.SpanFromContext(c.Request.Context())
go func() {
    log.Error("failed")  // has trace_id (từ closure)
}()

// ✅ Cron tạo span
ctx, span := otel.Tracer("cron").Start(context.Background(), "job")
defer span.End()
log := logger.Log.With(logger.ContextField(ctx))

// ✅ LogSystem với ctx từ request
logger.LogSystem(c.Request.Context(), "INFO", "event quan trọng")  // SigNoz + system_logs DB
```
