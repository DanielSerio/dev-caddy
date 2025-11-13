import type { Meta, StoryObj } from '@storybook/react';
import { AnnotationFilters, type FilterOptions } from '../ui/Developer/AnnotationFilters';
import { useState } from 'react';
import { ANNOTATION_STATUS } from '../types/annotations';

const meta = {
  title: 'Developer/AnnotationFilters',
  component: AnnotationFilters,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    filters: {
      description: 'Current filter values',
    },
    onFiltersChange: {
      action: 'filters changed',
      description: 'Callback when filters change',
    },
    availablePages: {
      description: 'List of unique page paths from annotations',
    },
  },
} satisfies Meta<typeof AnnotationFilters>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Sample page paths for testing
 */
const samplePages = ['/', '/products', '/dashboard', '/settings', '/about', '/blog'];

/**
 * Default state with all filters set to "all"
 */
export const Default: Story = {
  args: {
    filters: {
      status: 'all',
      author: '',
      page: 'all',
    },
    availablePages: samplePages,
    onFiltersChange: () => {},
  },
};

/**
 * Filtered by NEW status
 */
export const FilteredByNewStatus: Story = {
  args: {
    filters: {
      status: ANNOTATION_STATUS.NEW,
      author: '',
      page: 'all',
    },
    availablePages: samplePages,
    onFiltersChange: () => {},
  },
};

/**
 * Filtered by IN_PROGRESS status
 */
export const FilteredByInProgress: Story = {
  args: {
    filters: {
      status: ANNOTATION_STATUS.IN_PROGRESS,
      author: '',
      page: 'all',
    },
    availablePages: samplePages,
    onFiltersChange: () => {},
  },
};

/**
 * Filtered by author
 */
export const FilteredByAuthor: Story = {
  args: {
    filters: {
      status: 'all',
      author: 'john@example.com',
      page: 'all',
    },
    availablePages: samplePages,
    onFiltersChange: () => {},
  },
};

/**
 * Filtered by current page
 */
export const FilteredByCurrentPage: Story = {
  args: {
    filters: {
      status: 'all',
      author: '',
      page: 'current',
    },
    availablePages: samplePages,
    onFiltersChange: () => {},
  },
};

/**
 * Filtered by specific page
 */
export const FilteredBySpecificPage: Story = {
  args: {
    filters: {
      status: 'all',
      author: '',
      page: '/products',
    },
    availablePages: samplePages,
    onFiltersChange: () => {},
  },
};

/**
 * Multiple filters applied
 */
export const MultipleFilters: Story = {
  args: {
    filters: {
      status: ANNOTATION_STATUS.IN_PROGRESS,
      author: 'designer',
      page: '/dashboard',
    },
    availablePages: samplePages,
    onFiltersChange: () => {},
  },
};

/**
 * No available pages (empty list)
 */
export const NoAvailablePages: Story = {
  args: {
    filters: {
      status: 'all',
      author: '',
      page: 'all',
    },
    availablePages: [],
    onFiltersChange: () => {},
  },
};

/**
 * Many available pages
 */
export const ManyPages: Story = {
  args: {
    filters: {
      status: 'all',
      author: '',
      page: 'all',
    },
    availablePages: [
      '/',
      '/about',
      '/blog',
      '/blog/post-1',
      '/blog/post-2',
      '/checkout',
      '/dashboard',
      '/products',
      '/products/category-1',
      '/products/category-2',
      '/settings',
      '/settings/account',
      '/settings/security',
    ],
    onFiltersChange: () => {},
  },
};

/**
 * Interactive demo with state management
 */
function InteractiveFilters() {
  const [filters, setFilters] = useState<FilterOptions>({
    status: 'all',
    author: '',
    page: 'all',
  });

  return (
    <div>
      <AnnotationFilters
        filters={filters}
        onFiltersChange={setFilters}
        availablePages={samplePages}
      />
      <div style={{ marginTop: '20px', padding: '12px', background: '#1a1a1a', borderRadius: '4px' }}>
        <h4 style={{ marginTop: 0, fontSize: '14px' }}>Current Filter State:</h4>
        <pre style={{ fontSize: '12px', margin: 0 }}>
          {JSON.stringify(filters, null, 2)}
        </pre>
      </div>
    </div>
  );
}

export const Interactive: Story = {
  render: () => <InteractiveFilters />,
};

/**
 * Narrow width demonstration
 */
export const NarrowWidth: Story = {
  render: () => (
    <div style={{ width: '300px' }}>
      <AnnotationFilters
        filters={{
          status: 'all',
          author: '',
          page: 'all',
        }}
        availablePages={samplePages}
        onFiltersChange={() => {}}
      />
    </div>
  ),
};

/**
 * Wide width demonstration
 */
export const WideWidth: Story = {
  render: () => (
    <div style={{ width: '800px' }}>
      <AnnotationFilters
        filters={{
          status: 'all',
          author: '',
          page: 'all',
        }}
        availablePages={samplePages}
        onFiltersChange={() => {}}
      />
    </div>
  ),
};
