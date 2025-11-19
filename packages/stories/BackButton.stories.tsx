import type { Meta, StoryObj } from "@storybook/react";
import { BackButton } from "../src/ui/Core/components/button/BackButton";
import { ComponentProps } from "react";

const meta = {
  title: "Core/Button/BackButton",
  component: BackButton,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    onClick: {
      description: "Click handler for back navigation",
      action: "clicked",
    },
    label: {
      control: "text",
      description: "Custom label text",
    },
    className: {
      control: "text",
      description: "Additional CSS class name",
    },
  },
} satisfies Meta<typeof BackButton>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default back button with "← Back" label
 */
export const Default: Story = {
  args: {
    onClick: () => console.log("Back clicked"),
  },
};

/**
 * Back button with custom label
 */
export const CustomLabel: Story = {
  args: {
    onClick: () => console.log("Back clicked"),
    label: "← Return to List",
  },
};

/**
 * Back button with longer label
 */
export const LongerLabel: Story = {
  args: {
    onClick: () => console.log("Back clicked"),
    label: "← Back to All Annotations",
  },
};

/**
 * Back button with custom className
 */
export const WithCustomClass: Story = {
  args: {
    onClick: () => console.log("Back clicked"),
    className: "custom-back-button",
  },
};

/**
 * Interactive back button demo
 */
export const Interactive: Story = {
  args: {} as ComponentProps<typeof BackButton>,
  render: () => {
    const handleClick = () => {
      alert("Navigating back...");
    };

    return (
      <div
        style={{
          display: "flex",
          gap: "16px",
          flexDirection: "column",
          alignItems: "flex-start",
        }}
      >
        <div>
          <strong>Default:</strong>
          <br />
          <BackButton onClick={handleClick} />
        </div>
        <div>
          <strong>Custom Label:</strong>
          <br />
          <BackButton onClick={handleClick} label="← Return to Dashboard" />
        </div>
        <div>
          <strong>In Header Context:</strong>
          <br />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              padding: "12px",
              borderBottom: "1px solid #ccc",
            }}
          >
            <BackButton onClick={handleClick} />
            <h3 style={{ margin: 0 }}>Annotation Details</h3>
          </div>
        </div>
      </div>
    );
  },
};
