#!/bin/bash
# ============================================
# 🔍 Check Prerequisites cho Deploy Script
# ============================================
# Usage: ./check_prerequisites.sh <service> <environment>
# Example: ./check_prerequisites.sh api prod
# ============================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEPLOY_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"

# Load valid environments dynamically
VALID_ENVS=($(ls -d ${DEPLOY_ROOT}/envs/*/ 2>/dev/null | xargs -n1 basename 2>/dev/null || true))

# Load valid services dynamically from docker/ folder
VALID_SERVICES=($(ls -d ${DEPLOY_ROOT}/docker/*/ 2>/dev/null | xargs -n1 basename 2>/dev/null || true))

# ==============================
# 📖 Help & Usage
# ==============================
show_help() {
  echo "Usage: $0 <service> <environment>"
  echo ""
  echo "Services: ${VALID_SERVICES[*]// /, }"
  echo "Environments: ${VALID_ENVS[*]// /, }"
  echo ""
  echo "Examples:"
  echo "  $0 portal prod              # Check prerequisites for portal deployment to prod"
  echo "  $0 portal dev              # Check prerequisites for portal deployment to dev"
}

# ==============================
# 🔍 Parse Arguments
# ==============================
if [ $# -lt 2 ]; then
  show_help
  exit 1
fi

SERVICE="$1"
ENVIRONMENT="$2"

# Validate service
if [[ ! " ${VALID_SERVICES[@]} " =~ " ${SERVICE} " ]]; then
  echo "❌ Invalid service: $SERVICE"
  echo "Valid services: ${VALID_SERVICES[*]}"
  exit 1
fi

# Validate environment
if [[ ! " ${VALID_ENVS[@]} " =~ " ${ENVIRONMENT} " ]]; then
  echo "❌ Invalid environment: $ENVIRONMENT"
  echo "Valid environments: ${VALID_ENVS[*]}"
  exit 1
fi

# Load env file
ENV_DIR="${DEPLOY_ROOT}/envs/${ENVIRONMENT}"

# Support both envs/env/.env.service and envs/env/service/.env
if [ -d "${ENV_DIR}/${SERVICE}" ]; then
  ENV_FILE="${ENV_DIR}/${SERVICE}/.env"
  ENV_LOCAL="${ENV_DIR}/${SERVICE}/.env.local"
else
  ENV_FILE="${ENV_DIR}/.env.${SERVICE}"
  ENV_LOCAL="${ENV_DIR}/.env.${SERVICE}.local"
fi

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

check_passed=0
check_failed=0

check_command() {
  local cmd="$1"
  local desc="$2"
  if command -v "$cmd" &> /dev/null; then
    echo -e "${GREEN}✅${NC} $desc ($cmd)"
    check_passed=$((check_passed + 1))
  else
    echo -e "${RED}❌${NC} $desc ($cmd) - NOT FOUND"
    check_failed=$((check_failed + 1))
  fi
}

check_file() {
  local file="$1"
  local desc="$2"
  # Expand ~ and ${HOME}
  eval file="$file"
  if [ -f "$file" ]; then
    echo -e "${GREEN}✅${NC} $desc ($file)"
    check_passed=$((check_passed + 1))
  else
    echo -e "${RED}❌${NC} $desc ($file) - NOT FOUND"
    check_failed=$((check_failed + 1))
  fi
}

check_ssh() {
  local server="$1"
  
  if [ "${SSH_AUTH_METHOD:-key}" = "interactive" ]; then
    echo -e "${YELLOW}⏭️${NC}  SSH to $server (interactive mode - sẽ nhập password khi deploy)"
    check_passed=$((check_passed + 1))
    return
  fi
  
  local ssh_key="$SSH_KEY_PATH"
  eval ssh_key="$ssh_key"
  if ssh -q -o BatchMode=yes -o ConnectTimeout=5 -i "$ssh_key" "$server" exit 2>/dev/null; then
    echo -e "${GREEN}✅${NC} SSH to $server (key)"
    check_passed=$((check_passed + 1))
  else
    echo -e "${RED}❌${NC} SSH to $server - FAILED"
    check_failed=$((check_failed + 1))
  fi
}

echo "============================================"
echo "🔍 Checking Prerequisites for $SERVICE ($ENVIRONMENT)"
echo "============================================"
echo ""

# 1. Check required commands
echo "📦 Required Commands:"
check_command "docker" "Docker CLI"
check_command "ssh" "SSH Client"
check_command "scp" "SCP Client"
check_command "curl" "cURL (for health check)"
echo ""

# 2. Check .env file
echo "📄 Configuration Files:"
if [ -f "$ENV_LOCAL" ]; then
  check_file "$ENV_LOCAL" "Deploy config (local override)"
  # shellcheck disable=SC1090
  source "$ENV_LOCAL"
elif [ -f "$ENV_FILE" ]; then
  check_file "$ENV_FILE" "Deploy config"
  # shellcheck disable=SC1090
  source "$ENV_FILE"
else
  echo -e "${RED}❌${NC} Config file not found: $ENV_FILE"
  check_failed=$((check_failed + 1))
fi

if [ -f "$ENV_FILE" ] || [ -f "$ENV_LOCAL" ]; then
  # 3. Check SSH auth prerequisites
  echo ""
  echo "🔐 SSH Authentication (mode: ${SSH_AUTH_METHOD:-key}):"
  if [ "${SSH_AUTH_METHOD:-key}" = "interactive" ]; then
    echo -e "${YELLOW}⏭️${NC}  Mode interactive: sẽ nhập password khi deploy"
  else
    check_file "$SSH_KEY_PATH" "SSH private key"
  fi
  
  # 4. Check SSH connectivity
  echo ""
  echo "🌐 SSH Connectivity:"
  for SERVER in ${SERVERS:-}; do
    check_ssh "$SERVER"
  done
  
  # 5. Check Docker daemon
  echo ""
  echo "🐳 Docker Daemon:"
  if docker info &> /dev/null; then
    echo -e "${GREEN}✅${NC} Docker daemon running"
    check_passed=$((check_passed + 1))
  else
    echo -e "${RED}❌${NC} Docker daemon not running"
    check_failed=$((check_failed + 1))
  fi
fi

# Summary
echo ""
echo "============================================"
echo "📊 Summary: ${check_passed} passed, ${check_failed} failed"
echo "============================================"

if [ $check_failed -gt 0 ]; then
  echo -e "${YELLOW}⚠️  Fix the failed checks before running deploy script${NC}"
  exit 1
else
  echo -e "${GREEN}✅ All prerequisites met. Ready to deploy!${NC}"
  exit 0
fi
