import { themes as prismThemes } from "prism-react-renderer";
import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";

const config: Config = {
  title: "Cloud Console",
  tagline: "Tài liệu kỹ thuật cho đội phát triển và đối tác",
  favicon: "img/favicon.ico",

  url: "https://cloud-console-docs.internal",
  baseUrl: "/",

  onBrokenLinks: "throw",

  markdown: {
    mermaid: true,
    hooks: {
      onBrokenMarkdownLinks: "throw",
    },
  },

  themes: ["@docusaurus/theme-mermaid"],

  i18n: {
    defaultLocale: "vi",
    locales: ["vi"],
  },

  presets: [
    [
      "classic",
      {
        docs: {
          path: "../content",
          routeBasePath: "/",
          sidebarPath: "./sidebars.ts",
          editUrl: "about:blank",
        },
        blog: false,
        theme: {
          customCss: "./src/css/custom.css",
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    navbar: {
      title: "Cloud Console",
      logo: {
        alt: "Cloud Console",
        src: "img/miniLogo.svg",
        href: "/",
      },
      items: [
        {
          href: "about:blank",
          label: "GitLab",
          position: "right",
        },
      ],
    },
    footer: {
      style: "dark",
      links: [
        {
          title: "Nội dung",
          items: [
            { label: "Trang chủ", to: "/" },
            { label: "Handbook", to: "/handbook/overview" },
            { label: "Getting Started", to: "/getting-started/setup" },
            { label: "Kiến trúc", to: "/architecture/overview" },
            { label: "Guidelines", to: "/guidelines/coding-standards" },
          ],
        },
        {
          title: "Liên kết",
          items: [
            {
              label: "Figma — Components",
              href: "https://www.figma.com/design/7qgfl4khMz7vL4ub7qzg7I/VT-Cloud---Components?node-id=31085-51417",
            },
            {
              label: "Figma — Product",
              href: "https://www.figma.com/design/7qgfl4khMz7vL4ub7qzg7I/VT-Cloud?node-id=36586-83690",
            },
            {
              label: "GitLab Wiki",
              href: "about:blank",
            },
          ],
        },
      ],
      copyright: `© ${new Date().getFullYear()} Cloud Console Team`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ["bash", "json", "tsx"],
    },
    colorMode: {
      defaultMode: "light",
      disableSwitch: false,
      respectPrefersColorScheme: true,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
