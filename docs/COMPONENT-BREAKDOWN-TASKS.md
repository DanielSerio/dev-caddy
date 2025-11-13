# Component Breakdown Tasks

**Date:** 2025-11-13
**Status:** Not Started
**Related:** [COMPONENT-BREAKDOWN-PLAN.md](./COMPONENT-BREAKDOWN-PLAN.md)

This document tracks all tasks for breaking down DevCaddy components into atomic, reusable pieces.

---

## Phase 1: Extract Utilities (Week 1)

**Risk:** Low | **Status:** In Progress

### Setup

- [x] Create `packages/src/ui/Core/lib/element/` directory
- [x] Create `packages/src/ui/Core/lib/annotation/` directory
- [x] Create `packages/src/ui/Core/lib/element/index.ts` barrel export
- [x] Create `packages/src/ui/Core/lib/annotation/index.ts` barrel export

### Element Utilities

- [x] **Extract `findElement()` utility**
  - File: `packages/src/ui/Core/lib/element/find-element.ts`
  - Replaces: Code in AnnotationBadges.tsx (lines 11-57), ElementHighlight.tsx (lines 24-72)
  - Lines saved: ~140
  - Interface:
    ```typescript
    export function findElement(annotation: Annotation): Element | null
    ```

- [x] **Extract `isElementVisible()` utility**
  - File: `packages/src/ui/Core/lib/element/is-element-visible.ts`
  - Replaces: Code in AnnotationBadges.tsx (lines 76-90), ElementHighlight.tsx (lines 7-20)
  - Lines saved: ~30
  - Interface:
    ```typescript
    export function isElementVisible(element: Element): boolean
    ```

- [x] **Extract `getScrollableAncestors()` utility**
  - File: `packages/src/ui/Core/lib/element/get-scrollable-ancestors.ts`
  - Replaces: Code in AnnotationPopover.tsx (lines 83-98), ElementHighlight.tsx (lines 134-147)
  - Lines saved: ~30
  - Interface:
    ```typescript
    export function getScrollableAncestors(element: Element): HTMLElement[]
    ```

- [x] **Extract `getBadgePosition()` utility**
  - File: `packages/src/ui/Core/lib/element/get-badge-position.ts`
  - Replaces: Position calculation in AnnotationBadges.tsx
  - Lines saved: ~20
  - Interface:
    ```typescript
    export function getBadgePosition(element: Element): { top: number; left: number }
    ```

### Annotation Utilities

- [x] **Extract `getElementKey()` utility**
  - File: `packages/src/ui/Core/lib/annotation/get-element-key.ts`
  - Replaces: Code in AnnotationBadges.tsx (lines 60-73)
  - Lines saved: ~15
  - Interface:
    ```typescript
    export function getElementKey(annotation: Annotation): string
    ```

- [x] **Extract `groupAnnotations()` utility**
  - File: `packages/src/ui/Core/lib/annotation/group-annotations.ts`
  - Replaces: Code in AnnotationBadges.tsx (lines 105-122)
  - Lines saved: ~25
  - Interface:
    ```typescript
    export function groupAnnotations(
      annotations: Annotation[]
    ): Map<string, Map<number, Annotation[]>>
    ```

### Formatting Utilities

- [x] **Extract `formatDate()` utility**
  - File: `packages/src/ui/Core/utility/format-date.ts`
  - Replaces: formatDate in 4 components (Developer/AnnotationDetail, Developer/AnnotationItem, Client/AnnotationList, Client/AnnotationDetail)
  - Lines saved: ~16
  - Interface:
    ```typescript
    export interface FormatDateOptions {
      includeTime?: boolean;
      relative?: boolean;
    }
    export function formatDate(isoString: string, options?: FormatDateOptions): string
    ```

- [ ] **Extract `formatElementSelector()` utility**
  - File: `packages/src/ui/Core/utility/format-element-selector.ts`
  - Replaces: Element selector formatting across multiple components
  - Lines saved: ~15
  - Interface:
    ```typescript
    export function formatElementSelector(annotation: Annotation): string
    ```

### Testing & Integration

- [ ] **Write integration tests for element utilities**
  - Test `findElement()` with different selector strategies
  - Test `isElementVisible()` with modals and scrolling
  - Test `getScrollableAncestors()` with nested scroll containers

