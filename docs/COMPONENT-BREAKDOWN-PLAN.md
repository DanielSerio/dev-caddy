# Component Breakdown Plan

**Date:** 2025-11-13
**Status:** Planning
**Goal:** Break down DevCaddy components into pure, highly reusable atomic components for better maintainability and testability

---

## Executive Summary

DevCaddy's UI consists of 20 components totaling 2,728 lines. This plan outlines how to refactor them into atomic, reusable components following these principles:

1. **Pure components** - No side effects, deterministic rendering
2. **Single responsibility** - Each component does one thing well
3. **Under 250 lines** - Adherence to project guidelines
4. **Zero duplication** - Shared logic extracted to utilities/hooks
5. **Highly testable** - Easy to test in Storybook

**Expected outcome:**
- ~19% reduction in total lines (528 lines eliminated)
- Zero duplication of logic
- All components under 250 lines
- 30+ new atomic components
- 8+ reusable custom hooks
- 8+ shared utilities

---

## Current State Analysis

### Components Over 100 Lines (Need Breakdown)

| Component | Lines | Primary Issues |
|-----------|-------|----------------|
| AnnotationBadges.tsx | 303 | Multiple responsibilities: finding, positioning, visibility, grouping |
| AnnotationPopover.tsx | 267 | Form logic, positioning, validation, scroll detection mixed |
| Developer/AnnotationDetail.tsx | 259 | 95% duplicate of Client version |
| Developer/AnnotationManager.tsx | 225 | Complex filtering, navigation, state combined |
| DevCaddy.tsx | 225 | Nested components, complex orchestration |
| ElementHighlight.tsx | 223 | Finding, visibility, positioning in one component |
| Client/AnnotationList.tsx | 217 | List display, navigation, formatting combined |
| Client/AnnotationDetail.tsx | 216 | Near-duplicate of Developer version |
| AuthPrompt.tsx | 183 | Form, validation, success states in one |

### Repeated Patterns (Need Extraction)

| Pattern | Occurrences | Lines Duplicated |
|---------|-------------|------------------|
| Element finding logic | 3 | ~140 lines |
| Element visibility detection | 2 | ~30 lines |
| Date formatting | 4 | ~16 lines |
| Scrollable parent detection | 2 | ~30 lines |
| Position update with throttling | 2 | ~26 lines |
| Annotation header display | 3 | ~60 lines |
| Annotation meta display | 2 | ~40 lines |
| Status badge display | 5+ | ~25 lines |
| Page badge display | 2 | ~14 lines |
| Element code display | 3 | ~24 lines |

**Total duplicated code:** ~405 lines

---

## Atomic Components to Create

### Display Components (Pure, Read-Only)

#### 1. StatusBadge
```typescript
// packages/src/ui/Core/components/badges/StatusBadge.tsx
export interface StatusBadgeProps {
  statusId: number;
  className?: string;
}

export function StatusBadge({ statusId, className }: StatusBadgeProps) {
  const statusName = getStatusName(statusId);
  return (
    <span className={clsx('annotation-status', `status-${statusName}`, className)}>
      {statusName}
    </span>
  );
}
```

**Usage:** Replaces inline status badges across 5+ components
**Lines:** 5-10
**Priority:** Phase 2

#### 2. PageBadge
```typescript
// packages/src/ui/Core/components/badges/PageBadge.tsx
export interface PageBadgeProps {
  annotation: Annotation;
  showFullPath?: boolean;
  className?: string;
}

export function PageBadge({ annotation, showFullPath = false, className }: PageBadgeProps) {
  const isCurrent = isCurrentPage(annotation);
  return (
    <span className={clsx('annotation-page-badge', isCurrent ? 'current-page' : 'other-page', className)}>
      {isCurrent && !showFullPath ? 'Current Page' : annotation.page}
    </span>
  );
}
```

**Usage:** Developer/AnnotationItem, Client/AnnotationList
**Lines:** 5-10
**Priority:** Phase 2

#### 3. ElementCode
```typescript
// packages/src/ui/Core/components/display/ElementCode.tsx
export interface ElementCodeProps {
  annotation: Annotation;
  includeRole?: boolean;
  className?: string;
}

export function ElementCode({ annotation, includeRole = true, className }: ElementCodeProps) {
  return (
    <code className={className}>
      {annotation.element_tag}
      {annotation.element_id && `#${annotation.element_id}`}
      {annotation.element_test_id && ` [data-testid="${annotation.element_test_id}"]`}
      {includeRole && annotation.element_role && ` [role="${annotation.element_role}"]`}
    </code>
  );
}
```

**Usage:** Both AnnotationDetail components, AnnotationItem
**Lines:** 10-15
**Priority:** Phase 2

#### 4. AnnotationHeader
```typescript
// packages/src/ui/Core/components/annotation/AnnotationHeader.tsx
export interface AnnotationHeaderProps {
  annotation: Annotation;
  showPageBadge?: boolean;
  className?: string;
}

