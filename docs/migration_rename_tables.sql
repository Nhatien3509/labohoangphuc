-- Đổi tên bảng job_failed_pages
ALTER TABLE job_failed_pages RENAME TO pull_errors;
ALTER INDEX idx_failed_pages_job_status RENAME TO idx_pull_errors_job_status;

-- Đổi tên bảng sync_state_data
ALTER TABLE sync_state_data RENAME TO pull_history;
ALTER INDEX idx_sync_state_data_status RENAME TO idx_pull_history_status;
ALTER INDEX idx_sync_state_data_job_id RENAME TO idx_pull_history_job_id;
