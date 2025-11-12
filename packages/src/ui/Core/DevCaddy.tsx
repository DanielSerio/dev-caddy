import { useMemo, useState } from "react";
import type { DevCaddyMode, DevCaddyProps } from "../../types";
import { CaddyWindow } from "./CaddyWindow/CaddyWindow";
import { ModeToggle } from "./ModeToggle";
import { getCornerStyles } from "./utility";
import { AnnotationProvider, useAnnotations } from "./context";
import { AnnotationList } from "../Client/AnnotationList";
import { AnnotationManager } from "../Developer/AnnotationManager";
import { AnnotationPopover } from "./AnnotationPopover";
import { AuthPrompt } from "./AuthPrompt";
import { ModeSwitcher } from "./ModeSwitcher";
import { useElementSelector, useAuth } from "./hooks";
import { getElementSelectors } from "./lib/selector/get-element-selectors";
import { ANNOTATION_STATUS } from "../../types/annotations";
import type { CreateAnnotationInput } from "../../types/annotations";
import "./styles/output/dev-caddy.scss";
import { Skeleton } from "./Skeleton";

type DevCaddyWindow = Window & { __DEV_CADDY_UI_MODE__: DevCaddyMode };

/**
 * Inner component that has access to AnnotationProvider context
 */
function DevCaddyContent({
  uiMode,
  windowStyles,
}: {
  uiMode: DevCaddyMode;
  windowStyles: React.CSSProperties;
}) {
  const { addAnnotation } = useAnnotations();
  const { mode, setMode, selectedElement, clearSelection } =
    useElementSelector();
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  // Get user ID from authenticated session
  const currentUserId = user?.id || "";

  /**
   * Handle annotation submission
   */
  const handleSubmitAnnotation = async (content: string) => {
    if (!selectedElement) return;

    try {
      const selectors = getElementSelectors(selectedElement);

      const input: CreateAnnotationInput = {
        page: window.location.pathname,
        element_tag: selectors.tag,
        compressed_element_tree: selectors.compressedTree,
        element_id: selectors.id || null,
        element_test_id: selectors.testId || null,
        element_role: selectors.role || null,
        element_unique_classes: selectors.classes || null,
        element_parent_selector: selectors.parent,
        element_nth_child: selectors.nthChild,
        content,
        status_id: ANNOTATION_STATUS.NEW,
        created_by: currentUserId,
      };

      await addAnnotation(input);
      clearSelection();
    } catch (err) {
      console.error("Failed to create annotation:", err);
      alert("Failed to create annotation. Please try again.");
    }
  };

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <CaddyWindow uiMode={uiMode} style={windowStyles}>
        <div
          className="caddy-content"
          data-dev-caddy
          data-testid="devcaddy-panel"
        >
          <div className="auth-loading" data-testid="auth-loading">
            {/* <p>Checking authentication...</p> */}
            <Skeleton />
          </div>
        </div>
      </CaddyWindow>
    );
  }

  // Show auth prompt if not authenticated
  if (!isAuthenticated) {
    return <AuthPrompt />;
  }

  return (
    <>
      <CaddyWindow uiMode={uiMode} style={windowStyles}>
        <div className="caddy-content" data-testid="devcaddy-panel">
          <ModeSwitcher />

          <div className="caddy-toolbar" data-testid="devcaddy-toolbar">
            <button
              onClick={() =>
                setMode(mode === "selecting" ? "idle" : "selecting")
              }
              className={`btn-add-annotation ${
                mode === "selecting" ? "active" : ""
              }`}
              aria-label="Add annotation to UI element"
              data-testid="add-annotation-btn"
            >
              {mode === "selecting" ? "Cancel Selection" : "+ Add Annotation"}
            </button>
          </div>

          {uiMode === "client" && (
            <AnnotationList currentUserId={currentUserId} />
          )}
          {uiMode === "developer" && <AnnotationManager />}
        </div>
      </CaddyWindow>

      {selectedElement && (
        <AnnotationPopover
          selectedElement={selectedElement}
          onSubmit={handleSubmitAnnotation}
          onCancel={clearSelection}
        />
      )}
    </>
  );
}

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
    <div className="dev-caddy" data-dev-caddy data-testid="devcaddy-root">
      <ModeToggle
        isActive={devCaddyIsActive}
        onToggle={setDevCaddyIsActive}
        corner={corner}
        style={toggleStyles}
      />
      {devCaddyIsActive && UI_MODE && (
        <AnnotationProvider>
          <DevCaddyContent uiMode={UI_MODE} windowStyles={windowStyles} />
        </AnnotationProvider>
      )}
    </div>
  );
}
