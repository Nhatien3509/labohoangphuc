import { execSync } from "node:child_process";

const ALLOWED_TYPES = "feat|fix|refactor|docs|chore|style|test|build|ci|perf";

// Branch: type/description
const BRANCH_PATTERN = new RegExp(`^(${ALLOWED_TYPES})\\/[a-z0-9][a-z0-9-]*$`);

/**
 * MR Title: type(scope): description [TICKET-ID]
 * Đã bỏ dấu '?' sau cụm scope để bắt buộc phải có (...)
 */
const MR_TITLE_PATTERN = new RegExp(
  `^(${ALLOWED_TYPES})\\([a-z0-9-]+\\)!?: .+`,
);

// Pattern yêu cầu mã vé ở cuối cho feat/fix
const TICKET_SUFFIX_PATTERN = /\s+\[[A-Z]+-\d+(?:,\s*[A-Z]+-\d+)*\]$/;

const PROTECTED_BRANCHES = new Set(["main", "master", "dev"]);
const DRAFT_WIP_PATTERN = /^(Draft|WIP|\[WIP\]):\s*/i;

function fail(message) {
  console.error(`\n[gitflow-rules] ❌ ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`[gitflow-rules] ✅ ${message}`);
}

function normalize(text) {
  return (text || "").trim();
}

function safeExec(command) {
  try {
    return execSync(command, { encoding: "utf-8", stdio: "pipe" });
  } catch (error) {
    return "";
  }
}

function detectBranchName() {
  return normalize(
    process.env.CI_MERGE_REQUEST_SOURCE_BRANCH_NAME ||
      process.env.GITHUB_HEAD_REF ||
      process.env.CI_COMMIT_BRANCH ||
      process.env.GITHUB_REF_NAME ||
      safeExec("git rev-parse --abbrev-ref HEAD"),
  );
}

function detectMrTitle() {
  return normalize(process.env.PR_TITLE || process.env.CI_MERGE_REQUEST_TITLE);
}

function validateBranch() {
  const branch = detectBranchName();

  if (!branch) {
    fail("Could not determine branch name for validation.");
  }

  if (PROTECTED_BRANCHES.has(branch)) {
    pass(`Skipping protected branch: ${branch}`);
    return;
  }

  if (!BRANCH_PATTERN.test(branch)) {
    fail(
      [
        `Branch name does not follow convention: "${branch}".`,
        "Valid pattern: <type>/<description>",
        `Allowed types: ${ALLOWED_TYPES.replace(/\|/g, ", ")}`,
      ].join("\n"),
    );
  }

  pass(`Branch name is valid: ${branch}`);
}

function validateMrTitle() {
  const title = detectMrTitle();

  if (!title) {
    pass("No MR/PR title found in current context, skipping validation.");
    return;
  }

  const normalizedTitle = title.replace(DRAFT_WIP_PATTERN, "").trimStart();

  // 1. Check format tổng quát (Bắt buộc có scope)
  if (!MR_TITLE_PATTERN.test(normalizedTitle)) {
    fail(
      [
        `MR/PR title does not follow convention: "${title}".`,
        "Valid pattern: type(scope): description",
        "Example: feat(ui): add button logic",
      ].join("\n"),
    );
  }

  // 2. Trích xuất type để check ticket (Bắt phần chữ trước dấu ngoặc)
  const typeMatch = normalizedTitle.match(/^([a-z]+)\(/);
  const type = typeMatch ? typeMatch[1] : "";

  // 3. Check ticket ID cho feat/fix
  if (type === "feat" || type === "fix") {
    if (!TICKET_SUFFIX_PATTERN.test(normalizedTitle)) {
      fail(
        [
          `MR/PR title for "${type}" must include ticket IDs at the end.`,
          `Current title: "${title}"`,
          "Missing format: [TICKET-1] at the end.",
          `Example: ${normalizedTitle} [ACC-1]`,
        ].join("\n"),
      );
    }
  }

  pass(`MR/PR title is valid: ${title}`);
}

function run() {
  const mode = process.argv[2];

  switch (mode) {
    case "branch":
      validateBranch();
      return;
    case "mr-title":
      validateMrTitle();
      return;
    default:
      fail("Invalid mode. Use: branch | mr-title");
  }
}

run();
