# Project-Wide Annotations Implementation Plan

**Status:** Planning Phase
**Created:** 2025-11-13
**Estimated Effort:** 10-15 hours

---

## Overview

Change DevCaddy from page-scoped to project-wide annotation viewing, allowing users to see all annotations across the entire application and navigate to annotations on other pages.

### Current State
- Users see only annotations for the current page
- Client mode filters to show only user's own annotations
- Real-time subscriptions are page-scoped
- SPA navigation detection re-loads annotations for new pages

### Target State
- Users see ALL annotations across the entire project
- Client mode shows all users' annotations (no user filtering)
- Real-time subscriptions receive all project updates
- Clicking an annotation on another page navigates to that page
- After navigation, element is highlighted and detail view opens

---

## Phase 1: Backend & API Changes

### 1.1 Update Client API Functions

**File:** `packages/src/client/api/annotations.ts`

**Changes:**
- Add new function: `getAllAnnotations()` - fetches all annotations (no page filter)
- Keep `getAnnotationsByPage(pageUrl)` for potential future use

**New Functions:**
```typescript
/**
 * Get all annotations for the entire project
 *
 * @returns Promise resolving to array of all annotations
 * @throws {Error} If fetch fails
 */
export async function getAllAnnotations(): Promise<Annotation[]> {
  const client = getSupabaseClient();

  const { data, error } = await client
    .from('annotation')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch annotations: ${error.message}`);
  }

  return data || [];
}
```

**Impact:** Minimal - additive changes, existing functions remain

---

### 1.2 Update Subscription Logic

**File:** `packages/src/client/api/subscriptions.ts`

**Changes:**
- Add new function: `subscribeToAllAnnotations(callback)` - subscribes to ALL annotation changes
- Channel name: `annotations:all` instead of `annotations:${normalizedUrl}`
- Filter removed - receive INSERT/UPDATE/DELETE for any page
- **Handle DELETE events** (currently not handled in callback)

**New Function:**
```typescript
/**
 * Subscribe to all annotation changes across the entire project
 *
 * @param callback - Function called when annotation changes (INSERT, UPDATE, DELETE)
 * @returns Unsubscribe function
 */
