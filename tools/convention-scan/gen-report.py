#!/usr/bin/env python3
# Sinh báo cáo chi tiết vi phạm convention từ output của convention-scan.
#   tools/convention-scan/bin/convention-scan --paths-from - --no-color > LOG
#   python3 tools/convention-scan/gen-report.py LOG docs/convention/BE-convention-violations-report.md
# Báo cáo: sắp theo severity (CRITICAL→HIGH→MEDIUM→LOW), mỗi loại lỗi nêu mô tả +
# cách khắc phục, rồi liệt kê từng vị trí (file · function · dòng).
import re, sys, collections, pathlib

LOG = sys.argv[1] if len(sys.argv) > 1 else "/tmp/cs.live.log"
OUT = sys.argv[2] if len(sys.argv) > 2 else "docs/convention/BE-convention-violations-report.md"
DATE = sys.argv[3] if len(sys.argv) > 3 else "17/06/2026"

lines = pathlib.Path(LOG).read_text(encoding="utf-8").splitlines()
items = []  # (scanner_sev, file, line, func, desc, fix)
sev = None
i = 0
while i < len(lines):
    l = lines[i]
    if "[CRITICAL" in l:
        sev = "CRITICAL"
    elif "[WARNING]" in l:
        sev = "WARNING"
    else:
        m = re.match(r"^    (\S+):(\d+)\s+(\S.*?)\s*$", l)
        if m and sev:
            desc = fix = ""
            if i + 1 < len(lines):
                md = re.match(r"^      → (.+)$", lines[i + 1])
                if md:
                    desc = md.group(1)
            if i + 2 < len(lines):
                mf = re.match(r"^      (?!→)(\S.+)$", lines[i + 2])
                if mf:
                    fix = mf.group(1).strip()
            items.append((sev, m.group(1), int(m.group(2)), m.group(3), desc, fix))
    i += 1


def rule(d):
    x = d.lower()
    if "hardcoded secret" in x:
        return "Hardcoded secret (lộ bí mật)"
    if "quá nhiều logic" in x:
        return "Fat handler (>30 dòng / gọi IO trực tiếp)"
    if "http.newrequest" in x or "http.get" in x or "http.post" in x:
        return "Handler gọi http.* trực tiếp"
    if "gorm" in x:
        return "Handler gọi gorm.* trực tiếp"
    if "context.background" in x or "todo()" in x:
        return "context.Background()/TODO() trong business logic"
    if x.startswith("bare") or "return err" in x:
        return "return err không wrap context"
    if "gin.h{}" in x:
        return "Dùng gin.H{} trực tiếp"
    if "healthcheck" in x:
        return "Dockerfile thiếu HEALTHCHECK"
    if "user directive" in x or "chạy bằng root" in x:
        return "Dockerfile thiếu USER (chạy bằng root)"
    if "function dài" in x:
        return "Function quá dài (>50 dòng)"
    if "kebab-case" in x:
        return "Go file đặt tên kebab-case"
    return d[:60]


# WARNING của scanner được phân mức rủi ro; CRITICAL của scanner luôn = CRITICAL.
WARN_LEVEL = {
    "return err không wrap context": "HIGH",
    "Dockerfile thiếu USER (chạy bằng root)": "HIGH",
    "Dùng gin.H{} trực tiếp": "MEDIUM",
    "Function quá dài (>50 dòng)": "MEDIUM",
    "Dockerfile thiếu HEALTHCHECK": "MEDIUM",
    "Go file đặt tên kebab-case": "LOW",
}
# Giải thích "lỗi cụ thể" cho từng loại (vì sao sai).
WHY = {
    "Hardcoded secret (lộ bí mật)": "Đặt giá trị bí mật (mật khẩu/secret/api-key) làm default literal trong code → lộ trong repo/image.",
    "Fat handler (>30 dòng / gọi IO trực tiếp)": "Handler dài >30 dòng hoặc gọi thẳng DB/HTTP → vi phạm tách lớp handler/service/repository.",
    "Handler gọi http.* trực tiếp": "Handler gọi http.NewRequest/Get/Post trực tiếp thay vì qua service/repository.",
    "Handler gọi gorm.* trực tiếp": "Handler truy vấn gorm.* trực tiếp thay vì qua repository.",
    "context.Background()/TODO() trong business logic": "Dùng context.Background()/TODO() trong business logic → mất khả năng hủy/timeout/trace của request.",
    "return err không wrap context": "Trả `return err` trần, không kèm ngữ cảnh → khó truy vết nguồn lỗi.",
    "Dùng gin.H{} trực tiếp": "Trả response bằng gin.H{} thủ công → không nhất quán envelope (code/message/data).",
    "Dockerfile thiếu HEALTHCHECK": "Image không khai báo HEALTHCHECK → orchestrator không biết container có healthy không.",
    "Dockerfile thiếu USER (chạy bằng root)": "Container chạy bằng root → rủi ro bảo mật khi bị thoát container.",
    "Function quá dài (>50 dòng)": "Hàm vượt 50 dòng → khó đọc/test/bảo trì.",
    "Go file đặt tên kebab-case": "Tên file Go dùng kebab-case (a-b.go) thay vì snake_case (a_b.go) theo chuẩn Go.",
}


