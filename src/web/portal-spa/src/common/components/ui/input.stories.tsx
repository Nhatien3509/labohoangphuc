import { Input } from "@common/components/ui/input";

import { Check, Plus } from "@common/components/icons";

import * as React from "react";
import type { Meta, StoryObj } from "@storybook/nextjs";
import { baseMeta } from "@/stories/_base-story-template";
import { getUpdate } from "@/stories/_sb-helpers";

const meta: Meta<typeof Input> = {
  title: "UI/Input",
  component: Input,
  ...baseMeta({
    description:
      "Input (Shadcn + Tailwind). Hỗ trợ icon trái/phải, copy, fullWidth, label/desc, và kiểu number có nút tăng/giảm.",
  }),
  argTypes: {
    type: {
      control: "select",
      options: ["text", "email", "password", "number"],
      description: "Kiểu input",
    },
    disabled: { control: "boolean" },
    readOnly: { control: "boolean" },
    fullWidth: { control: "boolean" },
    showCopyIcon: { control: "boolean" },
    autoComplete: { control: "text" },
    placeholder: { control: "text" },
    value: { control: "text", description: "Giá trị (controlled)" },
    defaultValue: {
      control: "text",
      description: "Giá trị mặc định (uncontrolled)",
    },

    // Non-serializable / function props → tắt control
    leftIcon: { control: false },
    rightIcon: { control: false },
    handleNumberValue: { control: false },
    label: { control: false },
    desc: { control: false },

    // Events
    onChange: { action: "change" },
    onFocus: { action: "focus" },
    onBlur: { action: "blur" },

    // Khác
    className: { control: false },
    name: { control: "text" },
    step: { control: "number" },
    min: { control: "number" },
    max: { control: "number" },
  },
};
export default meta;

type Story = StoryObj<typeof Input>;

// ====== Stories ======

// 1) Uncontrolled text (dùng defaultValue, không sync Controls)
export const UncontrolledText: Story = {
  args: {
    type: "text",
    defaultValue: "Xin chào Storybook!",
    placeholder: "Nhập nội dung...",
    fullWidth: true,
    showCopyIcon: false,
    name: "intro",
    label: "Tiêu đề",
    desc: "Mô tả ngắn cho input (tooltip hiển thị khi tràn).",
  },
};

// 2) Controlled text (sync value ↔️ Controls)
export const ControlledText: Story = {
  args: {
    type: "text",
    value: "Giá trị ban đầu",
    placeholder: "Gõ để thay đổi...",
    leftIcon: <Plus size={16} />,
    rightIcon: <Check size={16} />,
    name: "controlled_text",
  },
  render: (args, ctx) => {
    const update = getUpdate(ctx);
    const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
      update({ value: e.target.value });
      args.onChange?.(e);
    };
    return <Input {...args} onChange={handleChange} />;
  },
};

// 3) Readonly + overflow tooltip demo
export const ReadOnlyOverflow: Story = {
  args: {
    type: "text",
    value:
      "Đây là một giá trị khá dài để bạn thấy tooltip xuất hiện khi tràn nội dung trong ô input (hover để xem).",
    readOnly: true,
    showCopyIcon: false,
    name: "ro_overflow",
    label: "Readonly",
    desc: "Di chuột để xem tooltip full text.",
  },
};

// 4) Number (Controlled) với step/min/max + nút tăng/giảm builtin
export const NumberControlled: Story = {
  args: {
    type: "number",
    value: "58",
    step: 1,
    min: 0,
    max: 100,
    placeholder: "0–100",
    name: "age",
    label: "Tuổi",
    desc: "Dùng nút tăng/giảm hoặc gõ số.",
  },
  render: (args, ctx) => {
    const update = getUpdate(ctx);

    // Khi bấm các nút tăng/giảm, Input sẽ gọi prop "handleNumberValue"
    const handleNumberValue = (next: number) => {
      update({ value: next });
    };

    // Khi gõ tay: sync về Controls
    const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
      const raw = e.target.value;
      const parsed = raw === "" ? "" : Number(raw);
      update({ value: parsed });
      args.onChange?.(e);
    };

    return (
      <Input
        {...args}
        handleNumberValue={handleNumberValue}
        onChange={handleChange}
      />
    );
  },
};

// 5) Number (Uncontrolled) – dùng defaultValue, không cần sync
export const NumberUncontrolled: Story = {
  args: {
    type: "number",
    defaultValue: "24",
    step: 5,
    min: 0,
    max: 50,
    placeholder: "0–50 (bước 5)",
    name: "qty",
    label: "Số lượng",
    desc: "Uncontrolled: dùng defaultValue.",
  },
};

// 6) Disabled / Placeholder
export const Disabled: Story = {
  args: {
    type: "text",
    placeholder: "Không thể nhập",
    disabled: true,
    value: "",
    name: "disabled",
  },
};

// 7) Không full width
export const NotFullWidth: Story = {
  args: {
    type: "text",
    placeholder: "Chiều rộng vừa nội dung",
    fullWidth: false,
    value: "Nội dung",
    name: "nfw",
  },
};
