import Image from "next/image";
import Link from "next/link";

import { SITE } from "@common/lib/core/site";

/** Chân trang công khai (nền tối). */
export function SiteFooter() {
  return (
    <footer className="bg-ink text-white">
      <div className="mx-auto max-w-container px-6 pb-8 pt-16">
        <div className="grid gap-12 md:grid-cols-[2fr_1fr_1fr]">
          <div>
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/products/labo.jpg"
                alt="Labo Hoàng Phúc"
                width={1392}
                height={1130}
                className="h-12 w-auto"
              />
              <span className="text-lg font-bold">{SITE.name}</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm text-white/70">
              {SITE.tagline} — Chuyên cung cấp các sản phẩm răng sứ cao cấp với
              công nghệ CAD/CAM hiện đại.
            </p>
          </div>

          <div>
            <h4 className="mb-5 text-xs font-bold uppercase tracking-wider text-white/50">
              Menu
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/" className="text-white/85 hover:text-white">
                  Trang chủ
                </Link>
              </li>
              <li>
                <Link
                  href="/tra-cuu"
                  className="text-white/85 hover:text-white"
                >
                  Tra cứu bảo hành
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-5 text-xs font-bold uppercase tracking-wider text-white/50">
              Liên hệ
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <a
                  href={`tel:${SITE.phoneRaw}`}
                  className="text-white/85 hover:text-white"
                >
                  Điện thoại: {SITE.phone}
                </a>
              </li>
              <li>
                <a
                  href={`tel:${SITE.hotlineRaw}`}
                  className="text-white/85 hover:text-white"
                >
                  Hotline: {SITE.hotline}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${SITE.email}`}
                  className="text-white/85 hover:text-white"
                >
                  {SITE.email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-8 text-center text-xs text-white/50">
          © {new Date().getFullYear()} {SITE.name}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