export function AnnotationHeader({ annotation, showPageBadge = true, className }: AnnotationHeaderProps) {
  return (
    <div className={clsx('annotation-header', className)}>
      <ElementCode annotation={annotation} includeRole={false} className="annotation-element" />
      <div className="annotation-badges">
        {showPageBadge && <PageBadge annotation={annotation} />}
        <StatusBadge statusId={annotation.status_id} />
      </div>
    </div>
  );
}
```

**Usage:** AnnotationItem, AnnotationList items
**Lines:** 20-30
**Priority:** Phase 4

#### 5. AnnotationMeta
```typescript
// packages/src/ui/Core/components/annotation/AnnotationMeta.tsx
export interface AnnotationMetaProps {
  annotation: Annotation;
  showAuthor?: boolean;
  className?: string;
}

export function AnnotationMeta({ annotation, showAuthor = true, className }: AnnotationMetaProps) {
  const isUpdated = annotation.updated_at !== annotation.created_at;

  return (
    <div className={clsx('annotation-meta', className)}>
      {showAuthor && (
        <span className="annotation-author">
          {annotation.created_by_email || annotation.created_by}
        </span>
      )}
      <span className="annotation-date">
        Created: {formatDate(annotation.created_at)}
      </span>
      {isUpdated && (
        <span className="annotation-updated">
          Updated: {formatDate(annotation.updated_at)}
        </span>
      )}
      {annotation.resolved_at && (
        <span className="annotation-resolved">
          Resolved: {formatDate(annotation.resolved_at)}
        </span>
      )}
    </div>
  );
}
```

**Usage:** AnnotationItem, AnnotationList items
**Lines:** 30-40
**Priority:** Phase 4

#### 6. DetailSection
```typescript
// packages/src/ui/Core/components/layout/DetailSection.tsx
export interface DetailSectionProps {
  label: string;
  children: ReactNode;
  className?: string;
}

export function DetailSection({ label, children, className }: DetailSectionProps) {
  return (
    <div className={clsx('detail-section', className)}>
      <label className="detail-label">{label}</label>
      <div className="detail-value">{children}</div>
    </div>
  );
}
```

**Usage:** Both AnnotationDetail components
**Lines:** 10-15
**Priority:** Phase 2

#### 7. EmptyState
```typescript
// packages/src/ui/Core/components/display/EmptyState.tsx
export interface EmptyStateProps {
  message: string;
  icon?: ReactNode;
  className?: string;
}

export function EmptyState({ message, icon, className }: EmptyStateProps) {
  return (
    <div className={clsx('empty-state', className)}>
      {icon && <div className="empty-state-icon">{icon}</div>}
      <p className="empty-state-message">{message}</p>
    </div>
  );
}
```

**Usage:** AnnotationManager, AnnotationList
**Lines:** 10-20
**Priority:** Phase 2

#### 8. ErrorDisplay
```typescript
// packages/src/ui/Core/components/display/ErrorDisplay.tsx
export interface ErrorDisplayProps {
  error: Error | string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorDisplay({ error, onRetry, className }: ErrorDisplayProps) {
  const message = typeof error === 'string' ? error : error.message;

  return (
    <div className={clsx('error-display', className)}>
      <p className="error-message">Error: {message}</p>
      {onRetry && (
        <ActionButton variant="secondary" onClick={onRetry}>
          Retry
        </ActionButton>
      )}
    </div>
  );
}
```

**Usage:** AnnotationManager, AnnotationList, DevCaddy
**Lines:** 10-20
**Priority:** Phase 2

#### 9. LoadingState
```typescript
// packages/src/ui/Core/components/loading/LoadingState.tsx
export interface LoadingStateProps {
  type: 'list' | 'detail' | 'filters';
  count?: number;
  className?: string;
}

export function LoadingState({ type, count = 3, className }: LoadingStateProps) {
  if (type === 'list') {
    return (
      <div className={clsx('loading-state', className)}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="annotation-item">
            <Skeleton variant="text" width="45%" height="16px" />
            <Skeleton variant="text" width="90%" height="14px" />
            <Skeleton variant="text" width="30%" height="12px" />
          </div>
        ))}
      </div>
    );
  }

  // Handle other types: detail, filters
  // ...
}
```

**Usage:** AnnotationManager, AnnotationList
**Lines:** 20-30
**Priority:** Phase 4

### Form/Input Components (Interactive)

#### 10. FormField
```typescript
// packages/src/ui/Core/components/form/FormField.tsx
export interface FormFieldProps {
  label: string;
  htmlFor: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}

