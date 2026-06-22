import { EMAIL_REGEX, VALID_CHAR_SET } from "../core/const";
import DOMPurify from "isomorphic-dompurify";

// Get first and last name, e.g., Brenda Smith Braam -> Brenda Braam
export function getFirstAndLastName(fullName: string | undefined | null) {
  if (fullName === undefined || fullName === null || fullName === "") {
    return "";
  }

  const names = fullName.split(" ");
  if (names.length === 1) {
    return names[0];
  }

  return (names[0] ?? "") + " " + (names.pop() ?? "");
}

// Get initials, e.g., John Doe -> JD
export function getInitials(str: string | undefined | null) {
  if (str === undefined || str === null || str === "") {
    return "";
  }

  const names = str.split(" ");

  if (names.length === 1) {
    return str.charAt(0).toUpperCase();
  }

  const firstInitial = names[0]?.charAt(0).toUpperCase() ?? "";
  const lastInitial = names[names.length - 1]?.charAt(0).toUpperCase() ?? "";

  return firstInitial + lastInitial;
}

// Convert a string to title case, e.g., ALBERTA'LYN SMITH -> Alberta'lyn Smith
export function toTitleCase(str?: string | null): string {
  if (!str) return "";

  // Insert space before camelCase
  const spaced = str.replace(/([a-z])([A-Z])/g, "$1 $2");

  return spaced
    .split(/\s+/)
    .map((word) => {
      if (!word) return "";

      return word
        .split("-")
        .map((hyphenPart) => {
          return hyphenPart
            .split("'")
            .map((apostrophePart, i) =>
              i === 0
                ? apostrophePart.charAt(0).toUpperCase() +
                  apostrophePart.slice(1).toLowerCase()
                : apostrophePart.toLowerCase(),
            )
            .join("'");
        })
        .join("-");
    })
    .join(" ");
}

// Replace last segment of string seperated by separator, e.g: hello/world -> hello/replacement
export function replaceLastBySeparator(
  str: string,
  replacement: string,
  separator = "/",
) {
  const parts = str.split(separator);

  parts[parts.length - 1] = replacement;
  return parts.join(separator);
}

/**
 * Check if the string matches a pattern
 * @param pattern  pattern
 * @param str string
 * @returns True | False
 */
export function isPatternMatched(pattern: string, str: string): boolean {
  return new RegExp(pattern).test(str);
}

/**
 * Replace all path placeholder values, skip if replacement value is not provided
 * Eg:
 * /project/@projectId/members --> project/1234-34234-3424/members
 * /project/@projectId/members/@memberId/edit --> /project/123-342-324/members/322-231-321/edit
 * @param path path with placeholders
 * @param values values to replace placeholders
 * @returns path with placeholder value replaced
 */
export function replacePathPlaceholders(
  path: string,
  values: Record<string, unknown>,
) {
  return path.replace(
    /@(\w+)/g,
    (match: string, placeholder: string) =>
      (values[placeholder] as string | undefined) ?? match,
  );
}

export const base10Int = (strNum?: string | null, fallback = 0) => {
  if (!strNum) return fallback;

  const parsed = parseInt(strNum);
  return isNaN(parsed) ? fallback : parsed;
};

export function validateDomainEmail(email: string, orgDomain: string) {
  const domain = email.split("@")[1] ?? "";
  return EMAIL_REGEX.test(email) && !!orgDomain && domain.includes(orgDomain);
}

export const truncateText = (text: string, maxLength: number): string =>
  text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;

export const bgColors = {
  red: "bg-red-800",
  blue: "bg-blue-800",
  green: "bg-green-800",
  orange: "bg-orange-800",
  neutral: "bg-neutral-500",
};

const replacementsStatus: Record<string, string> = {
  "waiting-soak-time": "Waiting for Soak Time",
  "rolling-back-success": "Rollback Successful",
  "rolling-back-failed": "Rollback Failed",
  "upgrade-success": "Upgrade Successful",
  pending_create: "Creating",
  pending_update: "Updating",
  pending_delete: "Deleting",
  performing_backup: "Backing up",
};

export function formatStatusLabel(statusKey: string): string {
  const formatted =
    replacementsStatus[statusKey] ??
    statusKey
      .replace(/_/g, "-")
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

  return formatted;
}

const redStatuses = [
  "attach-failed",
  "backup-failed",
  "deleting",
  "detach-failed",
  "failed",
  "fail",
  "restore-failed",
  "suspended",
  "canceled",
  "rolling-back-failed",
  "upgrade-failed",
  "error",
  "failed_validation",
  "partially_failed",
  "diskfull",
  "firing",
  "deleted",
];

const blueStatuses = [
  "applying",
  "attaching",
  "awaiting-transfer",
  "backing-up",
  "creating",
  "rescuing",
  "restoring",
  "retyping",
  "updating",
  "uploading",
  "provisioning",
  "enabling",
  "new",
  "renewing",
  "upgrading",
  "upgrading-control-plane",
  "upgrading-worker",
  "creating-green-node",
  "draining-blue-node",
  "draining-green-node",
  "uncordon-blue-node",
  "deleting-blue-node",
  "deleting-green-node",
  "waiting-soak-time",
  "scaling-up",
  "scheduling",
  "pending_create",
  "pending_update",
  "in_progress",
  "deleting",
  "upgrading",
  "volume_resizing",
  "flavor_resizing",
  "created",
  "testing",
  "starting",
  "loading",
  "replicating",
  "modifying",
  "started",
  "stopped",
  "stopping",
];