export function subscribeToAllAnnotations(
  callback: (payload: {
    eventType: 'INSERT' | 'UPDATE' | 'DELETE';
    annotation: Annotation | null;
    id: number | null;
  }) => void
): () => void {
  const client = getSupabaseClient();

  const channel = client
    .channel('annotations:all')
    .on(
      'postgres_changes',
      {
        event: '*', // Listen to INSERT, UPDATE, DELETE
        schema: 'public',
        table: 'annotation',
      },
      (payload) => {
        if (payload.eventType === 'DELETE') {
          // For DELETE, payload.old contains the deleted record
          callback({
            eventType: 'DELETE',
            annotation: null,
            id: payload.old.id,
          });
        } else {
          // For INSERT and UPDATE, payload.new contains the data
          callback({
            eventType: payload.eventType as 'INSERT' | 'UPDATE',
            annotation: payload.new as Annotation,
            id: null,
          });
        }
      }
    )
    .subscribe();

  return () => {
    channel.unsubscribe();
  };
}
```

**Considerations:**
- More real-time traffic (all changes, not just current page)
- Need to handle DELETE events properly (remove from state)
- Channel name change may require Supabase Realtime configuration check

---

## Phase 2: Context & State Management

### 2.1 Update AnnotationContext

**File:** `packages/src/ui/Core/context/AnnotationContext.tsx`

**Changes:**

1. **Remove page tracking state** (line 80)
   ```typescript
   // REMOVE:
   const [currentPage, setCurrentPage] = useState(pageUrl);
   ```

2. **Remove SPA navigation detection** (lines 85-115)
   ```typescript
   // REMOVE entire useEffect for URL change tracking
   useEffect(() => {
     const handleUrlChange = () => { ... };
     // ...
   }, [currentPage]);
   ```

3. **Update initial load** (line 128)
   ```typescript
   // BEFORE:
   const data = await getAnnotationsByPage(currentPage);

   // AFTER:
   const data = await getAllAnnotations();
   ```

4. **Update real-time subscription** (line 157-178)
   ```typescript
   // BEFORE:
   const unsubscribe = subscribeToAnnotations(
     currentPage,
     (annotation) => {
       setAnnotations((prev) => {
         const existingIndex = prev.findIndex((a) => a.id === annotation.id);
         if (existingIndex > -1) {
           const updated = [...prev];
           updated[existingIndex] = annotation;
           return updated;
         } else {
           return [annotation, ...prev];
         }
       });
     }
   );

   // AFTER:
   const unsubscribe = subscribeToAllAnnotations(({ eventType, annotation, id }) => {
     setAnnotations((prev) => {
       if (eventType === 'DELETE' && id) {
         // Remove deleted annotation
         return prev.filter((a) => a.id !== id);
       } else if (annotation) {
         // Handle INSERT and UPDATE
         const existingIndex = prev.findIndex((a) => a.id === annotation.id);
         if (existingIndex > -1) {
           // Update existing annotation
           const updated = [...prev];
           updated[existingIndex] = annotation;
           return updated;
         } else {
           // Add new annotation
           return [annotation, ...prev];
         }
       }
       return prev;
     });
   });
   ```

5. **Remove pageUrl from AnnotationProvider props** (line 56-58, 75-76)
   ```typescript
   // REMOVE pageUrl prop entirely
   interface AnnotationProviderProps {
     children: ReactNode;
     // REMOVED: pageUrl?: string;
   }

   export function AnnotationProvider({ children }: AnnotationProviderProps) {
     // REMOVED: pageUrl = typeof window !== 'undefined' ? window.location.pathname : ''
   }
   ```

6. **Update dependencies** (line 151, 178)
   ```typescript
   // BEFORE: }, [currentPage]);
   // AFTER: }, []); // No dependencies - load once on mount
   ```

**Impact:** Breaking change - loads all annotations on mount, no longer page-scoped

---

## Phase 3: Navigation System

### 3.1 Create Navigation Utility

**File:** `packages/src/ui/Core/utility/navigation.ts` (new file)

**Purpose:** Handle cross-page navigation and element highlighting

```typescript
import type { Annotation } from '../../../types/annotations';

/**
 * Navigate to annotation's page and highlight the element
 *
 * Uses sessionStorage to persist the annotation ID across page navigation.
 * After navigation, the app will check for pending annotation and highlight it.
 *
 * @param annotation - The annotation to navigate to
 *
 * @example
 * navigateToAnnotation(annotation); // Navigates to /products and highlights element
 */
export function navigateToAnnotation(annotation: Annotation): void {
  // Store annotation ID in sessionStorage for retrieval after navigation
  sessionStorage.setItem('devcaddy_pending_annotation', annotation.id.toString());

  // Navigate to the page (full page reload)
  window.location.pathname = annotation.page;

  // After navigation, the app will:
  // 1. Load all annotations
  // 2. Check sessionStorage for pending annotation
  // 3. Find the annotation by ID
  // 4. Highlight the element and show detail view
}

/**
 * Check for pending annotation after page load
 *
 * Should be called after annotations are loaded to check if there's a pending
 * annotation from cross-page navigation.
 *
 * @param annotations - All loaded annotations
 * @param onAnnotationFound - Callback when pending annotation is found
 *
 * @example
 * useEffect(() => {
 *   checkPendingAnnotation(annotations, (annotation) => {
 *     handleSelectAnnotation(annotation);
 *   });
 * }, [annotations]);
 */
export function checkPendingAnnotation(
  annotations: Annotation[],
  onAnnotationFound: (annotation: Annotation) => void
): void {
  const pendingId = sessionStorage.getItem('devcaddy_pending_annotation');

  if (!pendingId) return;

  const annotation = annotations.find(a => a.id === parseInt(pendingId, 10));

  if (annotation) {
    // Clear pending state
    sessionStorage.removeItem('devcaddy_pending_annotation');

    // Trigger annotation selection/highlight
    onAnnotationFound(annotation);
  }
}

/**
 * Check if annotation is on current page
 *
 * @param annotation - The annotation to check
 * @returns true if annotation is on current page
 */
