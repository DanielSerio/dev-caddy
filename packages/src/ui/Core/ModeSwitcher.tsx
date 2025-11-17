import { useState, useEffect } from "react";
import type { DevCaddyMode } from "../../types";

/**
 * Mode switcher component for development
 *
 * Only visible in development mode. Allows switching between
 * client and developer UI modes by adding a query parameter
 * and reloading the page.
 *
 * @example
 * <ModeSwitcher />
 */
export function ModeSwitcher() {
  const [currentMode, setCurrentMode] = useState<DevCaddyMode | null>(null);
  const [isDevelopment, setIsDevelopment] = useState(false);

  useEffect(() => {
    // Get current mode from window (type defined in global.d.ts)
    const mode = window.__DEV_CADDY_UI_MODE__;
    setCurrentMode(mode);

    // Only show in development (check if override is possible)
    setIsDevelopment(import.meta.env.DEV);
  }, []);

  /**
   * Switch to a different mode
   */
  const switchMode = (newMode: "client" | "developer") => {
    if (newMode === currentMode) return;

    // Update URL with query parameter
    const url = new URL(window.location.href);
    url.searchParams.set("devCaddyMode", newMode);

    // Reload page with new mode
    window.location.href = url.toString();
  };

  // Only render in development mode
  if (!isDevelopment) {
    return null;
  }

  return (
    <div className="dev-caddy-mode-switcher">
      <div className="mode-switcher-label">
        <span className="dev-badge">DEV</span>
        Current: <strong>{currentMode}</strong>
      </div>
      <div className="mode-switcher-buttons">
        <button
          onClick={() => switchMode("client")}
          disabled={currentMode === "client"}
          className={`btn-mode ${currentMode === "client" ? "active" : ""}`}
          title="Switch to client/reviewer mode"
        >
          Client
        </button>
        <button
          onClick={() => switchMode("developer")}
          disabled={currentMode === "developer"}
          className={`btn-mode ${currentMode === "developer" ? "active" : ""}`}
          title="Switch to developer mode"
        >
          Developer
        </button>
      </div>
    </div>
  );
}
