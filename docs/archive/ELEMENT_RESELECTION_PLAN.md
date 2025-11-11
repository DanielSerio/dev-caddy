# Element Reselection and Highlighting - Implementation Plan

## Feasibility Assessment

**Status:** ✅ **FEASIBLE - Recommended to Proceed**

**Success Probability:** 85-90%

This plan is based on proven technologies and patterns used by browser devtools, Selenium/Playwright, and visual regression tools. The multi-layered selector strategy provides robust fallback mechanisms for element reselection.

**Expected Reselection Success Rate:** 80-95%
- ✅ Elements with stable IDs, test-ids, or predictable structure
- ⚠️ May fail for heavily dynamic content or removed elements
- ❌ Known limitations: Cross-origin iframes, closed shadow DOM

**Key Challenges Identified:**
1. Badge positioning with CSS transforms - Solvable with alternative approach
2. Performance with 100+ annotations - Solvable with batching/Intersection Observer
3. SPA route changes - Solvable with history API hooks
4. Dynamic React re-renders - Solvable with MutationObserver

All challenges have known solutions. See "Technical Considerations" section for details.

---

## Problem Statement

Currently, DevCaddy stores comprehensive selector data for annotated elements, but **does not implement any functionality to reselect those elements when annotations are loaded**. Users cannot:

1. See which elements on the page have annotations
2. Click an annotation to jump to/highlight the element
3. Visually identify annotated elements

## Current State

### What We Store (✅ Good Foundation)

```typescript
interface Annotation {
  element_tag: string;                    // "BUTTON"
  compressed_element_tree: string;        // "body>DIV[0]>MAIN[1]>BUTTON[2]"
  element_id: string | null;              // "submit-btn"
  element_test_id: string | null;         // "checkout-button"
  element_role: string | null;            // "button"
  element_unique_classes: string | null;  // "btn btn-primary submit"
  element_parent_selector: string | null; // "FORM#checkout-form"
  element_nth_child: number | null;       // 2
}
```

### What's Missing (❌ Need to Implement)

1. **Element reselection function** - Takes annotation data → finds element on page
2. **Selector strategy** - Tries multiple approaches in priority order
3. **Visual indicators** - Highlights annotated elements on the page
4. **Click-to-navigate** - Click annotation → scroll to and highlight element
5. **Stale element detection** - Detect when elements can't be found (page changed)

---

## Implementation Plan

### Phase 1: Core Reselection Logic

#### 1.1 Create Selector Strategy Function

**File:** `packages/src/ui/lib/selector/reselect-element.ts`

**Purpose:** Implement fallback strategy to find elements using stored selector data

**Strategy Priority (ordered):**

```typescript
/**
 * Tries multiple selector strategies in priority order:
 * 1. ID selector (most stable)
 * 2. data-test-id selector (stable, semantic)
 * 3. Compressed tree path (handles dynamic content)
 * 4. Parent selector + nth-child (structural)
 * 5. Tag + unique classes + nth-child (less stable)
 */
function reselectElement(annotation: Annotation): Element | null {
  // Try each strategy, return first match
}
```

**Key Functions:**

```typescript
// Try to select by ID
function trySelectById(id: string, tag: string): Element | null

// Try to select by data-test-id
function trySelectByTestId(testId: string, tag: string): Element | null

// Try to select using compressed tree path
// e.g., "body>DIV[0]>MAIN[1]>BUTTON[2]"
function trySelectByCompressedTree(tree: string): Element | null

// Try parent selector + nth-child
function trySelectByParentAndNth(
  parentSelector: string,
  tag: string,
  nth: number
): Element | null

// Try tag + classes + nth-child (last resort)
function trySelectByClasses(
  tag: string,
  classes: string,
  nth: number
): Element | null

// Validate that the selected element matches expected characteristics
function validateElement(
  element: Element,
  annotation: Annotation
): boolean
```

**Return Type:**

