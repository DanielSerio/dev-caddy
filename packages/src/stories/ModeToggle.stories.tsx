import type { Meta, StoryObj } from "@storybook/react";
import { ModeToggle } from "../ui/Core/ModeToggle";
import { useState, type Dispatch, type SetStateAction } from "react";

const meta = {
  title: "Core/ModeToggle",
  component: ModeToggle,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    corner: {
      control: "select",
      options: ["top-left", "top-right", "bottom-right", "bottom-left"],
      description: "Position of the toggle button",
    },
    isActive: {
      control: "boolean",
      description: "Whether DevCaddy window is visible",
    },
    onToggle: {
      action: "toggled",
      description: "Callback when toggle button is clicked",
    },
  },
} satisfies Meta<typeof ModeToggle>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Interactive wrapper to demonstrate toggle functionality
 */
function InteractiveModeToggle({
  corner = "bottom-right",
}: {
  corner?: "top-left" | "top-right" | "bottom-right" | "bottom-left";
}) {
  const [isActive, setIsActive] = useState(false);

  return (
    <div
      style={{
        position: "relative",
        width: "400px",
        height: "300px",
        border: "1px dashed #ccc",
        borderRadius: "8px",
      }}
    >
      <ModeToggle corner={corner} isActive={isActive} onToggle={setIsActive} />
    </div>
  );
}

/**
 * Default state - toggle button with annotation icon (inactive)
 */
export const Inactive: Story = {
  args: {
    corner: "bottom-right",
    isActive: false,
    onToggle: (() => {}) as Dispatch<SetStateAction<boolean>>,
  },
};

/**
 * Active state - toggle button with close icon
 */
export const Active: Story = {
  args: {
    corner: "bottom-right",
    isActive: true,
    onToggle: (() => {}) as Dispatch<SetStateAction<boolean>>,
  },
};

/**
 * Toggle positioned in top-left corner
 */
export const TopLeft: Story = {
  args: {
    corner: "top-left",
    isActive: false,
    onToggle: (() => {}) as Dispatch<SetStateAction<boolean>>,
  },
};

/**
 * Toggle positioned in top-right corner
 */
export const TopRight: Story = {
  args: {
    corner: "top-right",
    isActive: false,
    onToggle: (() => {}) as Dispatch<SetStateAction<boolean>>,
  },
};

/**
 * Toggle positioned in bottom-left corner
 */
export const BottomLeft: Story = {
  args: {
    corner: "bottom-left",
    isActive: false,
    onToggle: (() => {}) as Dispatch<SetStateAction<boolean>>,
  },
};

/**
 * Toggle positioned in bottom-right corner (default)
 */
export const BottomRight: Story = {
  args: {
    corner: "bottom-right",
    isActive: false,
    onToggle: (() => {}) as Dispatch<SetStateAction<boolean>>,
  },
};

/**
 * Interactive demo showing toggle state changes
 */
export const Interactive: Story = {
  args: {
    corner: "bottom-right",
    isActive: false,
    onToggle: (() => {}) as Dispatch<SetStateAction<boolean>>,
  },
  render: () => <InteractiveModeToggle corner="bottom-right" />,
};