- [ ] **Write integration tests for annotation utilities**
  - Test `getElementKey()` with various annotation types
  - Test `groupAnnotations()` with mixed annotations

- [ ] **Write integration tests for formatting utilities**
  - Test `formatDate()` with different options
  - Test `formatElementSelector()` with various elements

- [ ] **Update AnnotationBadges.tsx to use utilities**
  - Import utilities
  - Replace inline code
  - Verify behavior unchanged

- [ ] **Update ElementHighlight.tsx to use utilities**
  - Import utilities
  - Replace inline code
  - Verify behavior unchanged

- [ ] **Update AnnotationPopover.tsx to use utilities**
  - Import utilities
  - Replace inline code
  - Verify behavior unchanged

- [ ] **Update AnnotationDetail components to use `formatDate()`**
  - Developer/AnnotationDetail.tsx
  - Client/AnnotationDetail.tsx

- [ ] **Update AnnotationItem to use `formatDate()`**
  - Developer/AnnotationItem.tsx

- [ ] **Update AnnotationList to use `formatDate()`**
  - Client/AnnotationList.tsx

### Phase 1 Completion Criteria

- [ ] All utilities extracted and exported
- [ ] Integration tests pass for all utilities
- [ ] All consuming components updated
- [ ] No regressions in functionality
- [ ] Zero duplication of extracted logic

---

## Phase 2: Create Atomic Display Components (Week 2)

**Risk:** Low | **Status:** Not Started

### Setup

- [ ] Create `packages/src/ui/Core/components/` directory structure:
  - `badges/`
  - `display/`
  - `layout/`
  - `button/`
- [ ] Create index files for each subdirectory

### Badge Components

- [ ] **Create StatusBadge component**
  - File: `packages/src/ui/Core/components/badges/StatusBadge.tsx`
  - Lines: 5-10
  - Props: `statusId: number`, `className?: string`
  - Story: `src/stories/StatusBadge.stories.tsx`
  - Replaces: Inline status badges in 5+ components

- [ ] **Create PageBadge component**
  - File: `packages/src/ui/Core/components/badges/PageBadge.tsx`
  - Lines: 5-10
  - Props: `annotation: Annotation`, `showFullPath?: boolean`, `className?: string`
  - Story: `src/stories/PageBadge.stories.tsx`
  - Replaces: Page badges in Developer/AnnotationItem, Client/AnnotationList

- [ ] **Export badges from index**
  - File: `packages/src/ui/Core/components/badges/index.ts`
  - Export StatusBadge and PageBadge

### Display Components

- [ ] **Create ElementCode component**
  - File: `packages/src/ui/Core/components/display/ElementCode.tsx`
  - Lines: 10-15
  - Props: `annotation: Annotation`, `includeRole?: boolean`, `className?: string`
  - Story: `src/stories/ElementCode.stories.tsx`
  - Replaces: Element code display in both AnnotationDetail components, AnnotationItem

- [ ] **Create EmptyState component**
  - File: `packages/src/ui/Core/components/display/EmptyState.tsx`
  - Lines: 10-20
  - Props: `message: string`, `icon?: ReactNode`, `className?: string`
  - Story: `src/stories/EmptyState.stories.tsx`
  - Replaces: Empty state in AnnotationManager, AnnotationList

- [ ] **Create ErrorDisplay component**
  - File: `packages/src/ui/Core/components/display/ErrorDisplay.tsx`
  - Lines: 10-20
  - Props: `error: Error | string`, `onRetry?: () => void`, `className?: string`
  - Story: `src/stories/ErrorDisplay.stories.tsx`
  - Replaces: Error display in AnnotationManager, AnnotationList, DevCaddy

- [ ] **Export display components from index**
  - File: `packages/src/ui/Core/components/display/index.ts`
  - Export ElementCode, EmptyState, ErrorDisplay

### Layout Components

- [ ] **Create DetailSection component**
  - File: `packages/src/ui/Core/components/layout/DetailSection.tsx`
  - Lines: 10-15
  - Props: `label: string`, `children: ReactNode`, `className?: string`
  - Story: `src/stories/DetailSection.stories.tsx`
  - Replaces: Detail sections in both AnnotationDetail components

- [ ] **Export layout components from index**
  - File: `packages/src/ui/Core/components/layout/index.ts`
  - Export DetailSection