```typescript
interface ReselectionResult {
  element: Element | null;
  confidence: 'high' | 'medium' | 'low' | 'not-found';
  method: 'id' | 'test-id' | 'tree' | 'parent-nth' | 'classes' | 'none';
  isStale: boolean; // true if element characteristics don't match
}
```

#### 1.2 Compressed Tree Parser

**Purpose:** Parse and execute compressed tree selectors

**Example:**
```
Input:  "body>DIV[0]>MAIN[1]>BUTTON[2]"
Output: document.body.children[0].children[1].children[2]
```

**Algorithm:**
1. Split by `>`
2. For each segment, parse `TAG[INDEX]`
3. Walk down the DOM tree
4. Return final element or null if path breaks

**Edge Cases:**
- Handle missing indices (element was removed)
- Handle changed indices (elements inserted/removed)
- Handle changed tag names (unlikely but possible)

---

### Phase 2: Visual Indicators

#### 2.1 Annotation Markers/Badges

**Feature:** Show color-coded badges on elements that have annotations, grouped by status

**Design Approach:**

Each status gets its own badge, so an element with:
- 2 "new" annotations
- 1 "in-progress" annotation
- 3 "resolved" annotations

Would display **3 separate badges** (one per status), each color-coded and showing the count.

**Badge Structure:**
```html
<div class="dev-caddy-badge-group" data-element-id="...">
  <div class="dev-caddy-badge badge-status-new" data-status="new" data-count="2">
    2
  </div>
  <div class="dev-caddy-badge badge-status-in-progress" data-status="in-progress" data-count="1">
    1
  </div>
  <div class="dev-caddy-badge badge-status-resolved" data-status="resolved" data-count="3">
    3
  </div>
</div>
```

**Status Color Scheme:**
```typescript
const STATUS_COLORS = {
  'new': '#ef4444',           // Red - needs attention
  'in-progress': '#f59e0b',   // Orange - being worked on
  'in-review': '#8b5cf6',     // Purple - awaiting review
  'hold': '#6b7280',          // Gray - paused/blocked
  'resolved': '#10b981',      // Green - completed
};
```

**Badge Layout:**

Badges are stacked vertically in the top-right corner of the element:

```
┌─────────────────────┐
│ Element Content  [2]│ ← Red badge (new)
│                  [1]│ ← Orange badge (in-progress)
│                  [3]│ ← Green badge (resolved)
└─────────────────────┘
```

**CSS Requirements:**
```scss
.dev-caddy-badge-group {
  position: absolute;
  top: -8px;
  right: -8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  z-index: 9999;
  pointer-events: auto;
}

.dev-caddy-badge {
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 600;
  color: white;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.15);
  }

  // Status-specific colors
  &.badge-status-new {
    background: #ef4444;
  }

  &.badge-status-in-progress {
    background: #f59e0b;
  }

  &.badge-status-in-review {
    background: #8b5cf6;
  }

  &.badge-status-hold {
    background: #6b7280;
  }

  &.badge-status-resolved {
    background: #10b981;
  }
}
```

**Badge Click Behavior:**

When a badge is clicked:
1. Open DevCaddy window (if not already open)
2. Filter annotation list to show only annotations for:
   - This specific element
   - This specific status (the badge that was clicked)

Example: Clicking the orange badge (in-progress) shows only in-progress annotations for that element.

**Positioning Strategy:**

**Recommended Approach: Wrapper with Relative Positioning**

Instead of using `position: fixed` with constant position updates, attach badges as siblings within a wrapper:

