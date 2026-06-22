#!/bin/bash
# ============================================
# 🔍 Debug Toolbox Entrypoint
# ============================================
set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

ok()   { echo -e "${GREEN}✅${NC} $1"; }
fail() { echo -e "${RED}❌${NC} $1"; }
warn() { echo -e "${YELLOW}⚠️${NC}  $1"; }
info() { echo -e "${CYAN}ℹ️${NC}  $1"; }

# ─── DNS Check ───────────────────────────────────────────────────────────────
check_dns() {
  local host="$1"
  info "DNS lookup: $host"
  if nslookup "$host" > /dev/null 2>&1; then
    ok "Resolved: $(nslookup "$host" 2>/dev/null | grep 'Address:' | tail -1)"
  else
    fail "Cannot resolve $host"
    return 1
  fi
}

# ─── TCP Port Check ─────────────────────────────────────────────────────────
check_port() {
  local host="$1"
  local port="$2"
  local timeout="${3:-3}"
  info "TCP connect: ${host}:${port} (timeout ${timeout}s)"
  if ncat -z -w "$timeout" "$host" "$port" 2>/dev/null; then
    ok "Port ${port} open on ${host}"
  else
    fail "Port ${port} closed/unreachable on ${host}"
    return 1
  fi
}

# ─── PostgreSQL Check ────────────────────────────────────────────────────────
check_pg() {
  local host="${1:-localhost}"
  local port="${2:-5432}"
  local user="${3:-postgres}"
  local db="${4:-postgres}"

  echo ""
  echo "═══════════════════════════════════════"
  echo "🐘 PostgreSQL: ${host}:${port}"
  echo "═══════════════════════════════════════"

  check_port "$host" "$port" || return 1

  info "Checking PostgreSQL connection..."
  if PGPASSWORD="${PGPASSWORD:-}" psql -h "$host" -p "$port" -U "$user" -d "$db" -c "SELECT version();" 2>/dev/null; then
    ok "PostgreSQL connected"
  else
    warn "Port open but auth/connection failed (set PGPASSWORD env)"
    return 1
  fi
}

# ─── Redis Check ─────────────────────────────────────────────────────────────
check_redis() {
  local host="${1:-localhost}"
  local port="${2:-6379}"
  local password="${3:-${REDIS_PASSWORD:-}}"

  echo ""
  echo "═══════════════════════════════════════"
  echo "🔴 Redis: ${host}:${port}"
  echo "═══════════════════════════════════════"

  check_port "$host" "$port" || return 1

  info "Checking Redis connection..."
  local auth_args=""
  if [ -n "$password" ]; then
    auth_args="-a $password"
  fi

  local result
  result=$(redis-cli -h "$host" -p "$port" $auth_args PING 2>/dev/null) || true
  if [ "$result" = "PONG" ]; then
    ok "Redis PONG"
    info "Redis info:"
    redis-cli -h "$host" -p "$port" $auth_args INFO server 2>/dev/null | grep -E "^(redis_version|uptime|tcp_port)" || true
  else
    warn "Port open but auth failed (set REDIS_PASSWORD env hoặc truyền password)"
    return 1
  fi
}

# ─── HTTP Check ──────────────────────────────────────────────────────────────
check_http() {
  local url="$1"
  local timeout="${2:-5}"

  echo ""
  echo "═══════════════════════════════════════"
  echo "🌐 HTTP: ${url}"
  echo "═══════════════════════════════════════"

  info "HTTP request..."
  local status
  status=$(curl -sS -o /dev/null -w "%{http_code}" --max-time "$timeout" "$url" 2>/dev/null) || true
  if [ -n "$status" ] && [ "$status" != "000" ]; then
    if [ "$status" -lt 400 ]; then
      ok "HTTP ${status}"
    else
      warn "HTTP ${status} (server responded but with error)"
    fi
  else
    fail "No response from ${url}"
    return 1
  fi
}

# ─── Check All (from env vars) ──────────────────────────────────────────────
check_all() {
  echo ""
  echo "╔═══════════════════════════════════════╗"
  echo "║     🔍 Debug Toolbox - Check All      ║"
  echo "╚═══════════════════════════════════════╝"
  echo ""

  local failed=0

  # PostgreSQL
  if [ -n "${PG_HOST:-}" ]; then
    check_pg "${PG_HOST}" "${PG_PORT:-5432}" "${PG_USER:-postgres}" "${PG_DB:-postgres}" || failed=$((failed + 1))
  else
    warn "PG_HOST not set, skipping PostgreSQL check"
  fi

  # Redis
  if [ -n "${REDIS_HOST:-}" ]; then
    check_redis "${REDIS_HOST}" "${REDIS_PORT:-6379}" "${REDIS_PASSWORD:-}" || failed=$((failed + 1))
  else
    warn "REDIS_HOST not set, skipping Redis check"
  fi

  # HTTP endpoints
  if [ -n "${HTTP_ENDPOINTS:-}" ]; then
    for url in $HTTP_ENDPOINTS; do
      check_http "$url" || failed=$((failed + 1))
    done
  fi

  # Custom hosts (space-separated host:port pairs)
  if [ -n "${CHECK_HOSTS:-}" ]; then
    echo ""
    echo "═══════════════════════════════════════"
    echo "🔌 Custom hosts"
    echo "═══════════════════════════════════════"
    for hp in $CHECK_HOSTS; do
      local h="${hp%%:*}"
      local p="${hp##*:}"
      check_dns "$h" || true
      check_port "$h" "$p" || failed=$((failed + 1))
    done
  fi

  echo ""
  echo "═══════════════════════════════════════"
  if [ $failed -eq 0 ]; then
    ok "All checks passed"
  else
    fail "${failed} check(s) failed"
  fi

  return $failed
}

# ─── Help ────────────────────────────────────────────────────────────────────
show_help() {
  echo ""
  echo "🔍 Debug Toolbox"
  echo ""
  echo "Commands:"
  echo "  check-all                        Check all (from env vars)"
  echo "  pg <host> [port] [user] [db]     Test PostgreSQL connection"
  echo "  redis <host> [port] [password]   Test Redis connection"
  echo "  http <url>                       Test HTTP endpoint"
  echo "  port <host> <port>               Test TCP port"
  echo "  dns <host>                       DNS lookup"
  echo "  bash                             Interactive shell"
  echo ""
  echo "Environment variables for check-all:"
  echo "  PG_HOST, PG_PORT, PG_USER, PG_DB, PGPASSWORD"
  echo "  REDIS_HOST, REDIS_PORT, REDIS_PASSWORD"
  echo "  HTTP_ENDPOINTS   (space-separated URLs)"
  echo "  CHECK_HOSTS      (space-separated host:port pairs)"
  echo ""
  echo "Examples:"
  echo "  docker compose -f debug.yml run --rm toolbox check-all"
  echo "  docker compose -f debug.yml run --rm toolbox pg db-server 5432 myuser mydb"
  echo "  docker compose -f debug.yml run --rm toolbox redis redis-server 6379"
  echo "  docker compose -f debug.yml run --rm toolbox bash"
  echo ""
}

# ─── Main ────────────────────────────────────────────────────────────────────
case "${1:-bash}" in
  check-all) check_all ;;
  pg)        shift; check_pg "$@" ;;
  redis)     shift; check_redis "$@" ;;
  http)      shift; check_http "$@" ;;
  port)      shift; check_port "$@" ;;
  dns)       shift; check_dns "$@" ;;
  help|--help|-h) show_help ;;
  bash|sh)   exec /bin/bash ;;
  *)         exec "$@" ;;
esac