### Button Components

- [ ] **Create BackButton component**
  - File: `packages/src/ui/Core/components/button/BackButton.tsx`
  - Lines: 10-15
  - Props: `onClick: () => void`, `label?: string`, `className?: string`
  - Story: `src/stories/BackButton.stories.tsx`
  - Replaces: Back buttons in AnnotationDetail components

- [ ] **Export button components from index**
  - File: `packages/src/ui/Core/components/button/index.ts`
  - Export BackButton

### Storybook Stories

- [ ] **Create StatusBadge story**
  - Show all status types
  - Show with custom className
  - Show in different contexts

- [ ] **Create PageBadge story**
  - Show current page badge
  - Show other page badge
  - Show with full path

- [ ] **Create ElementCode story**
  - Show with all element attributes
  - Show with minimal attributes
  - Show with/without role

- [ ] **Create EmptyState story**
  - Show with different messages
  - Show with/without icon
  - Show in different layouts

- [ ] **Create ErrorDisplay story**
  - Show with Error object
  - Show with string message
  - Show with/without retry button

- [ ] **Create DetailSection story**
  - Show with text content
  - Show with complex children
  - Show with custom styling

- [ ] **Create BackButton story**
  - Show default
  - Show with custom label
  - Show in different contexts

### Phase 2 Completion Criteria

- [ ] All atomic display components created
- [ ] All components have Storybook stories
- [ ] Visual regression tests pass
- [ ] Components exported from index files
- [ ] All components are pure (no side effects)

---

## Phase 3: Create Atomic Interactive Components (Week 3)

**Risk:** Medium | **Status:** Not Started

### Setup

- [ ] Create `packages/src/ui/Core/components/form/` directory
- [ ] Create `packages/src/ui/Core/components/filter/` directory
- [ ] Create index files

### Form Components

- [ ] **Create FormField component**
  - File: `packages/src/ui/Core/components/form/FormField.tsx`
  - Lines: 20-30
  - Props: `label: string`, `htmlFor: string`, `error?: string`, `required?: boolean`, `children: ReactNode`, `className?: string`
  - Story: `src/stories/FormField.stories.tsx`
  - Replaces: Form fields in AnnotationPopover, AuthPrompt

- [ ] **Create TextArea component**
  - File: `packages/src/ui/Core/components/form/TextArea.tsx`
  - Lines: 30-40
  - Props: extends `React.TextareaHTMLAttributes`, `error?: string`, `onKeyboardShortcut?: (key: string) => void`
  - Story: `src/stories/TextArea.stories.tsx`
  - Features: Keyboard shortcuts (Ctrl+Enter to submit, Escape to cancel)
  - Replaces: Textareas in AnnotationPopover, AnnotationDetail editors

- [ ] **Create StatusSelect component**
  - File: `packages/src/ui/Core/components/form/StatusSelect.tsx`
  - Lines: 30-40
  - Props: `value: number`, `onChange: (value: number) => void`, `disabled?: boolean`, `className?: string`
  - Story: `src/stories/StatusSelect.stories.tsx`
  - Replaces: Status dropdowns in AnnotationDetail components

- [ ] **Export form components from index**
  - File: `packages/src/ui/Core/components/form/index.ts`
  - Export FormField, TextArea, StatusSelect

### Button Components (Additional)

- [ ] **Create ActionButton component**
  - File: `packages/src/ui/Core/components/button/ActionButton.tsx`
  - Lines: 15-25
  - Props: extends `React.ButtonHTMLAttributes`, `variant: 'primary' | 'secondary' | 'danger'`, `icon?: ReactNode`, `loading?: boolean`
  - Story: `src/stories/ActionButton.stories.tsx`
  - Replaces: Buttons in AnnotationDetail, AnnotationPopover, DevCaddy

- [ ] **Update button index to export ActionButton**

### Filter Components

- [ ] **Create FilterGroup component**
  - File: `packages/src/ui/Core/components/filter/FilterGroup.tsx`
  - Lines: 15-20
  - Props: `label: string`, `htmlFor: string`, `children: ReactNode`, `className?: string`
  - Story: `src/stories/FilterGroup.stories.tsx`
  - Replaces: Filter groups in AnnotationFilters