```typescript
function positionBadgeGroup(element: Element, badgeGroup: HTMLElement) {
  // 1. Skip inline elements (no layout box)
  const computedStyle = window.getComputedStyle(element);
  if (computedStyle.display === 'inline' || computedStyle.display === 'contents') {
    console.warn('[DevCaddy] Cannot badge inline element:', element);
    return null;
  }

  // 2. Create wrapper with relative positioning
  const wrapper = document.createElement('div');
  wrapper.className = 'dev-caddy-badge-wrapper';
  wrapper.setAttribute('data-dev-caddy', 'true');
  wrapper.style.position = 'relative';
  wrapper.style.display = 'inline-block'; // Preserve element sizing

  // 3. Insert wrapper before element and move element inside
  element.parentNode?.insertBefore(wrapper, element);
  wrapper.appendChild(element);

  // 4. Position badge group absolute within wrapper
  badgeGroup.style.position = 'absolute';
  badgeGroup.style.top = '-8px';
  badgeGroup.style.right = '-8px';
  badgeGroup.style.zIndex = '9999';

  wrapper.appendChild(badgeGroup);

  return wrapper;
}
```

**Benefits:**
- ✅ Badges automatically scroll with elements (no position updates needed)
- ✅ Badges inherit CSS transforms from element
- ✅ No need to listen to scroll/resize events
- ✅ Simpler implementation, better performance
- ✅ Works with sticky/fixed positioning

**Trade-off:**
- ⚠️ Adds wrapper div to DOM (minimal impact)
- ⚠️ Could affect CSS selectors like `:first-child` (rare edge case)

**Alternative (if wrapper causes issues):**
Fall back to `position: fixed` with debounced position updates on scroll

#### 2.2 Highlight on Hover/Click

**Feature:** Temporarily highlight element when hovering/clicking annotation in list

**Implementation:**
```typescript
function highlightElement(element: Element, duration?: number): void {
  // Add highlight class
  element.classList.add('dev-caddy-highlight');

  // Scroll into view (smooth)
  element.scrollIntoView({ behavior: 'smooth', block: 'center' });

  // Remove after duration (default: 3s)
  setTimeout(() => {
    element.classList.remove('dev-caddy-highlight');
  }, duration || 3000);
}
```

**CSS:**
```scss
.dev-caddy-highlight {
  outline: 3px solid var(--dev-caddy-highlight-color) !important;
  outline-offset: 2px;
  animation: pulse 0.5s ease-in-out 3;
}

@keyframes pulse {
  0%, 100% { outline-color: var(--dev-caddy-highlight-color); }
  50% { outline-color: transparent; }
}
```

---

### Phase 3: UI Integration

#### 3.1 Annotation List Enhancements

**File:** `packages/src/ui/Client/AnnotationList.tsx` & `packages/src/ui/Developer/AnnotationManager.tsx`

**Changes:**

1. **Add "Jump to Element" button** on each annotation item
2. **Show element status** (found/not-found/stale)
3. **Hover preview** - Highlight element on hover
4. **Click handler** - Scroll to and highlight element

**UI Mockup:**
```tsx
<div className="annotation-item">
  <div className="annotation-header">
    <span className="annotation-element-tag">Button</span>
    <span className={`annotation-status-indicator ${elementStatus}`}>
      {elementStatus === 'found' ? '✓' : '⚠️'}
    </span>
  </div>
  <p>{annotation.content}</p>
  <button
    onClick={() => jumpToElement(annotation)}
    disabled={elementStatus === 'not-found'}
  >
    Jump to Element →
  </button>
</div>
```

#### 3.2 Context Provider Enhancement

**File:** `packages/src/ui/context/AnnotationContext.tsx`

**Add new state and functions:**

```typescript
interface AnnotationContextValue {
  // ... existing fields ...

  // New fields for reselection
  elementMap: Map<number, ReselectionResult>; // annotation.id → element
  refreshElementMap: () => void;
  highlightElement: (annotationId: number) => void;
  jumpToElement: (annotationId: number) => void;
}
```

**⚠️ Backward Compatibility Note:**

These new fields are **additive and backward compatible**. They do not modify or remove any existing fields from the `AnnotationContextValue` interface. Components that currently use the context will continue to work without modification. The new fields are optional and will only be used by new badge-related components.

**Migration Strategy:**
1. Add new fields to interface with proper TypeScript typing
2. Initialize new fields with sensible defaults (empty Map, no-op functions initially)
3. Implement functionality incrementally without breaking existing features
4. Existing components (AnnotationList, AnnotationManager) continue to work unchanged

