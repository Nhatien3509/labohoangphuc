# convention-scan

Static checker mô phỏng [SCAN-20260524-184022](../../docs/convention/Go_Service_Check_20260524-184022_TongHop.md) — chạy ở **pre-commit** + **Jenkins CI** để chặn các vi phạm nghiêm trọng (CRITICAL) ngay khi commit và một lần nữa trước khi merge.

**Phạm vi:** áp dụng cho toàn bộ project NGOẠI TRỪ `src/web/` (Next.js SPA — có FE convention riêng).

---

## Cài đặt (BẮT BUỘC sau mỗi `git clone`)

**Linux / Mac / Git-Bash:**

```bash
./scripts/install-hooks.sh
```

**Windows PowerShell:**

```powershell
.\scripts\install-hooks.ps1
```

Script làm 3 việc:

1. `git config core.hooksPath .githooks` — trỏ Git đến hook nằm trong repo (không cần copy vào `.git/hooks/`).
2. `chmod +x .githooks/*` — set quyền exec (Linux/Mac).
3. `go build` ra `tools/convention-scan/bin/convention-scan` (cần Go ≥ 1.26).

Idempotent — chạy nhiều lần OK. Nếu chưa có Go, scanner sẽ tự build lần đầu commit (cần Go khi đó).

> Bypass tạm: `git commit --no-verify` — **NHƯNG** Jenkins CI sẽ vẫn chặn merge khi push.

---

## Checks hiện có

| Section | Severity | Check |
|---|---|---|
| 2 — Fat Handler | **CRITICAL** | Handler function > 30 dòng HOẶC gọi trực tiếp `gorm.*` / `http.Get|Post|...` |
| 13 — Security | **CRITICAL** | `viper.SetDefault("DB_PASS"|"SECRET"|...)` với default literal (không phải env var) |
| 28 — Prohibited | **CRITICAL** | `context.Background()` / `context.TODO()` trong handler/service/repository/core |
| 28 — Prohibited | **CRITICAL** | `panic()` ngoài package main |
| 28 — Prohibited | **CRITICAL** | Raw SQL string (`SELECT ... `, `INSERT INTO ...`) trong handler |
| 4.3 — Naming | WARNING | Go file name dùng kebab-case (vd `sync-history.go`) |
| 7 — Clean Code | WARNING | Function body > 50 dòng |
| 8 — Error Handling | WARNING | Bare `return err` (không wrap context) |
| 10 — HTTP API | WARNING | `gin.H{}` trực tiếp (thay vì standard response envelope) |
| 20 — Docker | WARNING | `Dockerfile` thiếu `USER` hoặc `HEALTHCHECK` |

CRITICAL → exit code **2** → commit bị block (local) + Jenkins fail (CI).
WARNING → exit code **1** → commit được phép, hiển thị warning.
Không violation → exit code **0**.

**Hai tầng enforcement:**

| Tầng | Khi nào chạy | Bypass được? | Mục đích |
|---|---|---|---|
| Pre-commit hook (`.githooks/pre-commit`) | Local, mỗi `git commit` | Có (`--no-verify`) | Feedback nhanh |
| Jenkins stage `Convention Scan` ([jenkinsfile](../../jenkinsfile)) | CI, mỗi push lên `develop` | Không | Enforce thật sự |

---

## Chạy thủ công

Quét vài file cụ thể:

```bash
go run ./tools/convention-scan src/services/admin-service/internal/handler/foo.go
```

Quét toàn bộ Go files của branch (diff vs `main`):

```bash
git diff --name-only main...HEAD | grep -E '\.go$|Dockerfile' | \
    go run ./tools/convention-scan --paths-from -
```

Xuất ra markdown để paste vào MR/PR:

```bash
go run ./tools/convention-scan --format md \
    --paths-from <(git diff --name-only main...HEAD) > scan.md
```

---

## Thêm check mới

1. Tạo file `internal/checks/sectionXX_<name>.go` theo template:

```go
package checks

import (
    "go/ast"
    "go/token"
)

func CheckYourRule(path string, fset *token.FileSet, file *ast.File, res *Result) {
    if IsTestFile(path) {
        return
    }
    ast.Inspect(file, func(n ast.Node) bool {
        // detect pattern...
        res.Add(Violation{
            Section:   "Tên section convention",
            SectionID: "XX",
            Severity:  SeverityCritical, // hoặc SeverityWarning
            File:      path,
            Line:      fset.Position(n.Pos()).Line,
            Function:  funcNameAt(file, n.Pos()),
            Message:   "...",
            Hint:      "...",
        })
        return true
    })
}
```

2. Đăng ký trong [`internal/checks/runner.go`](internal/checks/runner.go) bên trong `runGoChecks`.

3. (Khuyến nghị) Viết test với `_test.go` chứa cả case pass + fail.

---

## Cấu trúc

```
tools/convention-scan/
├── go.mod
├── main.go                       — CLI entry, flag parsing, exit codes
├── internal/
│   ├── checks/
│   │   ├── types.go              — Violation, Severity, Result
│   │   ├── path.go               — phân loại path (handler/service/business/...)
│   │   ├── ast_helpers.go        — parse Go file + funcNameAt
│   │   ├── runner.go             — orchestrator: gọi tất cả checks
│   │   ├── section02_fat_handler.go
│   │   ├── section04_naming.go
│   │   ├── section07_clean_code.go
│   │   ├── section08_error.go
│   │   ├── section10_http.go
│   │   ├── section13_security.go
│   │   ├── section20_docker.go
│   │   └── section28_prohibited.go
│   └── report/
│       └── report.go             — Text (ANSI color) + Markdown formatter
└── README.md
```

---

## Troubleshooting

**Hook không chạy:**

```bash
git config --get core.hooksPath   # phải in ra ".githooks"
ls -la .githooks/pre-push         # phải có quyền exec (chmod +x)
```

**Trên Windows (Git Bash / WSL):** hook chạy được. PowerShell native không invoke shell hook — nhưng `git push` luôn dùng shell.

**False positive:**
- Mở issue / chat trong team
- Hoặc thêm path filter trong file check tương ứng (vd thêm `if IsTestFile(path) { return }`)

**Slow scan:** số file thay đổi nhiều → parse AST song song (chưa implement, MR welcome).
