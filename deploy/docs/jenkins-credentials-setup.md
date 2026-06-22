# Hướng dẫn Thiết lập Credentials & Kết nối Jenkins cho THCS

Tài liệu này hướng dẫn chi tiết cách thiết lập các thông tin xác thực (Credentials) và các kết nối cần thiết trên hệ thống Jenkins để chạy CI/CD Pipeline cho dự án THCS.

---

## 1. Truy cập trang quản lý Credentials
1. Đăng nhập Jenkins Admin.
2. Dashboard -> **Manage Jenkins** -> **Credentials**.
3. Store **System** -> **Global credentials (unrestricted)**.
4. Chọn **Add Credentials**.

---

## 2. Các Credentials Cần Thiết

### 2.1. Harbor Docker Registry (`registry-thcs-user`)
Dùng để push image lên Harbor.
- **Kind:** `Username with password`
- **ID:** `registry-thcs-user`
- **Username:** Tài khoản Harbor (ví dụ: `robot$thcs`).
- **Password:** Mật khẩu/Token của user Harbor.
- **Description:** `Harbor registry credential for THCS project`.

### 2.2. SSH Key Máy Chủ Deploy (`thcs-dev-ssh-key`)
Dùng để SSH vào máy chủ `160.191.32.224`.
- **Kind:** `SSH Username with private key`
- **ID:** `thcs-dev-ssh-key`
- **Username:** `almalinux`
- **Private Key:** Chọn **Enter directly** và dán nội dung file `.pem` hoặc `id_rsa`.
- **Description:** `SSH Key for THCS App Server 160.191.32.224`.

### 2.3. Telegram Notification
Pipeline gửi thông báo vào Group riêng của THCS qua Topic.

**Bot Token (`telegram-bot-token`):**
- **Kind:** `Secret text`
- **Secret:** HTTP API Token từ BotFather (dùng chung với H04).
- **ID:** `telegram-bot-token`

**Chat ID (`thcs-telegram-chat-id`):**
- **Kind:** `Secret text`
- **Secret:** ID của Group Telegram THCS (ví dụ: `-100...`).
- **ID:** `thcs-telegram-chat-id`

**Topic ID (`thcs-telegram-topic-id`):**
- **Kind:** `Secret text`
- **Secret:** ID của Topic (thread) trong group.
- **ID:** `thcs-telegram-topic-id`

---

## 3. Cấu hình Kết Nối GitLab

### Bước 3.1: GitLab Connection (System)
- Vào **Manage Jenkins** -> **System**.
- Tìm mục **GitLab**:
    - **Connection name:** `GitLab` (Bắt buộc đúng tên này).
    - **GitLab host URL:** `https://git.egovernment.com.vn/`
    - **Credentials:** Chọn API Token đã có (hoặc tạo mới loại `GitLab API token`).

### Bước 3.2: Pipeline Job
1. Tạo Folder: **THCS**.
2. Trong Folder, tạo Job: **thcs-monorepo** (loại Pipeline).
3. Cấu hình Pipeline:
    - **Definition:** `Pipeline script from SCM`.
    - **SCM:** `Git`.
    - **Repository URL:** `https://git.egovernment.com.vn/dmst/26.dmst.c12.tichhopchiase.git`.
    - **Credentials:** Chọn SSH Key hoặc User/Pass có quyền clone repo.
    - **Branch Specifier:** `*/develop` (hoặc `${gitlabSourceBranch}` nếu muốn build dynamic branch).
    - **Script Path:** `jenkinsfile`.

---

## 4. Thiết lập Webhook từ GitLab

1. Vào Repository trên GitLab -> **Settings** -> **Webhooks**.
2. **URL:** `http://<dia-chi-jenkins>/project/THCS/thcs-monorepo`.
3. **Secret token:** Lấy từ Job config (Build Triggers -> Advanced -> Secret token).
4. **Trigger:** Tích chọn **Push events**.
5. Nhấn **Add webhook**.

---

## 5. Hướng dẫn sử dụng Deploy Tag

Pipeline chỉ build và deploy khi commit message chứa tag tương ứng:

| Tag | Dịch vụ triển khai |
|---|---|
| `[deploy:admin]` | admin-service |
| `[deploy:audit]` | audit-service |
| `[deploy:file-downloader]` | file-downloader-service |
| `[deploy:integration]` | integration-service |
| `[deploy:masking]` | masking-service |
| `[deploy:monitoring]` | monitoring-service |
| `[deploy:sharing]` | sharing-service |
| `[deploy:portal]` | portal-spa |
| `[deploy:backend]` | **Tất cả 7 dịch vụ backend** |
| `[deploy:all]` | **Toàn bộ 8 dịch vụ** |

**Ví dụ commit message:**

`fix: cập nhật logic phân quyền [deploy:admin]`

`feat: thêm tính năng mới [deploy:backend]`

`feat: [deploy:portal]`