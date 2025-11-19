import type { CSSProperties } from "react";

/**
 * Skeleton component props
 */
export interface SkeletonProps {
  /** Width of the skeleton (CSS value: px, %, rem, etc.) */
  width?: string | number;
  /** Height of the skeleton (CSS value: px, %, rem, etc.) */
  height?: string | number;
  /** Border radius (CSS value: px, %, rem, etc.) */
  radius?: string | number;
  /** Additional CSS class name */
  className?: string;
  /** Additional inline styles */
  style?: CSSProperties;
  /** Variant for common use cases */
  variant?: "text" | "circular" | "rectangular";
}

/**
 * Skeleton loading component
 *
 * Displays an animated placeholder while content is loading.
 * Supports custom sizing, radius, and common variants.
 *
 * @example
 * // Text placeholder
 * <Skeleton variant="text" width="200px" />
 *
 * @example
 * // Avatar placeholder
 * <Skeleton variant="circular" width={40} height={40} />
 *
 * @example
 * // Custom rectangle
 * <Skeleton width="100%" height="150px" radius="8px" />
 */
export function Skeleton({
  width,
  height,
  radius,
  className = "",
  style = {},
  variant = "rectangular",
}: SkeletonProps) {
  // Default dimensions based on variant
  const getDefaultDimensions = () => {
    switch (variant) {
      case "text":
        return {
          width: width || "100%",
          height: height || "1em",
          radius: radius || "4px",
        };
      case "circular":
        return {
          width: width || "40px",
          height: height || width || "40px", // Height defaults to width for circles
          radius: radius || "50%",
        };
      case "rectangular":
      default:
        return {
          width: width || "100%",
          height: height || "100px",
          radius: radius || "4px",
        };
    }
  };

  const dimensions = getDefaultDimensions();

  // Convert numbers to px strings
  const formatValue = (
    value: string | number | undefined
  ): string | undefined => {
    if (value === undefined) return undefined;
    return typeof value === "number" ? `${value}px` : value;
  };

  const skeletonStyle: CSSProperties = {
    width: formatValue(dimensions.width),
    height: formatValue(dimensions.height),
    borderRadius: formatValue(dimensions.radius),
    backgroundColor: "var(--dc-skeleton-bg)",
    backgroundImage:
      "linear-gradient(90deg, transparent, var(--dc-skeleton-shimmer), transparent)",
    backgroundSize: "200% 100%",
    backgroundRepeat: "no-repeat",
    animation: "skeleton-shimmer 1.8s var(--dc-ease-smooth) infinite",
    display: "inline-block",
    ...style,
  };

  return (
    <div
      className={`skeleton ${className}`.trim()}
      style={skeletonStyle}
      data-dev-caddy
      data-testid="skeleton"
      aria-busy="true"
      aria-label="Loading..."
    />
  );
}