**Implementation:**
```typescript
// On annotations load/update:
useEffect(() => {
  const map = new Map<number, ReselectionResult>();

  annotations.forEach(annotation => {
    const result = reselectElement(annotation);
    map.set(annotation.id, result);
  });

  setElementMap(map);
}, [annotations]);
```

#### 3.3 Page Load Behavior

**When DevCaddy initializes:**

1. Fetch all annotations for current page
2. Attempt to reselect each element
3. Group annotations by element and status
4. Render status-specific badges on found elements
5. Log warnings for not-found elements

**Hook:**
```typescript
function useAnnotationMarkers(annotations: Annotation[]) {
  useEffect(() => {
    // Reselect all elements and group by element
    const elementGroups = new Map<Element, Annotation[]>();

    annotations.forEach(annotation => {
      const result = reselectElement(annotation);
      if (result.element) {
        const existing = elementGroups.get(result.element) || [];
        elementGroups.set(result.element, [...existing, annotation]);
      }
    });

    // Render badge groups for each element
    elementGroups.forEach((annotationsForElement, element) => {
      renderBadgeGroup(element, annotationsForElement);
    });

    // Cleanup on unmount
    return () => {
      removeAllBadgeGroups();
    };
  }, [annotations]);
}

function renderBadgeGroup(element: Element, annotations: Annotation[]) {
  // Group annotations by status
  const statusGroups = annotations.reduce((acc, annotation) => {
    const statusName = getStatusName(annotation.status_id);
    acc[statusName] = (acc[statusName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Create badge group container
  const badgeGroup = document.createElement('div');
  badgeGroup.className = 'dev-caddy-badge-group';
  badgeGroup.setAttribute('data-dev-caddy', 'true');

  // Create individual status badges
  Object.entries(statusGroups).forEach(([status, count]) => {
    const badge = document.createElement('div');
    badge.className = `dev-caddy-badge badge-status-${status}`;
    badge.setAttribute('data-status', status);
    badge.setAttribute('data-count', count.toString());
    badge.textContent = count.toString();

    // Click handler: open DevCaddy and filter to this element + status
    badge.addEventListener('click', (e) => {
      e.stopPropagation();
      handleBadgeClick(element, status);
    });

    badgeGroup.appendChild(badge);
  });

  // Position and attach badge group
  positionBadgeGroup(element, badgeGroup);
}
```

#### 3.4 Badge Grouping Logic

**Data Structure:**

Annotations need to be grouped in two dimensions:
1. By **element** (which DOM element has annotations)
2. By **status** (within an element, group by status)

```typescript
// Step 1: Group annotations by element
type ElementAnnotationMap = Map<Element, Annotation[]>;

// Step 2: Within each element, group by status
type StatusCountMap = Record<AnnotationStatusName, number>;

// Example result:
{
  <button#submit>: {
    'new': 2,           // 2 new annotations
    'in-progress': 1,   // 1 in-progress annotation
    'resolved': 3       // 3 resolved annotations
  },
  <div.card>: {
    'new': 1,           // 1 new annotation
    'in-review': 2      // 2 in-review annotations
  }
}
```

**Grouping Algorithm:**

```typescript
interface BadgeGroupData {
  element: Element;
  statusCounts: Record<AnnotationStatusName, number>;
  annotationsByStatus: Record<AnnotationStatusName, Annotation[]>;
}

function groupAnnotationsByElement(
  annotations: Annotation[]
): BadgeGroupData[] {
  const elementMap = new Map<Element, Annotation[]>();

  // Step 1: Reselect and group by element
  annotations.forEach(annotation => {
    const result = reselectElement(annotation);
    if (result.element) {
      const existing = elementMap.get(result.element) || [];
      elementMap.set(result.element, [...existing, annotation]);
    }
  });

  // Step 2: For each element, group annotations by status
  const badgeGroups: BadgeGroupData[] = [];

  elementMap.forEach((elementAnnotations, element) => {
    const statusCounts: Record<string, number> = {};
    const annotationsByStatus: Record<string, Annotation[]> = {};

    elementAnnotations.forEach(annotation => {
      const statusName = getStatusName(annotation.status_id);
      statusCounts[statusName] = (statusCounts[statusName] || 0) + 1;

      if (!annotationsByStatus[statusName]) {
        annotationsByStatus[statusName] = [];
      }
      annotationsByStatus[statusName].push(annotation);
    });

    badgeGroups.push({
      element,
      statusCounts,
      annotationsByStatus,
    });
  });

  return badgeGroups;
}
```

