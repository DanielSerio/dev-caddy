import type { Meta, StoryObj } from "@storybook/react";
import { PageBadge } from "../src/ui/Core/components/badges/PageBadge";
import type { Annotation } from "../src/types/annotations";

// Mock annotation for current page
const currentPageAnnotation: Annotation = {
  id: 1,
  content: "Test annotation",
  page: window.location.pathname,
  element_tag: "button",
  compressed_element_tree: "html>body>div>button",
  element_id: "submit",
  element_unique_classes: "btn-primary",
  element_role: "button",
  element_test_id: "submit-btn",
  element_parent_selector: "div.form",
  element_nth_child: 1,
  status_id: 1,
  created_by: "user-123",
  created_by_email: "user@example.com",
  created_at: new Date().toISOString(),
  updated_by: null,
  updated_at: new Date().toISOString(),
  resolved_at: null,
};

// Mock annotation for another page
const otherPageAnnotation: Annotation = {
  ...currentPageAnnotation,
  id: 2,
  page: "/dashboard",
};

const meta = {
  title: "Core/Badges/PageBadge",
  component: PageBadge,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    annotation: {
      description: "The annotation containing page information",
    },
    className: {
      control: "text",
      description: "Additional CSS class name",
    },
  },
} satisfies Meta<typeof PageBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Badge for annotation on current page - shows "Current Page"
 */
export const CurrentPage: Story = {
  args: {
    annotation: currentPageAnnotation,
  },
};

/**
 * Badge for annotation on another page - shows the page path
 */
export const OtherPage: Story = {
  args: {
    annotation: otherPageAnnotation,
  },
};

/**
 * Current page badge with full path shown
 */
export const CurrentPageWithFullPath: Story = {
  args: {
    annotation: currentPageAnnotation,
  },
};

/**
 * Badge with custom className
 */
export const WithCustomClass: Story = {
  args: {
    annotation: otherPageAnnotation,
    className: "custom-badge-style",
  },
};

/**
 * All page badge variations displayed together
 */
export const AllVariations: Story = {
  args: {
    annotation: currentPageAnnotation,
  },
  render: () => (
    <div
      style={{
        display: "flex",
        gap: "12px",
        flexDirection: "column",
        alignItems: "flex-start",
      }}
    >
      <div>
        <strong>Current Page:</strong>{" "}
        <PageBadge annotation={currentPageAnnotation} />
      </div>
      <div>
        <strong>Other Page:</strong>{" "}
        <PageBadge annotation={otherPageAnnotation} />
      </div>
      <div>
        <strong>Current Page (Full Path):</strong>{" "}
        <PageBadge annotation={currentPageAnnotation} />
      </div>
    </div>
  ),
};