export function FormField({ label, htmlFor, error, required, children, className }: FormFieldProps) {
  return (
    <div className={clsx('form-field', error && 'has-error', className)}>
      <label htmlFor={htmlFor} className="form-label">
        {label}
        {required && <span className="required">*</span>}
      </label>
      {children}
      {error && <span className="form-error">{error}</span>}
    </div>
  );
}
```

**Usage:** AnnotationPopover, AuthPrompt
**Lines:** 20-30
**Priority:** Phase 3

#### 11. TextArea
```typescript
// packages/src/ui/Core/components/form/TextArea.tsx
export interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
  onKeyboardShortcut?: (key: string) => void;
}

export function TextArea({ error, onKeyboardShortcut, onKeyDown, className, ...props }: TextAreaProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (onKeyboardShortcut) {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        onKeyboardShortcut('submit');
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onKeyboardShortcut('cancel');
      }
    }
    onKeyDown?.(e);
  };

  return (
    <textarea
      className={clsx('form-textarea', error && 'has-error', className)}
      onKeyDown={handleKeyDown}
      {...props}
    />
  );
}
```

**Usage:** AnnotationPopover, AnnotationDetail editors
**Lines:** 30-40
**Priority:** Phase 3

#### 12. StatusSelect
```typescript
// packages/src/ui/Core/components/form/StatusSelect.tsx
export interface StatusSelectProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  className?: string;
}

export function StatusSelect({ value, onChange, disabled, className }: StatusSelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      disabled={disabled}
      className={clsx('status-select', className)}
    >
      <option value={ANNOTATION_STATUS.NEW}>New</option>
      <option value={ANNOTATION_STATUS.IN_PROGRESS}>In Progress</option>
      <option value={ANNOTATION_STATUS.IN_REVIEW}>In Review</option>
      <option value={ANNOTATION_STATUS.HOLD}>Hold</option>
      <option value={ANNOTATION_STATUS.RESOLVED}>Resolved</option>
    </select>
  );
}
```

**Usage:** AnnotationDetail components
**Lines:** 30-40
**Priority:** Phase 3

### Button Components

#### 13. ActionButton
```typescript
// packages/src/ui/Core/components/button/ActionButton.tsx
export interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant: 'primary' | 'secondary' | 'danger';
  icon?: ReactNode;
  loading?: boolean;
}

export function ActionButton({ variant, icon, loading, children, className, disabled, ...props }: ActionButtonProps) {
  return (
    <button
      className={clsx('action-button', `variant-${variant}`, loading && 'loading', className)}
      disabled={disabled || loading}
      {...props}
    >
      {icon && <span className="button-icon">{icon}</span>}
      {children}
    </button>
  );
}
```

**Usage:** AnnotationDetail, AnnotationPopover, DevCaddy
**Lines:** 15-25
**Priority:** Phase 3

#### 14. BackButton
```typescript
// packages/src/ui/Core/components/button/BackButton.tsx
export interface BackButtonProps {
  onClick: () => void;
  label?: string;
  className?: string;
}

export function BackButton({ onClick, label = 'Back', className }: BackButtonProps) {
  return (
    <button
      className={clsx('back-button', className)}
      onClick={onClick}
      type="button"
    >
      ← {label}
    </button>
  );
}
```

**Usage:** AnnotationDetail components
**Lines:** 10-15
**Priority:** Phase 2

---

## Utilities to Extract

### Element Utilities

#### 1. findElement
```typescript
// packages/src/ui/Core/lib/element/find-element.ts
export function findElement(annotation: Annotation): Element | null {
  // Try test ID first (most reliable)
  if (annotation.element_test_id) {
    const element = document.querySelector(`[data-testid="${annotation.element_test_id}"]`);
    if (element) return element;
  }

  // Try ID
  if (annotation.element_id) {
    const element = document.getElementById(annotation.element_id);
    if (element) return element;
  }

  // Try unique classes with tag
  if (annotation.element_unique_classes) {
    const classes = annotation.element_unique_classes.split(' ').map(c => `.${c}`).join('');
    const selector = `${annotation.element_tag}${classes}`;
    const element = document.querySelector(selector);
    if (element) return element;
  }

  // Try compressed element tree (fallback)
  if (annotation.compressed_element_tree) {
    try {
      const element = document.querySelector(annotation.compressed_element_tree);
      if (element) return element;
    } catch {
      // Invalid selector, continue
    }
  }

  return null;
}
```

**Replaces:** Code in AnnotationBadges.tsx, ElementHighlight.tsx
**Lines saved:** ~140
**Priority:** Phase 1

#### 2. isElementVisible
```typescript
// packages/src/ui/Core/lib/element/is-element-visible.ts
export function isElementVisible(element: Element): boolean {
  const rect = element.getBoundingClientRect();

  // Check if element is in viewport
  if (rect.width === 0 || rect.height === 0) return false;

  // Check if element is behind a modal or other overlay
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  const topElement = document.elementFromPoint(centerX, centerY);

  return topElement !== null && element.contains(topElement);
}
```

**Replaces:** Code in AnnotationBadges.tsx, ElementHighlight.tsx
**Lines saved:** ~30
**Priority:** Phase 1

#### 3. getScrollableAncestors
```typescript
// packages/src/ui/Core/lib/element/get-scrollable-ancestors.ts
export function getScrollableAncestors(element: Element): HTMLElement[] {
  const scrollableAncestors: HTMLElement[] = [];
  let parent = element.parentElement;

  while (parent) {
    const computedStyle = window.getComputedStyle(parent);
    const overflow = computedStyle.overflow + computedStyle.overflowY + computedStyle.overflowX;

    if (overflow.includes('scroll') || overflow.includes('auto')) {
      scrollableAncestors.push(parent);
    }

    parent = parent.parentElement;
  }

  return scrollableAncestors;
}
```

**Replaces:** Code in AnnotationPopover.tsx, ElementHighlight.tsx
**Lines saved:** ~30
**Priority:** Phase 1

### Formatting Utilities

#### 4. formatDate
```typescript
// packages/src/ui/Core/utility/format-date.ts
export interface FormatDateOptions {
  includeTime?: boolean;
  relative?: boolean;
}

