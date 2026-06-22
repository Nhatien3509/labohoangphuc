// Trỏ git về hook chung ở repo-root `.githooks` cho MỌI dev — bản Node thay
// cho setup-git-hooks.sh để chạy được trên Windows.
//
// Chạy tự động qua npm/pnpm `prepare` mỗi lần cài deps FE (xem package.json).
// npm trên Windows chạy script qua cmd.exe (không có `sh`/`[ -f ]`), nên dùng
// Node — luôn có sẵn lúc `npm install` — để khỏi vỡ ngay bước cài.
//
// `core.hooksPath` lưu đường dẫn TƯƠNG ĐỐI với repo root (git chạy hook từ gốc
// working tree nên giải đúng dù commit từ thư mục con). Hook `.githooks/*` là
// shell script vẫn chạy bình thường vì Git for Windows tự dùng bash để chạy hook.

import { execFileSync } from "node:child_process";

const HOOKS_PATH = ".githooks";

/** @param {readonly string[]} args */
function git(args) {
  // Bỏ stdin, lấy stdout (giá trị trả về), nuốt stderr — nếu không git in thẳng
  // "fatal: not a git repository" ra stderr cha lúc npm install (Docker build,
  // hoặc cài như dependency), phá ý định "bỏ qua êm".
  return execFileSync("git", args, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  }).trim();
}

try {
  // Bỏ qua êm nếu không phải git repo (vd cài deps trong Docker build không có .git).
  git(["rev-parse", "--is-inside-work-tree"]);
} catch {
  process.exit(0);
}

let current = "";
try {
  current = git(["config", "core.hooksPath"]);
} catch {
  // chưa cấu hình → git trả exit code khác 0, current giữ rỗng.
}

// Idempotent + im lặng nếu đã cấu hình (để post-merge/post-checkout không spam).
if (current === HOOKS_PATH) {
  process.exit(0);
}

try {
  git(["config", "core.hooksPath", HOOKS_PATH]);
  console.log(
    `✅ git hooks: core.hooksPath=${HOOKS_PATH} (pre-commit sẽ chặn vi phạm convention)`,
  );
} catch {
  // Không chặn cài đặt nếu vì lý do nào đó không set được.
  process.exit(0);
}
