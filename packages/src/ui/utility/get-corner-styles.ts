import type { CSSProperties } from "react";
import type { WindowCorner } from "../../types";

export function getCornerStyles(
  element: "window" | "toggle",
  corner: WindowCorner,
  offset: number | [number, number]
) {
  let style = {
    top: undefined,
    right: undefined,
    bottom: undefined,
    left: undefined,
  } as CSSProperties;

  const offsetX = typeof offset === "number" ? offset : offset[0];
  const offsetY = typeof offset === "number" ? offset : offset[1];
  const windowOffset = ~~(38 * 0.25);

  if (corner === "bottom-left") {
    style = {
      top: undefined,
      right: undefined,
      bottom: offsetY,
      left: offsetX,
      transform:
        element !== "toggle"
          ? `translate(${offsetX + windowOffset}px,-${offsetY + windowOffset
          }px)`
          : undefined,
    };
  } else if (corner === "bottom-right") {
    style = {
      top: undefined,
      right: offsetX,
      bottom: offsetY,
      left: undefined,
      transform:
        element !== "toggle"
          ? `translate(-${offsetX + windowOffset}px,-${offsetY + windowOffset
          }px)`
          : undefined,
    };
  } else if (corner === "top-left") {
    style = {
      top: offsetY,
      right: undefined,
      bottom: undefined,
      left: offsetX,
      transform:
        element !== "toggle"
          ? `translate(${offsetX + windowOffset}px,${offsetY + windowOffset}px)`
          : undefined,
    };
  } else if (corner === "top-right") {
    style = {
      top: offsetY,
      right: offsetX,
      bottom: undefined,
      left: undefined,
      transform:
        element !== "toggle"
          ? `translate(-${offsetX + windowOffset}px,${offsetY + windowOffset
          }px)`
          : undefined,
    };
  }

  return style;
}
