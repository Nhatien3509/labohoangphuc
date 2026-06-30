import {
  ArrowRight,
  Award,
  BadgeCheck,
  Clock,
  Cpu,
  Phone,
  ShieldCheck,
  Truck,
} from "lucide-react";
import Image from "next/image";
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

const PRODUCTS = [
  {
    name: "Răng sứ Cercon",
    image: "/products/cercon.png",
    desc: "Răng sứ không kim loại được tạo nên hoàn toàn từ khối sứ nguyên chất, đảm bảo tính thuần nhất, không gây kích ứng nướu.",
  },
  {
    name: "Răng sứ Katana",
    image: "/products/katana.png",
    desc: "Răng sứ không kim loại cao cấp hai lớp: khung sườn zirconia chịu lực bên trong, lớp sứ tạo màu bên ngoài giống răng thật.",
  },
  {
    name: "Răng sứ Emax",
    image: "/products/emax.png",
    desc: "Phổ biến trong kỹ thuật inlay – onlay. Công nghệ press cho phép tạo ra những chi tiết siêu nhỏ với độ chính xác cao nhất.",
  },
  {
    name: "Răng sứ Ceramill",
    image: "/products/ceramill.png",
    desc: "Gia công trên hệ thống CAD/CAM Ceramill (Đức), độ chính xác cao, phục hình thẩm mỹ tự nhiên.",
  },
  {
    name: "Răng sứ HT-Smile",
    image: "/products/htsmile.png",
    desc: "Sứ zirconia độ trong cao từ pritidenta (Đức), thuộc tập đoàn IMES-ICORE, phục hình bền chắc, thẩm mỹ tự nhiên với chế độ bảo hành dài lâu.",
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
                Trung tâm Phục Hình <span className="text-brand">Răng</span>
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
                  href={`tel:${SITE.hotlineRaw}`}
                  className="inline-flex items-center gap-2 rounded-xl border-[1.5px] border-border px-7 py-3.5 text-[15px] font-semibold transition-colors hover:border-brand hover:bg-brand-soft hover:text-brand"
                >
                  Gọi ngay: {SITE.hotline}
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
                <div className="relative mb-6 aspect-[16/10] overflow-hidden rounded-2xl bg-gradient-to-br from-brand-soft to-border">
                  <Image
                    src="/banner.png"
                    alt="Labo Hoàng Phúc"
                    fill
                    priority
                    quality={100}
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                  />
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

      {/* PRODUCTS */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-container">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight">Sản phẩm</h2>
            <p className="mx-auto mt-3 max-w-xl text-[15px] text-muted-foreground">
              Đa dạng dòng răng sứ cao cấp, đáp ứng mọi nhu cầu phục hình thẩm mỹ
              và chức năng ăn nhai.
            </p>
          </div>

          <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {PRODUCTS.map((p) => (
              <article
                key={p.name}
                className="group overflow-hidden rounded-2xl border border-border bg-surface transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="aspect-[3/2] overflow-hidden p-5">
                  <div className="relative h-full w-full">
                    <Image
                      src={p.image}
                      alt={p.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-contain drop-shadow-lg transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold tracking-tight group-hover:text-brand">
                    {p.name}
                  </h3>
                  <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                    {p.desc}
                  </p>
                </div>
              </article>
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
              href={`tel:${SITE.hotlineRaw}`}
              className="inline-flex items-center gap-2 rounded-xl bg-brand px-7 py-3.5 text-[15px] font-semibold text-brand-foreground transition-all hover:-translate-y-0.5 hover:bg-brand-dark"
            >
              <Phone className="h-[18px] w-[18px]" />
              Gọi ngay: {SITE.hotline}
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
