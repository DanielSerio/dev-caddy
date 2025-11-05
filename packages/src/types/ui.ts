export type WindowCorner = 'top-left' | 'top-right' | 'bottom-right' | 'bottom-left';

export interface DevCaddyProps {
  corner?: WindowCorner;
  offset?: number | [number, number];
}