**Badge Rendering Order:**

Badges should be rendered in a consistent order for visual clarity:

```typescript
const STATUS_ORDER: AnnotationStatusName[] = [
  'new',         // Red - most urgent (top)
  'in-progress', // Orange
  'in-review',   // Purple
  'hold',        // Gray
  'resolved'     // Green - least urgent (bottom)
];

// Sort status entries by priority
Object.entries(statusCounts)
  .sort(([a], [b]) => {
    return STATUS_ORDER.indexOf(a as AnnotationStatusName) -
           STATUS_ORDER.indexOf(b as AnnotationStatusName);
  })
  .forEach(([status, count]) => {
    // Render badge...
  });
```

---

### Phase 4: Stale Element Detection

#### 4.1 Element Validation

**Purpose:** Detect when an element was found but characteristics changed (stale)

**Validation Checks:**
```typescript
function validateElement(element: Element, annotation: Annotation): boolean {
  // Tag name must match
  if (element.tagName !== annotation.element_tag) return false;

  // If we stored an ID, it should still have that ID
  if (annotation.element_id && element.id !== annotation.element_id) {
    return false;
  }

  // If we stored a test-id, it should still match
  if (annotation.element_test_id) {
    const testId = element.getAttribute('data-test-id');
    if (testId !== annotation.element_test_id) return false;
  }

  // Role should match if stored
  if (annotation.element_role) {
    const role = element.getAttribute('role');
    if (role !== annotation.element_role) return false;
  }

  return true; // Validation passed
}
```

#### 4.2 User Notification

**For stale/not-found elements:**

1. Show warning badge in annotation list
2. Display message: "Element may have changed or been removed"
3. Offer "Update Selector" button (future enhancement)
4. Offer "Delete Annotation" option

---

### Phase 5: Performance Optimization

#### 5.1 Caching Strategy

**Problem:** Re-running selectors on every render is expensive

**Solution:**
```typescript
// Cache reselection results
const elementCache = new Map<string, WeakRef<Element>>();

function getCachedElement(annotation: Annotation): Element | null {
  const cacheKey = `${annotation.id}-${annotation.updated_at}`;
  const weakRef = elementCache.get(cacheKey);

  if (weakRef) {
    const element = weakRef.deref();
    if (element && document.contains(element)) {
      return element; // Cache hit
    }
  }

  // Cache miss - reselect
  const result = reselectElement(annotation);
  if (result.element) {
    elementCache.set(cacheKey, new WeakRef(result.element));
  }

  return result.element;
}
```

#### 5.2 Debounced Updates

**On scroll/resize:**
```typescript
const debouncedRefresh = useDebouncedCallback(() => {
  refreshElementMap();
}, 300);

useEffect(() => {
  window.addEventListener('scroll', debouncedRefresh);
  window.addEventListener('resize', debouncedRefresh);

  return () => {
    window.removeEventListener('scroll', debouncedRefresh);
    window.removeEventListener('resize', debouncedRefresh);
  };
}, []);
```

#### 5.3 Intersection Observer for Badges

**Only render badges for visible elements:**

```typescript
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      renderBadge(entry.target);
    } else {
      hideBadge(entry.target);
    }
  });
});
```

---

### Phase 6: Dynamic Content & React Re-renders

#### 6.1 MutationObserver for DOM Changes

