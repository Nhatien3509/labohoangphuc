#!/bin/bash

STATUS="$1"
SERVICE="$2"
STAGE="$3"
JOB="$4"
BUILD_NO="$5"
BRANCH="$6"
URL="$7"
WEBHOOK="$8"
START_TS_RAW="$9"
GITLAB_TOKEN="${10}"

PYTHON_BIN="$(command -v python3 || command -v python)"
END_TS_MS="$(date +%s%3N)"

if [ -z "$PYTHON_BIN" ]; then
  echo "Python runtime is not available. Skip Google Chat notification."
  exit 0
fi

read_meta_file() {
  local path="$1"
  if [ -f "$path" ]; then
    tr -d '\r' < "$path"
  fi
}

normalize_start_ts_ms() {
  local raw="$1"
  if [ -z "$raw" ]; then
    echo "$END_TS_MS"
    return
  fi

  if [ "${#raw}" -le 10 ]; then
    echo "${raw}000"
    return
  fi

  echo "$raw"
}

START_TS_MS="$(normalize_start_ts_ms "$START_TS_RAW")"
START_SEC=$((START_TS_MS / 1000))
END_SEC=$((END_TS_MS / 1000))

START_TIME="$(date -d "@$START_SEC" '+%d-%m-%Y %H:%M:%S')"
END_TIME="$(date -d "@$END_SEC" '+%d-%m-%Y %H:%M:%S')"

TOTAL_MS=$((END_TS_MS - START_TS_MS))
TOTAL_SEC=$((TOTAL_MS / 1000))

if [ "$TOTAL_SEC" -eq 0 ]; then
  TOTAL_TIME="${TOTAL_MS} ms"
elif [ "$TOTAL_SEC" -lt 60 ]; then
  TOTAL_TIME="${TOTAL_SEC} seconds"
elif [ "$TOTAL_SEC" -lt 3600 ]; then
  TOTAL_TIME="$((TOTAL_SEC / 60)) minutes $((TOTAL_SEC % 60)) seconds"
else
  TOTAL_TIME="$((TOTAL_SEC / 3600)) hours $((TOTAL_SEC % 3600 / 60)) minutes $((TOTAL_SEC % 60)) seconds"
fi

URL="$(echo "$URL" | sed 's|^https://|http://|')"

if [ "$STATUS" = "SUCCESS" ]; then
  TITLE="🟢 DEPLOY FE C04 COMPLETED 🎉🎉🎉"
  BUTTON_TEXT="VIEW PIPELINE"
  BUTTON_URL="$URL"
else
  TITLE="🚨 IMPOSSIBLE MISSION — C04 FE DEPLOYMENT DOWN 💥💀"
  BUTTON_TEXT="VIEW LOG"
  BUTTON_URL="${URL}console"
fi

COMMIT_SHA="$(git rev-parse HEAD 2>/dev/null || read_meta_file .notify-commit-sha)"
SHORT_SHA="$(git rev-parse --short HEAD 2>/dev/null || read_meta_file .notify-short-sha)"
COMMIT_TITLE="$(git log -1 --pretty=%s 2>/dev/null || read_meta_file .notify-commit-title)"
COMMIT_AUTHOR="$(git log -1 --pretty=%an 2>/dev/null || read_meta_file .notify-commit-author)"
REMOTE_URL="$(git config --get remote.origin.url 2>/dev/null || read_meta_file .notify-remote-url)"
RECENT_COMMITS="$(git log -n 5 --pretty=format:%H 2>/dev/null || read_meta_file .notify-recent-commits)"

MR_TITLE=""
MR_URL=""
MR_IID=""
MR_SOURCE_BRANCH=""
MR_TARGET_BRANCH=""

if [ -n "$PYTHON_BIN" ] && [ -n "$GITLAB_TOKEN" ] && [ -n "$COMMIT_SHA" ] && [ -n "$REMOTE_URL" ]; then
  MR_INFO="$("$PYTHON_BIN" - "$REMOTE_URL" "$GITLAB_TOKEN" "$RECENT_COMMITS" "$COMMIT_TITLE" <<'PY'
import json
import re
import sys
import urllib.parse
import urllib.request

remote_url, token = sys.argv[1], sys.argv[2]
commit_shas = [sha.strip() for sha in sys.argv[3].splitlines() if sha.strip()]
commit_title = sys.argv[4]

host = ""
project_path = ""

if remote_url.startswith("http://") or remote_url.startswith("https://"):
    parsed = urllib.parse.urlparse(remote_url)
    host = f"{parsed.scheme}://{parsed.netloc}"
    project_path = parsed.path.lstrip("/")
else:
    if remote_url.startswith("git@") and ":" in remote_url:
        host_part, path_part = remote_url.split(":", 1)
        host = f"https://{host_part.split('@', 1)[1]}"
        project_path = path_part

if project_path.endswith(".git"):
    project_path = project_path[:-4]

if not host or not project_path:
    print(json.dumps({}))
    sys.exit(0)

