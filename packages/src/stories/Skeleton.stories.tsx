import type { Meta, StoryObj } from '@storybook/react';
import { Skeleton } from '../ui/Core/Skeleton';

const meta = {
  title: 'Core/Skeleton',
  component: Skeleton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['text', 'circular', 'rectangular'],
      description: 'Preset variant for common use cases',
    },
    width: {
      control: 'text',
      description: 'Width (CSS value: px, %, rem, etc.)',
    },
    height: {
      control: 'text',
      description: 'Height (CSS value: px, %, rem, etc.)',
    },
    radius: {
      control: 'text',
      description: 'Border radius (CSS value: px, %, rem, etc.)',
    },
  },
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Text variant - for loading text placeholders
 */
export const Text: Story = {
  args: {
    variant: 'text',
    width: '200px',
  },
};

/**
 * Circular variant - for loading avatar/icon placeholders
 */
export const Circular: Story = {
  args: {
    variant: 'circular',
    width: 40,
    height: 40,
  },
};

/**
 * Rectangular variant - for loading card/image placeholders
 */
export const Rectangular: Story = {
  args: {
    variant: 'rectangular',
    width: '300px',
    height: '150px',
  },
};

/**
 * Custom dimensions with specific radius
 */
export const CustomDimensions: Story = {
  args: {
    variant: 'rectangular',
    width: '250px',
    height: '100px',
    radius: '12px',
  },
};

/**
 * Multiple text lines loading state
 */
export const MultipleTextLines: Story = {
  render: () => (
    <div style={{ width: '400px' }}>
      <Skeleton variant="text" width="100%" height="1em" style={{ marginBottom: '8px' }} />
      <Skeleton variant="text" width="90%" height="1em" style={{ marginBottom: '8px' }} />
      <Skeleton variant="text" width="95%" height="1em" style={{ marginBottom: '8px' }} />
      <Skeleton variant="text" width="80%" height="1em" />
    </div>
  ),
};

/**
 * Card loading state with avatar and text
 */
export const CardLoading: Story = {
  render: () => (
    <div style={{ width: '350px', padding: '16px', border: '1px solid #333', borderRadius: '8px' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
        <Skeleton variant="circular" width={48} height={48} style={{ marginRight: '12px' }} />
        <div style={{ flex: 1 }}>
          <Skeleton variant="text" width="60%" height="1em" style={{ marginBottom: '4px' }} />
          <Skeleton variant="text" width="40%" height="0.8em" />
        </div>
      </div>
      <Skeleton variant="rectangular" width="100%" height="200px" style={{ marginBottom: '12px' }} />
      <Skeleton variant="text" width="100%" height="1em" style={{ marginBottom: '6px' }} />
      <Skeleton variant="text" width="90%" height="1em" style={{ marginBottom: '6px' }} />
      <Skeleton variant="text" width="70%" height="1em" />
    </div>
  ),
};

/**
 * Annotation item loading state
 */
export const AnnotationItemLoading: Story = {
  render: () => (
    <div style={{ width: '400px', padding: '12px', border: '1px solid #333', borderRadius: '6px' }}>
      {/* Header with element tag and status badge */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
        <Skeleton variant="text" width="45%" height="16px" />
        <Skeleton variant="text" width="22%" height="20px" />
      </div>

      {/* Content text */}
      <div style={{ marginBottom: '8px' }}>
        <Skeleton variant="text" width="90%" height="14px" style={{ marginBottom: '4px' }} />
        <Skeleton variant="text" width="75%" height="14px" />
      </div>

      {/* Meta information (author, dates) */}
      <div style={{ display: 'flex', gap: '16px' }}>
        <Skeleton variant="text" width="30%" height="12px" />
        <Skeleton variant="text" width="40%" height="12px" />
      </div>
    </div>
  ),
};

/**
 * List of skeleton items
 */
export const SkeletonList: Story = {
  render: () => (
    <div style={{ width: '400px' }}>
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          style={{
            padding: '12px',
            border: '1px solid #333',
            borderRadius: '6px',
            marginBottom: i < 3 ? '12px' : '0'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <Skeleton variant="text" width="45%" height="16px" />
            <Skeleton variant="text" width="22%" height="20px" />
          </div>
          <Skeleton variant="text" width="90%" height="14px" style={{ marginBottom: '4px' }} />
          <Skeleton variant="text" width="75%" height="14px" />
        </div>
      ))}
    </div>
  ),
};

/**
 * Different sizes demonstration
 */
export const DifferentSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'flex-start' }}>
      <div>
        <p style={{ marginBottom: '8px', fontSize: '12px', color: '#999' }}>Small</p>
        <Skeleton variant="rectangular" width="100px" height="60px" />
      </div>
      <div>
        <p style={{ marginBottom: '8px', fontSize: '12px', color: '#999' }}>Medium</p>
        <Skeleton variant="rectangular" width="200px" height="100px" />
      </div>
      <div>
        <p style={{ marginBottom: '8px', fontSize: '12px', color: '#999' }}>Large</p>
        <Skeleton variant="rectangular" width="300px" height="150px" />
      </div>
    </div>
  ),
};

/**
 * Circular variants of different sizes (for avatars)
 */
export const CircularSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
      <Skeleton variant="circular" width={32} height={32} />
      <Skeleton variant="circular" width={48} height={48} />
      <Skeleton variant="circular" width={64} height={64} />
      <Skeleton variant="circular" width={80} height={80} />
    </div>
  ),
};
