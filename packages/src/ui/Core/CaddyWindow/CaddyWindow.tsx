import clsx from "clsx";
import { type AreaHTMLAttributes } from "react";
import { CaddyWindowHeader } from "./CaddyWindowHeader";
import { type DevCaddyMode } from "../../../types";

export interface CaddyWindowProps extends AreaHTMLAttributes<HTMLDivElement> {
  uiMode: DevCaddyMode;
}

export function CaddyWindow({
  children,
  className,
  uiMode,
  ...props
}: CaddyWindowProps) {
  const classNames = clsx("caddy-window", className);
  return (
    <div className={classNames} {...props}>
      <CaddyWindowHeader uiMode={uiMode} />
      <section>{children}</section>
    </div>
  );
}
