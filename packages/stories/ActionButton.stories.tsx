import type { Meta, StoryObj } from "@storybook/react";
import { ActionButton } from "../src/ui/Core/components/button/ActionButton";

const meta = {
  title: "Core/Button/ActionButton",
  component: ActionButton,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "secondary", "danger"],
      description: "Button variant/style",
    },
    loading: {
      control: "boolean",
      description: "Loading state",
    },
    disabled: {
      control: "boolean",
      description: "Disabled state",
    },
    onClick: {
      action: "clicked",
      description: "Click handler",
    },
  },
} satisfies Meta<typeof ActionButton>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Primary action button (Save, Submit, etc.)
 */
export const Primary: Story = {
  args: {
    variant: "primary",
    children: "Save",
  },
};

/**
 * Secondary action button (Cancel, Back, etc.)
 */
export const Secondary: Story = {
  args: {
    variant: "secondary",
    children: "Cancel",
  },
};

/**
 * Danger action button (Delete, Remove, etc.)
 */
export const Danger: Story = {
  args: {
    variant: "danger",
    children: "Delete",
  },
};

/**
 * Button with loading state
 */
export const Loading: Story = {
  args: {
    variant: "primary",
    loading: true,
    children: "Saving...",
  },
};

/**
 * Disabled button
 */
export const Disabled: Story = {
  args: {
    variant: "primary",
    disabled: true,
    children: "Submit",
  },
};

/**
 * Button with icon (using emoji as example)
 */
export const WithIcon: Story = {
  args: {
    variant: "primary",
    icon: "✓",
    children: "Save",
  },
};

/**
 * All variants displayed together
 */
export const AllVariants: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "12px", flexDirection: "column", alignItems: "flex-start" }}>
      <div>
        <strong>Primary:</strong>
        <br />
        <ActionButton variant="primary" onClick={() => console.log("Primary clicked")}>
          Save
        </ActionButton>
      </div>
      <div>
        <strong>Secondary:</strong>
        <br />
        <ActionButton variant="secondary" onClick={() => console.log("Secondary clicked")}>
          Cancel
        </ActionButton>
      </div>
      <div>
        <strong>Danger:</strong>
        <br />
        <ActionButton variant="danger" onClick={() => console.log("Danger clicked")}>
          Delete
        </ActionButton>
      </div>
      <div>
        <strong>Loading:</strong>
        <br />
        <ActionButton variant="primary" loading={true}>
          Saving...
        </ActionButton>
      </div>
      <div>
        <strong>Disabled:</strong>
        <br />
        <ActionButton variant="primary" disabled={true}>
          Submit
        </ActionButton>
      </div>
    </div>
  ),
};

/**
 * Common action button combinations
 */
export const CommonCombinations: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "24px", flexDirection: "column" }}>
      <div>
        <strong>Save/Cancel:</strong>
        <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
          <ActionButton variant="primary">Save</ActionButton>
          <ActionButton variant="secondary">Cancel</ActionButton>
        </div>
      </div>
      <div>
        <strong>Edit/Delete:</strong>
        <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
          <ActionButton variant="primary">Edit</ActionButton>
          <ActionButton variant="danger">Delete</ActionButton>
        </div>
      </div>
      <div>
        <strong>Submit/Reset:</strong>
        <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
          <ActionButton variant="primary">Submit</ActionButton>
          <ActionButton variant="secondary">Reset</ActionButton>
        </div>
      </div>
    </div>
  ),
};
