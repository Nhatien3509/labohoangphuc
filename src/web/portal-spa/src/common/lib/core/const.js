/* Regex */
export const TAX_CODE_REGEX = /^(\d{10}|\d{10}-\d{3})?$/;

export const EMAIL_REGEX =
  /^[a-zA-Z0-9]+(?:[._-][a-zA-Z0-9]+)*@[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?(?:\.[a-zA-Z]{2,})+$/;

export const PHONE_REGEX = /^(03|05|07|08|09|01[2-9])\d{8}$/;

export const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const ROLE_REGEX =
  /^[\wÁÀẢÃẠĂẮẰẲẴẶÂẤẦẨẪẬáàảãạăắằẳẵặâấầẩẫậÉÈẺẼẸÊẾỀỂỄỆéèẻẽẹêếềểễệÍÌỈĨỊíìỉĩịÓÒỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢóòỏõọôốồổỗộơớờởỡợÚÙỦŨỤƯỨỪỬỮỰúùủũụưứừửữựÝỲỶỸỴýỳỷỹỵĐđ\s-]+$/;

export const NUMBER_REGEX = /^\d+$/;

export const RSA_PUBLIC_KEY_REGEX =
  /ssh-rsa AAAA[0-9A-Za-z+/]+={0,3}( [^@]+@[^@]+)?/;

export const DATE_REGEX = /^(\d{2})\/(\d{2})\/(\d{4})$/; // DD/MM/YYYY

export const LEADING_ZEROS_REGEX = /^0+/;

export const DEPOSIT_AMOUNT_REGEX =
  /^(?:(?:[2-9]|[1-9]\d|[1-9]\d{2}|[1-9]\d{3})0000)$/;

export const PORT_RANGE_REGEX = /^\d{0,5}(-\d{0,5})?$|^N\/A$/;

export const ASCII_REGEX = /^[\x20-\x7E\r\n\t]*$/;

export const ASCII_NO_SPACE_REGEX = /^[\x21-\x7E]*$/;

export const WEBHOOK_URL_REGEX = /^https?:\/\/[^\s]+$/;

/* Others */
export const DYNAMIC_ROUTE_SEGMENT = "[^/]+";

export const BASE_PATH = ""; // To disable subpath, use empty string ""

export const VALID_CHAR_SET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+[]{}|;:,.<>?";

export const INVALID_NUMERIC_CHARACTERS = /[.+-]/;

export const SLASH = "/";

export const DATE_FORMAT = "HH:mm dd/MM/yyyy";

export const ERROR_403 = Promise.resolve({
  success: false,
  status: 403,
});

export const SUCCESS_200 = Promise.resolve({
  success: true,
  status: 200,
});

export const EMPTY_RESULT = { data: { results: [] } };

export const INSUFFICIENT_BALANCE_CODE = 402;

export const DaysOfTheWeek = Object.freeze({
  Mon: "mon",
  Tue: "tue",
  Wed: "wed",
  Thu: "thu",
  Fri: "fri",
  Sat: "sat",
  Sun: "sun",
});

export const USD = "$";
export const VND = "₫";

export const TELEPHONE_COUNTRY_CODES = [
  { code: "af", phone: 93 },
  { code: "ax", phone: 358 },
  { code: "al", phone: 355 },
  { code: "dz", phone: 213 },
  { code: "as", phone: 1684 },
  { code: "ad", phone: 376 },
  { code: "ao", phone: 244 },
  { code: "ai", phone: 1264 },
  { code: "aq", phone: 672 },
  { code: "ag", phone: 1268 },
  { code: "ar", phone: 54 },
  { code: "am", phone: 374 },
  { code: "aw", phone: 297 },
  { code: "au", phone: 61 },
  { code: "at", phone: 43 },
  { code: "az", phone: 994 },
  { code: "bs", phone: 1242 },
  { code: "bh", phone: 973 },
  { code: "bd", phone: 880 },
  { code: "bb", phone: 1246 },
  { code: "by", phone: 375 },
  { code: "be", phone: 32 },
  { code: "bz", phone: 501 },
  { code: "bj", phone: 229 },
  { code: "bm", phone: 1441 },
  { code: "bt", phone: 975 },
  { code: "bo", phone: 591 },
  { code: "bq", phone: 599 },
  { code: "ba", phone: 387 },
  { code: "bw", phone: 267 },
  { code: "bv", phone: 55 },
  { code: "br", phone: 55 },
  { code: "io", phone: 246 },
  { code: "bn", phone: 673 },
  { code: "bg", phone: 359 },
  { code: "bf", phone: 226 },
  { code: "bi", phone: 257 },
  { code: "kh", phone: 855 },
  { code: "cm", phone: 237 },
  { code: "ca", phone: 1 },
  { code: "cv", phone: 238 },
  { code: "ky", phone: 1345 },
  { code: "cf", phone: 236 },
  { code: "td", phone: 235 },
  { code: "cl", phone: 56 },
  { code: "cn", phone: 86 },
  { code: "cx", phone: 61 },
  { code: "cc", phone: 672 },
  { code: "co", phone: 57 },
  { code: "km", phone: 269 },
  { code: "cg", phone: 242 },
  { code: "cd", phone: 242 },
  { code: "ck", phone: 682 },
  { code: "cr", phone: 506 },
  { code: "ci", phone: 225 },
  { code: "hr", phone: 385 },
  { code: "cu", phone: 53 },
  { code: "cw", phone: 599 },
  { code: "cy", phone: 357 },
  { code: "cz", phone: 420 },
  { code: "dk", phone: 45 },
  { code: "dj", phone: 253 },
  { code: "dm", phone: 1767 },
  { code: "do", phone: 1809 },
  { code: "ec", phone: 593 },
  { code: "eg", phone: 20 },
  { code: "sv", phone: 503 },
  { code: "gq", phone: 240 },
  { code: "er", phone: 291 },
  { code: "ee", phone: 372 },
  { code: "et", phone: 251 },
  { code: "fk", phone: 500 },
  { code: "fo", phone: 298 },
  { code: "fj", phone: 679 },
  { code: "fi", phone: 358 },
  { code: "fr", phone: 33 },
  { code: "gf", phone: 594 },
  { code: "pf", phone: 689 },
  { code: "tf", phone: 262 },
  { code: "ga", phone: 241 },
  { code: "gm", phone: 220 },
  { code: "ge", phone: 995 },
  { code: "de", phone: 49 },
  { code: "gh", phone: 233 },
  { code: "gi", phone: 350 },
  { code: "gr", phone: 30 },
  { code: "gl", phone: 299 },
  { code: "gd", phone: 1473 },
  { code: "gp", phone: 590 },
  { code: "gu", phone: 1671 },
  { code: "gt", phone: 502 },
  { code: "gg", phone: 44 },
  { code: "gn", phone: 224 },
  { code: "gw", phone: 245 },
  { code: "gy", phone: 592 },
  { code: "ht", phone: 509 },
  { code: "hm", phone: 0 },
  { code: "va", phone: 39 },
  { code: "hn", phone: 504 },
  { code: "hk", phone: 852 },
  { code: "hu", phone: 36 },
  { code: "is", phone: 354 },
  { code: "in", phone: 91 },
  { code: "id", phone: 62 },
  { code: "ir", phone: 98 },
  { code: "iq", phone: 964 },
  { code: "ie", phone: 353 },
  { code: "im", phone: 44 },
  { code: "il", phone: 972 },
  { code: "it", phone: 39 },
  { code: "jm", phone: 1876 },
  { code: "jp", phone: 81 },
  { code: "je", phone: 44 },
  { code: "jo", phone: 962 },
  { code: "kz", phone: 7 },
  { code: "ke", phone: 254 },
  { code: "ki", phone: 686 },
  { code: "kp", phone: 850 },
  { code: "kr", phone: 82 },
  { code: "xk", phone: 381 },
  { code: "kw", phone: 965 },
  { code: "kg", phone: 996 },
  { code: "la", phone: 856 },
  { code: "lv", phone: 371 },
  { code: "lb", phone: 961 },
  { code: "ls", phone: 266 },
  { code: "lr", phone: 231 },
  { code: "ly", phone: 218 },
  { code: "li", phone: 423 },
  { code: "lt", phone: 370 },
  { code: "lu", phone: 352 },
  { code: "mo", phone: 853 },
  { code: "mk", phone: 389 },
  { code: "mg", phone: 261 },
  { code: "mw", phone: 265 },
  { code: "my", phone: 60 },
  { code: "mv", phone: 960 },
  { code: "ml", phone: 223 },
  { code: "mt", phone: 356 },
  { code: "mh", phone: 692 },
  { code: "mq", phone: 596 },
  { code: "mr", phone: 222 },
  { code: "mu", phone: 230 },
  { code: "yt", phone: 269 },
  { code: "mx", phone: 52 },
  { code: "fm", phone: 691 },
  { code: "md", phone: 373 },
  { code: "mc", phone: 377 },
  { code: "mn", phone: 976 },
  { code: "me", phone: 382 },
  { code: "ms", phone: 1664 },
  { code: "ma", phone: 212 },
  { code: "mz", phone: 258 },
  { code: "mm", phone: 95 },
  { code: "na", phone: 264 },
  { code: "nr", phone: 674 },
  { code: "np", phone: 977 },
  { code: "nl", phone: 31 },
  { code: "an", phone: 599 },
  { code: "nc", phone: 687 },
  { code: "nz", phone: 64 },
  { code: "ni", phone: 505 },
  { code: "ne", phone: 227 },
  { code: "ng", phone: 234 },
  { code: "nu", phone: 683 },
  { code: "nf", phone: 672 },
  { code: "mp", phone: 1670 },
  { code: "no", phone: 47 },
  { code: "om", phone: 968 },
  { code: "pk", phone: 92 },
  { code: "pw", phone: 680 },
  { code: "ps", phone: 970 },
  { code: "pa", phone: 507 },
  { code: "pg", phone: 675 },
  { code: "py", phone: 595 },
  { code: "pe", phone: 51 },
  { code: "ph", phone: 63 },
  { code: "pn", phone: 64 },
  { code: "pl", phone: 48 },
  { code: "pt", phone: 351 },
  { code: "pr", phone: 1787 },
  { code: "qa", phone: 974 },
  { code: "re", phone: 262 },
  { code: "ro", phone: 40 },
  { code: "ru", phone: 70 },
  { code: "rw", phone: 250 },
  { code: "bl", phone: 590 },
  { code: "sh", phone: 290 },
  { code: "kn", phone: 1869 },
  { code: "lc", phone: 1758 },
  { code: "mf", phone: 590 },
  { code: "pm", phone: 508 },
  { code: "vc", phone: 1784 },
  { code: "ws", phone: 684 },
  { code: "sm", phone: 378 },
  { code: "st", phone: 239 },
  { code: "sa", phone: 966 },
  { code: "sn", phone: 221 },
  { code: "rs", phone: 381 },
  { code: "cs", phone: 381 },
  { code: "sc", phone: 248 },
  { code: "sl", phone: 232 },
  { code: "sg", phone: 65 },
  { code: "sx", phone: 1 },
  { code: "sk", phone: 421 },
  { code: "si", phone: 386 },
  { code: "sb", phone: 677 },
  { code: "so", phone: 252 },
  { code: "za", phone: 27 },
  { code: "gs", phone: 500 },
  { code: "ss", phone: 211 },
  { code: "es", phone: 34 },
  { code: "lk", phone: 94 },
  { code: "sd", phone: 249 },
  { code: "sr", phone: 597 },
  { code: "sj", phone: 47 },
  { code: "sz", phone: 268 },
  { code: "se", phone: 46 },
  { code: "ch", phone: 41 },
  { code: "sy", phone: 963 },
  { code: "tw", phone: 886 },
  { code: "tj", phone: 992 },
  { code: "tz", phone: 255 },
  { code: "th", phone: 66 },
  { code: "tl", phone: 670 },
  { code: "tg", phone: 228 },
  { code: "tk", phone: 690 },
  { code: "to", phone: 676 },
  { code: "tt", phone: 1868 },
  { code: "tn", phone: 216 },
  { code: "tr", phone: 90 },
  { code: "tm", phone: 7370 },
  { code: "tc", phone: 1649 },
  { code: "tv", phone: 688 },
  { code: "ug", phone: 256 },
  { code: "ua", phone: 380 },
  { code: "ae", phone: 971 },
  { code: "gb", phone: 44 },
  { code: "us", phone: 1 },
  { code: "um", phone: 1 },
  { code: "uy", phone: 598 },
  { code: "uz", phone: 998 },
  { code: "vu", phone: 678 },
  { code: "ve", phone: 58 },
  { code: "vn", phone: 84 },
  { code: "vg", phone: 1284 },
  { code: "vi", phone: 1340 },
  { code: "wf", phone: 681 },
  { code: "eh", phone: 212 },
  { code: "ye", phone: 967 },
  { code: "zm", phone: 260 },
  { code: "zw", phone: 263 },
];

// Client env vars replacements
export const LANDING_PAGE_URL = "https://viettelcloud.vn";

export const DOCS_PAGE_URL = "https://docs.viettelcloud.vn";

export const HOTLINE = "18008000";

export const SECONDS_PER_HOUR = 3600;

export const SECONDS_PER_DAY = 24 * SECONDS_PER_HOUR;

export const SECONDS_PER_MONTH = 30 * SECONDS_PER_DAY;

export const MAX_FILE_BYTES = 5 * 1024 * 1024 * 1024; // 5 GiB

export const SENSITIVE_KEYS = [
  "authorization",
  "token",
  "password",
  "secret",
  "api_key",
];

export const SERVICE_NAMES = /** @type {const} */ ({
  SERVER: "Server",
  DPC: "DPC",
  NETWORK: "Network",
  BACKUP: "Backup",
  BLOCK_STORAGE: "Block Storage",
  OBJECT_STORAGE: "Object Storage",
  FILE_STORAGE: "File Storage",
  AUTO_SCALING: "Auto Scaling",
  LOAD_BALANCING: "Load Balancing",
  KMS: "Key Management",
  KUBERNETES: "Kubernetes",
  CONTAINER_REGISTRY: "Container Registry",
  DBAAS: "DBaaS",
  API_GATEWAY: "API Gateway",
  CLOUD_OBSERVABILITY: "Cloud Observability",
  WEB_PROTECTION: "Web Protection",
  VOLUME_BASED_DDOS_PREVENTION: "Volume-based DDoS Prevention",
  DMS: "Data Migration Service",
  VPN: "Virtual Private Network",
});

export const BANDWIDTH_MIN_VALUE = 3;
export const BANDWIDTH_MAX_VALUE = 100;