**Problem:** React re-renders replace DOM nodes, breaking element references and badge positioning.

**Solution:** Use MutationObserver to detect DOM mutations and re-render badges

```typescript
function observeDOMChanges() {
  const observer = new MutationObserver((mutations) => {
    // Check if any mutations affected annotated elements
    const affectedElements = new Set<Element>();

    mutations.forEach(mutation => {
      // Element removed
      if (mutation.type === 'childList' && mutation.removedNodes.length > 0) {
        mutation.removedNodes.forEach(node => {
          if (node instanceof Element) {
            // Check if this element or its children have badges
            const badges = node.querySelectorAll('[data-dev-caddy-badge]');
            badges.forEach(badge => affectedElements.add(badge));
          }
        });
      }

      // Element attributes changed (class, id, etc.)
      if (mutation.type === 'attributes' && mutation.target instanceof Element) {
        const wrapper = mutation.target.closest('.dev-caddy-badge-wrapper');
        if (wrapper) {
          affectedElements.add(mutation.target);
        }
      }
    });

    // Re-render badges for affected elements
    if (affectedElements.size > 0) {
      debouncedRefreshBadges(Array.from(affectedElements));
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['class', 'id', 'data-test-id'],
  });

  return () => observer.disconnect();
}
```

**Debouncing Strategy:**
```typescript
const debouncedRefreshBadges = debounce((elements: Element[]) => {
  // Re-select annotations for affected elements
  elements.forEach(element => {
    const annotations = findAnnotationsForElement(element);
    if (annotations.length > 0) {
      renderBadgeGroup(element, annotations);
    }
  });
}, 300); // 300ms debounce to batch rapid changes
```

**Performance Considerations:**
- ⚠️ MutationObserver can fire frequently on dynamic pages
- ✅ Debouncing reduces badge re-renders to ~3-4 per second max
- ✅ Only observe elements with badges (not entire DOM)
- ✅ Use `attributeFilter` to limit observation scope

#### 6.2 Handling SPA Route Changes

**Problem:** Single Page Applications change routes without page reloads, leaving stale badges.

**Solution:** Hook into browser history API

```typescript
function setupSPARouteDetection() {
  // Handle browser back/forward
  window.addEventListener('popstate', handleRouteChange);

  // Hook into history.pushState (used by React Router, etc.)
  const originalPushState = history.pushState;
  history.pushState = function(...args) {
    originalPushState.apply(history, args);
    handleRouteChange();
  };

  // Hook into history.replaceState
  const originalReplaceState = history.replaceState;
  history.replaceState = function(...args) {
    originalReplaceState.apply(history, args);
    handleRouteChange();
  };

  function handleRouteChange() {
    // Clean up all current badges
    removeAllBadgeGroups();

    // AnnotationProvider will automatically refetch for new page
    // (already implemented via pageUrl prop)
  }

  // Cleanup
  return () => {
    window.removeEventListener('popstate', handleRouteChange);
    history.pushState = originalPushState;
    history.replaceState = originalReplaceState;
  };
}
```

**Integration with AnnotationProvider:**
The `AnnotationProvider` already accepts a `pageUrl` prop and refetches when it changes. This hook ensures badges are cleaned up before new ones render.

---

## Implementation Order

### MVP (Minimum Viable Product) - RECOMMENDED START

**Goal:** Prove the concept with minimal features

**Priority:** HIGH - Validate approach before building everything

**Scope:**
1. ✅ Create `reselectElement()` function with ID + test-id + tree strategies (Phase 1.1)
2. ✅ Implement wrapper-based badge positioning (Phase 2.1 - improved approach)
3. ✅ Render color-coded badges grouped by status (Phase 2.1)
4. ✅ Add `jumpToElement()` functionality (Phase 3.1)
5. ✅ Show element status (found/not-found) in annotation list (Phase 3.1)
6. ✅ Basic badge click to filter (Phase 3.3)

**Estimated:** 6-8 hours

