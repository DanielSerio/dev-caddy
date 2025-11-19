import type { SVGProps } from 'react';

/**
 * Chevron Left icon
 * Used for back/navigation buttons
 */
export function ChevronLeftIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <title>Back</title>
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}
