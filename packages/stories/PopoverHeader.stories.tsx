import type { Meta, StoryObj } from "@storybook/react";
import { PopoverHeader } from "../src/ui/Core/components/composite/PopoverHeader";

const meta = {
  title: "Core/Composite/PopoverHeader",
  component: PopoverHeader,
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
    title: {
      control: "text",
      description: "Header title text",
    },
    onClose: {
      description: "Callback when close button is clicked",
      action: "close clicked",
    },
  },
} satisfies Meta<typeof PopoverHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Add annotation popover header
 */
export const AddAnnotation: Story = {
  args: {
    title: "Add Annotation",
  },
};

/**
 * Edit annotation popover header
 */
export const EditAnnotation: Story = {
  args: {
    title: "Edit Annotation",
  },
};

/**
 * Short title
 */
export const ShortTitle: Story = {
  args: {
    title: "Edit",
  },
};

/**
 * Long title
 */
export const LongTitle: Story = {
  args: {
    title: "This is a very long title that might need to wrap",
  },
};

/**
 * In a popover container
 */
export const InPopover: Story = {
  render: (args) => (
    <div
      style={{
        border: "1px solid #333",
        borderRadius: "4px",
        background: "#2a2a2a",
        width: "400px",
      }}
    >
      <PopoverHeader {...args} title="Add Annotation" />
      <div style={{ padding: "16px", fontSize: "12px", color: "#ccc" }}>
        <p>This is the popover content area below the header.</p>
        <p style={{ marginTop: "8px" }}>The header provides a title and close button.</p>
      </div>
    </div>
  ),
};

/**
 * Interactive example
 */
export const Interactive: Story = {
  args: {
    title: "Add Annotation",
  },
  render: (args) => (
    <div>
      <p style={{ marginBottom: "16px", fontSize: "12px", color: "#888" }}>
        Click the close button (✕) to see the action in the Actions panel below
      </p>
      <PopoverHeader {...args} />
    </div>
  ),
};
