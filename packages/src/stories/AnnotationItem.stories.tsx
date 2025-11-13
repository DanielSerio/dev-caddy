import type { Meta, StoryObj } from '@storybook/react';
import { AnnotationItem } from '../ui/Developer/AnnotationItem';
import {
  mockAnnotation,
  mockAnnotationCurrentPage,
  mockAnnotationInProgress,
  mockAnnotationInReview,
  mockAnnotationOnHold,
  mockAnnotationResolved,
  mockAnnotationMinimal,
  mockAnnotationLongContent,
} from './fixtures/annotations';

const meta = {
  title: 'Developer/AnnotationItem',
  component: AnnotationItem,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    annotation: {
      description: 'Annotation data object',
    },
    onClick: {
      action: 'clicked',
      description: 'Callback when annotation item is clicked',
    },
  },
} satisfies Meta<typeof AnnotationItem>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default annotation item with NEW status
 */
export const Default: Story = {
  args: {
    annotation: mockAnnotation,
    onClick: () => {},
  },
};

/**
 * Annotation on current page (shows "Current Page" badge)
 */
export const CurrentPage: Story = {
  args: {
    annotation: mockAnnotationCurrentPage,
    onClick: () => {},
  },
};

/**
 * Annotation with IN_PROGRESS status
 */
export const InProgress: Story = {
  args: {
    annotation: mockAnnotationInProgress,
    onClick: () => {},
  },
};

/**
 * Annotation with IN_REVIEW status
 */
export const InReview: Story = {
  args: {
    annotation: mockAnnotationInReview,
    onClick: () => {},
  },
};

/**
 * Annotation with HOLD status
 */
export const OnHold: Story = {
  args: {
    annotation: mockAnnotationOnHold,
    onClick: () => {},
  },
};

/**
 * Annotation with RESOLVED status
 */
export const Resolved: Story = {
  args: {
    annotation: mockAnnotationResolved,
    onClick: () => {},
  },
};

/**
 * Annotation with minimal element data (no id, test-id, role, classes)
 */
export const MinimalData: Story = {
  args: {
    annotation: mockAnnotationMinimal,
    onClick: () => {},
  },
};

/**
 * Annotation with long content text
 */
export const LongContent: Story = {
  args: {
    annotation: mockAnnotationLongContent,
    onClick: () => {},
  },
};

/**
 * List of annotation items showing all statuses
 */
export const AllStatuses: Story = {
  render: () => (
    <div style={{ width: '500px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <AnnotationItem annotation={mockAnnotation} onClick={() => {}} />
      <AnnotationItem annotation={mockAnnotationInProgress} onClick={() => {}} />
      <AnnotationItem annotation={mockAnnotationInReview} onClick={() => {}} />
      <AnnotationItem annotation={mockAnnotationOnHold} onClick={() => {}} />
      <AnnotationItem annotation={mockAnnotationResolved} onClick={() => {}} />
    </div>
  ),
};

/**
 * Comparison between current page and other page badges
 */
export const PageBadgeComparison: Story = {
  render: () => (
    <div style={{ width: '500px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div>
        <p style={{ marginBottom: '8px', fontSize: '12px', color: '#999' }}>Current Page Badge</p>
        <AnnotationItem annotation={mockAnnotationCurrentPage} onClick={() => {}} />
      </div>
      <div>
        <p style={{ marginBottom: '8px', fontSize: '12px', color: '#999' }}>Other Page Badge</p>
        <AnnotationItem annotation={mockAnnotation} onClick={() => {}} />
      </div>
    </div>
  ),
};

/**
 * Mixed list showing various states and pages
 */
export const MixedList: Story = {
  render: () => (
    <div style={{ width: '500px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <AnnotationItem annotation={mockAnnotationCurrentPage} onClick={() => {}} />
      <AnnotationItem annotation={mockAnnotation} onClick={() => {}} />
      <AnnotationItem annotation={mockAnnotationInProgress} onClick={() => {}} />
      <AnnotationItem annotation={mockAnnotationMinimal} onClick={() => {}} />
      <AnnotationItem annotation={mockAnnotationResolved} onClick={() => {}} />
      <AnnotationItem annotation={mockAnnotationLongContent} onClick={() => {}} />
    </div>
  ),
};

/**
 * Responsive layout demonstration
 */
export const ResponsiveWidths: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <p style={{ marginBottom: '8px', fontSize: '12px', color: '#999' }}>Narrow (300px)</p>
        <div style={{ width: '300px' }}>
          <AnnotationItem annotation={mockAnnotationLongContent} onClick={() => {}} />
        </div>
      </div>
      <div>
        <p style={{ marginBottom: '8px', fontSize: '12px', color: '#999' }}>Medium (500px)</p>
        <div style={{ width: '500px' }}>
          <AnnotationItem annotation={mockAnnotationLongContent} onClick={() => {}} />
        </div>
      </div>
      <div>
        <p style={{ marginBottom: '8px', fontSize: '12px', color: '#999' }}>Wide (700px)</p>
        <div style={{ width: '700px' }}>
          <AnnotationItem annotation={mockAnnotationLongContent} onClick={() => {}} />
        </div>
      </div>
    </div>
  ),
};
