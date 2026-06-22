---
sidebar_position: 99
title: Changelog
description: Nhật ký các thay đổi kiến trúc và quyết định quan trọng
---

# Changelog

Nhật ký các thay đổi kiến trúc, quyết định kỹ thuật, và milestone quan trọng.

## 2026-04-07

### 🏗️ Khởi tạo Hệ thống Tài liệu
- Tạo `docs/` với cấu trúc hoàn chỉnh: getting-started, architecture, guidelines, workflow, ADR
- Setup **Docusaurus 3** trong `docs/site/` để render docs thành website
- Module **DBaaS** được xác nhận là **reference implementation** cho kiến trúc v6
- Tạo ADR-0001: Feature Slice Layout

### 📊 Migration Status
- DBaaS: ✅ migrate hoàn chỉnh (`_apis/`, `_lib/`, `_hooks/`, `_stores/`, alias `@dbaas/*`)
- 20+ modules còn lại: ⚠️ legacy structure

---

_Cập nhật changelog mỗi khi có thay đổi kiến trúc, quyết định ADR mới, hoặc module migrate xong._
