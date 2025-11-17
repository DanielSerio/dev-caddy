import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { StatusSelect } from "../src/ui/Core/components/form/StatusSelect";
import { ANNOTATION_STATUS } from "../src/types/annotations";

const meta = {
  title: "Core/Form/StatusSelect",
  component: StatusSelect,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    value: {
      control: "select",
      options: [1, 2, 3, 4, 5],
      description: "Current status ID (1=New, 2=In Progress, 3=In Review, 4=Hold, 5=Resolved)",
    },
    onChange: {
      description: "Callback when status changes",
      action: "status changed",
    },
    disabled: {
      control: "boolean",
      description: "Whether the select is disabled",
    },
    className: {
      control: "text",
      description: "Additional CSS class name",
    },
  },
} satisfies Meta<typeof StatusSelect>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Status select with New status
 */
export const New: Story = {
  args: {
    value: ANNOTATION_STATUS.NEW,
    onChange: (status) => console.log("Status changed to:", status),
  },
};

/**
 * Status select with In Progress status
 */
export const InProgress: Story = {
  args: {
    value: ANNOTATION_STATUS.IN_PROGRESS,
    onChange: (status) => console.log("Status changed to:", status),
  },
};

/**
 * Status select with In Review status
 */
export const InReview: Story = {
  args: {
    value: ANNOTATION_STATUS.IN_REVIEW,
    onChange: (status) => console.log("Status changed to:", status),
  },
};

/**
 * Status select with Hold status
 */
export const Hold: Story = {
  args: {
    value: ANNOTATION_STATUS.HOLD,
    onChange: (status) => console.log("Status changed to:", status),
  },
};

/**
 * Status select with Resolved status
 */
export const Resolved: Story = {
  args: {
    value: ANNOTATION_STATUS.RESOLVED,
    onChange: (status) => console.log("Status changed to:", status),
  },
};

/**
 * Disabled status select
 */
export const Disabled: Story = {
  args: {
    value: ANNOTATION_STATUS.IN_PROGRESS,
    onChange: () => {},
    disabled: true,
  },
};

/**
 * Interactive status select
 */
export const Interactive: Story = {
  args: {
    value: ANNOTATION_STATUS.NEW,
    onChange: () => {},
  },
  render: function RenderInteractive() {
    const [status, setStatus] = useState<number>(ANNOTATION_STATUS.NEW);

    const statusNames = {
      [ANNOTATION_STATUS.NEW]: "New",
      [ANNOTATION_STATUS.IN_PROGRESS]: "In Progress",
      [ANNOTATION_STATUS.IN_REVIEW]: "In Review",
      [ANNOTATION_STATUS.HOLD]: "Hold",
      [ANNOTATION_STATUS.RESOLVED]: "Resolved",
    };

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "16px", alignItems: "flex-start" }}>
        <div>
          <strong>Current Status:</strong> {statusNames[status]}
        </div>
        <StatusSelect value={status} onChange={(newStatus) => setStatus(newStatus)} />
        <div style={{ fontSize: "12px", color: "#888" }}>
          Try changing the status to see the color update
        </div>
      </div>
    );
  },
};

/**
 * All statuses displayed
 */
export const AllStatuses: Story = {
  args: {
    value: ANNOTATION_STATUS.NEW,
    onChange: () => {},
  },
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px", alignItems: "flex-start" }}>
      <div>
        <strong>New:</strong>
        <br />
        <StatusSelect value={ANNOTATION_STATUS.NEW} onChange={() => {}} />
      </div>
      <div>
        <strong>In Progress:</strong>
        <br />
        <StatusSelect value={ANNOTATION_STATUS.IN_PROGRESS} onChange={() => {}} />
      </div>
      <div>
        <strong>In Review:</strong>
        <br />
        <StatusSelect value={ANNOTATION_STATUS.IN_REVIEW} onChange={() => {}} />
      </div>
      <div>
        <strong>Hold:</strong>
        <br />
        <StatusSelect value={ANNOTATION_STATUS.HOLD} onChange={() => {}} />
      </div>
      <div>
        <strong>Resolved:</strong>
        <br />
        <StatusSelect value={ANNOTATION_STATUS.RESOLVED} onChange={() => {}} />
      </div>
    </div>
  ),
};
