# syntax=docker/dockerfile:1
# ALL-IN-ONE: chạy cả Backend (Go) lẫn Frontend (Next.js) trong 1 container.
# Dùng cho gói Starter (1 service web gộp + 1 database = 2 slot).
# Vibe Hosting: trỏ service Website tới Dockerfile này, build context = thư mục gốc.

# ====== Build Backend (Go) ======
FROM golang:1.26-alpine AS gobuild
WORKDIR /src
COPY go.mod go.sum ./
RUN go mod download
COPY labo-warranty ./labo-warranty
RUN CGO_ENABLED=0 GOOS=linux go build -trimpath -ldflags="-s -w" -o /out/api ./labo-warranty/cmd/api

# ====== Build Frontend (Next.js standalone) ======
FROM node:20-alpine AS webbuild
WORKDIR /web
COPY web/portal-spa/package.json web/portal-spa/package-lock.json ./
RUN npm ci
COPY web/portal-spa/ ./
ENV STANDALONE=true NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ====== Runtime: Node (chạy Next) + Go binary ======
FROM node:20-alpine
RUN apk add --no-cache ca-certificates tzdata
WORKDIR /app

# Backend Go (binary tĩnh, chạy thẳng trên alpine)
COPY --from=gobuild /out/api /app/api

# Frontend Next.js standalone -> /app/web
COPY --from=webbuild /web/.next/standalone /app/web/
COPY --from=webbuild /web/.next/static /app/web/.next/static
COPY --from=webbuild /web/public /app/web/public

# Script chạy cả 2 tiến trình
COPY docker/start.sh /app/start.sh
RUN chmod +x /app/start.sh

# Backend cố định cổng 8080; FE gọi BE qua localhost (cùng container).
# Các biến DB_*, JWT_SECRET, SEED_ADMIN_* set ở dashboard Vibe Hosting.
ENV APP_ENV=production \
    SERVER_PORT=8080 \
    NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    HOSTNAME=0.0.0.0 \
    PORT=3600 \
    BACKEND_URL=http://localhost:8080

EXPOSE 3600
CMD ["/app/start.sh"]
