# 1. Quyền cho phép ứng dụng MÃ HÓA dữ liệu bằng key adm-srv-key
path "transit/encrypt/adm-srv-key" {
  capabilities = ["update"]
}

# 2. Quyền cho phép ứng dụng GIẢI MÃ dữ liệu bằng key adm-srv-key
path "transit/decrypt/adm-srv-key" {
  capabilities = ["update"]
}

# (Lưu ý: Tính năng Batch Encrypt/Decrypt trong Vault Transit sử dụng CHUNG 
# endpoint encrypt/decrypt ở trên, chỉ khác là body JSON truyền vào một mảng. 
# Nên không cần cấu hình thêm đường dẫn /* nào khác).

# 3. Quyền cho phép ứng dụng tự kiểm tra Token của chính nó (dùng cho LifetimeWatcher)
path "auth/token/lookup-self" {
  capabilities = ["read"]
}

# 4. Quyền cho phép ứng dụng tự gia hạn (renew) Token của chính nó (Auto-Renewal)
path "auth/token/renew-self" {
  capabilities = ["update"]
}