- [ ] **Export filter components from index**
  - File: `packages/src/ui/Core/components/filter/index.ts`
  - Export FilterGroup

### Storybook Stories with Interactions

- [ ] **Create FormField story**
  - Show with text input
  - Show with textarea
  - Show with error state
  - Show required field

- [ ] **Create TextArea story**
  - Show default state
  - Show with error
  - Show with keyboard shortcuts (interaction test)
  - Show different sizes

- [ ] **Create StatusSelect story**
  - Show all options
  - Show selected states
  - Show disabled state
  - Test onChange interaction

- [ ] **Create ActionButton story**
  - Show all variants (primary, secondary, danger)
  - Show with icon
  - Show loading state
  - Test click interactions

- [ ] **Create FilterGroup story**
  - Show with select input
  - Show with text input
  - Show multiple filter groups

### Phase 3 Completion Criteria

- [ ] All interactive components created
- [ ] All components have interactive Storybook stories
- [ ] Keyboard shortcuts work correctly
- [ ] Form validation displays properly
- [ ] Components are accessible (ARIA labels, keyboard navigation)

---

## Phase 4: Create Composite Components (Week 4)

**Risk:** Medium | **Status:** Not Started

### Setup

- [ ] Create `packages/src/ui/Core/components/annotation/` directory
- [ ] Create `packages/src/ui/Core/components/loading/` directory
- [ ] Create `packages/src/ui/Core/components/popover/` directory
- [ ] Create index files

### Annotation Components

- [ ] **Create AnnotationHeader component**
  - File: `packages/src/ui/Core/components/annotation/AnnotationHeader.tsx`
  - Lines: 20-30
  - Props: `annotation: Annotation`, `showPageBadge?: boolean`, `className?: string`
  - Uses: ElementCode, PageBadge, StatusBadge
  - Story: `src/stories/AnnotationHeader.stories.tsx`
  - Replaces: Header in Developer/AnnotationItem, Client/AnnotationList items

- [ ] **Create AnnotationMeta component**
  - File: `packages/src/ui/Core/components/annotation/AnnotationMeta.tsx`
  - Lines: 30-40
  - Props: `annotation: Annotation`, `showAuthor?: boolean`, `className?: string`
  - Uses: formatDate utility
  - Story: `src/stories/AnnotationMeta.stories.tsx`
  - Replaces: Meta in Developer/AnnotationItem, Client/AnnotationList items

- [ ] **Create AnnotationBadge component**
  - File: `packages/src/ui/Core/components/annotation/AnnotationBadge.tsx`
  - Lines: 40-50
  - Props: `statusMap: Map<number, Annotation[]>`, `position: { top: number; left: number }`, `onClick?: (annotation: Annotation) => void`
  - Story: `src/stories/AnnotationBadge.stories.tsx`
  - Replaces: Inline badge in AnnotationBadges.tsx

- [ ] **Export annotation components from index**
  - File: `packages/src/ui/Core/components/annotation/index.ts`
  - Export AnnotationHeader, AnnotationMeta, AnnotationBadge

### Loading Components

- [ ] **Create LoadingState component**
  - File: `packages/src/ui/Core/components/loading/LoadingState.tsx`
  - Lines: 20-30
  - Props: `type: 'list' | 'detail' | 'filters'`, `count?: number`, `className?: string`
  - Uses: Skeleton component
  - Story: `src/stories/LoadingState.stories.tsx`
  - Replaces: Loading skeletons in AnnotationManager, AnnotationList

- [ ] **Export loading components from index**
  - File: `packages/src/ui/Core/components/loading/index.ts`
  - Export LoadingState

### Popover Components

- [ ] **Create PopoverHeader component**
  - File: `packages/src/ui/Core/components/popover/PopoverHeader.tsx`
  - Lines: 20-30
  - Props: `title: string`, `onClose: () => void`, `className?: string`
  - Story: `src/stories/PopoverHeader.stories.tsx`
  - Replaces: Header in AnnotationPopover

- [ ] **Export popover components from index**
  - File: `packages/src/ui/Core/components/popover/index.ts`
  - Export PopoverHeader

### Storybook Stories

- [ ] **Create AnnotationHeader story**
  - Show with all element attributes
  - Show with/without page badge
  - Show different status badges
  - Show in list context

