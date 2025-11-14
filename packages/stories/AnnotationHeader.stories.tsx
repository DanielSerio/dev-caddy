import type { Meta, StoryObj } from "@storybook/react";
import { AnnotationHeader } from "../src/ui/Core/components/composite/AnnotationHeader";
import type { Annotation } from "../src/types/annotations";
import { ANNOTATION_STATUS } from "../src/types/annotations";

const meta = {
  title: "Core/Composite/AnnotationHeader",
  component: AnnotationHeader,
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
      description: "The annotation to display header for",
    },
    onBack: {
      description: "Callback when back button is clicked",
      action: "back clicked",
    },
    showFullPath: {
      control: "boolean",
      description: "Show full page path instead of 'Current Page'",
    },
  },
} satisfies Meta<typeof AnnotationHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

// Mock annotation for current page
const currentPageAnnotation: Annotation = {
  id: 1,
  page: window.location.pathname,
  element_tag: "button",
  compressed_element_tree: "html>body>div>button",
  element_id: "submit-btn",
  element_test_id: "submit-button",
  element_role: "button",
  element_unique_classes: "btn btn-primary",
  element_parent_selector: "div.form-container",
  element_nth_child: 1,
  content: "This button needs better styling",
  status_id: ANNOTATION_STATUS.NEW,
  created_by: "user-123",
  created_by_email: "john.doe@example.com",
  created_at: new Date().toISOString(),
  updated_by: null,
  updated_at: new Date().toISOString(),
  resolved_at: null,
};

// Mock annotation for other page
const otherPageAnnotation: Annotation = {
  ...currentPageAnnotation,
  id: 2,
  page: "/dashboard",
  status_id: ANNOTATION_STATUS.IN_PROGRESS,
};

/**
 * Header for annotation on current page with "New" status
 */
export const CurrentPageNew: Story = {
  args: {
    annotation: currentPageAnnotation,
    onBack: () => console.log("Back clicked"),
  },
};

/**
 * Header for annotation on different page with "In Progress" status
 */
export const OtherPageInProgress: Story = {
  args: {
    annotation: otherPageAnnotation,
    onBack: () => console.log("Back clicked"),
  },
};

/**
 * Header showing full page path instead of "Current Page"
 */
export const WithFullPath: Story = {
  args: {
    annotation: currentPageAnnotation,
    showFullPath: true,
    onBack: () => console.log("Back clicked"),
  },
};

/**
 * Header with "In Review" status
 */
export const InReview: Story = {
  args: {
    annotation: {
      ...currentPageAnnotation,
      status_id: ANNOTATION_STATUS.IN_REVIEW,
    },
    onBack: () => console.log("Back clicked"),
  },
};

/**
 * Header with "Hold" status
 */
export const OnHold: Story = {
  args: {
    annotation: {
      ...currentPageAnnotation,
      status_id: ANNOTATION_STATUS.HOLD,
    },
    onBack: () => console.log("Back clicked"),
  },
};

/**
 * Header with "Resolved" status
 */
export const Resolved: Story = {
  args: {
    annotation: {
      ...currentPageAnnotation,
      status_id: ANNOTATION_STATUS.RESOLVED,
    },
    onBack: () => console.log("Back clicked"),
  },
};

/**
 * Interactive example showing back button functionality
 */
export const Interactive: Story = {
  args: {
    annotation: currentPageAnnotation,
    onBack: () => alert("Back button clicked!"),
  },
  render: (args) => {
    return (
      <div>
        <p style={{ marginBottom: "16px", fontSize: "12px", color: "#888" }}>
          Click the back button to see the action in the Actions panel below
        </p>
        <AnnotationHeader {...args} />
      </div>
    );
  },
};
