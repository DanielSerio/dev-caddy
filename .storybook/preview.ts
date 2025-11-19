import type { Preview } from "@storybook/react";
import '../packages/src/ui/Core/styles/output/dev-caddy.scss';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