- [ ] **Create AnnotationMeta story**
  - Show with all metadata
  - Show with/without author
  - Show updated annotations
  - Show resolved annotations

- [ ] **Create AnnotationBadge story**
  - Show single annotation
  - Show multiple annotations (grouped)
  - Show different positions
  - Test click interaction

- [ ] **Create LoadingState story**
  - Show list loading (1, 3, 5 items)
  - Show detail loading
  - Show filters loading

- [ ] **Create PopoverHeader story**
  - Show default
  - Show with long title
  - Test close button interaction

### Update Consuming Components

- [ ] **Update Developer/AnnotationItem to use AnnotationHeader**
- [ ] **Update Developer/AnnotationItem to use AnnotationMeta**
- [ ] **Update Client/AnnotationList to use AnnotationHeader**
- [ ] **Update Client/AnnotationList to use AnnotationMeta**
- [ ] **Update AnnotationManager to use LoadingState**
- [ ] **Update AnnotationList to use LoadingState**

### Phase 4 Completion Criteria

- [ ] All composite components created
- [ ] Components tested in isolation via Storybook
- [ ] Components tested in consuming components
- [ ] No regressions in functionality
- [ ] Significant reduction in component size

---

## Phase 5: Create Custom Hooks (Week 5)

**Risk:** Medium-High | **Status:** Not Started

### Setup

- [ ] Create `packages/src/ui/Core/hooks/` directory
- [ ] Create `packages/src/ui/Core/hooks/index.ts`

### Position Hooks

- [ ] **Create useThrottledPosition hook**
  - File: `packages/src/ui/Core/hooks/useThrottledPosition.ts`
  - Lines: 30-40
  - Interface: `(element: Element | null, calculatePosition: () => void, throttleMs?: number) => void`
  - Features: Throttled scroll/resize listeners, cleanup
  - Replaces: Position update logic in AnnotationPopover, ElementHighlight

- [ ] **Create useScrollableParents hook**
  - File: `packages/src/ui/Core/hooks/useScrollableParents.ts`
  - Lines: 20-30
  - Interface: `(element: Element | null) => HTMLElement[]`
  - Uses: getScrollableAncestors utility
  - Replaces: Scrollable parent detection in AnnotationPopover

- [ ] **Create useElementVisibility hook**
  - File: `packages/src/ui/Core/hooks/useElementVisibility.ts`
  - Lines: 25-35
  - Interface: `(element: Element | null) => boolean`
  - Uses: isElementVisible utility
  - Features: MutationObserver for dynamic visibility changes
  - Replaces: Visibility checks in AnnotationBadges, ElementHighlight

- [ ] **Create useElementPosition hook**
  - File: `packages/src/ui/Core/hooks/useElementPosition.ts`
  - Lines: 40-50
  - Interface: `(element: Element | null, options?: PositionOptions) => { position: Position; isVisible: boolean }`
  - Uses: useThrottledPosition, useElementVisibility, useScrollableParents
  - Replaces: Complex positioning logic in AnnotationPopover, ElementHighlight

### Navigation Hooks

- [ ] **Create useAnnotationNavigation hook**
  - File: `packages/src/ui/Core/hooks/useAnnotationNavigation.ts`
  - Lines: 25-35
  - Interface: `() => { navigateToAnnotation, checkPendingAnnotation }`
  - Uses: navigation utilities
  - Replaces: Navigation logic in AnnotationManager, AnnotationList

### Form Hooks

- [ ] **Create useFormKeyboardShortcuts hook**
  - File: `packages/src/ui/Core/hooks/useFormKeyboardShortcuts.ts`
  - Lines: 20-30
  - Interface: `(onSubmit: () => void, onCancel: () => void) => { onKeyDown: (e: KeyboardEvent) => void }`
  - Features: Ctrl+Enter for submit, Escape for cancel
  - Replaces: Keyboard shortcut logic in AnnotationPopover

### Export Hooks

- [ ] **Export all hooks from index**
  - File: `packages/src/ui/Core/hooks/index.ts`
  - Export all hooks

### Integration Tests

- [ ] **Write integration tests for useThrottledPosition**
  - Test throttling behavior
  - Test cleanup (no memory leaks)
  - Test with scroll/resize events

- [ ] **Write integration tests for useElementVisibility**
  - Test with modals
  - Test with DOM changes
  - Test cleanup

