CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS mock_records (
    id                    UUID         NOT NULL DEFAULT gen_random_uuid(),
    id_nguon_du_lieu      VARCHAR(50)  NOT NULL,
    ten_nguon_du_lieu     VARCHAR(500),
    ma_loai_du_lieu       VARCHAR(100) NOT NULL,
    ten_loai_du_lieu      TEXT,
    phien_ban             INT          NOT NULL DEFAULT 1,
    ngay_hieu_luc         TIMESTAMPTZ,
    thoi_gian_cap_nhat    TIMESTAMPTZ,
    ma_dinh_danh_du_lieu  UUID,
    tieu_de               VARCHAR(500),
    mo_ta                 TEXT,
    tan_suat_cap_nhat     VARCHAR(50),
    ngay_cap_nhat         TIMESTAMPTZ,
    trang_thai            VARCHAR(20),
    du_lieu_bo_sung       JSONB,
    created_at            TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    PRIMARY KEY (id)
);

-- Filter indexes
CREATE INDEX IF NOT EXISTS idx_bbn_nguon ON mock_records (id_nguon_du_lieu);
CREATE INDEX IF NOT EXISTS idx_bbn_loai  ON mock_records (ma_loai_du_lieu);
CREATE INDEX IF NOT EXISTS idx_bbn_jsonb ON mock_records USING GIN (du_lieu_bo_sung);

-- Sort index cho deferred join với default ORDER BY (created_at DESC)
CREATE INDEX IF NOT EXISTS idx_bbn_created ON mock_records (created_at DESC, id);