export function isCurrentPage(annotation: Annotation): boolean {
  return annotation.page === window.location.pathname;
}
```

**Export from utility index:**
```typescript
// packages/src/ui/Core/utility/index.ts
export * from './sanitize';
export * from './navigation'; // ADD THIS
```

---

### 3.2 Integrate Navigation Check

**Files:** `AnnotationList.tsx` and `AnnotationManager.tsx`

**Changes:**

Add `useEffect` to check for pending annotation on mount:

```typescript
import { checkPendingAnnotation } from '../Core/utility/navigation';

// Inside component:
useEffect(() => {
  if (annotations.length > 0) {
    checkPendingAnnotation(annotations, (annotation) => {
      handleSelectAnnotation(annotation);
      // ElementHighlight component already scrolls element into view
    });
  }
}, [annotations]);
```

**When to trigger:** Only when `annotations` array first loads with data

---

## Phase 4: UI Component Updates

### 4.1 Update AnnotationList (Client Mode)

**File:** `packages/src/ui/Client/AnnotationList.tsx`

**Changes:**

1. **Remove user filtering** (lines 40-43)
   ```typescript
   // REMOVE:
   const userAnnotations = annotations.filter(
     (a) => a.created_by === currentUserId
   );

   // USE: annotations directly (no filtering)
   ```

2. **Update component title** (line 137)
   ```typescript
   // BEFORE:
   <h3>My Annotations ({userAnnotations.length})</h3>

   // AFTER:
   <h3>All Annotations ({annotations.length})</h3>
   ```

3. **Update empty state message** (line 128)
   ```typescript
   // BEFORE:
   <p className="empty-state">
     No annotations yet. Click "Add Annotation" to create your first one.
   </p>

   // AFTER:
   <p className="empty-state">
     No annotations in this project yet. Click "Add Annotation" to create the first one.
   </p>
   ```

4. **Add page display** (in annotation item - line 148-160)
   ```typescript
   <div className="annotation-header">
     <span className="annotation-element">
       {annotation.element_tag}
       {annotation.element_id && `#${annotation.element_id}`}
     </span>
     {/* ADD PAGE BADGE */}
     <span className="annotation-page-badge">
       {annotation.page === window.location.pathname ? (
         <span className="current-page-indicator">Current Page</span>
       ) : (
         <span className="other-page-indicator">{annotation.page}</span>
       )}
     </span>
     <span className={`annotation-status status-${getStatusName(annotation.status_id)}`}>
       {getStatusName(annotation.status_id)}
     </span>
   </div>
   ```

5. **Add navigation handler** (replace `onClick` - line 145)
   ```typescript
   import { navigateToAnnotation, isCurrentPage } from '../Core/utility/navigation';

   const handleAnnotationClick = (annotation: Annotation) => {
     if (!isCurrentPage(annotation)) {
       // Navigate to annotation's page
       navigateToAnnotation(annotation);
     } else {
       // Same page - just select
       handleSelectAnnotation(annotation);
     }
   };

   // Update onClick:
   <div
     key={annotation.id}
     className={`annotation-item status-${getStatusName(annotation.status_id)}`}
     onClick={() => handleAnnotationClick(annotation)}
     data-testid="annotation-list-item"
   >
   ```

6. **Add cross-page indicator icon** (visual cue for navigation)
   ```typescript
   {!isCurrentPage(annotation) && (
     <span className="cross-page-icon" title="Click to navigate to this page">
       →
     </span>
   )}
   ```

7. **Update iteration** (line 139)
   ```typescript
   // BEFORE: {userAnnotations.map((annotation) =>
   // AFTER: {annotations.map((annotation) =>
   ```

---

### 4.2 Update AnnotationManager (Developer Mode)

**File:** `packages/src/ui/Developer/AnnotationManager.tsx`

**Changes:**

1. **Add page filter to FilterOptions** (line 13-16)
   ```typescript
   interface FilterOptions {
     status: number | "all";
     author: string;
     page: string | "all"; // NEW
   }
   ```

2. **Update initial filter state** (line 43-46)
   ```typescript
   const [filters, setFilters] = useState<FilterOptions>({
     status: "all",
     author: "",
     page: "all", // NEW
   });
   ```

3. **Update filter logic** (line 54-70)
   ```typescript
   const filteredAnnotations = useMemo(() => {
     let filtered = [...annotations];

     // Filter by status
     if (filters.status !== "all") {
       filtered = filtered.filter((a) => a.status_id === filters.status);
     }

     // Filter by author
     if (filters.author) {
       filtered = filtered.filter((a) =>
         a.created_by.toLowerCase().includes(filters.author.toLowerCase())
       );
     }

     // NEW: Filter by page
     if (filters.page !== "all") {
       filtered = filtered.filter((a) => a.page === filters.page);
     }

     return filtered;
   }, [annotations, filters]);
   ```

4. **Get unique pages for filter dropdown** (add after filteredAnnotations)
   ```typescript
   const uniquePages = useMemo(() => {
     const pages = new Set(annotations.map(a => a.page));
     return Array.from(pages).sort();
   }, [annotations]);
   ```

5. **Add page filter UI** (in manager-filters div - after author filter)
   ```typescript
   <div className="filter-group">
     <label htmlFor="page-filter">Page:</label>
     <select
       id="page-filter"
       value={filters.page}
       onChange={(e) =>
         setFilters({ ...filters, page: e.target.value })
       }
     >
       <option value="all">All Pages</option>
       <option value={window.location.pathname}>Current Page</option>
       {uniquePages
         .filter(page => page !== window.location.pathname)
         .map(page => (
           <option key={page} value={page}>{page}</option>
         ))
       }
     </select>
   </div>
   ```

6. **Add page badge to annotation items** (same as AnnotationList - line 221-226)
   ```typescript
   <div className="annotation-header">
     <span className="annotation-element">
       {annotation.element_tag}
       {annotation.element_id && `#${annotation.element_id}`}
       {annotation.element_role && ` [${annotation.element_role}]`}
     </span>
     {/* ADD PAGE BADGE */}
     <span className="annotation-page-badge">
       {annotation.page === window.location.pathname ? (
         <span className="current-page-indicator">Current Page</span>
       ) : (
         <span className="other-page-indicator">{annotation.page}</span>
       )}
     </span>
     <span className={`annotation-status status-${getStatusName(annotation.status_id)}`}>
       {getStatusName(annotation.status_id)}
     </span>
   </div>
   ```

7. **Add navigation handler** (same as AnnotationList)
   ```typescript
   import { navigateToAnnotation, isCurrentPage } from '../Core/utility/navigation';

   const handleAnnotationClick = (annotation: Annotation) => {
     if (!isCurrentPage(annotation)) {
       navigateToAnnotation(annotation);
     } else {
       handleSelectAnnotation(annotation);
     }
   };

   // Update onClick (line 218):
   onClick={() => handleAnnotationClick(annotation)}
   ```

---

## Phase 5: Styling Updates

### 5.1 Add Page Badge Styles

**File:** `packages/src/ui/Core/styles/critical/_annotations.scss`

**Add new styles:**
```scss
// Page badges
.annotation-page-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 3px;

  .current-page-indicator {
    color: var(--dc-primary);
    font-weight: 500;
  }

  .other-page-indicator {
    color: var(--dc-text-muted);
    background-color: var(--dc-background-raised);
    padding: 2px 6px;
    border-radius: 3px;
  }
}