project_id = urllib.parse.quote(project_path, safe="")

def request_json(url):
    request = urllib.request.Request(
        url,
        headers={"PRIVATE-TOKEN": token, "Accept": "application/json"},
    )
    with urllib.request.urlopen(request, timeout=10) as response:
        return json.loads(response.read().decode("utf-8"))

def build_widget_title(mr):
    iid = mr.get("iid")
    web_url = mr.get("web_url", "")
    if iid is None or not web_url:
        return mr.get("title", "")

    widget_url = re.sub(r"/-/$", "", web_url.rstrip("/"))
    widget_url = f"{widget_url}/widget.json"

    try:
        widget_data = request_json(widget_url)
    except Exception:
        return mr.get("title", "")

    message = (
        widget_data.get("default_merge_commit_message_with_description")
        or widget_data.get("default_merge_commit_message")
        or ""
    )
    lines = [line.strip() for line in message.splitlines() if line.strip()]
    if len(lines) >= 2:
        return lines[1]
    return mr.get("title", "")

mr_candidates_url = (
    f"{host}/api/v4/projects/{project_id}/merge_requests"
    f"?state=merged"
    f"&order_by=updated_at"
    f"&sort=desc"
    f"&per_page=20"
)

try:
    recent_mrs = request_json(mr_candidates_url)
except Exception:
    recent_mrs = []

if isinstance(recent_mrs, list):
    for mr in recent_mrs:
        merge_commit_sha = mr.get("merge_commit_sha") or ""
        squash_commit_sha = mr.get("squash_commit_sha") or ""
        if commit_shas and (merge_commit_sha == commit_shas[0] or squash_commit_sha == commit_shas[0]):
            print(json.dumps({
                "title": build_widget_title(mr),
                "url": mr.get("web_url", ""),
                "iid": str(mr.get("iid", "")) if mr.get("iid") is not None else "",
                "commit_sha": commit_shas[0],
                "source_branch": mr.get("source_branch", ""),
                "target_branch": mr.get("target_branch", ""),
            }))
            sys.exit(0)

for commit_sha in commit_shas:
    api_url = f"{host}/api/v4/projects/{project_id}/repository/commits/{commit_sha}/merge_requests"
    try:
        data = request_json(api_url)
    except Exception:
        continue

    if not isinstance(data, list) or not data:
        continue

    merged = next((item for item in data if item.get("state") == "merged"), data[0])
    print(json.dumps({
        "title": build_widget_title(merged),
        "url": merged.get("web_url", ""),
        "iid": str(merged.get("iid", "")) if merged.get("iid") is not None else "",
        "commit_sha": commit_sha,
        "source_branch": merged.get("source_branch", ""),
        "target_branch": merged.get("target_branch", ""),
    }))
    sys.exit(0)

merge_match = re.match(r"Merge branch '(.+)' into '(.+)'", commit_title or "")
if merge_match:
    source_branch, target_branch = merge_match.groups()
    source_branch = source_branch.strip()
    target_branch = target_branch.strip()
    mr_list_url = (
        f"{host}/api/v4/projects/{project_id}/merge_requests"
        f"?state=merged"
        f"&source_branch={urllib.parse.quote(source_branch, safe='')}"
        f"&target_branch={urllib.parse.quote(target_branch, safe='')}"
        f"&order_by=updated_at"
        f"&sort=desc"
        f"&per_page=5"
    )

    try:
        data = request_json(mr_list_url)
    except Exception:
        data = []

    if isinstance(data, list) and data:
        merged = next((item for item in data if item.get("state") == "merged"), data[0])
        print(json.dumps({
            "title": build_widget_title(merged),
            "url": merged.get("web_url", ""),
            "iid": str(merged.get("iid", "")) if merged.get("iid") is not None else "",
            "commit_sha": merged.get("merge_commit_sha", "") or merged.get("squash_commit_sha", "") or "",
            "source_branch": merged.get("source_branch", ""),
            "target_branch": merged.get("target_branch", ""),
        }))
        sys.exit(0)

print(json.dumps({}))
PY
)"

  if [ -n "$MR_INFO" ]; then
    MR_TITLE="$("$PYTHON_BIN" - "$MR_INFO" <<'PY'
import json
import sys
data = json.loads(sys.argv[1] or "{}")
print(data.get("title", ""))
PY
)"
    MR_URL="$("$PYTHON_BIN" - "$MR_INFO" <<'PY'
import json
import sys
data = json.loads(sys.argv[1] or "{}")
print(data.get("url", ""))
PY
)"
    MR_IID="$("$PYTHON_BIN" - "$MR_INFO" <<'PY'
import json
import sys
data = json.loads(sys.argv[1] or "{}")
print(data.get("iid", ""))
PY
)"
    MR_SOURCE_BRANCH="$("$PYTHON_BIN" - "$MR_INFO" <<'PY'
import json
import sys
data = json.loads(sys.argv[1] or "{}")
print(data.get("source_branch", ""))
PY
)"
    MR_TARGET_BRANCH="$("$PYTHON_BIN" - "$MR_INFO" <<'PY'
