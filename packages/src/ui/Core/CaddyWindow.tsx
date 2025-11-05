import clsx from "clsx";
import { type AreaHTMLAttributes } from "react";

export function CaddyWindow({
  children,
  className,
  ...props
}: AreaHTMLAttributes<HTMLDivElement>) {
  const classNames = clsx("caddy-window", className);
  return (
    <div className={classNames} {...props}>
      {children}
    </div>
  );
}
