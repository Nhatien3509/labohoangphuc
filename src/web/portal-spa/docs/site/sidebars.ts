import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

const sidebars: SidebarsConfig = {
  docsSidebar: [
    {
      type: "category",
      label: "Getting Started",
      items: [
        "index",
        "getting-started/index",
        "getting-started/setup",
        "getting-started/environment-variables",
        "getting-started/onboarding",
        "getting-started/first-task",
      ],
      collapsed: false,
    },
    {
      type: "category",
      label: "Build Features",
      items: [
        {
          type: "category",
          label: "Architecture",
          items: [
            "architecture/overview",
            "architecture/module-anatomy",
            "architecture/common-layer",
            "architecture/migration-status",
          ],
        },
        {
          type: "category",
          label: "Handbook",
          items: [
            "handbook/overview",
            "handbook/vision-and-standards",
            "handbook/references",
            "handbook/how-to-find-code",
            "handbook/component-usage",
            "handbook/philosophy",
            "handbook/global-impact-modules",
          ],
        },
        {
          type: "category",
          label: "Guidelines",
          items: [
            "guidelines/coding-standards",
            "guidelines/lint-and-quality",
            "guidelines/common-patterns",
            "guidelines/api-integration",
            "guidelines/form-and-validation",
            "guidelines/state-management",
            "guidelines/ui-components",
            "guidelines/icons",
            "guidelines/module-playbook",
          ],
        },
      ],
      collapsed: false,
    },
    {
      type: "category",
      label: "Operate & Contribute",
      items: [
        {
          type: "category",
          label: "Workflow",
          items: [
            "workflow/git-flow",
            "workflow/code-review",
            "workflow/ci-cd",
            "workflow/testing",
          ],
        },
        {
          type: "category",
          label: "Delivery",
          items: [
            "delivery/planning-and-tracking",
            "delivery/communication",
            "delivery/partner-delivery",
          ],
        },
        {
          type: "category",
          label: "ADR",
          items: ["adr/template", "adr/feature-slice-layout"],
        },
        {
          type: "category",
          label: "Engineering",
          items: ["contributing/agent-skills"],
        },
      ],
      collapsed: false,
    },
  ],
};

export default sidebars;
