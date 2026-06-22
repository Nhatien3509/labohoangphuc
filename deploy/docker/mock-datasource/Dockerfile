# Stage 1: Build
FROM golang:1.26-alpine AS builder

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN CGO_ENABLED=0 GOOS=linux go build -o server ./cmd/server/main.go
RUN CGO_ENABLED=0 GOOS=linux go build -o gen    ./cmd/gen/main.go

# Stage 2: Runtime
FROM alpine:latest

WORKDIR /app

COPY --from=builder /app/server .
COPY --from=builder /app/gen    .
COPY .env.example .env
COPY schemas/ schemas/

EXPOSE 8087

CMD ["./server"]