- [ ] **Write integration tests for useElementPosition**
  - Test position calculation accuracy
  - Test with scrolling
  - Test visibility integration

- [ ] **Write integration tests for useAnnotationNavigation**
  - Test cross-page navigation
  - Test pending annotation check
  - Test sessionStorage integration

### Update Consuming Components

- [ ] **Update AnnotationPopover to use hooks**
  - Use useElementPosition
  - Use useFormKeyboardShortcuts

- [ ] **Update ElementHighlight to use hooks**
  - Use useElementPosition or useElementVisibility

- [ ] **Update AnnotationBadges to use hooks**
  - Use useElementVisibility

- [ ] **Update AnnotationManager to use hooks**
  - Use useAnnotationNavigation

- [ ] **Update AnnotationList to use hooks**
  - Use useAnnotationNavigation

### Phase 5 Completion Criteria

- [ ] All custom hooks created
- [ ] Hooks work correctly in components
- [ ] No memory leaks (cleanup functions work)
- [ ] Position calculations are accurate
- [ ] Navigation works across pages
- [ ] Keyboard shortcuts work correctly

---

## Phase 6: Refactor Large Components (Weeks 6-8)

**Risk:** High | **Status:** Not Started

### Week 6: Detail Components

#### Shared AnnotationDetail Components

- [ ] **Create AnnotationDetailHeader component**
  - File: `packages/src/ui/Core/components/annotation/AnnotationDetailHeader.tsx`
  - Lines: 20-30
  - Props: `onBack: () => void`
  - Uses: BackButton
  - Story: `src/stories/AnnotationDetailHeader.stories.tsx`

- [ ] **Create AnnotationDetailContent component**
  - File: `packages/src/ui/Core/components/annotation/AnnotationDetailContent.tsx`
  - Lines: 60-80
  - Props: `annotation: Annotation`
  - Uses: DetailSection, ElementCode, AnnotationMeta
  - Story: `src/stories/AnnotationDetailContent.stories.tsx`

- [ ] **Create AnnotationContentEditor component**
  - File: `packages/src/ui/Core/components/annotation/AnnotationContentEditor.tsx`
  - Lines: 30-40
  - Props: `annotation: Annotation`, `isEditing: boolean`, `editedContent: string`, `canEdit: boolean`, `onEdit: () => void`, `onChange: (value: string) => void`
  - Uses: FormField, TextArea, ActionButton
  - Story: `src/stories/AnnotationContentEditor.stories.tsx`

- [ ] **Create AnnotationDetailActions component**
  - File: `packages/src/ui/Core/components/annotation/AnnotationDetailActions.tsx`
  - Lines: 40-50
  - Props: `mode: 'developer' | 'client'`, `annotation: Annotation`, `isEditing: boolean`, `canEdit: boolean`, `canDelete: boolean`, etc.
  - Uses: StatusSelect, ActionButton
  - Story: `src/stories/AnnotationDetailActions.stories.tsx`

#### Refactor Developer/AnnotationDetail

- [ ] **Refactor Developer/AnnotationDetail.tsx (259 → 30-40 lines)**
  - Use AnnotationDetailHeader
  - Use AnnotationDetailContent
  - Use AnnotationContentEditor
  - Use AnnotationDetailActions with mode="developer"
  - Keep only state management and handlers

#### Refactor Client/AnnotationDetail

- [ ] **Refactor Client/AnnotationDetail.tsx (216 → 30-40 lines)**
  - Use AnnotationDetailHeader
  - Use AnnotationDetailContent
  - Use AnnotationContentEditor
  - Use AnnotationDetailActions with mode="client"
  - Keep only state management and permission logic

#### Testing

- [ ] **Write E2E tests for Developer AnnotationDetail**
  - Test view mode
  - Test edit mode
  - Test save/cancel
  - Test delete
  - Test status changes

