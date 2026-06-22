import "@/styles/globals.css";
import type { Preview } from "@storybook/nextjs";
// import { LayoutStoreProvider } from "../src/stories/mocks/layout-store-mock"; // dùng mock!

const preview: Preview = {
  // decorators: [
  //   (Story) => (
  //     <LayoutStoreProvider>
  //       <Story />
  //     </LayoutStoreProvider>
  //   ),
  // ],
  tags: ["autodocs"],
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
      expanded: true,
    },
    a11y: {},
  },
};

export default preview;
