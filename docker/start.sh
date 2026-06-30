#!/bin/sh
# Chạy đồng thời Backend (Go) và Frontend (Next.js) trong cùng 1 container.
# Dùng cho gói Starter (gộp FE+BE vào 1 service). FE gọi BE qua localhost:8080.

echo "-> [start] Backend (Go) trên cổng ${SERVER_PORT:-8080}"
/app/api &
api_pid=$!

echo "-> [start] Frontend (Next.js) trên cổng ${PORT:-3600}"
cd /app/web || exit 1
node server.js &
web_pid=$!

# Nếu một trong hai tiến trình dừng -> thoát để Vibe Hosting tự khởi động lại container.
while kill -0 "$api_pid" 2>/dev/null && kill -0 "$web_pid" 2>/dev/null; do
  sleep 5
done

echo "-> [start] Một tiến trình đã dừng — thoát container để restart."
kill "$api_pid" "$web_pid" 2>/dev/null
exit 1
