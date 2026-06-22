import * as React from "react";
import { Checkbox, type CheckboxProps } from "@common/components/ui/checkbox";
import type { Meta, StoryObj } from "@storybook/nextjs";
import { baseMeta } from "@/stories/_base-story-template";
import { getUpdate } from "@/stories/_sb-helpers";

// ====== Default export (meta) ======
const meta: Meta<typeof Checkbox> = {
  title: "UI/Checkbox",
  component: Checkbox,
  ...baseMeta({
    description:
      "Checkbox dựa trên Radix + Tailwind. Hỗ trợ unchecked, checked, indeterminate; size; error; disabled.",
  }),
  argTypes: {
    size: {
      control: "select",
      options: ["sm", "default", "lg"],
      description: "Kích thước của checkbox",
    },
    error: { control: "boolean", description: "Trạng thái lỗi" },
    disabled: { control: "boolean", description: "Vô hiệu hoá" },
    checked: {
      control: "radio",
      options: [false, true, "indeterminate"],
      description:
        "Trạng thái checkbox. Bỏ trống prop này để dùng chế độ uncontrolled (dùng defaultChecked).",
    },
    onCheckedChange: { action: "checkedChange" },
    className: { control: false },
    id: { control: "text" },
    name: { control: "text" },
  },
};
export default meta;

type Story = StoryObj<typeof Checkbox>;

// ====== Helpers ======

type CheckboxLabelRowProps = CheckboxProps & {
  id: string;
  label: React.ReactNode;
};

/**
 * Hàng Checkbox + label text dùng chung cho các story
 */
const CheckboxLabelRow: React.FC<CheckboxLabelRowProps> = ({
  id,
  label,
  ...checkboxProps
}) => (
  <label className="flex items-center gap-2" htmlFor={id}>
    <Checkbox id={id} {...checkboxProps} />
    <span className="cursor-pointer select-none">{label}</span>
  </label>
);

/**
 * Helper tạo render function cho các story controlled (`checked` trong args)
 */
const makeControlledRender =
  (id: string, label: React.ReactNode): Story["render"] =>
  (args, ctx) => {
    const updateArgs = getUpdate(ctx);

    const handleChange = (next: boolean | "indeterminate") => {
      updateArgs({ checked: next });
      args.onCheckedChange?.(next);
    };

    return (
      <CheckboxLabelRow
        id={id}
        label={label}
        {...(args as CheckboxProps)}
        onCheckedChange={handleChange}
      />
    );
  };

// ====== Stories ======

// Uncontrolled: KHÔNG set 'checked' → tự toggle, không sync lại Controls
export const Uncontrolled: Story = {
  args: {
    defaultChecked: false,
    size: "default",
    error: false,
    disabled: false,
  },
  render: (args) => (
    <CheckboxLabelRow
      id="ucb"
      label="Ghi nhớ đăng nhập"
      {...(args as CheckboxProps)}
    />
  ),
};

// Controlled (checked = true)
export const Checked: Story = {
  args: { checked: true, size: "default" },
  render: makeControlledRender("cb-checked", "Đã chọn"),
};

// Controlled (checked = false)
export const Unchecked: Story = {
  args: { checked: false, size: "default" },
  render: makeControlledRender("cb-unchecked", "Chưa chọn"),
};

// Controlled (checked = "indeterminate")
export const Indeterminate: Story = {
  args: { checked: "indeterminate", size: "default" },
  render: makeControlledRender("cb-indeterminate", "Một phần"),
};

// Error + Controlled
export const ErrorState: Story = {
  args: { checked: true, error: true },
  render: makeControlledRender("cb-error", "Lỗi xác nhận"),
};

// Disabled (giá trị không đổi)
export const Disabled: Story = {
  args: { checked: true, disabled: true },
  render: (args) => (
    <div className="opacity-70">
      <CheckboxLabelRow
        id="cb-disabled"
        label="Không khả dụng"
        {...(args as CheckboxProps)}
      />
    </div>
  ),
};

// Showcase nhiều kích thước
export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-6">
      <CheckboxLabelRow id="size-sm" label='size="sm"' size="sm" />
      <CheckboxLabelRow
        id="size-default"
        label='size="default"'
        size="default"
      />
      <CheckboxLabelRow id="size-lg" label='size="lg"' size="lg" />
    </div>
  ),
};
