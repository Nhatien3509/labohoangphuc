// Hiệu ứng tuyết bay từ dưới lên cho panel xanh (thuần CSS animation).
// Giá trị mỗi hạt tính tất định theo index (Math.sin) để SSR và client khớp nhau,
// tránh lỗi hydration.

const COUNT = 18;

/** Pseudo-random tất định trong [0,1) từ một seed số. */
function rand(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

const FLAKES = Array.from({ length: COUNT }, (_, i) => ({
  left: rand(i + 1) * 100, // % theo chiều ngang
  size: 2 + rand(i + 2) * 5, // 2–7px
  duration: 18 + rand(i + 3) * 14, // 18–32s (bay chậm)
  delay: -rand(i + 4) * 32, // xuất phát lệch pha (âm = đã bay giữa chừng)
  drift: (rand(i + 5) - 0.5) * 90, // dạt ngang -45..45px
  opacity: 0.3 + rand(i + 6) * 0.45, // 0.3–0.75
}));

export function SnowEffect() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {FLAKES.map((f, i) => (
        <span
          key={i}
          className="absolute bottom-[-12px] rounded-full bg-white"
          style={{
            left: `${f.left}%`,
            width: `${f.size}px`,
            height: `${f.size}px`,
            boxShadow: "0 0 6px rgba(255,255,255,0.6)",
            // Biến CSS dùng trong keyframe snow-rise
            ["--drift" as string]: `${f.drift}px`,
            ["--flake-op" as string]: `${f.opacity}`,
            animation: `snow-rise ${f.duration}s linear ${f.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}
