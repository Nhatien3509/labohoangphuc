#!/usr/bin/env bash
# deploy-mock-datasource.sh
# Dùng: bash deploy/scripts/dev/deploy-mock-datasource.sh [image_tag]
# VD:   bash deploy/scripts/dev/deploy-mock-datasource.sh v1.0.0
#       bash deploy/scripts/dev/deploy-mock-datasource.sh          # dùng tag "latest"
set -euo pipefail

# ── Config ────────────────────────────────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"

SSH_KEY="$PROJECT_ROOT/dmst/secret-key/thcs_private_key.pem"
SERVER="almalinux@160.191.33.99"
REMOTE_DIR="\$HOME/thcs/deployments/dev/mock-datasource"

IMAGE_NAME="dmst-mock-datasource"
IMAGE_TAG="${1:-latest}"
FULL_IMAGE="${IMAGE_NAME}:${IMAGE_TAG}"
ARCHIVE="/tmp/${IMAGE_NAME}.tar.gz"

SERVICE_DIR="$PROJECT_ROOT/src/services/mock_datasource"
DOCKERFILE="$PROJECT_ROOT/deploy/docker/mock-datasource/Dockerfile"
COMPOSE_FILE="$PROJECT_ROOT/deploy/templates/mock-datasource.yml"
ENV_SERVICE_FILE="$PROJECT_ROOT/deploy/templates/.env.mock-datasource"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Deploy: $FULL_IMAGE → $SERVER"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# ── [1] Build ─────────────────────────────────────────────────────────────────
echo ""
echo "[1/5] Build Docker image..."
docker build -t "$FULL_IMAGE" -f "$DOCKERFILE" "$SERVICE_DIR"
echo "      ✓ $FULL_IMAGE"

# ── [2] Export ────────────────────────────────────────────────────────────────
echo ""
echo "[2/5] Export image → $ARCHIVE"
docker save "$FULL_IMAGE" | gzip > "$ARCHIVE"
SIZE=$(du -sh "$ARCHIVE" | cut -f1)
echo "      ✓ $SIZE"

# ── [3] Tạo thư mục trên server ───────────────────────────────────────────────
echo ""
echo "[3/5] Tạo thư mục trên server..."
ssh -i "$SSH_KEY" "$SERVER" "mkdir -p ~/thcs/deployments/dev/mock-datasource"
echo "      ✓ ~/thcs/deployments/dev/mock-datasource"

# ── [4] Copy files lên server ─────────────────────────────────────────────────
echo ""
echo "[4/5] Copy files lên server..."
scp -i "$SSH_KEY" "$ARCHIVE"          "$SERVER":~/
scp -i "$SSH_KEY" "$COMPOSE_FILE"     "$SERVER":~/thcs/deployments/dev/mock-datasource/docker-compose.yml
scp -i "$SSH_KEY" "$ENV_SERVICE_FILE" "$SERVER":~/thcs/deployments/dev/mock-datasource/.env.mock-datasource
echo "      ✓ image + docker-compose.yml + .env.mock-datasource"

# ── [5] Deploy trên server ────────────────────────────────────────────────────
echo ""
echo "[5/5] Deploy trên server..."

# Ghi .env (image tag + port)
ssh -i "$SSH_KEY" "$SERVER" "cat > ~/thcs/deployments/dev/mock-datasource/.env" <<EOF
IMAGE_MOCKDS=${FULL_IMAGE}
APP_PORT=8087
NETWORK_NAME=dmst_thcs_network
EOF

# Load image + restart service
ssh -i "$SSH_KEY" "$SERVER" bash <<REMOTE
set -e
echo "  Loading image..."
gunzip -c ~/${IMAGE_NAME}.tar.gz | docker load
rm -f ~/${IMAGE_NAME}.tar.gz

echo "  Starting service..."
cd ~/thcs/deployments/dev/mock-datasource
docker compose down --remove-orphans 2>/dev/null || true
docker compose up -d

echo ""
docker compose ps
REMOTE

# ── Done ──────────────────────────────────────────────────────────────────────
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Done!"
echo "  Health : http://160.191.33.99:8087/health"
echo "  API    : http://160.191.33.99:8087/api/v1/ud-tap-du-lieu/tim-kiem?Page=1&Size=10&Count=1"
echo "  Gen    : POST http://160.191.33.99:8087/api/v1/gen/schema/G02_001?count=5000"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
