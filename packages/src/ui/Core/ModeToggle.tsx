import clsx from "clsx";
import {
  forwardRef,
  type ButtonHTMLAttributes,
  type Dispatch,
  type ForwardedRef,
  type SetStateAction,
} from "react";
import type { WindowCorner } from "../../types";
import { AnnotationIcon } from "./icons/AnnotationIcon";
import { CloseIcon } from "./icons/CloseIcon";

export interface ModeToggleProps
  extends Omit<
    ButtonHTMLAttributes<HTMLButtonElement>,
    "type" | "children" | "onToggle"
  > {
  corner: WindowCorner;
  isActive: boolean;
  onToggle: Dispatch<SetStateAction<boolean>>;
}

function ModeToggleComponent(
  {
    className,
    corner,
    style,
    isActive,
    onToggle,
    onClick,
    ...props
  }: ModeToggleProps,
  ref?: ForwardedRef<HTMLButtonElement>
) {
  const classNames = clsx(
    "caddy-mode-toggle",
    isActive ? "active" : null,
    corner,
    className
  );

  return (
    <button
      className={classNames}
      type="button"
      style={{ ...style }}
      ref={ref}
      {...props}
      onClick={(ev) => {
        onToggle((v) => !v);
        onClick?.(ev);
      }}
      data-testid="devcaddy-toggle"
      aria-label={isActive ? "Close DevCaddy" : "Open DevCaddy"}
      aria-expanded={isActive}
      title="DevCaddy Annotations"
    >
      {isActive ? (
        <CloseIcon className="toggle-icon" />
      ) : (
        <AnnotationIcon className="toggle-icon" />
      )}
    </button>
  );
}

export const ModeToggle = forwardRef(ModeToggleComponent);
