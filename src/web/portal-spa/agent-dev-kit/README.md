# 🤖 Agent Development Kit

> CLAUDE.md + Skills + Hooks + Subagents + Plugins — **Năm lớp, một stack.**

Folder này là bộ template demo đầy đủ 5 lớp mở rộng của Claude Code. Mỗi lớp
nằm trong một thư mục con riêng. Đây là **bản tham chiếu**; xem mục
"Cách wire vào thực tế" ở cuối để kích hoạt từng lớp.

> ⚠️ **Ưu tiên rule FE hiện có.** Bộ kit này **bổ trợ**, không thay thế:
> - [`../CLAUDE.md`](../CLAUDE.md) — rule cứng
> - [`../docs/content/FE-Convention-Master.md`](../docs/content/FE-Convention-Master.md) — **source-of-truth**
>
> Mọi nội dung trong `agent-dev-kit/` chỉ trỏ về / tóm tắt 2 file trên.
> Khi có mâu thuẫn, **theo 2 file trên**.

```
agent-dev-kit/
├── 1-memory/        # L1 · Lớp Bộ nhớ      → đặt luật
├── 2-skills/        # L2 · Lớp Tri thức    → cung cấp chuyên môn
├── 3-hooks/         # L3 · Lớp Rào chắn    → đảm bảo chất lượng
├── 4-subagents/     # L4 · Lớp Ủy thác     → delegate công việc
└── 5-plugins/       # L5 · Lớp Phân phối   → phân phối cho team
```

## Luồng tổng quát

| Lớp | Tên | Vai trò |
|-----|-----|---------|
| **L1** | CLAUDE.md (Memory) | Naming, cấu trúc, kỳ vọng về repo |
| **L2** | Skills (Knowledge) | Chuyên môn, auto-invoke theo description |
| **L3** | Hooks (Guardrail) | Deterministic, chặn lệnh nguy hiểm, auto-lint |
| **L4** | Subagents (Delegation) | Context window riêng, giữ context chính sạch |
| **L5** | Plugins (Distribution) | Đóng gói & phân phối cho cả team |

Hai trục bổ trợ:
- **MCP Server** — external tools: GitHub, database, APIs, custom
- **Agent Teams** — parallel execution, message passing, shared perms

---

## Cách wire vào thực tế

Folder này chỉ là template. Để Claude Code thực sự dùng, copy/symlink sang
đúng vị trí:

Kit nằm tại `src/web/portal-spa/agent-dev-kit/`. Để Claude Code thật sự dùng:

| Lớp | Vị trí thật |
|-----|-------------|
| L1 `project.md` | bổ sung cho `src/web/portal-spa/CLAUDE.md` đã có (không ghi đè) |
| L1 `global.md`  | `~/.claude/CLAUDE.md` |
| L2 skills       | `~/.claude/skills/<name>/` hoặc `.claude/skills/` |
| L3 hooks        | khai báo trong `.claude/settings.json` (xem `3-hooks/settings.example.json`) |
| L4 subagents    | `.claude/agents/<name>.md` |
| L5 plugins      | publish marketplace / `.claude/plugins/` |

Cách nhanh: chạy `bash 5-plugins/team.install` (tự symlink L1/L2/L4).

> ⚠️ Lưu ý: file trong folder này **không tự động chạy**, được đặt gọn trong
> 1 folder để tham khảo. Repo đã có `CLAUDE.md` riêng cho portal-spa —
> kit này **không ghi đè**, chỉ bổ trợ.
