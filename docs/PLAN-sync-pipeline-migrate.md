# PLAN: Chuyển Fetcher Pipeline sang Integration-Service

> Chi tiết xem tại implementation_plan.md của conversation hiện tại.
> File này chỉ là placeholder trong docs/ để track.

## Tóm tắt

- **Admin-service**: Chỉ còn Cron Job → trigger HTTP call sang integration-service
- **Integration-service**: Nhận toàn bộ pipeline (Fetcher, Worker Pool, Checkpoint, DLQ)
- **Body request**: Các params (page_size, max_pages_cap, worker_count, etc.) truyền qua body POST `/api/v1/kho-mo/sync`

## Status: AWAITING USER REVIEW
