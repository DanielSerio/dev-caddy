import type { Meta, StoryObj } from "@storybook/react";
import { AnnotationBadge } from "../src/ui/Core/components/composite/AnnotationBadge";
import type { Annotation } from "../src/types/annotations";
import { ANNOTATION_STATUS } from "../src/types/annotations";

const meta = {
  title: "Core/Composite/AnnotationBadge",
  component: AnnotationBadge,
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
      description: "The annotation to display badges for",
    },
    showPage: {
      control: "boolean",
      description: "Show page badge",
    },
    showStatus: {
      control: "boolean",
      description: "Show status badge",
    },
    showFullPath: {
      control: "boolean",
      description: "Show full page path instead of 'Current Page'",
    },
  },
} satisfies Meta<typeof AnnotationBadge>;

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
  content: "This needs fixing",
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
 * Both page and status badges (default)
 */
export const BothBadges: Story = {
  args: {
    annotation: currentPageAnnotation,
    showPage: true,
    showStatus: true,
  },
};

/**
 * Only page badge
 */
export const PageOnly: Story = {
  args: {
    annotation: currentPageAnnotation,
    showPage: true,
    showStatus: false,
  },
};

/**
 * Only status badge
 */
export const StatusOnly: Story = {
  args: {
    annotation: currentPageAnnotation,
    showPage: false,
    showStatus: true,
  },
};

/**
 * Page badge with full path
 */
export const FullPath: Story = {
  args: {
    annotation: otherPageAnnotation,
    showPage: true,
    showStatus: true,
    showFullPath: true,
  },
};

/**
 * Other page with different status
 */
export const OtherPage: Story = {
  args: {
    annotation: otherPageAnnotation,
    showPage: true,
    showStatus: true,
  },
};

/**
 * All status variations
 */
export const AllStatuses: Story = {
  args: {
    annotation: currentPageAnnotation,
    showStatus: true,
    showPage: false,
  },
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <AnnotationBadge
        annotation={{ ...currentPageAnnotation, status_id: ANNOTATION_STATUS.NEW }}
        showStatus
        showPage={false}
      />
      <AnnotationBadge
        annotation={{ ...currentPageAnnotation, status_id: ANNOTATION_STATUS.IN_PROGRESS }}
        showStatus
        showPage={false}
      />
      <AnnotationBadge
        annotation={{ ...currentPageAnnotation, status_id: ANNOTATION_STATUS.IN_REVIEW }}
        showStatus
        showPage={false}
      />
      <AnnotationBadge
        annotation={{ ...currentPageAnnotation, status_id: ANNOTATION_STATUS.HOLD }}
        showStatus
        showPage={false}
      />
      <AnnotationBadge
        annotation={{ ...currentPageAnnotation, status_id: ANNOTATION_STATUS.RESOLVED }}
        showStatus
        showPage={false}
      />
    </div>
  ),
};

/**
 * Null case (nothing shown)
 */
export const NothingShown: Story = {
  args: {
    annotation: currentPageAnnotation,
    showPage: false,
    showStatus: false,
  },
};
