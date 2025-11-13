import type { Meta, StoryObj } from "@storybook/react";
import { AnnotationMeta } from "../src/ui/Core/components/composite/AnnotationMeta";
import type { Annotation } from "../src/types/annotations";
import { ANNOTATION_STATUS } from "../src/ui/Core/lib/annotation/constants";

const meta = {
  title: "Core/Composite/AnnotationMeta",
  component: AnnotationMeta,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="dev-caddy" style={{ padding: "20px", background: "#1a1a1a" }}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    annotation: {
      description: "The annotation to display metadata for",
    },
    showUpdated: {
      control: "boolean",
      description: "Show updated_at instead of created_at",
    },
  },
} satisfies Meta<typeof AnnotationMeta>;

export default meta;
type Story = StoryObj<typeof meta>;

// Create dates with clear difference
const createdDate = new Date("2025-01-10T10:30:00Z").toISOString();
const updatedDate = new Date("2025-01-13T14:45:00Z").toISOString();

// Mock annotation
const mockAnnotation: Annotation = {
  id: "1",
  project_id: "project-1",
  page: "/dashboard",
  element_tag: "button",
  element_id: "submit-btn",
  element_test_id: "submit-button",
  element_role: "button",
  element_text: "Submit",
  x_position: 100,
  y_position: 200,
  content: "This needs fixing",
  author: "john.doe@example.com",
  status_id: ANNOTATION_STATUS.NEW,
  created_at: createdDate,
  updated_at: updatedDate,
};

/**
 * Default metadata showing created date
 */
export const Default: Story = {
  args: {
    annotation: mockAnnotation,
  },
};

/**
 * Metadata showing updated date
 */
export const ShowUpdated: Story = {
  args: {
    annotation: mockAnnotation,
    showUpdated: true,
  },
};

/**
 * Metadata with long author email
 */
export const LongEmail: Story = {
  args: {
    annotation: {
      ...mockAnnotation,
      author: "very.long.email.address@company-domain.com",
    },
  },
};

/**
 * Metadata with short author name
 */
export const ShortName: Story = {
  args: {
    annotation: {
      ...mockAnnotation,
      author: "Dev",
    },
  },
};

/**
 * Side-by-side comparison of created vs updated
 */
export const Comparison: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div>
        <p style={{ fontSize: "11px", color: "#888", marginBottom: "8px" }}>Created Date:</p>
        <AnnotationMeta annotation={mockAnnotation} showUpdated={false} />
      </div>
      <div>
        <p style={{ fontSize: "11px", color: "#888", marginBottom: "8px" }}>Updated Date:</p>
        <AnnotationMeta annotation={mockAnnotation} showUpdated={true} />
      </div>
    </div>
  ),
};
