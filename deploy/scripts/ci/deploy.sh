#!/bin/bash
# ============================================
# Universal Deploy Script
# ============================================
# Usage: ./deploy.sh <service[,service2,...]> <environment> [IMAGE_TAG] [OPTIONS]
#
# Service có thể là 1 hoặc nhiều, phân cách bằng dấu phẩy (không có dấu cách).
#
# Examples:
#   ./deploy.sh ingest demo                   # Deploy 1 service
#   ./deploy.sh ingest,mockds demo            # Deploy 2 services
#   ./deploy.sh config,dest,kafka demo v0.3.0 # Deploy 3 services với tag cụ thể
#   ./deploy.sh config demo --cleanup         # Deploy + cleanup
#   ./deploy.sh ingest demo --build-only      # Chỉ build image, không deploy
# ============================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEPLOY_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"

# Load valid environments dynamically
VALID_ENVS=($(ls -d ${DEPLOY_ROOT}/envs/*/ 2>/dev/null | xargs -n1 basename 2>/dev/null || true))

# Load valid services dynamically from docker/ folder
VALID_SERVICES=($(ls -d ${DEPLOY_ROOT}/docker/*/ 2>/dev/null | xargs -n1 basename 2>/dev/null || true))

# ==============================
# Help & Usage
# ==============================
show_help() {
  echo "Usage: $0 <service[,service2,...]> <environment> [IMAGE_TAG] [OPTIONS]"
  echo ""
  echo "Services  : ${VALID_SERVICES[*]// /, }"
  echo "Environments: ${VALID_ENVS[*]// /, }"
  echo ""
  echo "Options:"
  echo "  --cleanup                Cleanup old Docker images after deploy"
  echo "  --build-only             Only build and save image, do NOT deploy"
  echo "  --force-compose          Force overwrite compose file on server (default: skip if exists)"
  echo "  --prebuilt               Build on host (dotnet publish) then COPY into image"
  echo "  --build-config <config>  .NET build configuration (Debug | Release)"
  echo "  --app-version <version>  .NET application version (e.g., 1.0.0)"
  echo "  --compose-service <name> Specific service name in docker-compose.yml to deploy"
  echo "  --help                   Show this help message"
  echo ""
  echo "Examples:"
  echo "  $0 ingest demo                   # Deploy single service"
  echo "  $0 ingest,mockds demo            # Deploy multiple services"
  echo "  $0 config,dest,kafka demo v0.3.0 # Multiple services + specific tag"
  echo "  $0 ingest demo --build-only      # Build only, no deploy"
  echo "  $0 config demo --cleanup         # Deploy + cleanup old images"
}

# ==============================
# Parse Arguments
# ==============================
if [[ "${1:-}" == "--help" || "${1:-}" == "-h" ]]; then
  show_help
  exit 0
fi

if [ $# -lt 2 ]; then
  show_help
  exit 1
fi

SERVICE_RAW="$1"
ENVIRONMENT="$2"
shift 2

# Normalize: replace commas with spaces → array of service names
SERVICE_LIST="${SERVICE_RAW//,/ }"

# Validate environment
if [[ ! " ${VALID_ENVS[@]} " =~ " ${ENVIRONMENT} " ]]; then
  echo "❌ Invalid environment: $ENVIRONMENT"
  echo "Valid environments: ${VALID_ENVS[*]}"
  exit 1
fi

# Validate all services up-front before doing any work
for SVC in $SERVICE_LIST; do
  if [[ ! " ${VALID_SERVICES[@]} " =~ " ${SVC} " ]]; then
    echo "❌ Invalid service: $SVC"
    echo "Valid services: ${VALID_SERVICES[*]}"
    exit 1
  fi
done

# Parse remaining flags
DO_CLEANUP="false"
BUILD_ONLY="false"
PREBUILT="false"
FORCE_COMPOSE="false"
CUSTOM_TAG=""
BUILD_CONFIG=""
APP_VERSION=""
COMPOSE_SERVICE=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --cleanup)
      DO_CLEANUP="true"
      shift
      ;;
    --build-only)
      BUILD_ONLY="true"
      shift
      ;;
    --force-compose)
      FORCE_COMPOSE="true"
      shift
      ;;
    --prebuilt)
      PREBUILT="true"
      shift
      ;;
    --build-config)
      if [ -n "${2:-}" ] && [ "${2:0:1}" != "-" ]; then
        BUILD_CONFIG="$2"
        shift 2
      else
        echo "❌ Error: Argument for --build-config is missing"
        exit 1
      fi
      ;;
    --app-version)
      if [ -n "${2:-}" ] && [ "${2:0:1}" != "-" ]; then
        APP_VERSION="$2"
        shift 2
      else
        echo "❌ Error: Argument for --app-version is missing"
        exit 1
      fi
      ;;
    --help)
      show_help
      exit 0
      ;;
    v*)
      CUSTOM_TAG="$1"
      shift
      ;;
    --compose-service)
      if [ -n "${2:-}" ] && [ "${2:0:1}" != "-" ]; then
        COMPOSE_SERVICE="$2"
        shift 2
      else
        echo "❌ Error: Argument for --compose-service is missing"
        exit 1
      fi
      ;;
    *)
      echo "❌ Unknown argument: $1"
      show_help
      exit 1
      ;;
  esac
done

# Validate build config if provided
if [ -n "$BUILD_CONFIG" ] && [[ "$BUILD_CONFIG" != "Debug" && "$BUILD_CONFIG" != "Release" ]]; then
  echo "❌ Invalid build-config: $BUILD_CONFIG"
  echo "Valid configs: Debug, Release"
  exit 1
