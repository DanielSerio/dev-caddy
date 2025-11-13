import type { Preview } from "@storybook/react-vite";
import React from "react";
import "../src/ui/Core/styles/output/dev-caddy.scss";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="dev-caddy" data-dev-caddy>
        <Story />
      </div>
    ),
  ],
};

export default preview;
