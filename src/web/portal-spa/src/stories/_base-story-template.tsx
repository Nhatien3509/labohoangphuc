import type { Meta } from "@storybook/nextjs";

export type CreateStoryMetaOptions = {
  description?: string;
  controlsExpanded?: boolean;
  actionsRegex?: string;
};

/**
 * Trả về phần cấu hình chung (partial) để ghép vào Meta<typeof Component>.
 * Không ép kiểu trả về Meta<any> để tránh lỗi generic ở SB9.
 */
export function baseMeta({
  description = "Component thuộc hệ thống UI (Shadcn + Tailwind).",
  controlsExpanded = true,
  actionsRegex = "^on[A-Z].*",
}: CreateStoryMetaOptions = {}): Pick<Meta, "tags" | "parameters"> {
  return {
    tags: ["autodocs"],
    parameters: {
      docs: {
        description: { component: description },
      },
      actions: { argTypesRegex: actionsRegex },
      controls: {
        expanded: controlsExpanded,
        matchers: {
          color: /(background|color)$/i,
          date: /Date$/,
        },
      },
    },
  } as const;
}
