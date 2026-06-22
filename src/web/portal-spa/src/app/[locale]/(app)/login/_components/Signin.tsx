"use client";

import { Eye, EyeSlash } from "@common/components/icons";
import { type FormEvent, useEffect, useRef, useState } from "react";
import { BASE_PATH } from "@common/lib/core/const";
import Image from "next/image";
import { cn } from "@common/lib/core/utils";
import { signInWithSso } from "@/app/[locale]/(app)/login/_apis/server.actions";
import styles from "@/app/[locale]/(app)/login/_components/login.module.css";
import toast from "@common/components/ui/toast";
import { useTranslations } from "next-intl";

type FormErrors = {
  username?: string;
  password?: string;
};

const PARTICLES = [
  { left: "8%", delay: "0s", size: 4 },
  { left: "18%", delay: "2.5s", size: 5 },
  { left: "28%", delay: "5s", size: 3 },
  { left: "38%", delay: "1.5s", size: 4 },
  { left: "48%", delay: "4s", size: 5 },
  { left: "58%", delay: "6s", size: 4 },
  { left: "68%", delay: "3s", size: 3 },
  { left: "78%", delay: "5.5s", size: 4 },
  { left: "88%", delay: "2s", size: 5 },
  { left: "95%", delay: "4.5s", size: 4 },
];

const FEATURES: { bg: string; label: string; icon: React.ReactNode }[] = [
  {
    bg: "linear-gradient(135deg, #1A5FAF, #2E7BD6)",
    label: "Quản lý danh mục",
    icon: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </>
    ),
  },
  {
    bg: "linear-gradient(135deg, #00A651, #00c764)",
    label: "Bảo mật cao",
    icon: (
      <>
        <rect x="3" y="11" width="18" height="11" rx="2" />
        <path d="M7 11V7a5 5 0 0110 0v4" />
        <circle cx="12" cy="16" r="1" />
      </>
    ),
  },
  {
    bg: "linear-gradient(135deg, #E31B23, #ff4d4d)",
    label: "Liên thông dữ liệu",
    icon: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
      </>
    ),
  },
  {
    bg: "linear-gradient(135deg, #00AEEF, #33c1f5)",
    label: "Chuẩn hóa dữ liệu",
    icon: (
      <>
        <path d="M9 11l3 3L22 4" />
        <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
      </>
    ),
  },
];

const SUBTITLE_TEXT = "TRUNG TÂM SÁNG TẠO, KHAI THÁC DỮ LIỆU";

// Thông tin quản trị viên hiển thị trong popup "Liên hệ quản trị viên".
const ADMIN_CONTACT = {
  name: "Quản trị viên",
  role: "Quản trị viên hệ thống",
  phone: "0901 234 567",
  phoneHref: "tel:0901234567",
  email: "admin@ncdi.gov.vn",
};

// Ghi nhớ đăng nhập: lưu username + password ở localStorage để điền sẵn form
// sau khi đăng xuất. LƯU Ý: lưu mật khẩu phía client không an toàn (XSS đọc
// được) — chỉ obfuscate base64, không phải mã hoá thật.
const REMEMBER_KEY = "ncdi_login_remember";

type RememberedCredentials = { username: string; password: string };

function saveCredentials(creds: RememberedCredentials) {
  try {
    localStorage.setItem(
      REMEMBER_KEY,
      btoa(encodeURIComponent(JSON.stringify(creds))),
    );
  } catch {
    // bỏ qua nếu localStorage không khả dụng
  }
}

function loadCredentials(): RememberedCredentials | null {
  try {
    const raw = localStorage.getItem(REMEMBER_KEY);
    if (!raw) return null;
    return JSON.parse(decodeURIComponent(atob(raw))) as RememberedCredentials;
  } catch {
    return null;
  }
}

function clearCredentials() {
  try {
    localStorage.removeItem(REMEMBER_KEY);
  } catch {
    // bỏ qua
  }
}

