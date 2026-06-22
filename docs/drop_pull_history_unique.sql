-- Chạy câu này 1 lần trên database để bỏ unique constraint cũ.
-- GORM không tự drop index cũ khi bạn đổi từ uniqueIndex → index.

-- Kiểm tra tên index thực tế:
SELECT indexname FROM pg_indexes WHERE tablename = 'pull_history';

-- Drop unique index (thử từng câu, chạy cái nào có kết quả):
DROP INDEX IF EXISTS idx_pull_history_job_id;
DROP INDEX IF EXISTS uni_pull_history_job_id;
