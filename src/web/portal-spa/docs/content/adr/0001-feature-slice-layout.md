---
sidebar_position: 2
title: "ADR-0001: Feature Slice Layout"
description: "Quyết định chọn Feature Slice mini-project layout"
---

# ADR-0001: Feature Slice Layout

- **Status**: accepted

## Decision

Áp dụng **Feature Slice mini-project layout** cho mỗi module:

```
src/app/[locale]/{module}/
├── _apis/          # API layer (server.ts, server.actions.ts, types.ts, urns.ts)
├── _lib/           # Business logic (const.ts, helpers.ts, validators.ts)
├── _hooks/         # Module-scoped hooks
├── _stores/        # Module-scoped Zustand stores
└── {routes}/       # Route pages + colocated schemas.ts
```

Kèm theo:
- Path alias `@{module}/*` cho module imports
- Import boundary: module → `@common/*` ✅, module → module ❌
- Validation tách: `validators.ts` (regex/predicates) + `schemas.ts` (Zod, colocated)
- DBaaS là pilot module, sau đó rollout cho các modules khác

## Alternatives Considered

### 1. Domain-Driven Design (DDD) folders
- Tách theo `domain/`, `application/`, `infrastructure/`
- **Loại bỏ**: Quá phức tạp cho frontend, team nhỏ

### 2. Giữ kiến trúc hiện tại + chỉ refactor imports
- **Loại bỏ**: Không giải quyết root cause coupling

### 3. Nx/Turborepo monorepo
- Mỗi module là 1 package riêng
- **Loại bỏ**: Overhead quá lớn cho team size hiện tại

## Consequences

### Positive
- Mỗi module self-contained, dễ hiểu scope
- Onboarding nhanh hơn: chỉ cần nhìn 1 module anatomy doc
- Import boundaries ngăn coupling
- Dễ migrate incremental (module by module)

### Negative
- Migration effort lớn cho 20+ legacy modules
- Giai đoạn chuyển tiếp có 2 kiến trúc tồn tại song song
- Cần discipline từ cả team và đối tác

### Risks
- Nếu không migrate hết, codebase bị fragmented
- Mitigation: tracking qua [Migration Status](../architecture/migration-status.md), ưu tiên modules đối tác phát triển
