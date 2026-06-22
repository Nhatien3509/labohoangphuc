# Bật giao diện Web UI (Truy cập qua http://localhost:8200)
ui = true

# Cho phép Vault khóa bộ nhớ RAM (vì đã cấp quyền IPC_LOCK ở docker-compose)
disable_mlock = false

# [BẮT BUỘC với Raft] Địa chỉ API công khai của node này
api_addr = "http://127.0.0.1:8200"

# [BẮT BUỘC với Raft] Địa chỉ nội bộ để các Raft node giao tiếp với nhau (port 8201)
cluster_addr = "http://127.0.0.1:8201"

# Sử dụng Integrated Storage (Raft) - Best Practice hiện tại
storage "raft" {
  path    = "/vault/file"
  node_id = "vault-node-1"
}

# Cấu hình cổng lắng nghe
listener "tcp" {
  address     = "0.0.0.0:8200"
  # Tắt TLS (HTTPS) dùng cho môi trường Local/Dev.
  # Lên Production bắt buộc đổi thành 0 và cung cấp chứng chỉ SSL.
  tls_disable = "true"
}
