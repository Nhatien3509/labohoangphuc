import { Check, Delete, Loading, Plus } from "@common/components/icons";
import type { Meta, StoryObj } from "@storybook/nextjs";
import { Button } from "@common/components/ui/button";
import { baseMeta } from "@/stories/_base-story-template";

const meta: Meta<typeof Button> = {
  title: "UI/Button",
  component: Button,
  ...baseMeta({
    description:
      "Button theo Shadcn UI. Hỗ trợ variant, size, shape, và trạng thái loading.",
  }),
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "ghost", "secondary", "tertiary", "text", "icon"],
      description: "Kiểu hiển thị của button",
    },
    size: {
      control: "select",
      options: ["default", "lg"],
      description: "Kích thước của button",
    },
    shape: {
      control: "select",
      options: ["default", "round"],
      description: "Bo góc button",
    },
    leftIcon: { control: false, description: "Icon bên trái (ReactNode)" },
    rightIcon: { control: false, description: "Icon bên phải (ReactNode)" },
    isLoading: { control: "boolean", description: "Trạng thái loading" },
    onClick: { action: "clicked" },
  },
};
export default meta;

type Story = StoryObj<typeof Button>;

export const Default: Story = {
  args: { children: "Primary", variant: "default" },
};

export const Secondary: Story = {
  args: { children: "Secondary", variant: "secondary" },
};

export const Ghost: Story = {
  args: { children: "Ghost", variant: "ghost" },
};

export const WithLeftIcon: Story = {
  args: { children: "Add Item", leftIcon: <Plus /> },
};

export const WithRightIcon: Story = {
  args: { children: "Next Step", rightIcon: <Check /> },
};

export const WithLoading: Story = {
  args: {
    children: "Loading...",
    isLoading: true,
    leftIcon: <Loading className="animate-spin" />,
  },
};

export const IconButton: Story = {
  args: { variant: "icon", leftIcon: <Delete /> },
};

export const LargeRound: Story = {
  args: { children: "Continue", size: "lg", shape: "round" },
};