**Success Criteria:**
- 80%+ annotations successfully reselected
- Badges render correctly on static elements
- Jump-to-element works smoothly
- No performance issues with <50 annotations

**Out of Scope for MVP:**
- ❌ Shadow DOM support
- ❌ MutationObserver for dynamic content
- ❌ Intersection Observer optimization
- ❌ Badge collision detection
- ❌ Accessibility features

### Enhancement 1: Dynamic Content Support

**Goal:** Handle React re-renders and SPA routing

**Priority:** HIGH - Critical for real-world React apps

**Scope:**
1. ✅ Implement MutationObserver (Phase 6.1)
2. ✅ Hook into history API for SPA routes (Phase 6.2)
3. ✅ Badge cleanup on unmount
4. ✅ Re-render badges when elements change

**Estimated:** 4-5 hours

### Enhancement 2: Performance & Robustness

**Goal:** Scale to 100+ annotations

**Priority:** MEDIUM - Needed for larger projects

**Scope:**
1. ✅ Implement all fallback selector strategies (Phase 1.1)
2. ✅ Add element validation (Phase 4.1)
3. ✅ Implement Intersection Observer (Phase 5.3)
4. ✅ Add batch reselection (Phase 5)
5. ✅ Stale element detection and warnings (Phase 4.2)

**Estimated:** 5-6 hours

### Enhancement 3: Polish & Edge Cases

**Goal:** Handle rare scenarios and improve UX

**Priority:** LOW - Nice to have, not critical

**Scope:**
1. ✅ Shadow DOM support (Phase 1.1 + new section)
2. ✅ Badge collision detection (Phase 2.1)
3. ✅ Accessibility features (Phase 6 - new)
4. ✅ Error boundaries (Phase 3.3)
5. ✅ Loading states (Phase 3.3)

**Estimated:** 4-5 hours

**Total Estimated Time:**
- MVP: 6-8 hours
- With Enhancement 1: 10-13 hours
- With Enhancement 2: 15-19 hours
- Full implementation: 19-24 hours (~3 work days)

---

## Technical Considerations

### Real-World Examples & Validation

**Similar Tools That Use This Approach:**

1. **Chrome DevTools** - Reselects elements for inspection across page refreshes
   - Uses computed XPath + CSS selectors
   - 95%+ success rate for static elements

2. **Selenium/Playwright** - Automated testing frameworks
   - Multi-strategy selector (ID → CSS → XPath)
   - Proven to work reliably for UI testing

3. **Visual Regression Tools** (Percy, Chromatic)
   - Track DOM elements across deployments
   - Use similar fallback selector strategies

4. **Browser Extensions** (Grammarly, LastPass)
   - Inject UI overlays that track elements
   - Use `position: fixed` or wrapper elements

**Our approach combines best practices from these proven tools.**

### Known Limitations

**Will NOT Work For:**
1. ❌ **Cross-origin iframes** - Security prevents DOM access
2. ❌ **Closed shadow DOM** - Inaccessible by design
3. ❌ **Dynamically generated IDs** - Elements with random IDs like `react-id-1234`
4. ❌ **Virtual scrolling** - Elements not in DOM until scrolled into view
5. ❌ **Canvas/WebGL content** - No DOM elements to select

**Recommended Action:**
Document these as known limitations in user-facing docs. Provide guidance:
- Use stable IDs/test-ids for important elements
- Avoid annotating virtualized list items
- Annotation success depends on DOM stability

### Selector Stability

**Most Stable → Least Stable:**
1. `element_id` - Unique, unlikely to change (if not auto-generated)
2. `element_test_id` - Semantic, stable for testing (best practice)
3. `compressed_element_tree` - Structural, breaks if DOM structure changes
4. `element_parent_selector + nth_child` - Breaks if siblings added/removed
5. `element_unique_classes` - Fragile (CSS classes change frequently)

