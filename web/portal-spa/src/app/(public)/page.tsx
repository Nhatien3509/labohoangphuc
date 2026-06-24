import {
  ArrowRight,
  Award,
  BadgeCheck,
  Clock,
  Cpu,
  Phone,
  ShieldCheck,
  Star,
  Truck,
} from "lucide-react";
import Link from "next/link";

import { SITE } from "@common/lib/core/site";

import { LookupForm } from "./tra-cuu/_components/LookupForm";

const STATS = [
  { value: "15+", label: "Năm kinh nghiệm" },
  { value: "500+", label: "Phòng khám đối tác" },
  { value: "12", label: "Loại răng sứ" },
];

const FEATURES = [
  {
    icon: Cpu,
    title: "Công nghệ CAD/CAM",
    desc: "Thiết kế và gia công chính xác 0.01mm với máy móc hiện đại",
  },
  {
    icon: ShieldCheck,
    title: "Bảo hành 15 năm",
    desc: "Cam kết bảo hành lên đến 15 năm cho các sản phẩm cao cấp",
  },
  {
    icon: Clock,
    title: "Giao hàng 24-48h",
    desc: "Quy trình số hóa giúp rút ngắn thời gian, giao hàng toàn quốc",
  },
  {
    icon: Award,
    title: "Chất lượng hàng đầu",
    desc: "Nguyên liệu nhập khẩu chính hãng từ Đức, Nhật, Thụy Sĩ",
  },
];

const TESTIMONIALS = [
  {
    avatar: "TH",
    name: "BS. Trần Hoàng",
    role: "Nha khoa Smile, Hà Nội",
    text: "Chất lượng răng sứ từ Labo Hoàng Phúc luôn ổn định, độ chính xác cao. Đã hợp tác hơn 5 năm và rất hài lòng với dịch vụ.",
  },
  {
    avatar: "NL",
    name: "BS. Nguyễn Lan",
    role: "Nha khoa Việt Smile, TP.HCM",
    text: "Giao hàng nhanh, đóng gói cẩn thận. Đặc biệt dịch vụ hỗ trợ kỹ thuật rất tận tình, luôn sẵn sàng tư vấn.",
  },
  {
    avatar: "PM",
    name: "BS. Phạm Minh",
    role: "Nha khoa Quốc tế, Đà Nẵng",
    text: "Răng sứ Venus thẩm mỹ rất tự nhiên, bệnh nhân của tôi luôn hài lòng. Giá cả hợp lý, cạnh tranh.",
  },
];

export default function HomePage() {
  return (
    <>
      {/* HERO */}
      <section className="bg-hero-soft px-6 py-20">
        <div className="mx-auto max-w-container">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            <div>
              <h1 className="text-4xl font-bold leading-tight tracking-tight md:text-5xl">
                Trung tâm Phục hình <span className="text-brand">Nha khoa</span>{" "}
                Hà Nội
              </h1>
              <p className="mt-6 max-w-md text-lg leading-relaxed text-muted-foreground">
                Chuyên cung cấp các sản phẩm răng sứ cao cấp với công nghệ
                CAD/CAM hiện đại cho các phòng khám nha khoa trên toàn quốc.
              </p>
              <div className="mt-10 flex flex-wrap gap-4">
                <Link
                  href="/tra-cuu"
                  className="inline-flex items-center gap-2 rounded-xl bg-brand px-7 py-3.5 text-[15px] font-semibold text-brand-foreground transition-all hover:-translate-y-0.5 hover:bg-brand-dark"
                >
                  Tra cứu bảo hành
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href={`tel:${SITE.phoneRaw}`}
                  className="inline-flex items-center gap-2 rounded-xl border-[1.5px] border-border px-7 py-3.5 text-[15px] font-semibold transition-colors hover:border-brand hover:bg-brand-soft hover:text-brand"
                >
                  Gọi ngay: {SITE.phone}
                </a>
              </div>
              <div className="mt-12 flex flex-wrap gap-12">
                {STATS.map((s) => (
                  <div key={s.label}>
                    <div className="text-4xl font-bold text-brand">
                      {s.value}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="rounded-3xl bg-surface p-8 shadow-2xl">
                <div className="mb-6 flex aspect-[16/10] items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-brand-soft to-border">
                  <BadgeCheck className="h-16 w-16 text-brand/40" />
                </div>
                <h3 className="text-xl font-semibold">Tra cứu nhanh</h3>
                <p className="mb-4 mt-1 text-sm text-muted-foreground">
                  Nhập mã bảo hành in trên thẻ để kiểm tra thông tin sản phẩm.
                </p>
                <div className="rounded-2xl bg-background p-4">
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Mã bảo hành
                  </label>
                  <LookupForm variant="compact" />
                </div>
              </div>
              <div className="absolute -left-4 -top-5 hidden items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3 shadow-lg lg:flex">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-soft text-brand">
                  <BadgeCheck className="h-5 w-5" />
                </div>
                <div className="text-[13px]">
                  <strong className="block text-foreground">Chứng nhận</strong>
                  ISO 9001:2015
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="border-y border-border bg-surface px-6 py-20">
        <div className="mx-auto grid max-w-container gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="px-2 text-center">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-soft text-brand">
                <f.icon className="h-7 w-7" />
              </div>
              <h3 className="mb-2 font-semibold">{f.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="bg-ink px-6 py-20 text-white">
        <div className="mx-auto max-w-container">
          <h2 className="mb-10 text-3xl font-bold">
            Đối tác nói gì về chúng tôi
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <div
                key={t.name}
                className="rounded-2xl border border-white/10 bg-white/[0.06] p-7"
              >
                <div className="mb-4 flex gap-1 text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="mb-5 text-[15px] leading-relaxed text-white/90">
                  &ldquo;{t.text}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand font-semibold text-brand-foreground">
                    {t.avatar}
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{t.name}</div>
                    <div className="text-[13px] text-white/60">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-cta-soft px-6 py-20 text-center">
        <div className="mx-auto max-w-xl">
          <h2 className="text-3xl font-bold">Cần tư vấn về sản phẩm?</h2>
          <p className="mt-4 text-[17px] text-muted-foreground">
            Đội ngũ chuyên gia của chúng tôi luôn sẵn sàng hỗ trợ bạn chọn loại
            răng sứ phù hợp nhất.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <a
              href={`tel:${SITE.phoneRaw}`}
              className="inline-flex items-center gap-2 rounded-xl bg-brand px-7 py-3.5 text-[15px] font-semibold text-brand-foreground transition-all hover:-translate-y-0.5 hover:bg-brand-dark"
            >
              <Phone className="h-[18px] w-[18px]" />
              Gọi ngay: {SITE.phone}
            </a>
            <Link
              href="/tra-cuu"
              className="inline-flex items-center gap-2 rounded-xl border-[1.5px] border-border bg-transparent px-7 py-3.5 text-[15px] font-semibold transition-colors hover:border-brand hover:bg-brand-soft hover:text-brand"
            >
              <Truck className="h-[18px] w-[18px]" />
              Tra cứu bảo hành
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
