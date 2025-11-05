import { useMemo, useState } from "react";
import type { DevCaddyProps } from "../../types";
import { CaddyWindow } from "./CaddyWindow";
import { ModeToggle } from "./ModeToggle";
import { getCornerStyles } from "../utility";
import "../styles/output/dev-caddy.scss";

type DevCaddyWindow = Window & { __DEV_CADDY_UI_MODE__: boolean };

export function DevCaddy({
  corner = "bottom-left",
  offset = 48,
}: DevCaddyProps) {
  const [devCaddyIsActive, setDevCaddyIsActive] = useState(false);

  const UI_MODE = useMemo(() => {
    if (window) {
      return (window as unknown as DevCaddyWindow)["__DEV_CADDY_UI_MODE__"];
    }

    return null;
  }, []);

  const toggleStyles = getCornerStyles("toggle", corner, offset);
  const windowStyles = getCornerStyles("window", corner, offset);

  return (
    <div className="dev-caddy">
      <ModeToggle
        isActive={devCaddyIsActive}
        onToggle={setDevCaddyIsActive}
        corner={corner}
        style={toggleStyles}
      />
      {devCaddyIsActive && (
        <CaddyWindow style={windowStyles}>{UI_MODE}</CaddyWindow>
      )}
    </div>
  );
}
