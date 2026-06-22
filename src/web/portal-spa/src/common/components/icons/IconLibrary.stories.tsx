import * as AllIcons from "./index";
import type { Meta, StoryObj } from "@storybook/nextjs";
import { useMemo, useState } from "react";

/* ───────── helpers ───────── */

// Icon names that are NOT visual icons (utility exports)
const EXCLUDED = new Set(["ServiceIconsMap", "BaseIcon"]);

type IconEntry = {
  name: string;
  Component: React.FC<{ size?: number; className?: string }>;
};

const iconEntries: IconEntry[] = Object.entries(AllIcons)
  .filter(([name]) => !EXCLUDED.has(name))
  .map(([name, Component]) => ({
    name,
    Component: Component as IconEntry["Component"],
  }))
  .sort((a, b) => a.name.localeCompare(b.name));

/* ───────── Catalog component ───────── */

function IconCatalog({
  size,
  color,
  columns,
}: Readonly<{
  size: number;
  color: string;
  columns: number;
}>) {
  const [search, setSearch] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!search) return iconEntries;
    const q = search.toLowerCase();
    return iconEntries.filter((e) => e.name.toLowerCase().includes(q));
  }, [search]);

  const handleCopy = (name: string) => {
    const importCode = `import { ${name} } from "@common/components/icons";`;
    void navigator.clipboard.writeText(importCode);
    setCopied(name);
    setTimeout(() => {
      setCopied(null);
    }, 1500);
  };

  return (
    <div style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
      {/* search bar */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          background: "var(--sb-bg, #fff)",
          padding: "12px 0 16px",
          borderBottom: "1px solid #e5e7eb",
          marginBottom: 16,
        }}
      >
        <input
          type="text"
          placeholder={`🔍  Tìm icon… (${filtered.length} / ${iconEntries.length})`}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
          }}
          style={{
            width: "100%",
            maxWidth: 480,
            padding: "10px 16px",
            fontSize: 14,
            border: "1px solid #d1d5db",
            borderRadius: 8,
            outline: "none",
            boxSizing: "border-box",
          }}
        />
      </div>

      {/* grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap: 12,
        }}
      >
        {filtered.map(({ name, Component }) => (
          <button
            key={name}
            type="button"
            onClick={() => {
              handleCopy(name);
            }}
            title={`Click to copy import for ${name}`}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              padding: "16px 8px",
              border: "1px solid #e5e7eb",
              borderRadius: 10,
              background: copied === name ? "#ecfdf5" : "#fafafa",
              cursor: "pointer",
              transition: "all 0.15s ease",
              position: "relative",
              minHeight: 100,
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "#6366f1";
              (e.currentTarget as HTMLElement).style.boxShadow =
                "0 2px 8px rgba(99,102,241,0.15)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "#e5e7eb";
              (e.currentTarget as HTMLElement).style.boxShadow = "none";
            }}
          >
            <div style={{ color, lineHeight: 0 }}>
              <Component size={size} />
            </div>
            <span
              style={{
                fontSize: 11,
                color: "#6b7280",
                textAlign: "center",
                lineHeight: 1.3,
                wordBreak: "break-word",
                maxWidth: "100%",
              }}
            >
              {copied === name ? "✅ Copied!" : name}
            </span>
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <p style={{ textAlign: "center", color: "#9ca3af", marginTop: 40 }}>
          Không tìm thấy icon nào khớp với &ldquo;{search}&rdquo;
        </p>
      )}
    </div>
  );
}

/* ───────── Storybook meta ───────── */

const meta: Meta<typeof IconCatalog> = {
  title: "Foundation/Icon Library",
  component: IconCatalog,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: [
          `### 📦  Icon Library — ${iconEntries.length} icons`,
          "",
          "Tất cả custom SVG icons trong hệ thống Cloud Console.",
          "",
          "- **Click** vào bất kỳ icon nào để copy import statement.",
          "- Dùng thanh tìm kiếm để filter nhanh.",
          "- Điều chỉnh `size`, `color`, `columns` qua Controls panel.",
          "",
          "```tsx",
          'import { Settings, Delete, Plus } from "@common/components/icons";',
          "```",
        ].join("\n"),
      },
    },
  },
  argTypes: {
    size: {
      control: { type: "range", min: 12, max: 64, step: 4 },
      description: "Kích thước icon (px)",
    },
    color: {
      control: "color",
      description: "Màu icon (currentColor)",
    },
    columns: {
      control: { type: "range", min: 3, max: 12, step: 1 },
      description: "Số cột hiển thị",
    },
  },
};

export default meta;
type Story = StoryObj<typeof IconCatalog>;

export const Gallery: Story = {
  args: {
    size: 24,
    color: "#1f2937",
    columns: 6,
  },
};

export const Large: Story = {
  args: {
    size: 48,
    color: "#4f46e5",
    columns: 5,
  },
  parameters: {
    docs: {
      description: {
        story: "Preview kích thước lớn (48px) với màu Indigo.",
      },
    },
  },
};

export const Small: Story = {
  args: {
    size: 16,
    color: "#6b7280",
    columns: 8,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Preview kích thước nhỏ (16px) — kích thước thường dùng trong bảng & button.",
      },
    },
  },
};
