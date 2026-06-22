-- =============================================================================
-- db/rbac.sql — RBAC (Module tree → Permission → PermissionGroup → User)
-- PostgreSQL 16+ — tham chiếu; runtime: GORM AutoMigrate + SeedCatalog
-- =============================================================================

-- ---------------------------------------------------------------------------
-- rbac_modules — cây chức năng (cha–con); quyền gắn vào node lá (id).
-- Cột code: slug ổn định (vd. quan-ly-ma-loi) phục vụ mã quyền & filter API.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS rbac_modules (
    id          BIGSERIAL PRIMARY KEY,
    code        VARCHAR(100) NOT NULL UNIQUE,
    name        VARCHAR(255) NOT NULL,
    parent_id   BIGINT REFERENCES rbac_modules(id) ON DELETE SET NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at  TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_rbac_modules_parent ON rbac_modules (parent_id);

COMMENT ON TABLE rbac_modules IS 'Danh mục chức năng dạng cây; permission.module_id trỏ node lá';
COMMENT ON COLUMN rbac_modules.parent_id IS 'NULL = node gốc';

-- ---------------------------------------------------------------------------
-- rbac_permissions — catalog (gắn module_id = lá)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS rbac_permissions (
    id          BIGSERIAL PRIMARY KEY,
    code        VARCHAR(100) NOT NULL UNIQUE,
    module_id   BIGINT NOT NULL REFERENCES rbac_modules(id) ON DELETE RESTRICT,
    action      VARCHAR(20)  NOT NULL,
    name        VARCHAR(255) NOT NULL,
    description VARCHAR(512),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at  TIMESTAMPTZ,

    CONSTRAINT uq_permission_module_id_action UNIQUE (module_id, action)
);

COMMENT ON TABLE rbac_permissions IS 'Quyền nguyên tử — seed từ code';
COMMENT ON COLUMN rbac_permissions.code IS 'Mã quyền: {module_code}:{action}';

CREATE INDEX IF NOT EXISTS idx_rbac_permissions_module_id ON rbac_permissions (module_id);

-- ---------------------------------------------------------------------------
-- rbac_permission_groups
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS rbac_permission_groups (
    id          BIGSERIAL PRIMARY KEY,
    code        VARCHAR(100) NOT NULL UNIQUE,
    name        VARCHAR(255) NOT NULL,
    description VARCHAR(512),
    status      VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at  TIMESTAMPTZ
);

-- ---------------------------------------------------------------------------
-- Junction tables
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS rbac_permission_group_permissions (
    permission_group_id BIGINT NOT NULL REFERENCES rbac_permission_groups(id) ON DELETE CASCADE,
    permission_id       BIGINT NOT NULL REFERENCES rbac_permissions(id) ON DELETE CASCADE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (permission_group_id, permission_id)
);

CREATE TABLE IF NOT EXISTS rbac_user_permission_groups (
    user_id             BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    permission_group_id BIGINT NOT NULL REFERENCES rbac_permission_groups(id) ON DELETE CASCADE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, permission_group_id)
);

CREATE TABLE IF NOT EXISTS rbac_user_permissions (
    user_id       BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    permission_id BIGINT NOT NULL REFERENCES rbac_permissions(id) ON DELETE CASCADE,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, permission_id)
);

CREATE INDEX IF NOT EXISTS idx_user_permission_groups_user   ON rbac_user_permission_groups (user_id);
CREATE INDEX IF NOT EXISTS idx_user_permission_groups_group  ON rbac_user_permission_groups (permission_group_id);
CREATE INDEX IF NOT EXISTS idx_user_permissions_user         ON rbac_user_permissions (user_id);
CREATE INDEX IF NOT EXISTS idx_user_permissions_permission   ON rbac_user_permissions (permission_id);

-- ---------------------------------------------------------------------------
-- Sơ đồ
-- ---------------------------------------------------------------------------
-- rbac_modules (cây)
-- Permission.module_id → lá
-- User ──M:N── PermissionGroup ──M:N── Permission
-- User ──M:N── Permission
