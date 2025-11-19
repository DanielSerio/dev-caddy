import type { Meta, StoryObj } from '@storybook/react';
import { StatusBadge } from './StatusBadge';
import { ANNOTATION_STATUS } from '../../../../types/annotations';

const meta: Meta<typeof StatusBadge> = {
  title: 'Components/Badges/StatusBadge',
  component: StatusBadge,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof StatusBadge>;

export const New: Story = {
  args: {
    statusId: ANNOTATION_STATUS.NEW,
  },
};

export const InProgress: Story = {
  args: {
    statusId: ANNOTATION_STATUS.IN_PROGRESS,
  },
};

export const Resolved: Story = {
  args: {
    statusId: ANNOTATION_STATUS.RESOLVED,
  },
};