const greenStatuses = [
  "available",
  "in-use",
  "running",
  "provisioned",
  "active",
  "enabled",
  "rolling-back-success",
  "upgrade-success",
  "public-read",
  "completed",
  "success",
  "ready",
  "resolved",
  "online",
];

const orangeStatuses = [
  "detaching",
  "paused",
  "pending",
  "rolling-back",
  "Down",
  "down",
  "resizing",
  "denying",
  "pending_delete",
  "failovering",
  "failovering_secondary",
  "under_maintainance",
  "flavor_resizing",
  "volume_resizing",
  "backing_up",
  "performing_backup",
  "degraded",
  "draining",
  "awaiting_transfer",
];

const neutralStatuses = [
  "shutdown",
  "unknown",
  "inactive",
  "disabled",
  "rejected",
  "expired",
  "abnormal",
  "offline",
  "no_monitor",
  "private",
];

function createStatusMap(
  keys: string[],
  color: string,
): Record<string, { label: string; bgColor: string }> {
  return Object.fromEntries(
    keys.map((key) => [key, { label: formatStatusLabel(key), bgColor: color }]),
  );
}

const statusMap: Record<string, { label: string; bgColor: string }> = {
  ...createStatusMap(redStatuses, bgColors.red),
  ...createStatusMap(blueStatuses, bgColors.blue),
  ...createStatusMap(greenStatuses, bgColors.green),
  ...createStatusMap(orangeStatuses, bgColors.orange),
  ...createStatusMap(neutralStatuses, bgColors.neutral),
};

export const getStatusColor = (status?: string | null) => {
  return (
    statusMap[status?.toLocaleLowerCase() ?? ""] ?? { label: "", bgColor: "" }
  );
};

export const getStatusCheckColor = (status: string) => {
  const [xStr, yStr] = status.split("/");
  const x = parseInt(xStr ?? "0", 10);
  const y = parseInt(yStr ?? "0", 10);

  switch (true) {
    case isNaN(x) || isNaN(y) || y <= 0 || x < 0 || x > y:
      return { label: "", bgColor: "" };
    case x === 0:
      return {
        label: status,
        bgColor: "bg-red-100",
        borderColor: "border-red-900",
        textColor: "text-red-900",
      };
    case x === y:
      return {
        label: status,
        bgColor: "bg-green-50",
        borderColor: "border-green-900",
        textColor: "text-green-900",
      };
    default:
      return {
        label: status,
        bgColor: "bg-blue-200",
        borderColor: "border-blue-900",
        textColor: "text-blue-900",
      };
  }
};

export function snakify(str: string, separateNumbers = false): string {
  return str
    .trim()
    .replace(/[^a-zA-Z\d_\s]/g, "") // Remove special characters (keep "_" and spaces)
    .replace(/\s+/g, "_") // Replace spaces with "_"
    .replace(/([a-z\d])([A-Z])/g, "$1_$2") // Add "_" between lowercase/number and uppercase letters
    .replace(/([a-zA-Z])(\d)/g, separateNumbers ? "$1_$2" : "$1$2") // Separate numbers from letters if enabled
    .replace(/_+/g, "_") // Remove consecutive "_"
    .replace(/(^_|_$)/g, "")
    .toLowerCase();
}

export const removeVietnameseTones = (str: string): string => {
  return str
    .normalize("NFD") // separate letter and tones
    .replace(/[\u0300-\u036f]/g, "") // remove tones
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
};

export const findLastMatchedIndex = <T>(
  array: T[],
  predicate: (value: T, index: number, array: T[]) => boolean,
) => {
  for (let i = array.length - 1; i >= 0; i--) {
    const currentValue = array[i];
    if (currentValue && predicate(currentValue, i, array)) {
      return i;
    }
  }

  return -1;
};

export const sanitize = (val: string | undefined | null) =>
  DOMPurify.sanitize(val ?? "");

export const utf8ByteLength = (s: string) => new TextEncoder().encode(s).length;

type GenerateRandomStringOptions = {
  length: number;
  onFinish: (value: string) => void;
  charSet?: string;
  requireLower?: boolean;
  requireUpper?: boolean;
  requireDigit?: boolean;
  requireSpecial?: boolean;
};

export const REGEX_RULES = {
  lower: /[a-z]/,
  upper: /[A-Z]/,
  digit: /\d/,
  special: /[^A-Za-z\d]/,
};

export const generateRandomString = ({
  length,
  onFinish,
  charSet = VALID_CHAR_SET,
  requireLower = true,
  requireUpper = true,
  requireDigit = true,
  requireSpecial = true,
}: GenerateRandomStringOptions) => {
  const charsetLength = charSet.length;

  const validateRule = [
    { enabled: requireLower, regex: REGEX_RULES.lower },
    { enabled: requireUpper, regex: REGEX_RULES.upper },
    { enabled: requireDigit, regex: REGEX_RULES.digit },
    { enabled: requireSpecial, regex: REGEX_RULES.special },
  ];

  const isValid = (value: string) =>
    validateRule.every((r) => !r.enabled || r.regex.test(value));

  let value = "";

  do {
    const randomValues = new Uint32Array(length);
    crypto.getRandomValues(randomValues);

    value = Array.from(randomValues, (v) => charSet[v % charsetLength]).join(
      "",
    );
  } while (!isValid(value));

  onFinish(value);
};
