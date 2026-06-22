-- =============================================================================
-- db/init.sql — POC Kong Integration
-- PostgreSQL 16+ — chạy tự động qua docker-entrypoint-initdb.d
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Table 1: kong_route_configs
-- Lưu cấu hình route và trạng thái đồng bộ với Kong Gateway
-- ---------------------------------------------------------------------------
CREATE TABLE kong_route_configs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    system_code     VARCHAR(50)  NOT NULL,
    action_code     VARCHAR(100) NOT NULL,
    version         VARCHAR(10)  NOT NULL DEFAULT 'v1',
    app             VARCHAR(50)  NOT NULL DEFAULT 'integration',
    upstream_url    VARCHAR(500) NOT NULL,
    route_path      VARCHAR(500) NOT NULL,
    kong_service_id UUID,
    kong_route_id   UUID,
    strip_path      BOOLEAN      NOT NULL DEFAULT FALSE,
    status          VARCHAR(20)  NOT NULL DEFAULT 'PENDING',
    notify_status   VARCHAR(20)           DEFAULT 'NONE',
    notify_retries  INT                   DEFAULT 0,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_route_config UNIQUE (version, app, system_code, action_code)
);

COMMENT ON TABLE kong_route_configs IS 'Cấu hình route Kong — nguồn sự thật cho việc đồng bộ Kong Gateway';
COMMENT ON COLUMN kong_route_configs.status IS 'PENDING | ACTIVE | DELETED';
COMMENT ON COLUMN kong_route_configs.notify_status IS 'NONE | SENT | FAILED';

-- ---------------------------------------------------------------------------
-- Table 2: kong_route_config_history
-- Audit trail — lưu snapshot mỗi lần thay đổi, dùng để rollback
-- ---------------------------------------------------------------------------
CREATE TABLE kong_route_config_history (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kong_route_config_id UUID        NOT NULL REFERENCES kong_route_configs(id) ON DELETE CASCADE,
    config_version       INT         NOT NULL,
    upstream_url         VARCHAR(500) NOT NULL,
    route_path           VARCHAR(500) NOT NULL,
    kong_service_id      UUID,
    kong_route_id        UUID,
    change_type          VARCHAR(20) NOT NULL,
    changed_by           VARCHAR(100),
    changed_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    snapshot_data        JSONB
);

COMMENT ON TABLE kong_route_config_history IS 'Lịch sử thay đổi route — mỗi record là snapshot đầy đủ tại thời điểm thay đổi';
COMMENT ON COLUMN kong_route_config_history.change_type IS 'CREATE | UPDATE | ROLLBACK | DELETE';
COMMENT ON COLUMN kong_route_config_history.config_version IS 'Số version tăng dần theo từng thay đổi của route config';
COMMENT ON COLUMN kong_route_config_history.snapshot_data IS 'Full JSON snapshot của kong_route_configs tại thời điểm thay đổi';

-- ---------------------------------------------------------------------------
-- Table 3: kong_audits
-- Log mọi action gọi Kong Admin API — dùng để debug và trace
-- ---------------------------------------------------------------------------
CREATE TABLE kong_audits (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kong_route_config_id UUID REFERENCES kong_route_configs(id) ON DELETE CASCADE,
    action_type          VARCHAR(50) NOT NULL,
    request_payload      JSONB,
    response_payload     JSONB,
    response_status      INT,
    executed_by          VARCHAR(100),
    created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE kong_audits IS 'Log audit mọi thao tác với Kong Admin API';
COMMENT ON COLUMN kong_audits.action_type IS 'CREATE_SERVICE | CREATE_ROUTE | UPDATE_SERVICE | UPDATE_ROUTE | DELETE_SERVICE | DELETE_ROUTE';

-- ---------------------------------------------------------------------------
-- Indexes bổ sung
-- ---------------------------------------------------------------------------
CREATE INDEX idx_kong_route_configs_status ON kong_route_configs (status);
CREATE INDEX idx_kong_route_configs_system ON kong_route_configs (system_code, action_code);
CREATE INDEX idx_history_config_id         ON kong_route_config_history (kong_route_config_id);
CREATE INDEX idx_audits_config_id          ON kong_audits (kong_route_config_id);

-- ---------------------------------------------------------------------------
-- Table 4: flink_jobs
-- Lưu metadata Flink jobs — auto-extract từ JAR manifest
-- ---------------------------------------------------------------------------
CREATE TABLE flink_jobs (
    id                  VARCHAR(64) PRIMARY KEY,
    name                VARCHAR(255) NOT NULL,
    entry_class         VARCHAR(255) NOT NULL UNIQUE,
    jar_file_path       VARCHAR(512),
    description         TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE flink_jobs IS 'Metadata Flink jobs — auto-register khi upload JAR';
COMMENT ON COLUMN flink_jobs.id IS 'Job ID từ MANIFEST.MF (Job-Id)';
COMMENT ON COLUMN flink_jobs.entry_class IS 'Main class từ MANIFEST.MF (Main-Class)';
COMMENT ON COLUMN flink_jobs.jar_file_path IS 'Path tới JAR file trên server';

-- ---------------------------------------------------------------------------
-- Table 5: flink_job_params
-- Lưu required/optional parameters cho mỗi job
-- ---------------------------------------------------------------------------
CREATE TABLE flink_job_params (
    id              BIGSERIAL PRIMARY KEY,
    job_id          VARCHAR(64) NOT NULL REFERENCES flink_jobs(id) ON DELETE CASCADE,
    param_name      VARCHAR(255) NOT NULL,
    param_type      VARCHAR(32) NOT NULL DEFAULT 'string',
    is_required     BOOLEAN NOT NULL DEFAULT false,
    default_value   TEXT,
    description     TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_param UNIQUE (job_id, param_name)
);

COMMENT ON TABLE flink_job_params IS 'Parameter definitions cho Flink jobs';
COMMENT ON COLUMN flink_job_params.param_type IS 'string | int | boolean | long';

-- ---------------------------------------------------------------------------
-- Table 6: flink_job_executions
-- Audit trail — lưu mỗi lần submit job và kết quả
-- ---------------------------------------------------------------------------
CREATE TABLE flink_job_executions (
    id              VARCHAR(64) PRIMARY KEY,
    job_id          VARCHAR(64) NOT NULL REFERENCES flink_jobs(id) ON DELETE RESTRICT,
    flink_job_id    VARCHAR(64),
    status          VARCHAR(32) NOT NULL DEFAULT 'SUBMITTED',
    config_json     JSONB,
    submitted_by    VARCHAR(255),
    submit_time     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    finish_time     TIMESTAMPTZ,
    error_message   TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE flink_job_executions IS 'Job execution history — mỗi record là 1 lần submit';
COMMENT ON COLUMN flink_job_executions.status IS 'SUBMITTED | RUNNING | COMPLETED | FAILED | CANCELLED';
COMMENT ON COLUMN flink_job_executions.flink_job_id IS 'Job ID trả về từ Flink REST API';
COMMENT ON COLUMN flink_job_executions.config_json IS 'JSON toàn bộ parameters được submit';

-- ---------------------------------------------------------------------------
-- Indexes cho Flink tables
-- ---------------------------------------------------------------------------
CREATE INDEX idx_flink_jobs_entry_class     ON flink_jobs (entry_class);
CREATE INDEX idx_flink_params_job_id        ON flink_job_params (job_id);
CREATE INDEX idx_flink_executions_job_id    ON flink_job_executions (job_id);
CREATE INDEX idx_flink_executions_status    ON flink_job_executions (status);
CREATE INDEX idx_flink_executions_submit    ON flink_job_executions (submit_time DESC);
