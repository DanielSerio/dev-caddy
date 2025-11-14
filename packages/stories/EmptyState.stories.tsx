import type { Meta, StoryObj } from "@storybook/react";
import { EmptyState } from "../src/ui/Core/components/display/EmptyState";

const meta = {
  title: "Core/Display/EmptyState",
  component: EmptyState,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    message: {
      control: "text",
      description: "Message to display",
    },
    icon: {
      description: "Optional icon or element to display above message",
    },
    className: {
      control: "text",
      description: "Additional CSS class name",
    },
  },
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default empty state with just a message
 */
export const Default: Story = {
  args: {
    message: "No annotations yet.",
  },
};

/**
 * Empty state for filtered results
 */
export const NoResults: Story = {
  args: {
    message: "No annotations match the current filters.",
  },
};

/**
 * Empty state for new project
 */
export const NewProject: Story = {
  args: {
    message:
      'No annotations in this project yet. Click "Add Annotation" to create the first one.',
  },
};

/**
 * Empty state with custom icon (using emoji as example)
 */
export const WithIcon: Story = {
  args: {
    message: "No annotations found.",
    icon: <span style={{ fontSize: "48px" }}>📝</span>,
  },
};

/**
 * Empty state with custom className
 */
export const WithCustomClass: Story = {
  args: {
    message: "Nothing to display.",
    className: "custom-empty-state",
  },
};

/**
 * Various empty state messages
 */
export const AllVariations: Story = {
  args: {
    message: "No annotations yet.",
  },
  render: () => (
    <div
      style={{
        display: "flex",
        gap: "24px",
        flexDirection: "column",
        width: "400px",
      }}
    >
      <EmptyState message="No annotations yet." />
      <EmptyState message="No annotations match the current filters." />
      <EmptyState
        message="No results found."
        icon={<span style={{ fontSize: "32px" }}>🔍</span>}
      />
    </div>
  ),
};
