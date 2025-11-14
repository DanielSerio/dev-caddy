import type { Meta, StoryObj } from "@storybook/react";
import { StatusBadge } from "../src/ui/Core/components/badges/StatusBadge";

const meta = {
  title: "Core/Badges/StatusBadge",
  component: StatusBadge,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    statusId: {
      control: "select",
      options: [1, 2, 3],
      description: "Status ID (1 = Open, 2 = In Progress, 3 = Resolved)",
    },
    className: {
      control: "text",
      description: "Additional CSS class name",
    },
  },
} satisfies Meta<typeof StatusBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Open status badge - indicates annotation is newly created
 */
export const Open: Story = {
  args: {
    statusId: 1,
  },
};

/**
 * In Progress status badge - indicates annotation is being worked on
 */
export const InProgress: Story = {
  args: {
    statusId: 2,
  },
};

/**
 * Resolved status badge - indicates annotation has been addressed
 */
export const Resolved: Story = {
  args: {
    statusId: 3,
  },
};

/**
 * Badge with custom className
 */
export const WithCustomClass: Story = {
  args: {
    statusId: 1,
    className: "custom-badge-style",
  },
};

/**
 * All status types displayed together
 */
export const AllStatuses: Story = {
  args: {
    statusId: 2,
  },
  render: () => (
    <div
      style={{
        display: "flex",
        gap: "12px",
        flexDirection: "column",
        alignItems: "flex-start",
      }}
    >
      <div>
        <strong>Open:</strong> <StatusBadge statusId={1} />
      </div>
      <div>
        <strong>In Progress:</strong> <StatusBadge statusId={2} />
      </div>
      <div>
        <strong>Resolved:</strong> <StatusBadge statusId={3} />
      </div>
    </div>
  ),
};
