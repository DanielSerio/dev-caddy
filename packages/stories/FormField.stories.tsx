import type { Meta, StoryObj } from "@storybook/react";
import { FormField } from "../src/ui/Core/components/form/FormField";

const meta = {
  title: "Core/Form/FormField",
  component: FormField,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    label: {
      control: "text",
      description: "Label text for the field",
    },
    htmlFor: {
      control: "text",
      description: "ID of the form control",
    },
    error: {
      control: "text",
      description: "Error message to display",
    },
    required: {
      control: "boolean",
      description: "Whether the field is required",
    },
    className: {
      control: "text",
      description: "Additional CSS class name",
    },
  },
} satisfies Meta<typeof FormField>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Form field with text input
 */
export const WithTextInput: Story = {
  args: {
    label: "Email Address",
    htmlFor: "email",
    children: <input id="email" type="email" placeholder="you@example.com" />,
  },
};

/**
 * Form field with textarea
 */
export const WithTextArea: Story = {
  args: {
    label: "Comments",
    htmlFor: "comments",
    children: <textarea id="comments" placeholder="Enter your comments..." rows={4} />,
  },
};

/**
 * Required field
 */
export const Required: Story = {
  args: {
    label: "Username",
    htmlFor: "username",
    required: true,
    children: <input id="username" type="text" />,
  },
};

/**
 * Field with error
 */
export const WithError: Story = {
  args: {
    label: "Password",
    htmlFor: "password",
    error: "Password must be at least 8 characters",
    children: <input id="password" type="password" />,
  },
};

/**
 * Required field with error
 */
export const RequiredWithError: Story = {
  args: {
    label: "Email",
    htmlFor: "email-error",
    required: true,
    error: "Please enter a valid email address",
    children: <input id="email-error" type="email" />,
  },
};

/**
 * Complete form example
 */
export const FormExample: Story = {
  render: () => (
    <div style={{ width: "300px", display: "flex", flexDirection: "column", gap: "16px" }}>
      <FormField label="Email Address" htmlFor="form-email" required>
        <input id="form-email" type="email" placeholder="you@example.com" />
      </FormField>
      <FormField label="Name" htmlFor="form-name">
        <input id="form-name" type="text" placeholder="Your name" />
      </FormField>
      <FormField
        label="Message"
        htmlFor="form-message"
        required
        error="Message is required"
      >
        <textarea id="form-message" placeholder="Your message..." rows={4} />
      </FormField>
    </div>
  ),
};
