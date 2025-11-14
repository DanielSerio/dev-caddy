import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { TextArea } from "../src/ui/Core/components/form/TextArea";

const meta = {
  title: "Core/Form/TextArea",
  component: TextArea,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    error: {
      control: "text",
      description: "Error message to display",
    },
    placeholder: {
      control: "text",
      description: "Placeholder text",
    },
    rows: {
      control: "number",
      description: "Number of rows",
    },
    onKeyboardShortcut: {
      description: "Callback for keyboard shortcuts (submit/cancel)",
      action: "keyboard shortcut",
    },
  },
} satisfies Meta<typeof TextArea>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default textarea
 */
export const Default: Story = {
  args: {
    placeholder: "Enter text...",
    rows: 4,
  },
};

/**
 * Textarea with error
 */
export const WithError: Story = {
  args: {
    placeholder: "Enter text...",
    rows: 4,
    error: "This field is required",
  },
};

/**
 * Textarea with keyboard shortcuts
 */
export const WithKeyboardShortcuts: Story = {
  args: {
    placeholder:
      "Press Enter to submit, Esc to cancel, Shift+Enter for new line",
    rows: 4,
    onKeyboardShortcut: (key) => {
      if (key === "submit") alert("Submit!");
      if (key === "cancel") alert("Cancel!");
    },
  },
};

/**
 * Interactive textarea with state
 */
export const Interactive: Story = {
  render: () => {
    const [value, setValue] = useState("");
    const [submitted, setSubmitted] = useState<string | null>(null);

    const handleSubmit = () => {
      if (value.trim()) {
        setSubmitted(value);
        setValue("");
      }
    };

    const handleCancel = () => {
      setValue("");
      setSubmitted(null);
    };

    return (
      <div style={{ width: "400px" }}>
        <TextArea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyboardShortcut={(key) => {
            if (key === "submit") handleSubmit();
            if (key === "cancel") handleCancel();
          }}
          placeholder="Type something and press Enter to submit, Esc to cancel..."
          rows={4}
        />
        <p style={{ marginTop: "8px", fontSize: "12px", color: "#888" }}>
          Press Enter to submit, Shift+Enter for new line, Esc to cancel
        </p>
        {submitted && (
          <div
            style={{
              marginTop: "12px",
              padding: "8px",
              background: "#f0f0f0",
              borderRadius: "4px",
            }}
          >
            <strong>Submitted:</strong> {submitted}
          </div>
        )}
      </div>
    );
  },
};

/**
 * Different sizes
 */
export const Sizes: Story = {
  render: () => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        width: "400px",
      }}
    >
      <div>
        <strong>Small (2 rows):</strong>
        <TextArea placeholder="Small textarea..." rows={2} />
      </div>
      <div>
        <strong>Medium (4 rows):</strong>
        <TextArea placeholder="Medium textarea..." rows={4} />
      </div>
      <div>
        <strong>Large (8 rows):</strong>
        <TextArea placeholder="Large textarea..." rows={8} />
      </div>
    </div>
  ),
};
