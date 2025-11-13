import type { Meta, StoryObj } from "@storybook/react";
import { ElementCode } from "../src/ui/Core/components/display/ElementCode";
import type { Annotation } from "../src/types/annotations";

// Mock annotation with all element attributes
const fullAnnotation: Annotation = {
  id: "1",
  content: "Test annotation",
  page: "/dashboard",
  element_tag: "button",
  element_id: "submit-btn",
  element_unique_classes: "btn-primary",
  element_role: "button",
  element_test_id: "submit-button",
  status_id: 1,
  created_by: "user-123",
  created_by_email: "user@example.com",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  resolved_at: null,
  project_id: "project-1",
};

// Mock annotation with minimal attributes
const minimalAnnotation: Annotation = {
  ...fullAnnotation,
  id: "2",
  element_id: "",
  element_role: "",
  element_test_id: "",
};

// Mock annotation with just tag and id
const tagAndIdAnnotation: Annotation = {
  ...fullAnnotation,
  id: "3",
  element_role: "",
  element_test_id: "",
};

const meta = {
  title: "Core/Display/ElementCode",
  component: ElementCode,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    annotation: {
      description: "The annotation containing element information",
    },
    className: {
      control: "text",
      description: "Additional CSS class name",
    },
  },
} satisfies Meta<typeof ElementCode>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Element code with all attributes (tag, id, test-id, role)
 */
export const AllAttributes: Story = {
  args: {
    annotation: fullAnnotation,
  },
};

/**
 * Element code with minimal attributes (just tag)
 */
export const MinimalAttributes: Story = {
  args: {
    annotation: minimalAnnotation,
  },
};

/**
 * Element code with tag and id only
 */
export const TagAndId: Story = {
  args: {
    annotation: tagAndIdAnnotation,
  },
};

/**
 * Element code with custom className
 */
export const WithCustomClass: Story = {
  args: {
    annotation: fullAnnotation,
    className: "custom-element-code",
  },
};

/**
 * Various element code examples
 */
export const AllVariations: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "16px", flexDirection: "column", width: "400px" }}>
      <div>
        <strong>All Attributes:</strong>
        <ElementCode annotation={fullAnnotation} />
      </div>
      <div>
        <strong>Tag Only:</strong>
        <ElementCode annotation={minimalAnnotation} />
      </div>
      <div>
        <strong>Tag + ID:</strong>
        <ElementCode annotation={tagAndIdAnnotation} />
      </div>
    </div>
  ),
};
