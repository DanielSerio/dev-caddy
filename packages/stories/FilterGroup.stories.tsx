import type { Meta, StoryObj } from "@storybook/react";
import { FilterGroup } from "../src/ui/Core/components/filter/FilterGroup";

const meta = {
  title: "Core/Filter/FilterGroup",
  component: FilterGroup,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    label: {
      control: "text",
      description: "Label for the filter",
    },
    htmlFor: {
      control: "text",
      description: "ID of the filter control",
    },
    className: {
      control: "text",
      description: "Additional CSS class name",
    },
  },
} satisfies Meta<typeof FilterGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Filter group with select dropdown
 */
export const WithSelect: Story = {
  args: {
    label: "Status:",
    htmlFor: "status-filter",
    children: (
      <select id="status-filter">
        <option value="all">All</option>
        <option value="active">Active</option>
        <option value="completed">Completed</option>
      </select>
    ),
  },
};

/**
 * Filter group with text input
 */
export const WithTextInput: Story = {
  args: {
    label: "Search:",
    htmlFor: "search-filter",
    children: <input id="search-filter" type="text" placeholder="Search..." />,
  },
};

/**
 * Filter group with date input
 */
export const WithDateInput: Story = {
  args: {
    label: "Date:",
    htmlFor: "date-filter",
    children: <input id="date-filter" type="date" />,
  },
};

/**
 * Multiple filter groups together
 */
export const MultipleFilters: Story = {
  args: {
    label: "Search:",
    htmlFor: "search-filter",
    children: <input id="search-filter" type="text" placeholder="Search..." />,
  },
  render: () => (
    <div
      style={{
        display: "flex",
        gap: "12px",
        flexDirection: "column",
        width: "300px",
      }}
    >
      <FilterGroup label="Status:" htmlFor="multi-status">
        <select id="multi-status">
          <option value="all">All</option>
          <option value="new">New</option>
          <option value="in-progress">In Progress</option>
          <option value="resolved">Resolved</option>
        </select>
      </FilterGroup>

      <FilterGroup label="Author:" htmlFor="multi-author">
        <input
          id="multi-author"
          type="text"
          placeholder="Filter by author..."
        />
      </FilterGroup>

      <FilterGroup label="Page:" htmlFor="multi-page">
        <select id="multi-page">
          <option value="all">All Pages</option>
          <option value="current">Current Page</option>
          <option value="/dashboard">/dashboard</option>
          <option value="/settings">/settings</option>
        </select>
      </FilterGroup>
    </div>
  ),
};

/**
 * Filter groups in horizontal layout
 */
export const HorizontalLayout: Story = {
  args: {
    label: "Search:",
    htmlFor: "search-filter",
    children: <input id="search-filter" type="text" placeholder="Search..." />,
  },
  render: () => (
    <div style={{ display: "flex", gap: "12px", alignItems: "flex-end" }}>
      <FilterGroup label="Status:" htmlFor="horiz-status">
        <select id="horiz-status">
          <option value="all">All</option>
          <option value="active">Active</option>
        </select>
      </FilterGroup>

      <FilterGroup label="Search:" htmlFor="horiz-search">
        <input id="horiz-search" type="text" placeholder="Search..." />
      </FilterGroup>

      <FilterGroup label="Date:" htmlFor="horiz-date">
        <input id="horiz-date" type="date" />
      </FilterGroup>
    </div>
  ),
};

/**
 * Filter panel example (mimics AnnotationFilters)
 */
export const FilterPanel: Story = {
  args: {
    label: "Search:",
    htmlFor: "search-filter",
    children: <input id="search-filter" type="text" placeholder="Search..." />,
  },
  render: () => (
    <div
      style={{
        padding: "16px",
        background: "#1a1a1a",
        borderRadius: "8px",
        width: "400px",
      }}
    >
      <h3 style={{ margin: "0 0 12px", fontSize: "14px", color: "#fff" }}>
        Filters
      </h3>
      <div style={{ display: "flex", gap: "12px" }}>
        <FilterGroup label="Page:" htmlFor="panel-page">
          <select id="panel-page">
            <option value="all">All Pages</option>
            <option value="current">Current Page</option>
          </select>
        </FilterGroup>

        <FilterGroup label="Status:" htmlFor="panel-status">
          <select id="panel-status">
            <option value="all">All</option>
            <option value="new">New</option>
            <option value="in-progress">In Progress</option>
          </select>
        </FilterGroup>

        <FilterGroup label="Author:" htmlFor="panel-author">
          <input
            id="panel-author"
            type="text"
            placeholder="Filter by author..."
          />
        </FilterGroup>
      </div>
    </div>
  ),
};