export function formatDate(isoString: string, options: FormatDateOptions = {}): string {
  const { includeTime = true, relative = false } = options;
  const date = new Date(isoString);

  if (relative) {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  }

  const dateString = date.toLocaleDateString();
  const timeString = date.toLocaleTimeString();

  return includeTime ? `${dateString} ${timeString}` : dateString;
}
```

**Replaces:** formatDate functions in 4 components
**Lines saved:** ~16
**Priority:** Phase 1

### Annotation Utilities

#### 5. getElementKey
```typescript
// packages/src/ui/Core/lib/annotation/get-element-key.ts
export function getElementKey(annotation: Annotation): string {
  if (annotation.element_test_id) {
    return `testid:${annotation.element_test_id}`;
  }
  if (annotation.element_id) {
    return `id:${annotation.element_id}`;
  }
  if (annotation.element_unique_classes) {
    return `class:${annotation.element_tag}.${annotation.element_unique_classes}`;
  }
  return `tree:${annotation.compressed_element_tree}`;
}
```

**Replaces:** Code in AnnotationBadges.tsx
**Lines saved:** ~15
**Priority:** Phase 1

#### 6. groupAnnotations
```typescript
// packages/src/ui/Core/lib/annotation/group-annotations.ts
export function groupAnnotations(
  annotations: Annotation[]
): Map<string, Map<number, Annotation[]>> {
  const grouped = new Map<string, Map<number, Annotation[]>>();

  for (const annotation of annotations) {
    const elementKey = getElementKey(annotation);

    if (!grouped.has(elementKey)) {
      grouped.set(elementKey, new Map());
    }

    const statusMap = grouped.get(elementKey)!;
    if (!statusMap.has(annotation.status_id)) {
      statusMap.set(annotation.status_id, []);
    }

    statusMap.get(annotation.status_id)!.push(annotation);
  }

  return grouped;
}
```

**Replaces:** Code in AnnotationBadges.tsx
**Lines saved:** ~25
**Priority:** Phase 1

---

## Custom Hooks to Create

### 1. useThrottledPosition
```typescript
// packages/src/ui/Core/hooks/useThrottledPosition.ts
export function useThrottledPosition(
  element: Element | null,
  calculatePosition: () => void,
  throttleMs: number = 100
): void {
  useEffect(() => {
    if (!element) return;

    let throttleTimer: number | null = null;

    const handleUpdate = () => {
      if (throttleTimer !== null) return;

      throttleTimer = window.setTimeout(() => {
        calculatePosition();
        throttleTimer = null;
      }, throttleMs);
    };

    window.addEventListener('scroll', handleUpdate, true);
    window.addEventListener('resize', handleUpdate);

    return () => {
      window.removeEventListener('scroll', handleUpdate, true);
      window.removeEventListener('resize', handleUpdate);
      if (throttleTimer !== null) {
        window.clearTimeout(throttleTimer);
      }
    };
  }, [element, calculatePosition, throttleMs]);
}
```

**Replaces:** Scroll/resize listeners in AnnotationPopover, ElementHighlight
**Lines saved:** ~26
**Priority:** Phase 5

### 2. useElementVisibility
```typescript
// packages/src/ui/Core/hooks/useElementVisibility.ts
export function useElementVisibility(element: Element | null): boolean {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (!element) return;

    const checkVisibility = () => {
      setIsVisible(isElementVisible(element));
    };

    checkVisibility();

    const observer = new MutationObserver(checkVisibility);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class'],
    });

    return () => observer.disconnect();
  }, [element]);

  return isVisible;
}
```

**Replaces:** Visibility checks in AnnotationBadges, ElementHighlight
**Lines saved:** ~20
**Priority:** Phase 5

### 3. useAnnotationNavigation
```typescript
// packages/src/ui/Core/hooks/useAnnotationNavigation.ts
export function useAnnotationNavigation() {
  const navigateToAnnotation = useCallback((
    annotation: Annotation,
    onSelect: (annotation: Annotation) => void
  ) => {
    navigateToAnnotation(annotation, onSelect);
  }, []);

  const checkPendingAnnotation = useCallback((
    annotations: Annotation[],
    onSelect: (annotation: Annotation) => void
  ) => {
    checkPendingAnnotation(annotations, onSelect);
  }, []);

  return { navigateToAnnotation, checkPendingAnnotation };
}
```

**Replaces:** Navigation logic in AnnotationManager, AnnotationList
**Lines saved:** ~15
**Priority:** Phase 5

---

## Component Refactoring Details

### AnnotationBadges.tsx (303 → 80-100 lines)

**Current issues:**
- Finding elements (lines 11-57) → Extract to `findElement` utility
- Visibility detection (lines 76-90) → Extract to `isElementVisible` utility
- Grouping logic (lines 105-122) → Extract to `groupAnnotations` utility
- Element key generation (lines 60-73) → Extract to `getElementKey` utility
- Badge positioning → Extract to `getBadgePosition` utility
- Inline Badge component (lines 95+) → Extract to `AnnotationBadge.tsx`

**After refactoring:**
```typescript
export function AnnotationBadges({ annotations }: AnnotationBadgesProps) {
  const groupedAnnotations = useMemo(() => groupAnnotations(annotations), [annotations]);
  const [badgePositions, setBadgePositions] = useState<Map<string, Position>>(new Map());

  useEffect(() => {
    const positions = new Map<string, Position>();

    for (const [elementKey, statusMap] of groupedAnnotations) {
      const firstAnnotation = statusMap.values().next().value[0];
      const element = findElement(firstAnnotation);

      if (element && isElementVisible(element)) {
        positions.set(elementKey, getBadgePosition(element));
      }
    }

    setBadgePositions(positions);
  }, [groupedAnnotations]);

  return (
    <>
      {Array.from(groupedAnnotations.entries()).map(([elementKey, statusMap]) => {
        const position = badgePositions.get(elementKey);
        if (!position) return null;

        return (
          <AnnotationBadge
            key={elementKey}
            statusMap={statusMap}
            position={position}
          />
        );
      })}
    </>
  );
}
```

**Extracted components:**
- `AnnotationBadge.tsx` (40-50 lines)

**Extracted utilities:**
- `findElement()`
- `isElementVisible()`
- `getElementKey()`
- `groupAnnotations()`
- `getBadgePosition()`

---

### AnnotationDetail Components (475 → 140 lines total)

**Current issue:** 95% duplicate code between Developer and Client versions

**Solution:** Create shared components and compose differently

**Shared components to create:**

1. **AnnotationDetailHeader.tsx** (20-30 lines)
```typescript
export function AnnotationDetailHeader({ onBack }: { onBack: () => void }) {
  return (
    <div className="detail-header">
      <BackButton onClick={onBack} />
      <h3>Annotation Details</h3>
    </div>
  );
}
```

2. **AnnotationDetailContent.tsx** (60-80 lines)
```typescript
export function AnnotationDetailContent({ annotation }: { annotation: Annotation }) {
  return (
    <>
      <DetailSection label="Element">
        <ElementCode annotation={annotation} />
      </DetailSection>

      <DetailSection label="Page">
        <a href={annotation.page}>{annotation.page}</a>
      </DetailSection>

      <DetailSection label="Created By">
        {annotation.created_by_email || annotation.created_by}
      </DetailSection>

      <AnnotationMeta annotation={annotation} showAuthor={false} />
    </>
  );
}
```

3. **AnnotationContentEditor.tsx** (30-40 lines)
```typescript
export function AnnotationContentEditor({
  annotation,
  isEditing,
  editedContent,
  canEdit,
  onEdit,
  onChange,
}: AnnotationContentEditorProps) {
  if (isEditing) {
    return (
      <FormField label="Content" htmlFor="content">
        <TextArea
          id="content"
          value={editedContent}
          onChange={(e) => onChange(e.target.value)}
          onKeyboardShortcut={(key) => key === 'submit' && onEdit()}
        />
      </FormField>
    );
  }

  return (
    <DetailSection label="Content">
      <p>{annotation.content}</p>
      {canEdit && <ActionButton variant="secondary" onClick={onEdit}>Edit</ActionButton>}
    </DetailSection>
  );
}
```

4. **AnnotationDetailActions.tsx** (40-50 lines)
```typescript
export function AnnotationDetailActions({
  mode,
  annotation,
  isEditing,
  canEdit,
  canDelete,
  editedContent,
  editedStatus,
  onSave,
  onCancel,
  onDelete,
}: AnnotationDetailActionsProps) {
  if (isEditing) {
    return (
      <div className="detail-actions">
        <StatusSelect value={editedStatus} onChange={setEditedStatus} />
        <ActionButton variant="primary" onClick={onSave}>Save</ActionButton>
        <ActionButton variant="secondary" onClick={onCancel}>Cancel</ActionButton>
      </div>
    );
  }

  if (mode === 'developer') {
    return (
      <div className="detail-actions">
        {canEdit && <ActionButton variant="primary" onClick={onEdit}>Edit</ActionButton>}
        {canDelete && <ActionButton variant="danger" onClick={onDelete}>Delete</ActionButton>}
      </div>
    );
  }

  // Client mode - limited actions
  return null;
}
```

**Refactored wrapper components:**

```typescript
// Developer/AnnotationDetail.tsx (30-40 lines)
export function AnnotationDetail({ annotation, onBack }: AnnotationDetailProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(annotation.content);
  const [editedStatus, setEditedStatus] = useState(annotation.status_id);

  const canEdit = true; // Developer can always edit
  const canDelete = true; // Developer can always delete

  return (
    <div className="dev-caddy-annotation-detail">
      <AnnotationDetailHeader onBack={onBack} />
      <AnnotationDetailContent annotation={annotation} />
      <AnnotationContentEditor
        annotation={annotation}
        isEditing={isEditing}
        editedContent={editedContent}
        canEdit={canEdit}
        onEdit={() => setIsEditing(true)}
        onChange={setEditedContent}
      />
      <AnnotationDetailActions
        mode="developer"
        annotation={annotation}
        isEditing={isEditing}
        canEdit={canEdit}
        canDelete={canDelete}
        editedContent={editedContent}
        editedStatus={editedStatus}
        onSave={handleSave}
        onCancel={() => setIsEditing(false)}
        onDelete={handleDelete}
      />
    </div>
  );
}
```

```typescript
// Client/AnnotationDetail.tsx (30-40 lines)
export function AnnotationDetail({ annotation, onBack, currentUserId }: AnnotationDetailProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(annotation.content);

  const canEdit = annotation.created_by === currentUserId;
  const canDelete = annotation.created_by === currentUserId;

  return (
    <div className="dev-caddy-annotation-detail">
      <AnnotationDetailHeader onBack={onBack} />
      <AnnotationDetailContent annotation={annotation} />
      <AnnotationContentEditor
        annotation={annotation}
        isEditing={isEditing}
        editedContent={editedContent}
        canEdit={canEdit}
        onEdit={() => setIsEditing(true)}
        onChange={setEditedContent}
      />
      <AnnotationDetailActions
        mode="client"
        annotation={annotation}
        isEditing={isEditing}
        canEdit={canEdit}
        canDelete={canDelete}
        editedContent={editedContent}
        editedStatus={annotation.status_id} // Can't change status in client mode
        onSave={handleSave}
        onCancel={() => setIsEditing(false)}
        onDelete={handleDelete}
      />
    </div>
  );
}
```

**Line reduction:** 475 → 220 lines (255 lines saved, 54% reduction)

---

## Implementation Plan

### Phase 1: Extract Utilities (Week 1)
**Risk:** Low
**Impact:** Immediate duplication reduction

- [ ] Create `packages/src/ui/Core/lib/element/` directory
- [ ] Extract `findElement()` utility
- [ ] Extract `isElementVisible()` utility
- [ ] Extract `getScrollableAncestors()` utility
- [ ] Create `packages/src/ui/Core/lib/annotation/` directory
- [ ] Extract `getElementKey()` utility
- [ ] Extract `groupAnnotations()` utility
- [ ] Create `packages/src/ui/Core/utility/` utilities
- [ ] Extract `formatDate()` utility
- [ ] Write integration tests for each utility
- [ ] Update consuming components to use utilities

**Success criteria:**
- All utilities have integration tests
- Zero duplication of element finding logic
- Zero duplication of date formatting

---

### Phase 2: Create Atomic Display Components (Week 2)
**Risk:** Low
**Impact:** Foundational components for Phase 3-6

- [ ] Create `packages/src/ui/Core/components/` directory structure
- [ ] Create `badges/StatusBadge.tsx`
- [ ] Create `badges/PageBadge.tsx`
- [ ] Create `display/ElementCode.tsx`
- [ ] Create `display/EmptyState.tsx`
- [ ] Create `display/ErrorDisplay.tsx`
- [ ] Create `layout/DetailSection.tsx`
- [ ] Create `button/BackButton.tsx`
- [ ] Create Storybook stories for each component
- [ ] Export components from index files

**Success criteria:**
- All components have Storybook stories
- Visual regression tests pass
- Components are pure (no side effects)

---

### Phase 3: Create Atomic Interactive Components (Week 3)
**Risk:** Medium
**Impact:** Reusable form/input components

- [ ] Create `form/FormField.tsx`
- [ ] Create `form/TextArea.tsx` with keyboard shortcuts
- [ ] Create `form/StatusSelect.tsx`
- [ ] Create `button/ActionButton.tsx`
- [ ] Create `filter/FilterGroup.tsx`
- [ ] Create Storybook stories with interaction tests
- [ ] Export components from index files

**Success criteria:**
- All components have interactive Storybook stories
- Keyboard shortcuts work correctly
- Form validation displays properly

---

### Phase 4: Create Composite Components (Week 4)
**Risk:** Medium
**Impact:** Significant reduction in component size

- [ ] Create `annotation/AnnotationHeader.tsx`
- [ ] Create `annotation/AnnotationMeta.tsx`
- [ ] Create `loading/LoadingState.tsx`
- [ ] Create `annotation/AnnotationBadge.tsx`
- [ ] Create `popover/PopoverHeader.tsx`
- [ ] Create Storybook stories
- [ ] Update consuming components incrementally

**Success criteria:**
- Composite components tested in isolation
- No regressions in consuming components

---

### Phase 5: Create Custom Hooks (Week 5)
**Risk:** Medium-High
**Impact:** Simplifies complex positioning/navigation logic

- [ ] Create `hooks/` directory
- [ ] Create `useThrottledPosition.ts`
- [ ] Create `useScrollableParents.ts`
- [ ] Create `useElementVisibility.ts`
- [ ] Create `useElementPosition.ts`
- [ ] Create `useAnnotationNavigation.ts`
- [ ] Write integration tests
- [ ] Update components to use hooks

**Success criteria:**
- Hooks work correctly in different scenarios
- No memory leaks (cleanup functions work)
- Position calculations are accurate

---

### Phase 6: Refactor Large Components (Week 6-8)
**Risk:** High
**Impact:** All components under 250 lines

#### Week 6: Detail Components
- [ ] Create shared AnnotationDetail components
- [ ] Create `annotation/AnnotationDetailHeader.tsx`
- [ ] Create `annotation/AnnotationDetailContent.tsx`
- [ ] Create `annotation/AnnotationContentEditor.tsx`
- [ ] Create `annotation/AnnotationDetailActions.tsx`
- [ ] Refactor `Developer/AnnotationDetail.tsx` to use shared components
- [ ] Refactor `Client/AnnotationDetail.tsx` to use shared components
- [ ] Write E2E tests for detail view workflows

#### Week 7: Positioning Components
- [ ] Refactor `AnnotationBadges.tsx` using utilities and AnnotationBadge component
- [ ] Refactor `AnnotationPopover.tsx` using PopoverForm and hooks
- [ ] Refactor `ElementHighlight.tsx` using utilities and hooks
- [ ] Write E2E tests for positioning behavior

#### Week 8: Manager and List Components
- [ ] Create `Developer/components/AnnotationManagerHeader.tsx`
- [ ] Create `Developer/components/AnnotationListView.tsx`
- [ ] Refactor `AnnotationManager.tsx`
- [ ] Create `Client/components/AnnotationListItem.tsx`
- [ ] Refactor `Client/AnnotationList.tsx`
- [ ] Refactor `DevCaddy.tsx` into smaller components
- [ ] Refactor `AuthPrompt.tsx` into form and success components
- [ ] Write E2E tests for all workflows

**Success criteria:**
- All components under 250 lines
- Zero duplication
- All E2E tests pass
- No regressions in functionality

---

## Testing Strategy

### 1. Utility Functions
- **Integration tests** via Playwright
- Test in real component context (not isolated unit tests)
- Verify behavior with real DOM elements

### 2. Atomic Components
- **Storybook stories** for all variations
- **Visual regression tests** for styling
- **Interaction tests** for interactive components
- No unit tests (per project guidelines)

### 3. Composite Components
- **Storybook stories** for common scenarios
- **Integration tests** verifying composition

### 4. Custom Hooks
- **Integration tests** within components
- Test cleanup functions (no memory leaks)
- Verify behavior across re-renders

### 5. Refactored Components
- **E2E tests** for full user workflows
- Test cross-page navigation
- Test real-time updates
- Verify permissions (developer vs client)

---

## Success Metrics

### Code Quality
- ✅ All components under 250 lines
- ✅ Zero duplication of logic
- ✅ 30+ reusable atomic components
- ✅ 8+ shared utilities
- ✅ 5+ custom hooks

### Maintainability
- ✅ Each component has single responsibility
- ✅ Pure components (deterministic rendering)
- ✅ Clear separation of concerns
- ✅ Easy to test in isolation

### Testing
- ✅ All atomic components have Storybook stories
- ✅ All workflows have E2E tests
- ✅ Visual regression tests pass
- ✅ No decrease in test coverage

### Performance
- ✅ No regressions in render performance
- ✅ Hooks cleanup properly (no memory leaks)
- ✅ Position updates throttled appropriately

---

## Migration Strategy

1. **No breaking changes** - All refactoring is internal
2. **Incremental adoption** - Extract and adopt one piece at a time
3. **Backward compatibility** - Keep old components until fully migrated
4. **Test coverage first** - Write tests before refactoring
5. **Documentation updates** - Update CLAUDE.md with new structure

---

## Directory Structure (After Refactoring)

```
packages/src/ui/
├── Core/
│   ├── components/
│   │   ├── annotation/
│   │   │   ├── AnnotationBadge.tsx
│   │   │   ├── AnnotationContentEditor.tsx
│   │   │   ├── AnnotationDetail.tsx (shared)
│   │   │   ├── AnnotationDetailActions.tsx
│   │   │   ├── AnnotationDetailContent.tsx
│   │   │   ├── AnnotationDetailHeader.tsx
│   │   │   ├── AnnotationHeader.tsx
│   │   │   ├── AnnotationMeta.tsx
│   │   │   └── index.ts
│   │   ├── badges/
│   │   │   ├── PageBadge.tsx
│   │   │   ├── StatusBadge.tsx
│   │   │   └── index.ts
│   │   ├── button/
│   │   │   ├── ActionButton.tsx
│   │   │   ├── BackButton.tsx
│   │   │   └── index.ts
│   │   ├── display/
│   │   │   ├── ElementCode.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   ├── ErrorDisplay.tsx
│   │   │   └── index.ts
│   │   ├── form/
│   │   │   ├── FormField.tsx
│   │   │   ├── StatusSelect.tsx
│   │   │   ├── TextArea.tsx
│   │   │   └── index.ts
│   │   ├── filter/
│   │   │   ├── FilterGroup.tsx
│   │   │   └── index.ts
│   │   ├── layout/
│   │   │   ├── DetailSection.tsx
│   │   │   └── index.ts
│   │   ├── loading/
│   │   │   ├── LoadingState.tsx
│   │   │   └── index.ts
│   │   ├── popover/
│   │   │   ├── PopoverForm.tsx
│   │   │   ├── PopoverHeader.tsx
│   │   │   └── index.ts
│   │   └── auth/
│   │       ├── AuthPromptForm.tsx
│   │       ├── AuthPromptSuccess.tsx
│   │       └── index.ts
│   ├── lib/
│   │   ├── annotation/
│   │   │   ├── get-element-key.ts
│   │   │   ├── group-annotations.ts
│   │   │   └── index.ts
│   │   ├── element/
│   │   │   ├── find-element.ts
│   │   │   ├── get-badge-position.ts
│   │   │   ├── get-scrollable-ancestors.ts
│   │   │   ├── is-element-visible.ts
│   │   │   └── index.ts
│   │   └── selector/ (existing)
│   ├── hooks/
│   │   ├── useAnnotationNavigation.ts
│   │   ├── useElementPosition.ts
│   │   ├── useElementVisibility.ts
│   │   ├── useScrollableParents.ts
│   │   ├── useThrottledPosition.ts
│   │   └── index.ts
│   ├── utility/
│   │   ├── format-date.ts
│   │   ├── navigation.ts (existing)
│   │   ├── positioning.ts (existing)
│   │   └── index.ts
│   └── ...existing files
├── Developer/
│   ├── components/
│   │   ├── AnnotationListView.tsx
│   │   ├── AnnotationManagerHeader.tsx
│   │   └── index.ts
│   ├── AnnotationDetail.tsx (thin wrapper)
│   ├── AnnotationFilters.tsx
│   ├── AnnotationItem.tsx
│   ├── AnnotationManager.tsx
│   └── index.ts
└── Client/
    ├── components/
    │   ├── AnnotationListItem.tsx
    │   └── index.ts
    ├── AnnotationDetail.tsx (thin wrapper)
    ├── AnnotationList.tsx
    └── index.ts
```

---

## Next Steps

1. **Review this plan** with team/stakeholders
2. **Prioritize phases** based on current development needs
3. **Set up branch** for refactoring work
4. **Begin Phase 1** (utility extraction) - lowest risk, immediate value
5. **Create tracking issues** for each phase
6. **Schedule code reviews** at end of each phase

---

## Questions to Address

1. Should we create stories for ALL atomic components, or just the most complex ones?
2. What's the preferred import pattern? Named exports from index files or direct imports?
3. Should custom hooks be in `hooks/` or colocated with components?
4. Timeline flexibility - can we extend phases if needed?
5. Migration path - keep old components or delete immediately after migration?

---

**Document Version:** 1.0
**Last Updated:** 2025-11-13
**Owner:** DevCaddy Team
