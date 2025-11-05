import type { PropsWithChildren } from "react";
import { type DevCaddyMode } from "../../../types";

export function CaddyWindowHeader({
  uiMode,
  children,
}: PropsWithChildren<{ uiMode: DevCaddyMode }>) {
  return (
    <header>
      <em>{uiMode === "client" ? "Annotations" : "Resolutions"}</em>
      {children}
    </header>
  );
}