import json
import sys
data = json.loads(sys.argv[1] or "{}")
print(data.get("target_branch", ""))
PY
)"
    MATCHED_COMMIT_SHA="$("$PYTHON_BIN" - "$MR_INFO" <<'PY'
import json
import sys
data = json.loads(sys.argv[1] or "{}")
print(data.get("commit_sha", ""))
PY
)"
    if [ -n "$MATCHED_COMMIT_SHA" ]; then
      COMMIT_SHA="$MATCHED_COMMIT_SHA"
      SHORT_SHA="$(git rev-parse --short "$MATCHED_COMMIT_SHA" 2>/dev/null || echo "$SHORT_SHA")"
      COMMIT_TITLE="$(git log -1 --pretty=%s "$MATCHED_COMMIT_SHA" 2>/dev/null || echo "$COMMIT_TITLE")"
      COMMIT_AUTHOR="$(git log -1 --pretty=%an "$MATCHED_COMMIT_SHA" 2>/dev/null || echo "$COMMIT_AUTHOR")"
    fi
  fi
fi

DISPLAY_TITLE="$MR_TITLE"
if [ -z "$DISPLAY_TITLE" ]; then
  DISPLAY_TITLE="$COMMIT_TITLE"
fi

DISPLAY_BRANCH="$BRANCH"
if [ -n "$MR_SOURCE_BRANCH" ] && [ -n "$MR_TARGET_BRANCH" ]; then
  DISPLAY_BRANCH="${MR_SOURCE_BRANCH} -> ${MR_TARGET_BRANCH}"
fi

PAYLOAD="$(TITLE="$TITLE" \
SERVICE="$SERVICE" \
JOB="$JOB" \
START_TIME="$START_TIME" \
END_TIME="$END_TIME" \
TOTAL_TIME="$TOTAL_TIME" \
DISPLAY_BRANCH="$DISPLAY_BRANCH" \
STAGE="$STAGE" \
BUTTON_URL="$BUTTON_URL" \
DISPLAY_TITLE="$DISPLAY_TITLE" \
MR_IID="$MR_IID" \
MR_URL="$MR_URL" \
SHORT_SHA="$SHORT_SHA" \
COMMIT_AUTHOR="$COMMIT_AUTHOR" \
"$PYTHON_BIN" - <<PY
import json
import os

title = os.environ.get("TITLE", "")
service = os.environ.get("SERVICE", "")
job = os.environ.get("JOB", "")
start_time = os.environ.get("START_TIME", "")
end_time = os.environ.get("END_TIME", "")
total_time = os.environ.get("TOTAL_TIME", "")
display_branch = os.environ.get("DISPLAY_BRANCH", "")
stage = os.environ.get("STAGE", "")
button_url = os.environ.get("BUTTON_URL", "")
display_title = os.environ.get("DISPLAY_TITLE", "")
mr_iid = os.environ.get("MR_IID", "")
mr_url = os.environ.get("MR_URL", "")
short_sha = os.environ.get("SHORT_SHA", "")
commit_author = os.environ.get("COMMIT_AUTHOR", "")

widgets = []

header_text = (
    f"<b>Merge request:</b> {display_title} (!{mr_iid})"
    if mr_iid
    else f"<b>Change:</b> {display_title}"
)
widgets.append({
    "textParagraph": {
        "text": header_text
    }
})

widgets.append({
    "textParagraph": {
        "text": f"<b>Commit:</b> {short_sha or '-'}"
    }
})

widgets.append({
    "textParagraph": {
        "text": f"<b>Author:</b> {commit_author or 'Unknown'}"
    }
})

widgets.append({
    "textParagraph": {
        "text": f"<b>Start time:</b> {start_time}"
    }
})

widgets.append({
    "textParagraph": {
        "text": f"<b>End time:</b> {end_time}"
    }
})

widgets.append({
    "textParagraph": {
        "text": f"<b>Total time:</b> {total_time}"
    }
})

widgets.append({
    "textParagraph": {
        "text": f"<b>Branch:</b> {display_branch}"
    }
})

widgets.append({
    "textParagraph": {
        "text": f"<b>Stage:</b> {stage}"
    }
})

buttons = [{
    "textButton": {
        "text": "🚀 View Pipeline",
        "onClick": {"openLink": {"url": button_url}},
    }
}]

if mr_url:
    buttons.append({
        "textButton": {
            "text": "🦊 Merge Request",
            "onClick": {"openLink": {"url": mr_url}},
        }
    })

widgets.append({"buttons": buttons})

payload = {
    "cards": [{
        "header": {
            "title": title,
            "subtitle": f"Service: {job}",
        },
        "sections": [{
            "widgets": widgets,
        }],
    }]
}

print(json.dumps(payload, ensure_ascii=False))
PY
)"

curl -s -X POST "$WEBHOOK" -H "Content-Type: application/json" -d "$PAYLOAD"
exit 0