**Expected Success Rates by Selector Type:**
- ID selector: ~95% (if IDs are stable)
- Test-id selector: ~90% (if using data-test-id pattern)
- Compressed tree: ~70-80% (depends on DOM stability)
- Parent + nth-child: ~60-70% (fragile to sibling changes)
- Classes only: ~40-50% (very fragile)

### Data Model Improvements (Optional)

Consider adding to schema:
```sql
-- Store a confidence score when annotation is created
selector_confidence VARCHAR(10) -- 'high', 'medium', 'low'

-- Store which selector method was most successful
selector_method VARCHAR(20) -- 'id', 'test-id', 'tree', etc.
```

This allows tracking which selectors work best over time.

### Browser Compatibility

- `Element.scrollIntoView({ behavior: 'smooth' })` - IE11 needs polyfill
- `WeakRef` - No IE11 support (use Map with manual cleanup)
- `IntersectionObserver` - IE11 needs polyfill

---

## Testing Strategy

### Unit Tests (Jest)

**File:** `packages/src/ui/lib/selector/reselect-element.test.ts`

Test cases:
```typescript
describe('reselectElement', () => {
  it('should select element by ID', () => {});
  it('should fallback to test-id if ID fails', () => {});
  it('should use compressed tree if no ID/test-id', () => {});
  it('should return null if element not found', () => {});
  it('should detect stale elements', () => {});
  it('should validate element characteristics', () => {});
});
```

### E2E Tests (Playwright)

**File:** `tests/e2e/element-reselection.spec.ts`

Test scenarios:
```gherkin
Feature: Element Reselection

Scenario: Annotated element is highlighted on page load
  Given I have created an annotation on a button
  When I refresh the page
  Then I should see a badge on the annotated button

Scenario: Click annotation to jump to element
  Given I have an annotation on a button
  When I click "Jump to Element" in the annotation list
  Then the page should scroll to the button
  And the button should be highlighted for 3 seconds

Scenario: Stale element detection
  Given I have an annotation on a button with id="submit"
  When the button's id changes to "submit-new"
  And I refresh the page
  Then the annotation should show a "stale" warning
```

---

## Migration Path

### For Existing Annotations

**No migration needed** - All required selector data is already stored!

Just need to implement the reselection logic.

### For Future Annotations

Consider enhancing `getElementSelectors()` to:
1. Calculate and store a "confidence score"
2. Test multiple selectors and pick the best one
3. Store which selector method is most reliable

---

## Documentation Updates

Update the following files:

1. **packages/README.md** - Add "Element Highlighting" section
2. **docs/ARCHITECTURE.md** - Document selector strategy
3. **docs/DEVELOPMENT.md** - Add testing guidelines for reselection
4. **examples/simple/SETUP.md** - Mention visual indicators

---

## Open Questions

1. **Should badges be always visible or only when DevCaddy is open?**
   - Recommendation: Only when DevCaddy window is open (less intrusive)

2. ~~**How to handle multiple annotations on the same element?**~~ ✅ **ANSWERED**
   - Each status gets its own color-coded badge showing count
   - Badges are stacked vertically (red/orange/purple/gray/green)
   - Clicking a badge filters to that element + status

3. **What to do with stale annotations?**
   - Recommendation: Keep them, show warning, allow manual re-linking (future feature)

4. **Should we track reselection success rates?**
   - Recommendation: Yes, for post-MVP analytics (help improve selector strategy)

5. **Should badges be visible on elements marked as resolved?**
   - Recommendation: Yes, but with option to hide resolved badges in settings (post-MVP)

---

## Success Metrics

**MVP is successful if:**
- ✅ 90%+ of annotations can be reselected using stored data
- ✅ Click-to-navigate works smoothly (< 1s to scroll and highlight)
- ✅ Visual indicators render without performance issues (60fps)
- ✅ Stale elements are detected and flagged appropriately

**Post-MVP goals:**
- ✅ 95%+ reselection success rate with fallback strategies
- ✅ < 50ms average reselection time per annotation
- ✅ Intersection Observer reduces badge rendering by 70%+