def level(sev, rn):
    return "CRITICAL" if sev == "CRITICAL" else WARN_LEVEL.get(rn, "MEDIUM")


def service(p):
    pa = p.split("/")
    if len(pa) >= 3 and pa[0] == "src" and pa[1] == "services":
        return pa[2]
    if p.startswith("deploy/"):
        return "(deploy)"
    if p.startswith("tools/"):
        return "(tools)"
    return "(" + pa[0] + ")"


# fix chuẩn cho mỗi rule = fix xuất hiện nhiều nhất.
rule_fix = collections.defaultdict(collections.Counter)
for sv, f, ln, fn, desc, fix in items:
    if fix:
        rule_fix[rule(desc)][fix] += 1
canon_fix = {k: v.most_common(1)[0][0] for k, v in rule_fix.items()}

# nhóm theo level → rule → list item
by = collections.defaultdict(lambda: collections.defaultdict(list))
for it in items:
    rn = rule(it[4])
    by[level(it[0], rn)][rn].append(it)

# ----- thống kê -----
per_lvl = {lv: sum(len(v) for v in by[lv].values()) for lv in ["CRITICAL", "HIGH", "MEDIUM", "LOW"]}
per_svc = collections.Counter(service(f) for _, f, *_ in items)
per_svc_lvl = collections.defaultdict(collections.Counter)
for it in items:
    per_svc_lvl[service(it[1])][level(it[0], rule(it[4]))] += 1

o = []
o.append("# Báo cáo chi tiết vi phạm convention — Backend (Go services)\n")
o.append(f"> Quét **LIVE** bằng `tools/convention-scan` ngày **{DATE}** (Go local). Liệt kê **từng dòng** vi phạm (không dedupe).")
o.append("> Mức độ: **CRITICAL** = scanner chặn push; **HIGH/MEDIUM/LOW** = phân loại rủi ro từ nhóm WARNING của scanner.\n")
o.append(f"**Tổng: {len(items)} vi phạm** — "
         f"🔴 CRITICAL {per_lvl['CRITICAL']} · 🟠 HIGH {per_lvl['HIGH']} · 🟡 MEDIUM {per_lvl['MEDIUM']} · ⚪ LOW {per_lvl['LOW']}\n")

o.append("## Tổng hợp theo service × mức độ\n")
o.append("| Service | CRITICAL | HIGH | MEDIUM | LOW | Tổng |")
o.append("|---|---:|---:|---:|---:|---:|")
for svc, c in per_svc.most_common():
    s = per_svc_lvl[svc]
    o.append(f"| {svc} | {s.get('CRITICAL',0)} | {s.get('HIGH',0)} | {s.get('MEDIUM',0)} | {s.get('LOW',0)} | {c} |")
o.append("")

ICON = {"CRITICAL": "🔴", "HIGH": "🟠", "MEDIUM": "🟡", "LOW": "⚪"}
for lv in ["CRITICAL", "HIGH", "MEDIUM", "LOW"]:
    if not by[lv]:
        continue
    o.append(f"## {ICON[lv]} {lv} — {per_lvl[lv]} vi phạm\n")
    for rn, its in sorted(by[lv].items(), key=lambda kv: -len(kv[1])):
        o.append(f"### {rn} — {len(its)}\n")
        o.append(f"- **Lỗi cụ thể:** {WHY.get(rn, rn)}")
        o.append(f"- **Hướng khắc phục:** {canon_fix.get(rn, '(xem convention)')}\n")
        o.append("**Vị trí:**\n")
        varies = len({it[4] for it in its}) > 1  # mô tả khác nhau từng dòng (vd secret/độ dài)?
        if varies:
            for f, ln, fn, desc in sorted((it[1], it[2], it[3], it[4]) for it in its):
                detail = re.sub(r'^(Hardcoded secret: |Function dài )', '', desc)
                o.append(f"- `{f}:{ln}` · `{fn}` — {detail}")
        else:
            byff = collections.defaultdict(list)
            for f, ln, fn in sorted((it[1], it[2], it[3]) for it in its):
                byff[(f, fn)].append(ln)
            for (f, fn), lns in sorted(byff.items()):
                ls = ", ".join(f"L{n}" for n in sorted(lns))
                o.append(f"- `{f}` · `{fn}` — {ls}")
        o.append("")
    o.append("")

o.append("## Quét lại\n")
o.append("```bash")
o.append("cd tools/convention-scan && go build -o bin/convention-scan . && cd ../..")
o.append("find . -type f \\( -name '*.go' -o -name 'Dockerfile*' \\) \\")
o.append("  ! -path './src/web/*' ! -path '*/vendor/*' ! -path './.git/*' | sed 's|^\\./||' \\")
o.append("  | tools/convention-scan/bin/convention-scan --paths-from - --no-color > /tmp/cs.log")
o.append("python3 tools/convention-scan/gen-report.py /tmp/cs.log docs/convention/BE-convention-violations-report.md")
o.append("```")

pathlib.Path(OUT).write_text("\n".join(o) + "\n", encoding="utf-8")
print(f"✅ {OUT}: {len(items)} items, {sum(1 for _ in (chr(10).join(o)))} chars")
print("Theo mức:", per_lvl)
