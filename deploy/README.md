# 🚀 Deploy Infrastructure

Thư mục chứa toàn bộ deployment infrastructure cho Portal project.

## 📁 Cấu trúc

```
deploy/
├── templates/              # Mẫu deploy → copy lên server
│   ├── portal.yml          # Docker Compose chính
│   ├── .env.example        # Env template (compose)
│   ├── .env.portal.example # Env template (app) — KHÔNG chứa secrets
│   ├── certificate/        # SSL cert scripts & files
│   └── umbraco/            # Volume mount structure
│
├── docker/                 # Dockerfiles & build config
│   └── portal/             # Portal service
│       ├── Dockerfile.portal          # Multi-stage (active)
│       └── Dockerfile.portal.prebuilt # Single-stage (prebuilt)
│
├── envs/                   # Biến môi trường theo environment
│   ├── dev/                #   Development
│   ├── poc/                #   Proof of Concept
│   └── prod/               #   Production
│
├── scripts/                # Scripts tự động
│   ├── ci/                 # Cho CI/CD pipeline & manual deploy
│   │   └── deploy.sh       # Build + deploy (parameterized)
│   ├── dev/                # Convenience wrappers cho developer
│   │   ├── build.sh        # Build image local (--build-only)
│   │   └── up.sh           # docker compose up local
│   ├── lib/                # Shared functions
│   │   ├── deploy_functions.sh
│   │   └── check_prerequisites.sh
│   └── logs/               # Deploy log files
│
└── docs/                   # Tài liệu tập trung
    ├── DEPLOY_GUIDE.md     # Hướng dẫn deploy step-by-step
    ├── DOCKER_DEPLOYMENT.md # Docker deployment guide
    ├── DOCKERFILE_COMPARISON.md
    ├── MANUAL_CHECK.md
    └── TEST_V2.md
```

## ⚡ Quick Start

### Development (local)

```bash
cd deploy/scripts/dev

# Build image
./build.sh

# Start containers
./up.sh

# Build + start + follow logs
./up.sh --build --logs
```

### Deploy to server

```bash
cd deploy/scripts/ci

# Deploy portal lên dev
./deploy.sh portal dev

# Deploy với custom tag
./deploy.sh portal dev v0.2.0

# Chỉ build, không deploy
./deploy.sh portal dev --build-only
```

### Setup mới trên server

1. Copy `deploy/templates/` lên server
2. Rename `.env.example` → `.env`, `.env.portal.example` → `.env.portal`
3. Điền giá trị thật (secrets, connection strings)
4. `docker compose -f portal.yml up -d`

## 📚 Tài liệu chi tiết

- [Deploy Guide](docs/DEPLOY_GUIDE.md) — Hướng dẫn deploy
- [Docker Deployment](docs/DOCKER_DEPLOYMENT.md) — Quản lý containers
