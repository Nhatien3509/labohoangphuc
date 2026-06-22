#!/bin/bash
# ============================================
# 📦 Deploy Functions Library
# ============================================
# Dùng chung cho tất cả các service và môi trường
# Source file này từ deploy.sh
# ============================================

# ==============================
# 🔧 Derived Variables (gọi sau khi source .env)
# ==============================
setup_derived_vars() {
  FULL_IMAGE="${IMAGE_NAME}:${IMAGE_TAG}"
  LOCAL_IMAGE_FILE="${LOCAL_IMAGE_SAVE_DIR}/${IMAGE_NAME}_${IMAGE_TAG}.tar"
  REMOTE_IMAGE_LOAD_PATH="${REMOTE_IMAGE_DIR}/${IMAGE_NAME}_${IMAGE_TAG}.tar"
}

# ==============================
# 📝 Logging Functions
# ==============================
setup_logging() {
  local log_dir="$1"
  mkdir -p "${log_dir}"
  LOG_FILE="${log_dir}/deploy_log_$(date +%Y%m%d_%H%M%S).log"
}

log() {
  echo "$1" | tee -a "$LOG_FILE"
}

log_error() {
  echo "❌ $1" | tee -a "$LOG_FILE" >&2
}

# ==============================
# 🔐 SSH Helper Functions
# ==============================
ssh_cmd() {
  local server="$1"
  shift
  if [ "${SSH_AUTH_METHOD:-key}" = "interactive" ]; then
    ssh -o StrictHostKeyChecking=no "$server" "$@"
  else
    ssh -i "$SSH_KEY_PATH" "$server" "$@"
  fi
}

scp_cmd() {
  local src="$1"
  local dest="$2"
  if [ "${SSH_AUTH_METHOD:-key}" = "interactive" ]; then
    scp -o StrictHostKeyChecking=no "$src" "$dest"
  else
    scp -i "$SSH_KEY_PATH" "$src" "$dest"
  fi
}

# ==============================
# 🔍 Validate SSH Connections
# ==============================
validate_ssh() {
  log "🔍 Validating SSH connections (mode: ${SSH_AUTH_METHOD:-key})..."
  
  if [ "${SSH_AUTH_METHOD:-key}" = "interactive" ]; then
    log "  ⏭️  Mode interactive: bỏ qua validation, sẽ nhập password khi deploy"
    return 0
  fi
  
  local failed=0
  for SERVER in $SERVERS; do
    if ! ssh -q -o BatchMode=yes -o ConnectTimeout=5 -i "$SSH_KEY_PATH" "$SERVER" exit 2>/dev/null; then
      log_error "Cannot connect to $SERVER"
      failed=1
    else
      log "  ✅ $SERVER"
    fi
  done
  if [ $failed -eq 1 ]; then
    log_error "SSH validation failed. Run ./check_prerequisites.sh for details."
    exit 1
  fi
}

# ==============================
# 🏥 Health Check Function
# ==============================
health_check() {
  local server_ip="$1"
  
  if [ "${HEALTH_CHECK_ENABLED:-false}" != "true" ]; then
    log "  ⏭️  Health check disabled, skipping..."
    return 0
  fi
  
  local max_attempts=$((HEALTH_CHECK_TIMEOUT / 2))
  local attempt=0
  
  log "  🏥 Waiting for health check (max ${HEALTH_CHECK_TIMEOUT}s)..."
  
  while [ $attempt -lt $max_attempts ]; do
    if curl -sf --max-time 2 "http://${server_ip}:${HEALTH_CHECK_PORT}${HEALTH_CHECK_PATH}" > /dev/null 2>&1; then
      log "  ✅ Health check passed"
      return 0
    fi
    sleep 2
    attempt=$((attempt + 1))
  done
  
  log "  ⚠️  Health check failed after ${HEALTH_CHECK_TIMEOUT}s"
  return 1
}

# ==============================
# 🧹 Cleanup Old Images
# ==============================
cleanup_images() {
  local do_cleanup="$1"
  if [ "$do_cleanup" = "true" ]; then
    log "🧹 Cleanup local images older than ${IMAGE_RETENTION_HOURS:-168}h..."
    docker image prune -af --filter "until=${IMAGE_RETENTION_HOURS:-168}h" 2>/dev/null || true
  fi
}


