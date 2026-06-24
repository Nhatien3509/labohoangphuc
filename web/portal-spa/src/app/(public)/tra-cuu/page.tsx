import { RefreshCw, ShieldCheck, Headphones, X } from "lucide-react";

import { errorMessage } from "@common/lib/helpers/warranty";

import { lookupWarranty } from "./_apis/server";
import { LookupForm } from "./_components/LookupForm";
import { WarrantyResult } from "./_components/WarrantyResult";

const HERO_STATS = [
  { value: "15+", label: "Năm bảo hành tối đa" },
  { value: "100%", label: "Chính hãng" },
  { value: "24/7", label: "Hỗ trợ tra cứu" },
];

const POLICIES = [
  {
    icon: ShieldCheck,
    title: "Bảo hành chính hãng",
    desc: "Tất cả sản phẩm đều được bảo hành chính hãng với thời gian lên đến 15 năm",
  },
  {
    icon: RefreshCw,
    title: "Đổi mới miễn phí",
    desc: "Đổi mới sản phẩm miễn phí nếu phát hiện lỗi kỹ thuật trong thời gian bảo hành",
  },
  {
    icon: Headphones,
    title: "Hỗ trợ 24/7",
    desc: "Đội ngũ hỗ trợ sẵn sàng giải đáp mọi thắc mắc về bảo hành",
  },
];

const PRODUCTS = [
  { name: "Răng sứ Venus", warranty: "Bảo hành 15 năm" },
  { name: "Răng sứ Katana", warranty: "Bảo hành 15 năm" },
  { name: "Răng sứ Emax", warranty: "Bảo hành 10 năm" },
  { name: "Răng sứ Nacera", warranty: "Bảo hành 10 năm" },
  { name: "Răng sứ Cercon", warranty: "Bảo hành 7 năm" },
  { name: "Răng sứ Zirconia", warranty: "Bảo hành 7 năm" },
  { name: "Răng sứ Ceramill", warranty: "Bảo hành 5 năm" },
  { name: "Răng sứ thường", warranty: "Bảo hành 3 năm" },
];

export default async function TraCuuPage({
  searchParams,
}: {
  searchParams: { code?: string };
}) {
  const code = searchParams.code?.trim();
  const result = code ? await lookupWarranty(code) : null;

  return (
    <>
      {/* HERO */}
      <section className="bg-hero-ink px-6 py-20 text-white">
        <div className="mx-auto max-w-container">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            <div>
              <h1 className="text-4xl font-bold leading-tight md:text-[44px]">
                Tra cứu <span className="text-brand">Thẻ Bảo hành</span>
              </h1>
              <p className="mt-5 max-w-lg text-lg leading-relaxed text-white/80">
                Kiểm tra thông tin bảo hành sản phẩm răng sứ chính hãng. Mỗi sản
                phẩm đều có mã bảo hành riêng biệt, đảm bảo quyền lợi cho khách
                hàng.
              </p>
              <div className="mt-8 flex flex-wrap gap-8">
                {HERO_STATS.map((s) => (
                  <div key={s.label}>
                    <div className="text-[40px] font-bold leading-none text-brand">
                      {s.value}
                    </div>
                    <div className="mt-1 text-sm text-white/60">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-white/15 bg-white/10 p-8 backdrop-blur">
              <div className="mb-5 flex aspect-[16/10] items-center justify-center rounded-2xl bg-gradient-to-br from-brand/30 to-white/5">
                <ShieldCheck className="h-20 w-20 text-white/70" />
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand">
                  <ShieldCheck className="h-6 w-6 text-brand-foreground" />
                </div>
                <div>
                  <div className="text-[15px] font-semibold">
                    Thẻ bảo hành chính hãng
                  </div>
                  <div className="text-[13px] text-white/60">
                    Mã QR xác thực sản phẩm
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SEARCH + RESULT */}
      <section className="bg-surface px-6 py-16">
        <div className="mx-auto max-w-2xl">
          <LookupForm initialCode={code} autoFocus />

          <div className="mt-8">
            {result?.success && result.data ? (
              <WarrantyResult data={result.data} />
            ) : result && !result.success ? (
              <div className="flex animate-fade-up items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/10 px-5 py-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive text-destructive-foreground">
                  <X className="h-5 w-5" />
                </span>
                <div>
                  <div className="font-semibold text-destructive">
                    Không tra cứu được
                  </div>
                  <div className="mt-0.5 text-sm text-destructive/80">
                    {errorMessage(result.error)}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {/* CHÍNH SÁCH BẢO HÀNH */}
      <section className="bg-background px-6 py-20">
        <div className="mx-auto max-w-container">
          <div className="mb-14 text-center">
            <h2 className="text-3xl font-bold">Chính sách bảo hành</h2>
            <p className="mt-3 text-[17px] text-muted-foreground">
              Cam kết chất lượng và quyền lợi khách hàng
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {POLICIES.map((p) => (
              <div
                key={p.title}
                className="rounded-2xl border border-border bg-surface p-8 text-center"
              >
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-soft text-brand">
                  <p.icon className="h-7 w-7" />
                </div>
                <h3 className="mb-3 text-lg font-semibold">{p.title}</h3>
                <p className="text-[15px] leading-relaxed text-muted-foreground">
                  {p.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SẢN PHẨM ĐƯỢC BẢO HÀNH */}
      <section className="bg-surface px-6 py-20">
        <div className="mx-auto max-w-container">
          <div className="mb-14 text-center">
            <h2 className="text-3xl font-bold">Sản phẩm được bảo hành</h2>
            <p className="mt-3 text-[17px] text-muted-foreground">
              Tất cả dòng răng sứ cao cấp của {`Labo Hoàng Phúc`}
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {PRODUCTS.map((pr) => (
              <div
                key={pr.name}
                className="rounded-2xl border border-border bg-background p-6 text-center"
              >
                <div className="mb-1 font-semibold">{pr.name}</div>
                <div className="text-sm text-brand">{pr.warranty}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
