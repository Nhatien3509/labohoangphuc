#!/bin/bash
# ============================================
# 🏗️ Build Docker Image (Local Development)
# ============================================
# Wrapper tiện lợi để build image trên máy dev
# 
# Usage: ./build.sh [OPTIONS]
#   --prebuilt    Build bằng dotnet publish trên host
#   --debug       Build config Debug (default: Release)
#   --tag <tag>   Custom image tag (default: từ .env)
#
# Ví dụ:
#   ./build.sh                    # Build multi-stage, Release
#   ./build.sh --debug            # Build multi-stage, Debug
#   ./build.sh --prebuilt         # Build prebuilt mode
#   ./build.sh --tag v0.0.2       # Build với custom tag
# ============================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEPLOY_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"

# Forward tới deploy.sh với --build-only
DEPLOY_SCRIPT="${DEPLOY_ROOT}/scripts/ci/deploy.sh"

# Parse arguments
ARGS="portal dev --build-only"
while [[ $# -gt 0 ]]; do
  case "$1" in
    --debug)
      ARGS="$ARGS --build-config Debug"
      shift
      ;;
    --tag)
      ARGS="$ARGS $2"
      shift 2
      ;;
    *)
      ARGS="$ARGS $1"
      shift
      ;;
  esac
done

echo "🏗️ Building Portal image (dev)..."
bash "$DEPLOY_SCRIPT" $ARGS
