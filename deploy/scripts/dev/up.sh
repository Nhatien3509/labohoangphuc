#!/bin/bash
# ============================================
# 🚀 Docker Compose Up (Local Development)
# ============================================
# Usage: ./up.sh <service> [OPTIONS]
#
# Services: portal (thêm service mới khi cần)
#
# Options:
#   --build     Build image trước khi start
#   --down      Stop containers trước khi start
#   --logs      Theo dõi logs sau khi start
#
# Ví dụ:
#   ./up.sh portal                  # Start portal
#   ./up.sh portal --build          # Build + start
#   ./up.sh portal --down --build   # Down + build + start
#   ./up.sh portal --logs           # Start + follow logs
# ============================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEPLOY_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"

# Parse service argument
if [ $# -lt 1 ]; then
  echo "Usage: $0 <service> [--build] [--down] [--logs]"
  echo "Services: portal"
  exit 1
fi

SERVICE="$1"
shift

# Resolve compose file
COMPOSE_FILE="${DEPLOY_ROOT}/templates/${SERVICE}.yml"
if [ ! -f "$COMPOSE_FILE" ]; then
  echo "❌ Compose file not found: $COMPOSE_FILE"
  echo "💡 Tạo file templates/${SERVICE}.yml trước"
  exit 1
fi

DO_BUILD=false
DO_DOWN=false
DO_LOGS=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --build) DO_BUILD=true; shift ;;
    --down)  DO_DOWN=true; shift ;;
    --logs)  DO_LOGS=true; shift ;;
    *)
      echo "❌ Unknown option: $1"
      exit 1
      ;;
  esac
done

cd "${DEPLOY_ROOT}/templates"

if [ "$DO_DOWN" = true ]; then
  echo "🧹 Stopping existing containers..."
  docker compose -f "$COMPOSE_FILE" down
fi

if [ "$DO_BUILD" = true ]; then
  echo "🏗️ Building images..."
  docker compose -f "$COMPOSE_FILE" build
fi

echo "🚀 Starting ${SERVICE}..."
docker compose -f "$COMPOSE_FILE" up -d

echo "📊 Container status:"
docker compose -f "$COMPOSE_FILE" ps

if [ "$DO_LOGS" = true ]; then
  echo ""
  echo "📋 Following logs (Ctrl+C to stop)..."
  docker compose -f "$COMPOSE_FILE" logs -f
fi