fi

# ==============================
# Load Deploy Functions
# ==============================
LIB_FILE="${DEPLOY_ROOT}/scripts/lib/deploy_functions.sh"
if [ ! -f "$LIB_FILE" ]; then
  echo "❌ Library file not found: $LIB_FILE"
  exit 1
fi
# shellcheck disable=SC1090
source "$LIB_FILE"

# One shared log file for the entire run (may cover multiple services)
setup_logging "${DEPLOY_ROOT}/scripts/logs"

# ==============================
# Summary before starting
# ==============================
SERVICE_COUNT=$(echo "$SERVICE_LIST" | wc -w | tr -d ' ')
echo "=============================="
echo "🚀 Deploy Run"
echo "   Services   : ${SERVICE_LIST// /, }"
echo "   Environment: $ENVIRONMENT"
echo "   Tag override: ${CUSTOM_TAG:-(from each service .env)}"
echo "   Build Config: ${BUILD_CONFIG:-Release (default)}"
echo "   App Version : ${APP_VERSION:-1.0.0 (default)}"
[ "$BUILD_ONLY" = "true" ] && echo "   Mode        : BUILD ONLY"
[ "$PREBUILT" = "true"   ] && echo "   Pre-built   : ENABLED"
echo "=============================="

# ==============================
# Prerequisites check (once per service, before any build/deploy)
# ==============================
if [ "$BUILD_ONLY" != "true" ]; then
  CHECK_PREREQ="${DEPLOY_ROOT}/scripts/lib/check_prerequisites.sh"
  if [ -f "$CHECK_PREREQ" ]; then
    echo ""
    echo "🔍 Checking prerequisites for all services..."
    for SVC in $SERVICE_LIST; do
      echo ""
      echo "--- $SVC ---"
      if ! bash "$CHECK_PREREQ" "$SVC" "$ENVIRONMENT"; then
        echo "❌ Prerequisites check failed for [$SVC]. Aborting."
        exit 1
      fi
    done
    echo ""
  fi
fi

# ==============================
# Deploy loop — one service at a time
# ==============================
OVERALL_SUCCESS=0
OVERALL_FAILED=0

for SERVICE in $SERVICE_LIST; do
  echo ""
  echo "=============================="
  echo "📦 [$SERVICE] Loading config..."
  echo "=============================="

  # ── Load env file for this service ──────────────────────────────────────
  ENV_DIR="${DEPLOY_ROOT}/envs/${ENVIRONMENT}"

  if [ ! -d "$ENV_DIR" ]; then
    echo "❌ Environment directory not found: $ENV_DIR"
    exit 1
  fi

  if [ -d "${ENV_DIR}/${SERVICE}" ]; then
    ENV_FILE="${ENV_DIR}/${SERVICE}/.env"
    ENV_LOCAL="${ENV_DIR}/${SERVICE}/.env.local"
  else
    ENV_FILE="${ENV_DIR}/.env.${SERVICE}"
    ENV_LOCAL="${ENV_DIR}/.env.${SERVICE}.local"
  fi

  if [ -f "$ENV_LOCAL" ]; then
    echo "📄 Loading ${ENVIRONMENT}/${SERVICE}/.env.local"
    # shellcheck disable=SC1090
    source "$ENV_LOCAL"
  elif [ -f "$ENV_FILE" ]; then
    echo "📄 Loading ${ENVIRONMENT}/${SERVICE}/.env"
    # shellcheck disable=SC1090
    source "$ENV_FILE"
  else
    echo "❌ Config file not found: $ENV_FILE"
    echo "💡 Create: $ENV_FILE"
    exit 1
  fi

  # ── Override IMAGE_TAG if custom tag was given ───────────────────────────
  if [ -n "$CUSTOM_TAG" ]; then
    IMAGE_TAG="$CUSTOM_TAG"
    echo "📌 [$SERVICE] Using IMAGE_TAG from argument: $IMAGE_TAG"
    if grep -q "^IMAGE_TAG=" "$ENV_FILE" 2>/dev/null; then
      sed -i "s|^IMAGE_TAG=.*|IMAGE_TAG=\"${IMAGE_TAG}\"|" "$ENV_FILE"
    else
      echo "IMAGE_TAG=\"${IMAGE_TAG}\"" >> "$ENV_FILE"
    fi
    echo "✅ [$SERVICE] Updated IMAGE_TAG in $ENV_FILE"
  fi

  # ── Run ─────────────────────────────────────────────────────────────────
  export FORCE_COMPOSE
  export COMPOSE_SERVICE
  setup_derived_vars

  echo ""
  echo "🎯 [$SERVICE] Image : ${FULL_IMAGE}"

  if run_deploy "$DO_CLEANUP" "$BUILD_ONLY" "${BUILD_CONFIG:-Release}" "${APP_VERSION:-1.0.0}" "$PREBUILT"; then
    OVERALL_SUCCESS=$((OVERALL_SUCCESS + 1))
  else
    OVERALL_FAILED=$((OVERALL_FAILED + 1))
    echo "❌ [$SERVICE] Deploy failed. Continuing with remaining services..."
  fi
done

# ==============================
# Final summary
# ==============================
echo ""
echo "=============================="
echo "📊 Overall Summary"
echo "   Total   : $SERVICE_COUNT"
echo "   Success : $OVERALL_SUCCESS"
echo "   Failed  : $OVERALL_FAILED"
echo "   Log     : $LOG_FILE"
echo "=============================="

[ $OVERALL_FAILED -gt 0 ] && exit 1 || exit 0
