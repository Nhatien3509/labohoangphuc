"use client";

import Image from "next/image";

import { useState } from "react";

import { SITE } from "@common/lib/core/site";

// Độ nghiêng tối đa (độ) khi con trỏ ở mép logo.
const MAX_TILT = 16;

/**
 * Logo thương hiệu 220×220 nghiêng 3D theo con trỏ — CHỈ khi rê chuột vào logo,
 * rời chuột thì trở về phẳng. Dùng ở panel trái trang đăng nhập (desktop).
 */
export function BrandLogo() {
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5; // -0.5..0.5
    const py = (e.clientY - r.top) / r.height - 0.5; // -0.5..0.5
    setTilt({ rx: -py * MAX_TILT * 2, ry: px * MAX_TILT * 2 });
  }

  return (
    <div
      onMouseMove={onMove}
      onMouseLeave={() => setTilt({ rx: 0, ry: 0 })}
      className="flex h-[220px] w-[220px] items-center justify-center rounded-3xl bg-white p-6 shadow-2xl ring-1 ring-white/30 transition-transform duration-200 ease-out will-change-transform"
      style={{
        transform: `perspective(900px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
      }}
    >
      <Image
        src="/products/labo.jpg"
        alt={SITE.name}
        width={1392}
        height={1130}
        priority
        className="h-full w-full object-contain"
      />
    </div>
  );
}