export default function Signin() {
  const t = useTranslations("layout.auth");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const logoRef = useRef<HTMLDivElement>(null);

  // Điền sẵn username + password nếu lần trước đã tick "Ghi nhớ đăng nhập"
  useEffect(() => {
    const saved = loadCredentials();
    if (saved) {
      setUsername(saved.username);
      setPassword(saved.password);
      setRemember(true);
    }
  }, []);

  // Đóng popup liên hệ bằng phím Escape.
  useEffect(() => {
    if (!contactOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setContactOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
    };
  }, [contactOpen]);

  // Tilt 3D logo theo con trỏ trong VÙNG MỞ RỘNG quanh logo (không chỉ khi rê
  // trực tiếp lên logo) — EXPAND px mỗi phía. Trả phẳng khi rời vùng.
  useEffect(() => {
    const el = logoRef.current;
    if (!el) return;
    const MAX_TILT = 18;
    const HOVER_SCALE = 1.08;
    const EXPAND = 160; // px mở rộng mỗi phía quanh logo
    let active = false;

    const onMove = (e: globalThis.MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const inZone =
        e.clientX >= rect.left - EXPAND &&
        e.clientX <= rect.right + EXPAND &&
        e.clientY >= rect.top - EXPAND &&
        e.clientY <= rect.bottom + EXPAND;
      if (inZone) {
        active = true;
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const halfW = rect.width / 2 + EXPAND;
        const halfH = rect.height / 2 + EXPAND;
        const mx = (e.clientX - centerX) / halfW;
        const my = (e.clientY - centerY) / halfH;
        el.style.transform = `perspective(1000px) rotateX(${-my * MAX_TILT}deg) rotateY(${mx * MAX_TILT}deg) scale3d(${HOVER_SCALE}, ${HOVER_SCALE}, ${HOVER_SCALE})`;
      } else if (active) {
        active = false;
        el.style.transform =
          "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
      }
    };

    window.addEventListener("mousemove", onMove);
    return () => {
      window.removeEventListener("mousemove", onMove);
    };
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newErrors: FormErrors = {};
    if (!username.trim()) {
      newErrors.username = "Vui lòng nhập tên đăng nhập";
    }
    if (!password) {
      newErrors.password = "Vui lòng nhập mật khẩu";
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setSubmitting(true);
    try {
      const result = await signInWithSso(username.trim(), password);

      if (result.success) {
        // Ghi nhớ / quên thông tin đăng nhập theo checkbox
        if (remember) {
          saveCredentials({ username: username.trim(), password });
        } else {
          clearCredentials();
        }
        window.location.href = `${BASE_PATH}/`;
        return;
      }

      toast.error(result.error ?? "Tên đăng nhập hoặc mật khẩu không đúng");
      setSubmitting(false);
    } catch {
      toast.error("Không thể kết nối máy chủ. Vui lòng thử lại.");
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full">
      {/* Left panel — branding (desktop only) */}
      <div className="relative hidden w-[60%] flex-col items-center justify-center overflow-hidden bg-[linear-gradient(135deg,#003366_0%,#0066B3_50%,#0088CC_100%)] p-[60px] lg:flex">
        {/* Animated background */}
        <div className={styles.bgEffects} aria-hidden>
          <div className={cn(styles.orb, styles.orb1)} />
          <div className={cn(styles.orb, styles.orb2)} />
          <div className={cn(styles.orb, styles.orb3)} />
          <div className={styles.particles}>
            {PARTICLES.map((p, i) => (
              <span
                key={i}
                className={styles.particle}
                style={{
                  left: p.left,
                  width: p.size,
                  height: p.size,
                  animationDelay: p.delay,
                }}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="relative z-[1] max-w-[600px] text-center">
          {/* Wrapper chỉ lo entrance (animation transform) — tách khỏi tilt */}
          <div
            className={cn(styles.animateItem, "mx-auto mb-8 w-fit")}
            style={{ animationDelay: "0.1s" }}
          >
            {/* Phần tử trong giữ transform tilt 3D (không bị animation đè) */}
            <div
              ref={logoRef}
              className={cn(
                styles.logo3dContainer,
                "flex h-[220px] w-[220px] items-center justify-center p-9",
              )}
            >
              <Image
                src="/image/logo.png"
                alt="Logo Trung tâm Sáng tạo, Khai thác Dữ liệu"
                width={140}
                height={140}
                priority
                unoptimized
                className="h-full w-full object-contain drop-shadow-[0_4px_16px_rgba(0,0,0,0.25)]"
              />
            </div>
          </div>
          <h1
            className={cn(
              styles.animateItem,
              "mb-2 text-[28px] font-bold leading-tight tracking-[0.5px] text-white",
            )}
            style={{ animationDelay: "0.18s" }}
          >
            HỆ THỐNG TÍCH HỢP, CHIA SẺ DỮ LIỆU
          </h1>
          <p
            className={cn(
              styles.animateItem,
              "mb-6 text-[16px] font-bold leading-relaxed text-white/85",
            )}
            style={{ animationDelay: "0.26s" }}
            aria-label={SUBTITLE_TEXT}
          >
            {(() => {
              let charIdx = 0;
              return Array.from(SUBTITLE_TEXT).map((ch, i) =>
                ch === " " ? (
                  <span key={i} className={styles.space} aria-hidden />
                ) : (
                  <span
                    key={i}
                    className={styles.char}
                    style={{ "--char-index": charIdx++ } as React.CSSProperties}
                    aria-hidden
                  >
                    {ch}
                  </span>
                ),
              );
            })()}
          </p>
          <p
            className={cn(
              styles.animateItem,
              "mx-auto mb-10 max-w-[440px] text-[14px] leading-relaxed text-white/70",
            )}
            style={{ animationDelay: "0.34s" }}
          >
            Nền tảng quản lý dữ liệu tập trung, hỗ trợ đổi mới sáng tạo và
            chuyển đổi số quốc gia.
          </p>

          <div className="grid grid-cols-2 gap-4">
            {FEATURES.map((f, i) => (
              <div
                key={f.label}
                className={cn(
                  styles.animateItem,
                  "flex items-center gap-3.5 rounded-xl border border-white/10 bg-white/[0.08] px-[18px] py-3.5 backdrop-blur-[8px] transition-all hover:-translate-y-[2px] hover:border-white/20 hover:bg-white/[0.12]",
                )}
                style={{ animationDelay: `${0.42 + i * 0.08}s` }}
              >
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
                  style={{ background: f.bg }}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    className="h-6 w-6 text-white"
                  >
                    {f.icon}
                  </svg>
                </div>
                <span className="text-left text-[14px] font-medium text-white">
                  {f.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <p className="absolute bottom-[30px] left-0 right-0 text-center text-[12px] text-white/50">
          © {new Date().getFullYear()} Trung tâm Sáng tạo, Khai thác Dữ liệu —
          Bộ Công an
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex w-full flex-col items-center justify-center bg-white px-6 py-12 dark:bg-neutral-dark-0 lg:w-[40%] lg:px-12">
        <div className="w-full max-w-[400px]">
          {/* Mobile logo */}
          <div className="mb-8 flex flex-col items-center gap-3 text-center lg:hidden">
            <Image
              src="/image/logo.png"
              alt="Logo"
              width={72}
              height={72}
              priority
              unoptimized
              className="h-[72px] w-[72px] object-contain"
            />
            <span className="text-[15px] font-semibold text-neutral-900 dark:text-neutral-dark-900">
              Trung tâm Sáng tạo, Khai thác Dữ liệu
            </span>
          </div>

          <div className="mb-8 text-center">
            <h2
              className={cn(
                styles.animateItem,
                "mb-2 text-[28px] font-bold leading-tight text-[#1a1a2e] dark:text-neutral-dark-900",
              )}
              style={{ animationDelay: "0.2s" }}
            >
              {t("sign_in")} SSO
            </h2>
            <p
              className={cn(
                styles.animateItem,
                "text-[14px] text-[#8a8a9a] dark:text-neutral-dark-500",
              )}
              style={{ animationDelay: "0.28s" }}
            >
              Vui lòng nhập thông tin đăng nhập của bạn
            </p>
          </div>

          <form
            onSubmit={(e) => {
              void handleSubmit(e);
            }}
            className="flex flex-col gap-5"
          >
            <div
              className={cn(styles.animateItem, "flex flex-col gap-2")}
              style={{ animationDelay: "0.36s" }}
            >
              <label
                htmlFor="login-username"
                className="text-[14px] font-medium text-[#4a4a5a] dark:text-neutral-dark-700"
              >
                {t("username")}
              </label>
              <div className="relative flex items-center">
                <input
                  id="login-username"
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (errors.username) {
                      setErrors((prev) => ({ ...prev, username: undefined }));
                    }
                  }}
                  placeholder="Nhập tên đăng nhập"
                  disabled={submitting}
                  autoComplete="username"
                  className="peer h-[52px] w-full rounded-[12px] border-2 border-transparent bg-[#f8f9fb] pl-12 pr-4 text-[15px] text-[#1a1a2e] outline-none transition-all placeholder:text-[#8a8a9a] hover:bg-[#f0f2f5] focus:border-[#0066B3] focus:bg-white focus:ring-4 focus:ring-[#0066B3]/10 disabled:opacity-60 dark:border-transparent dark:bg-neutral-dark-50 dark:text-neutral-dark-900"
                />
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  className="pointer-events-none absolute left-4 h-5 w-5 text-[#8a8a9a] transition-colors peer-focus:text-[#0066B3]"
                >
                  <circle cx="12" cy="7" r="4" />
                  <path d="M5.5 21a8.5 8.5 0 0117 0" />
                </svg>
              </div>
              {errors.username && (
                <span className="text-[12px] text-[#d80d31]">
                  {errors.username}
                </span>
              )}
            </div>

            <div
              className={cn(styles.animateItem, "flex flex-col gap-2")}
              style={{ animationDelay: "0.44s" }}
            >
              <label
                htmlFor="login-password"
                className="text-[14px] font-medium text-[#4a4a5a] dark:text-neutral-dark-700"
              >
                {t("password")}
              </label>
              <div className="relative flex items-center">
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) {
                      setErrors((prev) => ({ ...prev, password: undefined }));
                    }
                  }}
                  placeholder="Nhập mật khẩu"
                  disabled={submitting}
                  autoComplete="current-password"
                  className="peer h-[52px] w-full rounded-[12px] border-2 border-transparent bg-[#f8f9fb] pl-12 pr-12 text-[15px] text-[#1a1a2e] outline-none transition-all placeholder:text-[#8a8a9a] hover:bg-[#f0f2f5] focus:border-[#0066B3] focus:bg-white focus:ring-4 focus:ring-[#0066B3]/10 disabled:opacity-60 dark:border-transparent dark:bg-neutral-dark-50 dark:text-neutral-dark-900"
                />
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  className="pointer-events-none absolute left-4 h-5 w-5 text-[#8a8a9a] transition-colors peer-focus:text-[#0066B3]"
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0110 0v4" />
                </svg>
                <button
                  type="button"
                  onClick={() => {
                    setShowPassword((prev) => !prev);
                  }}
                  className="absolute right-4 flex items-center justify-center text-[#8a8a9a] transition-colors hover:text-[#0066B3]"
                  aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeSlash size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && (
                <span className="text-[12px] text-[#d80d31]">
                  {errors.password}
                </span>
              )}
            </div>

            <div
              className={cn(styles.animateItem, "flex items-center")}
              style={{ animationDelay: "0.52s" }}
            >
              <label className="flex w-fit cursor-pointer items-center gap-2.5">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => {
                    setRemember(e.target.checked);
                  }}
                  className="sr-only"
                />
                <span
                  className={cn(
                    "flex h-5 w-5 items-center justify-center rounded-[5px] border-2 transition-all",
                    remember
                      ? "border-[#0066B3] bg-[#0066B3]"
                      : "border-[#d1d5db] dark:border-neutral-dark-300",
                  )}
                >
                  {remember && (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={3}
                      className="h-3 w-3 text-white"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </span>
                <span className="select-none text-[14px] text-[#4a4a5a] dark:text-neutral-dark-700">
                  Ghi nhớ đăng nhập
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className={cn(
                styles.animateItem,
                "mt-2 flex h-[52px] w-full items-center justify-center gap-2.5 rounded-[12px] bg-[linear-gradient(135deg,#0066B3_0%,#0088CC_100%)] text-[16px] font-semibold text-white shadow-[0_4px_20px_rgba(0,102,179,0.35)] transition-all hover:-translate-y-[2px] hover:shadow-[0_8px_30px_rgba(0,102,179,0.45)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-80",
              )}
              style={{ animationDelay: "0.6s" }}
            >
              {submitting ? (
                <span className="h-6 w-6 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <>
                  <span>{t("sign_in")}</span>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    className="h-5 w-5"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </>
              )}
            </button>
          </form>

          <p
            className={cn(
              styles.animateItem,
              "mt-6 text-center text-[13px] text-[#8a8a9a] dark:text-neutral-dark-500",
            )}
            style={{ animationDelay: "0.68s" }}
          >
            Cần hỗ trợ?{" "}
            <button
              type="button"
              onClick={() => {
                setContactOpen(true);
              }}
              className="font-medium text-[#0066B3] transition-colors hover:text-[#004C8C]"
            >
              Liên hệ quản trị viên
            </button>
          </p>
        </div>
      </div>

      {/* Popup liên hệ quản trị viên */}
      {contactOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Đóng"
            onClick={() => {
              setContactOpen(false);
            }}
            className={cn(
              styles.contactOverlay,
              "absolute inset-0 cursor-default bg-black/50 backdrop-blur-[4px]",
            )}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Liên hệ quản trị viên"
            className={cn(
              styles.contactPopup,
              "relative z-[1] w-[340px] max-w-[90vw] rounded-[20px] bg-white shadow-[0_25px_80px_rgba(0,0,0,0.25)] dark:bg-neutral-dark-0",
            )}
          >
            <button
              type="button"
              onClick={() => {
                setContactOpen(false);
              }}
              aria-label="Đóng"
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-[#f0f2f5] text-[#4a4a5a] transition-all hover:rotate-90 hover:bg-[#e4e6e9] dark:bg-neutral-dark-50 dark:text-neutral-dark-700"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                className="h-4 w-4"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>

            {/* Header */}
            <div className="border-b border-[#f0f0f0] px-6 pb-4 pt-6 text-center dark:border-neutral-dark-100">
              <div className="mx-auto mb-4 flex h-[72px] w-[72px] items-center justify-center rounded-full bg-[linear-gradient(135deg,#0066B3,#0088CC)] shadow-[0_8px_24px_rgba(0,102,179,0.3)]">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.75}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-9 w-9 text-white"
                >
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 21c0-4.418 3.582-8 8-8s8 3.582 8 8" />
                </svg>
              </div>
              <div className="text-[18px] font-semibold text-[#1a1a2e] dark:text-neutral-dark-900">
                {ADMIN_CONTACT.name}
              </div>
              <div className="mt-1 text-[13px] text-[#8a8a9a] dark:text-neutral-dark-500">
                {ADMIN_CONTACT.role}
              </div>
            </div>

            {/* Body */}
            <div className="px-6 pb-6 pt-5">
              <a
                href={ADMIN_CONTACT.phoneHref}
                className="mb-3 flex items-center gap-3.5 rounded-[12px] bg-[#f8f9fb] px-4 py-3.5 transition-colors hover:bg-[#f0f2f5] dark:bg-neutral-dark-50 dark:hover:bg-neutral-dark-100"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-[linear-gradient(135deg,#00A651,#00c764)]">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    className="h-5 w-5 text-white"
                  >
                    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
                  </svg>
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[12px] text-[#8a8a9a] dark:text-neutral-dark-500">
                    Số điện thoại
                  </span>
                  <span className="block text-[15px] font-medium text-[#1a1a2e] dark:text-neutral-dark-900">
                    {ADMIN_CONTACT.phone}
                  </span>
                </span>
              </a>

              <a
                href={`mailto:${ADMIN_CONTACT.email}`}
                className="flex items-center gap-3.5 rounded-[12px] bg-[#f8f9fb] px-4 py-3.5 transition-colors hover:bg-[#f0f2f5] dark:bg-neutral-dark-50 dark:hover:bg-neutral-dark-100"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-[linear-gradient(135deg,#00AEEF,#33c1f5)]">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    className="h-5 w-5 text-white"
                  >
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="M22 6l-10 7L2 6" />
                  </svg>
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[12px] text-[#8a8a9a] dark:text-neutral-dark-500">
                    Email
                  </span>
                  <span className="block text-[15px] font-medium text-[#1a1a2e] dark:text-neutral-dark-900">
                    {ADMIN_CONTACT.email}
                  </span>
                </span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
