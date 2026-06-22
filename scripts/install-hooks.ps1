# install-hooks.ps1 — one-time setup after cloning (Windows PowerShell).
#
# Activates .githooks/ as the repo's hooks path and builds the convention scanner.
# Re-run safely; idempotent.

$ErrorActionPreference = 'Stop'

# 1) Find repo root
try {
    $repoRoot = (git rev-parse --show-toplevel 2>$null).Trim()
} catch {
    Write-Host "✗ Not inside a Git repository." -ForegroundColor Red
    exit 1
}
if (-not $repoRoot) {
    Write-Host "✗ Not inside a Git repository." -ForegroundColor Red
    exit 1
}

Set-Location $repoRoot

# 2) Point Git to .githooks/
$current = (git config --get core.hooksPath 2>$null)
if ($current -ne ".githooks") {
    git config core.hooksPath .githooks
    Write-Host "→ git config core.hooksPath = .githooks"
} else {
    Write-Host "✓ git config core.hooksPath already = .githooks"
}

# 3) Pre-build the scanner so the first commit doesn't pay the build cost.
$goExists = $null -ne (Get-Command go -ErrorAction SilentlyContinue)
if ($goExists) {
    Write-Host "→ Building convention-scan…"
    $scannerDir = Join-Path $repoRoot "tools\convention-scan"
    $binDir = Join-Path $scannerDir "bin"
    $bin = Join-Path $binDir "convention-scan.exe"
    if (-not (Test-Path $binDir)) {
        New-Item -ItemType Directory -Path $binDir | Out-Null
    }
    Push-Location $scannerDir
    try {
        go build -o $bin .
        Write-Host "✓ Scanner built: $bin" -ForegroundColor Green
    } finally {
        Pop-Location
    }
} else {
    Write-Host "⚠ Go not found in PATH — scanner will build on first commit (needs Go >= 1.26)." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "✓ Git hooks installed." -ForegroundColor Green
Write-Host ""
Write-Host "Từ giờ, mỗi 'git commit' sẽ chạy convention-scan trên file staged:"
Write-Host "  - CRITICAL → commit bị block (fat handler, hardcoded secret, panic, ...)"
Write-Host "  - WARNING  → in ra cho biết nhưng vẫn cho commit (gin.H{}, function dài, ...)"
Write-Host ""
Write-Host "Bypass (tránh dùng — CI cũng sẽ block):"
Write-Host "  git commit --no-verify"
