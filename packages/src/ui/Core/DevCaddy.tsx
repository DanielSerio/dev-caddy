import { useState, useCallback } from "react";
import type { DevCaddyMode, DevCaddyProps } from "../../types";
import { CaddyWindow } from "./CaddyWindow/CaddyWindow";
import { ModeToggle } from "./ModeToggle";
import { AnnotationProvider, NotificationProvider } from "./context";
import { AnnotationList } from "../Client/AnnotationList";
import { AnnotationManager } from "../Developer/AnnotationManager";
import { AnnotationPopover } from "./AnnotationPopover";
import { ElementHighlight } from "./ElementHighlight";
import { AuthPrompt } from "./AuthPrompt";
import { ModeSwitcher } from "./ModeSwitcher";
import { useElementSelector, useAuth, useAnnotations, useDevCaddyMode, useDevCaddyStyles, useNotification } from "./hooks";
import { getElementSelectors } from "./lib/selector/get-element-selectors";
import { ANNOTATION_STATUS } from "../../types/annotations";
import type {
  CreateAnnotationInput,
  Annotation,
} from "../../types/annotations";
import type { SelectionMode } from "./hooks/useElementSelector";
import "./styles/output/dev-caddy.scss";
import { AnnotationItemSkeleton } from "./AnnotationItemSkeleton";
import { PlusIcon, CancelIcon } from "./icons";

/**
 * Inner component that has access to AnnotationProvider context
 */
function DevCaddyContent({
  uiMode,
  windowStyles,
  mode,
  setMode,
  selectedElement,
  clearSelection,
  viewingAnnotation,
  setViewingAnnotation,
}: {
  uiMode: DevCaddyMode;
  windowStyles: React.CSSProperties;
  mode: SelectionMode;
  setMode: (mode: SelectionMode) => void;
  selectedElement: HTMLElement | null;
  clearSelection: () => void;
  viewingAnnotation: Annotation | null;
  setViewingAnnotation: (annotation: Annotation | null) => void;
}) {
  const { addAnnotation } = useAnnotations();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { notify } = useNotification();

  // Get user ID and email from authenticated session
  const currentUserId = user?.id || "";
  const currentUserEmail = user?.email || null;

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
        created_by_email: currentUserEmail,
      };

      await addAnnotation(input);
      notify('success', 'Annotation created successfully');
      clearSelection();
    } catch (err) {
      console.error("Failed to create annotation:", err);
      notify('error', 'Failed to create annotation. Please try again.');
    }
  };

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <CaddyWindow uiMode={uiMode} style={windowStyles}>
        <div className="caddy-content" data-testid="devcaddy-panel">
          <div className="annotation-items" data-testid="auth-loading">
            <AnnotationItemSkeleton />
            <AnnotationItemSkeleton />
            <AnnotationItemSkeleton />
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

          {!viewingAnnotation && (
            <div className="caddy-toolbar" data-testid="devcaddy-toolbar">
              <button
                onClick={() =>
                  setMode(mode === "selecting" ? "idle" : "selecting")
                }
                className={`btn-add-annotation ${
                  mode === "selecting" ? "btn-cancel" : "btn-default"
                }`}
                aria-label="Add annotation to UI element"
                data-testid="add-annotation-btn"
              >
                {mode === "selecting" ? (
                  <>
                    <CancelIcon />
                    <span>Cancel</span>
                  </>
                ) : (
                  <>
                    <PlusIcon />
                    <span>Add Annotation</span>
                  </>
                )}
              </button>
            </div>
          )}

          {uiMode === "client" && (
            <AnnotationList
              onAnnotationSelect={setViewingAnnotation}
            />
          )}
          {uiMode === "developer" && (
            <AnnotationManager onAnnotationSelect={setViewingAnnotation} />
          )}
        </div>
      </CaddyWindow>

      {selectedElement && (
        <AnnotationPopover
          selectedElement={selectedElement}
          onSubmit={handleSubmitAnnotation}
          onCancel={clearSelection}
        />
      )}

      {viewingAnnotation && <ElementHighlight annotation={viewingAnnotation} />}
    </>
  );
}

/**
 * Wrapper component to share state between DevCaddyContent and AnnotationBadges
 */
function DevCaddyWithBadges({
  uiMode,
  windowStyles,
}: {
  uiMode: DevCaddyMode;
  windowStyles: React.CSSProperties;
}) {
  const { mode, setMode, selectedElement, clearSelection } =
    useElementSelector();
  const [viewingAnnotation, setViewingAnnotation] = useState<Annotation | null>(
    null
  );

  // Memoize the callback to ensure stable reference
  const handleAnnotationSelect = useCallback((annotation: Annotation | null) => {
    setViewingAnnotation(annotation);
  }, []);

  return (
    <>
      <DevCaddyContent
        uiMode={uiMode}
        windowStyles={windowStyles}
        mode={mode}
        setMode={setMode}
        selectedElement={selectedElement}
        clearSelection={clearSelection}
        viewingAnnotation={viewingAnnotation}
        setViewingAnnotation={handleAnnotationSelect}
      />
    </>
  );
}

export function DevCaddy({
  corner = "bottom-left",
  offset = 48,
}: DevCaddyProps) {
  const [devCaddyIsActive, setDevCaddyIsActive] = useState(false);
  const uiMode = useDevCaddyMode();
  const styles = useDevCaddyStyles(corner, offset);

  return (
    <div className="dev-caddy" data-dev-caddy data-testid="devcaddy-root">
      <ModeToggle
        isActive={devCaddyIsActive}
        onToggle={setDevCaddyIsActive}
        corner={corner}
        style={styles.toggle}
      />
      {devCaddyIsActive && uiMode && (
        <NotificationProvider>
          <AnnotationProvider>
            <DevCaddyWithBadges
              uiMode={uiMode}
              windowStyles={styles.window}
            />
          </AnnotationProvider>
        </NotificationProvider>
      )}
    </div>
  );
}