- [ ] **Write E2E tests for Client AnnotationDetail**
  - Test view mode (own annotation)
  - Test edit mode (own annotation)
  - Test view mode (other's annotation)
  - Test permissions

- [ ] **Verify no regressions**
  - All existing tests pass
  - Visual appearance unchanged
  - Functionality unchanged

### Week 7: Positioning Components

#### Refactor AnnotationBadges

- [ ] **Refactor AnnotationBadges.tsx (303 → 80-100 lines)**
  - Use findElement utility
  - Use isElementVisible utility (or useElementVisibility hook)
  - Use getElementKey utility
  - Use groupAnnotations utility
  - Use getBadgePosition utility
  - Use AnnotationBadge component
  - Keep only orchestration logic

#### Refactor AnnotationPopover

- [ ] **Create PopoverForm component**
  - File: `packages/src/ui/Core/components/popover/PopoverForm.tsx`
  - Lines: 60-80
  - Props: Form-related props
  - Uses: FormField, TextArea, ActionButton
  - Story: `src/stories/PopoverForm.stories.tsx`

- [ ] **Refactor AnnotationPopover.tsx (267 → 80-100 lines)**
  - Use PopoverHeader
  - Use PopoverForm
  - Use useElementPosition hook
  - Use useFormKeyboardShortcuts hook
  - Keep only state management and position logic

#### Refactor ElementHighlight

- [ ] **Refactor ElementHighlight.tsx (223 → 80-100 lines)**
  - Use findElement utility
  - Use useElementPosition or useElementVisibility hook
  - Extract highlight rendering to smaller component if needed
  - Keep only state management

#### Testing

- [ ] **Write E2E tests for AnnotationBadges**
  - Test badge positioning
  - Test badge grouping
  - Test visibility with scroll
  - Test click behavior

- [ ] **Write E2E tests for AnnotationPopover**
  - Test positioning
  - Test form submission
  - Test keyboard shortcuts
  - Test scroll behavior

- [ ] **Write E2E tests for ElementHighlight**
  - Test highlight positioning
  - Test visibility
  - Test with page changes

### Week 8: Manager and List Components

#### Refactor AnnotationManager

- [ ] **Create AnnotationManagerHeader component**
  - File: `packages/src/ui/Developer/components/AnnotationManagerHeader.tsx`
  - Lines: 30-40
  - Props: `title: string`, `filters: FilterOptions`, `onFiltersChange`, `availablePages: string[]`
  - Uses: AnnotationFilters
  - Story: `src/stories/AnnotationManagerHeader.stories.tsx`

- [ ] **Create AnnotationListView component**
  - File: `packages/src/ui/Developer/components/AnnotationListView.tsx`
  - Lines: 40-50
  - Props: `annotations: Annotation[]`, `onAnnotationClick`, `emptyMessage: string`
  - Uses: AnnotationItem, EmptyState
  - Story: `src/stories/AnnotationListView.stories.tsx`

- [ ] **Refactor AnnotationManager.tsx (225 → 80-100 lines)**
  - Use AnnotationManagerHeader
  - Use AnnotationListView
  - Use LoadingState
  - Use ErrorDisplay
  - Use useAnnotationNavigation hook
  - Keep only state management and filter logic

#### Refactor AnnotationList

- [ ] **Create AnnotationListItem component**
  - File: `packages/src/ui/Client/components/AnnotationListItem.tsx`
  - Lines: 40-50
  - Props: `annotation: Annotation`, `onClick`
  - Uses: AnnotationHeader, AnnotationMeta
  - Story: `src/stories/AnnotationListItem.stories.tsx`

- [ ] **Refactor AnnotationList.tsx (217 → 80-100 lines)**
  - Use AnnotationListItem
  - Use LoadingState
  - Use ErrorDisplay
  - Use EmptyState
  - Use useAnnotationNavigation hook
  - Keep only state management

#### Refactor DevCaddy

- [ ] **Create DevCaddyToolbar component**
  - File: `packages/src/ui/Core/components/toolbar/DevCaddyToolbar.tsx`
  - Lines: 30-40
  - Props: `onAddAnnotation: () => void`
  - Story: `src/stories/DevCaddyToolbar.stories.tsx`

- [ ] **Extract DevCaddyContent component**
  - File: `packages/src/ui/Core/DevCaddyContent.tsx`
  - Lines: 80-100
  - Move inner component from DevCaddy.tsx (line 25)

- [ ] **Extract DevCaddyWithBadges component**
  - File: `packages/src/ui/Core/DevCaddyWithBadges.tsx`
  - Lines: 40-50
  - Move wrapper component from DevCaddy.tsx (line 159)

- [ ] **Refactor DevCaddy.tsx (225 → 60-80 lines)**
  - Use DevCaddyToolbar
  - Use DevCaddyContent
  - Use DevCaddyWithBadges
  - Keep only orchestration and mode detection

#### Refactor AuthPrompt

- [ ] **Create AuthPromptForm component**
  - File: `packages/src/ui/Core/components/auth/AuthPromptForm.tsx`
  - Lines: 50-60
  - Props: Email form props
  - Uses: FormField, ActionButton
  - Story: `src/stories/AuthPromptForm.stories.tsx`

- [ ] **Create AuthPromptSuccess component**
  - File: `packages/src/ui/Core/components/auth/AuthPromptSuccess.tsx`
  - Lines: 40-50
  - Props: Success state props
  - Story: `src/stories/AuthPromptSuccess.stories.tsx`

- [ ] **Refactor AuthPrompt.tsx (183 → 60-80 lines)**
  - Use AuthPromptForm
  - Use AuthPromptSuccess
  - Keep only state management and modal logic

#### Testing

- [ ] **Write E2E tests for AnnotationManager**
  - Test list display
  - Test filtering
  - Test navigation
  - Test annotation selection

- [ ] **Write E2E tests for AnnotationList**
  - Test list display
  - Test navigation
  - Test annotation selection

- [ ] **Write E2E tests for DevCaddy**
  - Test mode switching
  - Test add annotation flow
  - Test window toggle

- [ ] **Write E2E tests for AuthPrompt**
  - Test form submission
  - Test validation
  - Test success state

- [ ] **Verify all workflows**
  - Create annotation (developer mode)
  - Create annotation (client mode)
  - Edit annotation
  - Delete annotation
  - Filter annotations
  - Navigate between pages
  - Real-time sync

### Phase 6 Completion Criteria

- [ ] All components under 250 lines
- [ ] Zero duplication of logic
- [ ] All E2E tests pass
- [ ] No regressions in functionality
- [ ] Visual appearance unchanged

---

## Final Verification

### Code Quality Checks

- [ ] **Run linter on all new files**
- [ ] **Fix all TypeScript errors**
- [ ] **Fix all ESLint warnings**
- [ ] **Verify all exports in index files**
- [ ] **Verify no unused imports**
- [ ] **Verify all components have proper TypeScript interfaces**

### Testing

- [ ] **All Storybook stories load without errors**
- [ ] **Visual regression tests pass**
- [ ] **All E2E tests pass**
- [ ] **No console errors in development**
- [ ] **Test in both developer and client modes**

### Documentation

- [ ] **Update CLAUDE.md with new component structure**
- [ ] **Update COMPONENT-BREAKDOWN-PLAN.md status**
- [ ] **Document new hooks in inline JSDoc**
- [ ] **Document new components in inline JSDoc**
- [ ] **Update IMPLEMENTATION.md if needed**

### Build Verification

- [ ] **Run `npm run build` - succeeds**
- [ ] **Verify bundle size unchanged or smaller**
- [ ] **Verify no new dependencies added**
- [ ] **Test in example app**

### Metrics Verification

- [ ] **All components under 250 lines** ✅
- [ ] **Zero duplication of logic** ✅
- [ ] **30+ atomic components created** ✅
- [ ] **8+ utilities extracted** ✅
- [ ] **5+ custom hooks created** ✅
- [ ] **~19% reduction in total lines** ✅

---

## Rollback Plan

If any phase encounters critical issues:

1. **Revert to previous commit** (each phase should be a separate commit)
2. **Document the issue** in this file
3. **Create GitHub issue** for tracking
4. **Discuss solution** before retrying
5. **Update plan** based on learnings

---

## Notes and Learnings

### Phase 1 Notes
<!-- Add notes here during Phase 1 implementation -->

### Phase 2 Notes
<!-- Add notes here during Phase 2 implementation -->

### Phase 3 Notes
<!-- Add notes here during Phase 3 implementation -->

### Phase 4 Notes
<!-- Add notes here during Phase 4 implementation -->

### Phase 5 Notes
<!-- Add notes here during Phase 5 implementation -->

### Phase 6 Notes
<!-- Add notes here during Phase 6 implementation -->

---

**Last Updated:** 2025-11-13
**Status:** Not Started
**Next Action:** Review and approve plan, then begin Phase 1
