# =============================================================================
# Debug Toolbox Container
# Dùng để kiểm tra kết nối network, database, redis... từ trong Docker network
# =============================================================================
# Usage:
#   docker compose -f debug.yml run --rm toolbox
#   docker compose -f debug.yml run --rm toolbox check-all
#   docker compose -f debug.yml run --rm toolbox pg <host> <port> <user> <db>
#   docker compose -f debug.yml run --rm toolbox redis <host> <port>
# =============================================================================

FROM alpine:3.21

LABEL maintainer="DevOps Team" \
      description="Debug toolbox for network, DB, Redis connectivity testing"

# ─── Network tools ───────────────────────────────────────────────────────────
# curl, wget       : HTTP/HTTPS testing
# bind-tools       : dig, nslookup, host (DNS)
# iputils          : ping, tracepath
# busybox-extras   : telnet
# nmap, nmap-ncat  : port scanning, netcat
# tcpdump          : packet capture
# openssl          : TLS/SSL testing
# jq               : JSON parsing
# ─── Database clients ────────────────────────────────────────────────────────
# postgresql16-client : psql
# redis              : redis-cli
# ─── Other ───────────────────────────────────────────────────────────────────
# bash, vim         : shell & editor

RUN apk add --no-cache \
    bash vim less \
    curl wget \
    bind-tools \
    iputils \
    busybox-extras \
    nmap nmap-ncat \
    tcpdump \
    openssl \
    jq \
    postgresql16-client \
    redis \
    && rm -rf /var/cache/apk/*

COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

WORKDIR /debug

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["bash"]
