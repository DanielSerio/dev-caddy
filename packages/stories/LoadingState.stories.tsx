import type { Meta, StoryObj } from "@storybook/react";
import { LoadingState } from "../src/ui/Core/components/composite/LoadingState";

const meta = {
  title: "Core/Composite/LoadingState",
  component: LoadingState,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="dev-caddy" style={{ padding: "20px", background: "#1a1a1a" }}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    message: {
      control: "text",
      description: "Loading message to display",
    },
    size: {
      control: "select",
      options: ["small", "medium", "large"],
      description: "Size of the loading indicator",
    },
  },
} satisfies Meta<typeof LoadingState>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default loading state
 */
export const Default: Story = {
  args: {
    message: "Loading...",
    size: "medium",
  },
};

/**
 * Small loading state
 */
export const Small: Story = {
  args: {
    message: "Loading...",
    size: "small",
  },
};

/**
 * Large loading state
 */
export const Large: Story = {
  args: {
    message: "Loading...",
    size: "large",
  },
};

/**
 * Custom loading message
 */
export const CustomMessage: Story = {
  args: {
    message: "Loading annotations...",
    size: "medium",
  },
};

/**
 * Saving state
 */
export const Saving: Story = {
  args: {
    message: "Saving annotation...",
    size: "small",
  },
};

/**
 * Loading without message
 */
export const NoMessage: Story = {
  args: {
    message: undefined,
    size: "medium",
  },
};

/**
 * All sizes comparison
 */
export const AllSizes: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div>
        <p style={{ fontSize: "11px", color: "#888", marginBottom: "8px" }}>Small:</p>
        <LoadingState message="Loading..." size="small" />
      </div>
      <div>
        <p style={{ fontSize: "11px", color: "#888", marginBottom: "8px" }}>Medium:</p>
        <LoadingState message="Loading..." size="medium" />
      </div>
      <div>
        <p style={{ fontSize: "11px", color: "#888", marginBottom: "8px" }}>Large:</p>
        <LoadingState message="Loading..." size="large" />
      </div>
    </div>
  ),
};

/**
 * In a container (like annotation list)
 */
export const InContainer: Story = {
  render: () => (
    <div
      style={{
        border: "1px solid #333",
        borderRadius: "4px",
        padding: "16px",
        minHeight: "200px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <LoadingState message="Loading annotations..." />
    </div>
  ),
};
