#!/bin/bash
set -euo pipefail

# ── Submit job lên Flink cluster ─────────────────────────────────────────────
# Usage: ./submit.sh <job-dir>
# Ví dụ: ./submit.sh jobs/relay-kho-mo
#        ./submit.sh jobs/relay-opendata-metadata
#
# Env vars (override mặc định):
#   FLINK_URL    = http://160.191.32.193:8181
#   FLINK_SERVER = h04@160.191.32.193          (SSH user@host)
#   FLINK_JM    = int-flink-jm-1              (tên container JobManager)
#
# Job types (tự động detect qua job.yaml):
#   SQL job        : job.yaml KHÔNG có entryClass → dùng flink-job-runner.jar
#   DataStream job : job.yaml CÓ entryClass + jar → dùng JAR riêng của job

JOB_DIR="${1:?Usage: ./submit.sh <job-dir>}"
JOB_NAME="$(basename "$JOB_DIR")"
FLINK_URL="${FLINK_URL:-http://160.191.32.193:8181}"
FLINK_SERVER="${FLINK_SERVER:-h04@160.191.32.193}"
FLINK_JM="${FLINK_JM:-int-flink-jm-1}"
SSH_KEY="${SSH_KEY:-$(dirname "$0")/../../secret-key/dmst.pem}"
SSH_OPTS="-i ${SSH_KEY} -o StrictHostKeyChecking=no"
REMOTE_JOB_DIR="/opt/flink/jobs/${JOB_NAME}"

# ── Detect job type ───────────────────────────────────────────────────────────
ENTRY_CLASS=$(grep '^entryClass:' "$JOB_DIR/job.yaml" 2>/dev/null | sed 's/^entryClass:[[:space:]]*//' || true)
JAR_FIELD=$(grep '^jar:' "$JOB_DIR/job.yaml" 2>/dev/null | sed 's/^jar:[[:space:]]*//' || true)

if [ -n "$ENTRY_CLASS" ] && [ -n "$JAR_FIELD" ]; then
    JAR_LOCAL="${JOB_DIR}/${JAR_FIELD}"
    echo ">> DataStream job: $ENTRY_CLASS"
    if [ ! -f "$JAR_LOCAL" ]; then
        echo "JAR chưa có: $JAR_LOCAL"
        echo "Build trước: cd $JOB_DIR && mvn clean package -DskipTests"
        exit 1
    fi
else
    JAR_LOCAL="job-runner/target/flink-job-runner-1.0.0.jar"
    ENTRY_CLASS="com.gtsc.dmst.flink.FlinkJobRunner"
    echo ">> SQL job: dùng generic runner"
    if [ ! -f "$JAR_LOCAL" ]; then
        echo "JAR chưa có. Build trước:"
        echo "  cd job-runner && mvn clean package -DskipTests"
        exit 1
    fi
fi

if [ ! -d "$JOB_DIR" ]; then
    echo "Job dir không tồn tại: $JOB_DIR"
    exit 1
fi

# ── Bước 1: Copy job config lên server → vào container ───────────────────────
echo ">> Copy job config: $JOB_NAME → container..."
STAGING="/tmp/flink-job-${JOB_NAME}"
rsync -az --delete -e "ssh ${SSH_OPTS}" "$JOB_DIR/" "${FLINK_SERVER}:${STAGING}/"
ssh ${SSH_OPTS} "$FLINK_SERVER" "docker exec ${FLINK_JM} mkdir -p ${REMOTE_JOB_DIR} && \
  docker cp ${STAGING}/. ${FLINK_JM}:${REMOTE_JOB_DIR}/ && \
  rm -rf ${STAGING}"
echo "   Config copied to ${REMOTE_JOB_DIR}"

# ── Bước 2: Upload JAR lên Flink REST API ────────────────────────────────────
echo ">> Upload JAR lên Flink..."
UPLOAD_RESP=$(curl -sf -X POST \
  "${FLINK_URL}/jars/upload" \
  -H "Expect:" \
  -F "jarfile=@${JAR_LOCAL};type=application/java-archive")

JAR_ID=$(echo "$UPLOAD_RESP" | grep -o '"filename":"[^"]*"' | sed 's/"filename":"//;s/"//' | xargs basename)
echo "   JAR ID: $JAR_ID"

# ── Bước 3: Submit job ────────────────────────────────────────────────────────
echo ">> Submit job: $JOB_NAME..."

# DataStream jobs: đọc config.properties → build "--key value" args cho ParameterTool.fromArgs()
# SQL jobs: truyền đường dẫn thư mục cho generic runner
if [ -n "$ENTRY_CLASS" ] && [ -n "$JAR_FIELD" ] && [ -f "$JOB_DIR/config.properties" ]; then
    PROGRAM_ARGS=$(grep -v '^[[:space:]]*#' "$JOB_DIR/config.properties" \
        | grep -v '^[[:space:]]*$' \
        | sed 's/\([^=]*\)=\(.*\)/--\1 \2/' \
        | tr '\n' ' ' \
        | sed 's/[[:space:]]*$//')
    echo "   Program args: $PROGRAM_ARGS"
else
    PROGRAM_ARGS="${REMOTE_JOB_DIR}"
fi

RUN_RESP=$(curl -sf -X POST \
  "${FLINK_URL}/jars/${JAR_ID}/run" \
  -H "Content-Type: application/json" \
  -d "{\"entryClass\": \"${ENTRY_CLASS}\", \"programArgs\": \"${PROGRAM_ARGS}\"}")

JOB_ID=$(echo "$RUN_RESP" | grep -o '"jobid":"[^"]*"' | sed 's/"jobid":"//;s/"//')
echo "   Job ID: $JOB_ID"
echo ">> Done. Xem tại: ${FLINK_URL}/#/job/${JOB_ID}/overview"
