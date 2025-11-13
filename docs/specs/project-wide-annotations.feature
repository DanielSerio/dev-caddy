Feature: Project-Wide Annotations

  As a developer or client
  I want to see all annotations across the entire project
  So that I can understand all feedback and navigate between pages

  Background:
    Given the DevCaddy system is initialized
    And I am authenticated
    And there are annotations on multiple pages:
      | page      | content                    | author     |
      | /home     | Fix homepage title         | client1    |
      | /home     | Update hero image          | developer1 |
      | /products | Change button color        | client1    |
      | /products | Add product filters        | client2    |
      | /about    | Update company description | developer1 |

  # ============================================================================
  # Core Feature: View All Annotations
  # ============================================================================

  Scenario: Client views all annotations across all pages
    Given I am in "client" mode
    And I am on the "/home" page
    When I open DevCaddy
    Then I should see 5 annotations total
    And I should see annotations with content:
      | content                    |
      | Fix homepage title         |
      | Update hero image          |
      | Change button color        |
      | Add product filters        |
      | Update company description |
    And each annotation should display its page path

  Scenario: Developer views all annotations across all pages
    Given I am in "developer" mode
    And I am on the "/products" page
    When I open DevCaddy
    Then I should see 5 annotations total
    And I should see annotations from all users
    And each annotation should display its page path
    And each annotation should display the author name

  Scenario: Annotations show correct page badges
    Given I am on the "/home" page
    When I open DevCaddy
    Then I should see page badges for:
      | page      |
      | /home     |
      | /products |
      | /about    |
    And annotations on "/home" should show "Current Page" indicator
    And annotations on "/products" should show "/products" badge
    And annotations on "/about" should show "/about" badge

  # ============================================================================
  # Core Feature: Cross-Page Navigation
  # ============================================================================

  Scenario: Navigate to annotation on different page
    Given I am on the "/home" page
    And I have opened DevCaddy
    And there is an annotation "Change button color" on page "/products"
    When I click the annotation "Change button color"
    Then I should navigate to "/products"
    And the annotated element should be highlighted
    And the annotation detail view should open
    And I should see the content "Change button color"

  Scenario: Navigate to annotation on same page
    Given I am on the "/home" page
    And I have opened DevCaddy
    And there is an annotation "Fix homepage title" on page "/home"
    When I click the annotation "Fix homepage title"
    Then I should remain on "/home"
    And the page should not reload
    And the annotated element should be highlighted
    And the annotation detail view should open
    And I should see the content "Fix homepage title"

  Scenario: Cross-page navigation maintains DevCaddy state
    Given I am on the "/home" page
    And I have opened DevCaddy
    When I click an annotation on page "/products"
    Then I should navigate to "/products"
    And DevCaddy should remain open
    And the annotation detail view should be displayed

  # ============================================================================
  # Edge Cases: Navigation
  # ============================================================================

  Scenario: Navigate to annotation that no longer exists
    Given I am on the "/home" page
    And I have opened DevCaddy
    And there is an annotation "Change button color" on page "/products"
    When I click the annotation "Change button color"
    And the annotation is deleted before navigation completes
    Then I should navigate to "/products"
    And I should see the annotation list view
    And I should not see the detail view
    And I should not see annotation "Change button color"

  Scenario: Navigate to annotation on page that doesn't exist
    Given I am on the "/home" page
    And I have opened DevCaddy
    And there is an annotation on page "/non-existent"
    When I click the annotation on "/non-existent"
    Then the browser should navigate to "/non-existent"
    And the browser should handle the 404 normally

  # ============================================================================
  # Core Feature: Real-Time Updates Across All Pages
  # ============================================================================

  Scenario: Real-time annotation creation visible across pages
    Given user A is viewing annotations on "/home"
    And user B is viewing annotations on "/products"
    When user A creates an annotation "New homepage note" on "/home"
    Then user B should see the annotation "New homepage note" immediately
    And the annotation should show page badge "/home"
    And the total annotation count should update for user B

  Scenario: Real-time annotation update visible across pages
    Given user A is viewing annotations on "/home"
    And user B is viewing annotations on "/products"
    And there is an annotation "Fix homepage title" on "/home"
    When user A updates the annotation to "Fix homepage title (URGENT)"
    Then user B should see the updated content "Fix homepage title (URGENT)" immediately
    And the update timestamp should refresh

  Scenario: Real-time annotation deletion visible across pages
    Given user A is viewing annotations on "/home"
    And user B is viewing annotations on "/products"
    And there is an annotation "Fix homepage title" on "/home"
    When user A deletes the annotation "Fix homepage title"
    Then user B should no longer see the annotation "Fix homepage title"
    And the total annotation count should update for user B

  Scenario: Real-time status change visible across pages
    Given user A (developer) is viewing annotations on "/home"
    And user B is viewing annotations on "/products"
    And there is an annotation "Change button color" with status "New"
    When user A changes the status to "In Progress"
    Then user B should see the status change to "In Progress" immediately
    And the status badge should update visually

  # ============================================================================
  # Developer Mode: Filter by Page
  # ============================================================================

  Scenario: Developer filters annotations by specific page
    Given I am in "developer" mode
    And I am on the "/home" page
    And I have opened DevCaddy
    When I select "/products" from the page filter
    Then I should see 2 annotations
    And I should see annotations:
      | content             |
      | Change button color |
      | Add product filters |
    And I should not see annotations from other pages

  Scenario: Developer filters to current page only
    Given I am in "developer" mode
    And I am on the "/home" page
    And I have opened DevCaddy
    When I select "Current Page" from the page filter
    Then I should see 2 annotations
    And I should see annotations:
      | content            |
      | Fix homepage title |
      | Update hero image  |
    And I should not see annotations from other pages

  Scenario: Developer clears page filter to view all
    Given I am in "developer" mode
    And I have opened DevCaddy
    And I have filtered by page "/products"
    When I select "All Pages" from the page filter
    Then I should see 5 annotations total
    And I should see annotations from all pages

  Scenario: Page filter dropdown shows all unique pages
    Given I am in "developer" mode
    And I have opened DevCaddy
    When I open the page filter dropdown
    Then I should see options:
      | option       |
      | All Pages    |
      | Current Page |
      | /home        |
      | /products    |
      | /about       |
    And the pages should be sorted alphabetically

  Scenario: Combine page filter with status filter
    Given I am in "developer" mode
    And I have opened DevCaddy
    And annotation "Change button color" on "/products" has status "New"
    And annotation "Add product filters" on "/products" has status "Resolved"
    When I select "/products" from the page filter
    And I select "New" from the status filter
    Then I should see 1 annotation
    And I should see annotation "Change button color"
    And I should not see annotation "Add product filters"

  # ============================================================================
  # Client Mode: No User Filtering
  # ============================================================================

  Scenario: Client sees all users' annotations (not just their own)
    Given I am in "client" mode
    And I am logged in as "client1"
    And I am on the "/home" page
    When I open DevCaddy
    Then I should see annotations from "client1"
    And I should see annotations from "client2"
    And I should see annotations from "developer1"
    And the title should say "All Annotations" not "My Annotations"

  Scenario: Client can still edit their own annotations
    Given I am in "client" mode
    And I am logged in as "client1"
    And I have opened DevCaddy
    And there is my annotation "Fix homepage title"
    When I click the annotation "Fix homepage title"
    Then I should see an "Edit" button
    And I should be able to edit the content
    And I should be able to delete the annotation

  Scenario: Client cannot edit other users' annotations
    Given I am in "client" mode
    And I am logged in as "client1"
    And I have opened DevCaddy
    And there is an annotation "Update hero image" by "developer1"
    When I click the annotation "Update hero image"
    Then I should not see an "Edit" button
    And I should not see a "Delete" button
    And the annotation should be read-only

  # ============================================================================
  # Performance & Loading
  # ============================================================================

  Scenario: Initial load shows all annotations quickly
    Given there are 100 annotations across 10 pages
    When I open DevCaddy
    Then all annotations should load within 2 seconds
    And I should see the total count "100"
    And the UI should remain responsive

  Scenario: Real-time updates don't cause lag
    Given I have opened DevCaddy
    And there are 50 annotations visible
    When 5 annotations are updated simultaneously by other users
    Then the updates should appear within 500ms each
    And the UI should remain responsive
    And scrolling should remain smooth

  # ============================================================================
  # Empty States
  # ============================================================================

  Scenario: No annotations in entire project
    Given there are no annotations in the project
    When I open DevCaddy
    Then I should see "No annotations in this project yet"
    And I should see the "Add Annotation" button
    And I should not see any annotation items

  Scenario: Annotations exist but none match filter
    Given I am in "developer" mode
    And I have opened DevCaddy
    And there are annotations on "/home" and "/products"
    When I select "/about" from the page filter
    Then I should see "No annotations match the current filters"
    And I should see the filter controls
    And I should be able to clear the filter

  # ============================================================================
  # UI/UX Details
  # ============================================================================

  Scenario: Page badges show correct styling
    Given I am on the "/home" page
    And I have opened DevCaddy
    Then annotations on "/home" should have "current-page-indicator" style
    And annotations on "/products" should have "other-page-indicator" style
    And the current page badge should use primary color
    And other page badges should use muted color

  Scenario: Cross-page annotations show navigation hint
    Given I am on the "/home" page
    And I have opened DevCaddy
    When I hover over an annotation on "/products"
    Then I should see a visual indicator that clicking will navigate
    And the cursor should change to pointer
    And the annotation item should show hover state

  Scenario: Annotation list shows page distribution
    Given I have opened DevCaddy
    And there are annotations on multiple pages
    Then I should be able to see at a glance which pages have annotations
    And the page badges should be prominent
    And annotations should be grouped visually by some indicator

  # ============================================================================
  # Data Integrity
  # ============================================================================

  Scenario: Page path is stored correctly on creation
    Given I am on the "/products" page
    And I have opened DevCaddy
    When I create a new annotation "Test annotation"
    Then the annotation should be stored with page "/products"
    And when I navigate to "/home"
    And I view all annotations
    Then the annotation "Test annotation" should show page badge "/products"

  Scenario: Annotations persist across page navigations
    Given I am on the "/home" page
    And I have opened DevCaddy
    And I can see 5 annotations total
    When I navigate to "/products" via cross-page annotation
    Then I should still see 5 annotations total (when viewing all)
    And the annotation list should not duplicate entries
    And the annotation count should remain consistent