// Cross-page navigation icon
.cross-page-icon {
  display: inline-block;
  margin-left: 4px;
  color: var(--dc-text-muted);
  cursor: pointer;
  font-size: 14px;

  &:hover {
    color: var(--dc-primary);
  }
}

// Annotation item hover for cross-page navigation
.annotation-item {
  &.has-cross-page-nav {
    cursor: pointer;

    &:hover {
      border-left-color: var(--dc-primary);

      .cross-page-icon {
        color: var(--dc-primary);
      }
    }
  }
}
```

---

## Phase 6: Database & RLS Review

### 6.1 Review RLS Policies

**File:** `packages/migrations/002_rls_policies.sql`

**Current Policies:**
- ✅ Everyone can view ALL annotations (line ~12) - **No change needed**
- ✅ Developers can UPDATE/DELETE any annotation - **No change needed**
- ✅ Clients can UPDATE/DELETE own annotations - **No change needed**
- ✅ Clients can INSERT annotations - **No change needed**

**Verdict:** No RLS changes needed - current policies already support project-wide viewing

---

## Phase 7: Testing Plan

### 7.1 Manual Testing Scenarios

**Scenario 1: View All Annotations**
- [ ] Open DevCaddy in client mode
- [ ] Verify all annotations from all pages are visible
- [ ] Verify annotations from other users are visible
- [ ] Verify page badges show correct page paths

**Scenario 2: Cross-Page Navigation (Same Page)**
- [ ] Click annotation on current page
- [ ] Verify detail view opens without navigation
- [ ] Verify element highlights correctly

**Scenario 3: Cross-Page Navigation (Different Page)**
- [ ] Click annotation on different page
- [ ] Verify page navigates to annotation's page
- [ ] Verify element highlights after navigation
- [ ] Verify detail view opens automatically
- [ ] Verify sessionStorage is cleared after navigation

**Scenario 4: Real-Time Updates**
- [ ] Open DevCaddy on two different pages
- [ ] Create annotation on page A
- [ ] Verify annotation appears on page B immediately
- [ ] Update annotation on page A
- [ ] Verify update appears on page B immediately
- [ ] Delete annotation on page A
- [ ] Verify annotation disappears on page B immediately

**Scenario 5: Developer Mode Filters**
- [ ] Open developer mode
- [ ] Verify page filter dropdown shows all unique pages
- [ ] Filter by specific page
- [ ] Verify only annotations for that page show
- [ ] Filter by "Current Page"
- [ ] Verify only current page annotations show
- [ ] Combine page filter with status filter
- [ ] Verify filters work together correctly

**Scenario 6: Edge Cases**
- [ ] Navigate to annotation that no longer exists (deleted)
- [ ] Verify graceful handling (no error, redirect to list)
- [ ] Navigate to annotation on page that 404s
- [ ] Verify browser handles 404 normally
- [ ] Open DevCaddy with 0 annotations
- [ ] Verify empty state message is correct
- [ ] Create first annotation
- [ ] Verify it appears immediately

**Scenario 7: Performance**
- [ ] Load project with 100+ annotations
- [ ] Verify initial load time is acceptable (< 2 seconds)
- [ ] Verify scrolling is smooth
- [ ] Verify real-time updates don't cause lag

---

### 7.2 Automated Testing (Future)

**E2E Tests to Add:**
```typescript
// tests/e2e/cross-page-navigation.spec.ts
test('navigate to annotation on different page', async ({ page }) => {
  // Create annotation on /page-a
  await page.goto('/page-a');
  // ... create annotation

  // Navigate to /page-b
  await page.goto('/page-b');

  // Click annotation for /page-a
  await page.click('[data-annotation-page="/page-a"]');

  // Verify navigation
  await expect(page).toHaveURL('/page-a');

  // Verify element highlights
  await expect(page.locator('.dev-caddy-element-highlight')).toBeVisible();

  // Verify detail view opens
  await expect(page.locator('.dev-caddy-annotation-detail')).toBeVisible();
});
```

---

## Phase 8: Documentation Updates

### 8.1 Files to Update

**`docs/README.md`**
- Change "page-scoped annotations" to "project-wide annotations"
- Update feature list to mention cross-page navigation
- Update architecture section

**`docs/IMPLEMENTATION.md`**
- Update "Annotation Storage" section
- Document navigation system
- Update real-time sync description

**`packages/README.md`**
- Update feature descriptions
- Add cross-page navigation to feature list
- Update screenshots (if any)

**`docs/TASKS.md`**
- Add new phase tracking for this work
- Update completion status

**`CLAUDE.md`**
- Update project overview
- Update architecture section
- Add navigation utility documentation

---

## Implementation Order

### Phase 1: Core Backend Changes (2-3 hours)
1. ✅ Add `getAllAnnotations()` to `annotations.ts`
2. ✅ Add `subscribeToAllAnnotations()` to `subscriptions.ts`
3. ✅ Handle DELETE events in subscription callback
4. ✅ Export new functions from `client/index.ts`
5. ✅ Build and verify no TypeScript errors

### Phase 2: Context Updates (1-2 hours)
1. ✅ Remove `currentPage` state from `AnnotationContext.tsx`
2. ✅ Remove SPA navigation detection code
3. ✅ Update initial load to use `getAllAnnotations()`
4. ✅ Update subscription to use `subscribeToAllAnnotations()`
5. ✅ Handle DELETE events in subscription handler
6. ✅ Remove `pageUrl` prop from `AnnotationProvider`
7. ✅ Build and verify no TypeScript errors

### Phase 3: Navigation System (2-3 hours)
1. ✅ Create `packages/src/ui/Core/utility/navigation.ts`
2. ✅ Implement `navigateToAnnotation()` function
3. ✅ Implement `checkPendingAnnotation()` function
4. ✅ Implement `isCurrentPage()` helper
5. ✅ Export from `utility/index.ts`
6. ✅ Build and verify

### Phase 4: UI Updates - AnnotationList (1-2 hours)
1. ✅ Remove user filtering logic
2. ✅ Update component title and empty state
3. ✅ Add page badge display
4. ✅ Add navigation handler
5. ✅ Integrate `checkPendingAnnotation()` on mount
6. ✅ Build and verify

### Phase 5: UI Updates - AnnotationManager (1-2 hours)
1. ✅ Add page filter to `FilterOptions` interface
2. ✅ Update filter state and logic
3. ✅ Get unique pages for filter dropdown
4. ✅ Add page filter UI
5. ✅ Add page badge display
6. ✅ Add navigation handler
7. ✅ Integrate `checkPendingAnnotation()` on mount
8. ✅ Build and verify

### Phase 6: Styling (1 hour)
1. ✅ Add page badge styles to `_annotations.scss`
2. ✅ Add cross-page navigation icon styles
3. ✅ Add hover states for cross-page items
4. ✅ Build SCSS and verify

### Phase 7: Testing (2-3 hours)
1. ✅ Run all manual testing scenarios
2. ✅ Fix any bugs discovered
3. ✅ Verify real-time updates work correctly
4. ✅ Verify cross-page navigation works
5. ✅ Test with multiple users

### Phase 8: Documentation (1-2 hours)
1. ✅ Update `docs/README.md`
2. ✅ Update `docs/IMPLEMENTATION.md`
3. ✅ Update `packages/README.md`
4. ✅ Update `docs/TASKS.md`
5. ✅ Update `CLAUDE.md`

**Total Estimated Time:** 10-15 hours

---

## Breaking Changes & Migration

### Breaking Changes
1. **AnnotationContext API:** No longer accepts `pageUrl` prop
2. **Initial Load:** All annotations loaded on mount (not page-scoped)
3. **Real-Time:** Subscription receives all project updates (not page-scoped)
4. **Client Mode:** Shows all users' annotations (not just own)

### Migration Notes
- ✅ Existing annotations will work without database changes
- ✅ No RLS policy changes required
- ⚠️ Users will see more annotations initially (all instead of page-scoped)
- ⚠️ May need performance optimization for projects with 500+ annotations

### Compatibility
- ✅ Backward compatible with existing annotations
- ✅ No breaking changes to public API
- ✅ No migration scripts needed

---

## Performance Considerations

### Current Concerns
- **Loading all annotations:** Acceptable up to ~500 annotations
- **Real-time updates:** More frequent (all pages, not just current)
- **Badge rendering:** Currently minimal (only selected annotation)

### Optimizations (if needed)
1. **Lazy loading:** Implement pagination or infinite scroll
2. **Virtual scrolling:** For large annotation lists (500+)
3. **Debounce real-time updates:** Batch multiple updates
4. **localStorage cache:** Cache annotations between page loads
5. **Search/filter:** Add search to reduce visible annotations
6. **Request batching:** Batch multiple API calls

### Performance Targets
- Initial load: < 2 seconds for 500 annotations
- Real-time update: < 500ms to appear in UI
- UI responsiveness: 60 FPS during scrolling
- Memory usage: < 50MB for 500 annotations

---

## Open Questions

### 1. Should client mode show other users' annotations?
**Decision:** YES (show all)
- **Rationale:** Clients need to see all feedback to understand full picture
- **Alternative:** Keep user-scoped for clients, project-wide for developers
- **Impact:** Changes user permissions model

### 2. Should we show badges for all annotations on current page?
**Decision:** NO (keep current behavior - only show when selected)
- **Rationale:** Avoids visual clutter, maintains focus
- **Alternative:** Show all badges on current page
- **Impact:** Could be revisited in Phase 6 based on user feedback

### 3. Should we add pagination for large annotation lists?
**Decision:** Load all initially, add pagination later if needed
- **Rationale:** Keep implementation simple for MVP
- **Alternative:** Implement pagination from the start
- **Impact:** May need performance optimization for 500+ annotations

### 4. Should navigation be SPA-friendly or full page reload?
**Decision:** Use `window.location.pathname` (full page reload)
- **Rationale:** Framework-agnostic, works with all SPAs
- **Alternative:** Integrate with router (React Router, Next.js, etc.)
- **Impact:** Requires framework detection, more complex implementation

### 5. Should we add a "Current Page Only" quick filter?
**Decision:** YES (add to both client and developer modes)
- **Rationale:** Users may want to focus on current page despite seeing all
- **Alternative:** Remove page-scoping entirely
- **Impact:** Minimal - add toggle button to filter bar

---

## Success Metrics

### Functional Requirements
- ✅ All annotations visible across entire project
- ✅ Cross-page navigation works correctly
- ✅ Element highlights after navigation
- ✅ Detail view opens after navigation
- ✅ Real-time updates work for all annotations
- ✅ Page badges show correct information
- ✅ Filters work correctly (status, author, page)

### Non-Functional Requirements
- ✅ No console errors during operation
- ✅ No TypeScript errors during build
- ✅ Initial load < 2 seconds for 500 annotations
- ✅ Real-time updates < 500ms latency
- ✅ Smooth scrolling (60 FPS)
- ✅ No memory leaks during navigation

### User Experience
- ✅ Intuitive cross-page navigation
- ✅ Clear visual indicators for other pages
- ✅ Graceful handling of edge cases (deleted annotations, 404s)
- ✅ Consistent behavior across client and developer modes

---

## Risks & Mitigation

### Risk 1: Performance with Many Annotations
**Likelihood:** Medium
**Impact:** High
**Mitigation:** Implement pagination if > 500 annotations

### Risk 2: Real-Time Update Overload
**Likelihood:** Low
**Impact:** Medium
**Mitigation:** Debounce updates, batch processing

### Risk 3: Cross-Page Navigation Fails
**Likelihood:** Low
**Impact:** High
**Mitigation:** Handle 404s gracefully, clear sessionStorage on error

### Risk 4: User Confusion (Too Many Annotations)
**Likelihood:** Medium
**Impact:** Medium
**Mitigation:** Add "Current Page Only" filter, improve grouping/search

### Risk 5: Breaking Existing Workflows
**Likelihood:** Low
**Impact:** High
**Mitigation:** Thorough testing, gradual rollout, documentation updates

---

## Future Enhancements

### Short-Term (Next Sprint)
- Add search functionality for annotations
- Add "Group by Page" view option
- Add keyboard shortcuts for navigation
- Add loading indicator during cross-page navigation

### Medium-Term (Next Quarter)
- Implement virtual scrolling for large lists
- Add annotation export (CSV, JSON)
- Add bulk operations (delete multiple, update status)
- Add annotation history/audit log

### Long-Term (Future Versions)
- Implement router integration for SPA frameworks
- Add annotation threading/replies
- Add @mentions for users
- Add screenshot attachments
- Add annotation search with full-text indexing

---

## Questions for Review

1. Should we implement pagination from the start or wait for performance issues?
2. Should client mode have any user-scoped filtering options?
3. Should we add a "Recent" tab to show recently updated annotations?
4. Should we group annotations by page in the UI by default?
5. Should we add a minimap or page overview showing annotation counts per page?

---

## Approval & Sign-Off

**Created By:** Claude (AI Assistant)
**Reviewed By:** _Pending_
**Approved By:** _Pending_
**Start Date:** _TBD_
**Target Completion:** _TBD_

---

## Change Log

| Date | Version | Changes | Author |
|------|---------|---------|--------|
| 2025-11-13 | 1.0 | Initial plan created | Claude |
