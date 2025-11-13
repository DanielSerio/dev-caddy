import type { Meta, StoryObj } from "@storybook/react";
import { ErrorDisplay } from "../src/ui/Core/components/display/ErrorDisplay";

const meta = {
  title: "Core/Display/ErrorDisplay",
  component: ErrorDisplay,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    error: {
      description: "Error object or error message string",
    },
    onRetry: {
      description: "Optional retry callback",
      action: "retry clicked",
    },
    className: {
      control: "text",
      description: "Additional CSS class name",
    },
  },
} satisfies Meta<typeof ErrorDisplay>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Error display with string message
 */
export const WithStringMessage: Story = {
  args: {
    error: "Failed to load annotations.",
  },
};

/**
 * Error display with Error object
 */
export const WithErrorObject: Story = {
  args: {
    error: new Error("Network connection failed"),
  },
};

/**
 * Error display with retry button
 */
export const WithRetryButton: Story = {
  args: {
    error: "Failed to load data.",
    onRetry: () => alert("Retrying..."),
  },
};

/**
 * Error display for network errors
 */
export const NetworkError: Story = {
  args: {
    error: new Error("Unable to connect to server. Please check your internet connection."),
    onRetry: () => console.log("Retrying connection..."),
  },
};

/**
 * Error display with custom className
 */
export const WithCustomClass: Story = {
  args: {
    error: "Something went wrong.",
    className: "custom-error-style",
  },
};

/**
 * Various error display examples
 */
export const AllVariations: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "24px", flexDirection: "column", width: "400px" }}>
      <div>
        <strong>Simple Error:</strong>
        <ErrorDisplay error="Failed to load data." />
      </div>
      <div>
        <strong>With Retry:</strong>
        <ErrorDisplay
          error="Connection failed."
          onRetry={() => console.log("Retry clicked")}
        />
      </div>
      <div>
        <strong>Error Object:</strong>
        <ErrorDisplay error={new Error("Invalid credentials")} />
      </div>
    </div>
  ),
};
