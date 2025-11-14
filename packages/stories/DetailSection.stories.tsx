import type { Meta, StoryObj } from "@storybook/react";
import { DetailSection } from "../src/ui/Core/components/layout/DetailSection";
import { StatusBadge } from "../src/ui/Core/components/badges/StatusBadge";
import { ElementCode } from "../src/ui/Core/components/display/ElementCode";
import type { Annotation } from "../src/types/annotations";

// Mock annotation
const mockAnnotation: Annotation = {
  id: 1,
  content: "Test annotation",
  page: "/dashboard",
  element_tag: "button",
  compressed_element_tree: "html>body>div>button",
  element_id: "submit-btn",
  element_unique_classes: "btn-primary",
  element_role: "button",
  element_test_id: "submit-button",
  element_parent_selector: "div.form-container",
  element_nth_child: 1,
  status_id: 1,
  created_by: "user-123",
  created_by_email: "user@example.com",
  created_at: new Date().toISOString(),
  updated_by: null,
  updated_at: new Date().toISOString(),
  resolved_at: null,
};

const meta = {
  title: "Core/Layout/DetailSection",
  component: DetailSection,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    label: {
      control: "text",
      description: "Label for the section",
    },
    children: {
      description: "Content to display in the section",
    },
    className: {
      control: "text",
      description: "Additional CSS class name",
    },
  },
} satisfies Meta<typeof DetailSection>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Detail section with text content
 */
export const WithTextContent: Story = {
  args: {
    label: "Author",
    children: <span>john.doe@example.com</span>,
  },
};

/**
 * Detail section with status badge
 */
export const WithStatusBadge: Story = {
  args: {
    label: "Status",
    children: <StatusBadge statusId={1} />,
  },
};

/**
 * Detail section with element code
 */
export const WithElementCode: Story = {
  args: {
    label: "Element",
    children: <ElementCode annotation={mockAnnotation} />,
  },
};

/**
 * Detail section with complex content
 */
export const WithComplexContent: Story = {
  args: {
    label: "Feedback",
    children: (
      <div>
        <p>This is a detailed annotation with multiple paragraphs.</p>
        <p>It can contain complex HTML content.</p>
      </div>
    ),
  },
};

/**
 * Detail section with custom className
 */
export const WithCustomClass: Story = {
  args: {
    label: "Custom Section",
    children: <span>Custom styled content</span>,
    className: "custom-detail-section",
  },
};

/**
 * Multiple detail sections together
 */
export const MultipleSections: Story = {
  args: {
    label: "Custom Section",
    children: <span>Custom styled content</span>,
    className: "custom-detail-section",
  },
  render: () => (
    <div
      style={{
        display: "flex",
        gap: "16px",
        flexDirection: "column",
        width: "400px",
      }}
    >
      <DetailSection label="Element">
        <ElementCode annotation={mockAnnotation} />
      </DetailSection>
      <DetailSection label="Status">
        <StatusBadge statusId={2} />
      </DetailSection>
      <DetailSection label="Author">
        <span>user@example.com</span>
      </DetailSection>
      <DetailSection label="Created">
        <span className="detail-date">2024-01-15 10:30 AM</span>
      </DetailSection>
    </div>
  ),
};