# ==============================
# 🏗️ Build Docker Image
# ==============================
build_image() {
  local build_config="${1:-Release}"
  local app_version="${2:-1.0.0}"
  local prebuilt="${3:-false}"
  
  log "🔍 Checking if image exists..."
  
  if docker image inspect "$FULL_IMAGE" > /dev/null 2>&1; then
    log "✅ Image $FULL_IMAGE already exists, skipping build."
  else
    if [ "$prebuilt" = "true" ]; then
      build_image_prebuilt "$build_config" "$app_version"
    elif [ -n "${DOCKERFILE_PATH:-}" ]; then
      build_image_direct
    else
      build_image_multistage "$build_config" "$app_version"
    fi
  fi
}

# ==============================
# 🏗️ Build Docker Image (Direct)
# ==============================
build_image_direct() {
  log "🏗️ Building Docker image (direct build)..."
  
  # Resolve paths relative to DEPLOY_ROOT if they don't start with /
  local context_path="$DOCKER_CONTEXT"
  local dockerfile_path="$DOCKERFILE_PATH"
  
  [[ "$context_path" = /* ]] || context_path="${DEPLOY_ROOT}/${context_path}"
  [[ "$dockerfile_path" = /* ]] || dockerfile_path="${DEPLOY_ROOT}/${dockerfile_path}"
  
  log "   📂 Context: $context_path"
  log "   📄 Dockerfile: $dockerfile_path"
  
  docker build \
    -t "$FULL_IMAGE" \
    -f "$dockerfile_path" \
    "$context_path" \
    2>&1 | tee -a "$LOG_FILE"
    
  if [ ${PIPESTATUS[0]} -ne 0 ]; then
    log_error "docker build failed"
    exit 1
  fi
}

# ==============================
# 🏗️ Build Docker Image (Multi-stage - default)
# ==============================
build_image_multistage() {
  local build_config="$1"
  local app_version="$2"

  log "🔄 Changing to compose directory..."
  cd "$LOCAL_COMPOSE_DIR" || { log_error "Cannot change directory"; exit 1; }

  log "📝 Updating image tag in .env file..."
  local upper_service
  upper_service=$(echo "${SERVICE}" | tr '[:lower:]' '[:upper:]' | tr '-' '_')
  local var_name="IMAGE_THCS_${upper_service}"
  local env_file="$(dirname "$LOCAL_COMPOSE_FILE")/.env"
  
  if grep -q "^${var_name}=" "$env_file" 2>/dev/null; then
    sed -i "s|^${var_name}=.*|${var_name}=${FULL_IMAGE}|" "$env_file"
  else
    echo "${var_name}=${FULL_IMAGE}" >> "$env_file"
  fi

  log "🏗️ Building Docker image (multi-stage)..."
  log "   📊 Build Config: $build_config"
  log "   🔖 App Version: $app_version"
  
  docker compose -f "$LOCAL_COMPOSE_FILE" build \
    --build-arg BUILDCONFIG="$build_config" \
    --build-arg VERSION="$app_version" \
    2>&1 | tee -a "$LOG_FILE"
}

# ==============================
# 📦 Build Docker Image (Pre-built on host)
# ==============================
build_image_prebuilt() {
  local build_config="$1"
  local app_version="$2"

  # Xác định đường dẫn project
  local project_root
  project_root="$(cd "$LOCAL_COMPOSE_DIR/../.." && pwd)"
  local publish_dir="${project_root}/publish"
  local project_file="${project_root}/src/Umbraco.Web.UI/Umbraco.Web.UI.csproj"
  local dockerfile="${LOCAL_COMPOSE_DIR}/../docker/portal/Dockerfile.prebuilt"

  # Bước 1: dotnet publish trên host
  log "📦 Pre-built Mode: Running dotnet publish on host..."
  log "   📊 Build Config: $build_config"
  log "   🔖 App Version: $app_version"
  log "   📂 Publish Dir: $publish_dir"

  # Build Frontends first
  log "   🚀 Building Frontends on host..."
  
  log "      -> Backoffice SPA (Umbraco.Web.UI.Client)"
  (cd "$project_root/src/Umbraco.Web.UI.Client" && npm ci --no-fund --no-audit --prefer-offline && npm run build:for:cms) || { log_error "Backoffice SPA build failed"; exit 1; }

  log "      -> Login SPA (Umbraco.Web.UI.Login)"
  (cd "$project_root/src/Umbraco.Web.UI.Login" && npm ci --no-fund --no-audit --prefer-offline && npm run build) || { log_error "Login SPA build failed"; exit 1; }

  log "      -> Custom Plugin Client (Umbraco.Plugin.Custom.Client)"
  (cd "$project_root/src/Umbraco.Plugin.Custom.Client" && npm ci --no-fund --no-audit --prefer-offline && npm run build) || { log_error "Custom Plugin Client build failed"; exit 1; }

  if [ ! -f "$project_file" ]; then
    log_error "Project file not found: $project_file"
    exit 1
  fi

  dotnet publish "$project_file" \
    --configuration "$build_config" \
    --runtime linux-x64 \
    --self-contained false \
    --output "$publish_dir" \
    --property:UseAppHost=false \
    --property:Version="$app_version" \
    --property:UmbracoGitVersioningDisabled=true \
    --property:PublishReadyToRun=false \
    --property:ErrorOnDuplicatePublishOutputFiles=false \
    2>&1 | tee -a "$LOG_FILE"

  if [ $? -ne 0 ]; then
    log_error "dotnet publish failed"
    exit 1
  fi

  # Bước 2: docker build với Dockerfile.portal.prebuilt
  log "🏗️ Building Docker image (prebuilt)..."
  docker build \
    -t "$FULL_IMAGE" \
    -f "$dockerfile" \
    "$project_root" \
    2>&1 | tee -a "$LOG_FILE"

  if [ $? -ne 0 ]; then
    log_error "docker build failed"
    exit 1
  fi

  log "✅ Pre-built image created: $FULL_IMAGE"
}

# ==============================
# 💾 Save Docker Image
# ==============================
save_image() {
  log "🔍 Checking if image file exists..."
  if [ -f "$LOCAL_IMAGE_FILE" ]; then
    log "✅ Image file exists: $LOCAL_IMAGE_FILE, skipping save."
  else
    log "💾 Saving image to tar file..."
    mkdir -p "$LOCAL_IMAGE_SAVE_DIR"
    docker save -o "$LOCAL_IMAGE_FILE" "$FULL_IMAGE" 2>&1 | tee -a "$LOG_FILE"
  fi
}

# ==============================
# 📤 Deploy to Server
# ==============================
deploy_to_server() {
  local server="$1"
  local do_cleanup="$2"
  
  # Đảm bảo COMPOSE_SERVICE luôn được định nghĩa (mặc định rỗng)
  COMPOSE_SERVICE="${COMPOSE_SERVICE:-}"
  
  log "=============================="
  log "🚀 Deploying to: $server"
  log "=============================="

  local server_ip="${server#*@}"
  local upper_service=$(echo "${SERVICE}" | tr '[:lower:]' '[:upper:]')

  local remote_dir
  remote_dir="$(dirname "$REMOTE_COMPOSE_FILE")"
  local local_compose_src="${LOCAL_COMPOSE_DIR}/${LOCAL_COMPOSE_FILE}"

  log "🗂️  Ensuring remote directory exists: $remote_dir"
  if ! ssh_cmd "$server" "mkdir -p \"$remote_dir\" && mkdir -p \"$REMOTE_IMAGE_DIR\"" 2>&1 | tee -a "$LOG_FILE"; then
    log_error "Failed to create remote directory on $server"
    return 1
  fi

  log "📋 Syncing compose template to server..."
  if [ "${FORCE_COMPOSE:-false}" = "true" ]; then
    log "   --force-compose: overwriting compose file on server"
    if ! scp_cmd "$local_compose_src" "$server:$REMOTE_COMPOSE_FILE" 2>&1 | tee -a "$LOG_FILE"; then
      log_error "Failed to upload compose template to $server"
      return 1
    fi
  elif ! ssh_cmd "$server" "test -f \"$REMOTE_COMPOSE_FILE\"" 2>/dev/null; then
    log "   (first deploy — uploading compose template)"
    if ! scp_cmd "$local_compose_src" "$server:$REMOTE_COMPOSE_FILE" 2>&1 | tee -a "$LOG_FILE"; then
      log_error "Failed to upload compose template to $server"
      return 1
    fi
  else
    log "   compose file exists on server, skipping (use --force-compose to overwrite)"
  fi

  log "📤 Copying image to server..."
  if ! scp_cmd "$LOCAL_IMAGE_FILE" "$server:$REMOTE_IMAGE_DIR/" 2>&1 | tee -a "$LOG_FILE"; then
    log_error "SCP failed for $server, skipping..."
    return 1
  fi

  log "🔧 Executing deploy commands on server..."
  # shellcheck disable=SC2087
  if ssh_cmd "$server" <<EOF 2>&1 | tee -a "$LOG_FILE"
set -e
echo "📦 Loading Docker image..."
docker load -i "$REMOTE_IMAGE_LOAD_PATH"

echo "📝 Updating image in .env file..."
REMOTE_ENV_FILE="${remote_dir}/.env"
touch "\$REMOTE_ENV_FILE"
UPPER_SVC_VAR=\$(echo "${SERVICE}" | tr '[:lower:]' '[:upper:]' | tr '-' '_')
VAR_NAME="IMAGE_THCS_\${UPPER_SVC_VAR}"

if grep -q "^\${VAR_NAME}=" "\$REMOTE_ENV_FILE" 2>/dev/null; then
  sed -i "s|^\${VAR_NAME}=.*|\${VAR_NAME}=${FULL_IMAGE}|" "\$REMOTE_ENV_FILE"
else
  echo "\${VAR_NAME}=${FULL_IMAGE}" >> "\$REMOTE_ENV_FILE"
fi

if [ -n "${COMPOSE_SERVICE:-}" ]; then
  echo "🧹 Removing old container for service: ${COMPOSE_SERVICE}..."
  docker ps -aq --filter "label=com.docker.compose.service=${COMPOSE_SERVICE}" | xargs -r docker rm -f 2>/dev/null || true
fi

echo "🚀 Starting container..."
docker compose -f "$REMOTE_COMPOSE_FILE" up -d --no-deps ${COMPOSE_SERVICE:-}

echo "🔍 Container status:"
docker compose -f "$REMOTE_COMPOSE_FILE" ps ${COMPOSE_SERVICE:-}

if [ "$do_cleanup" = "true" ]; then
  echo "🧹 Cleanup old images on server..."
  docker image prune -af --filter "until=${IMAGE_RETENTION_HOURS:-168}h" || true
fi
EOF
  then
    health_check "$server_ip"
    return 0
  else
    log_error "Deploy failed on $server"
    return 1
  fi
}

# ==============================
# 🚀 Main Deploy Function
# ==============================
run_deploy() {
  local do_cleanup="$1"
  local build_only="$2"
  local build_config="${3:-Release}"
  local app_version="${4:-1.0.0}"
  local prebuilt="${5:-false}"
  
  log "=============================="
  log "🚀 Starting Deploy: $FULL_IMAGE"
  log "📅 $(date '+%Y-%m-%d %H:%M:%S')"
  if [ "$prebuilt" = "true" ]; then
    log "📦 Mode: Pre-built (dotnet publish on host)"
  else
    log "🏗️ Mode: Multi-stage (build in Docker)"
  fi
  log "=============================="

  # Validate SSH only if not build-only
  if [ "$build_only" != "true" ]; then
      validate_ssh
  else
      log "🧱 Build Only Mode: Skipping SSH validation."
  fi
  
  build_image "$build_config" "$app_version" "$prebuilt"
  save_image

  if [ "$build_only" = "true" ]; then
      log "=============================="
      log "✅ Build & Save Complete (Build Only Mode)"
      log "=============================="
      log "📄 Log file: $LOG_FILE"
      return 0
  fi

  local deploy_success=0
  local deploy_failed=0

  for SERVER in $SERVERS; do
    if deploy_to_server "$SERVER" "$do_cleanup"; then
      deploy_success=$((deploy_success + 1))
    else
      deploy_failed=$((deploy_failed + 1))
    fi
  done

  log "=============================="
  log "📊 Deploy Summary"
  log "=============================="
  log "✅ Success: $deploy_success"
  log "❌ Failed: $deploy_failed"
  log "📄 Log file: $LOG_FILE"

  cleanup_images "$do_cleanup"

  if [ $deploy_failed -gt 0 ]; then
    log "⚠️  Some deployments failed. Check logs for details."
    return 1
  else
    log "✅ All deployments completed successfully!"
    return 0
  fi
}
