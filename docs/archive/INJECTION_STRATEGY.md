## 🚀 Wrapper Component Injection Strategy Phases

Asking developers to wrap their application in an exported component (e.g., `<DevCaddyProvider>`) is the superior method. It guarantees the badge overlay runs **inside the host application's render tree**, providing explicit control over lifecycles and performance.

### Phase 1: 💾 Data Foundation & Selector Generation (Unchanged)

This phase establishes the consistent method for identifying elements and structuring the real-time data flow.

- **Capture Comprehensive Selector Data:** The **Reviewer UI** captures detailed properties (like `element_tag`, `compressed_element_tree`, `element_id`, etc.) and stores them in the Supabase `annotation` table.
- **Centralize Real-Time Data:** The local **Store** maintains a structured list of all active annotations, holding all the necessary selector properties for reconstruction.

---

### Phase 2: 🔄 Stacked Confidence Scoring & Controlled Rendering

This phase leverages the wrapper component's lifecycle for controlled DOM search and score calculation.

- **Wrapper Component Mounting:** The developer installs the exported wrapper component: `<DevCaddyProvider><App /></DevCaddyProvider>`.
- **Environment-Aware Initialization:** The `<DevCaddyProvider>` component uses properties passed down from the **Vite Plugin (C)** to initialize the **Global Badge Overlay Component** only when the mode is not `Disabled`.
- **Lifecycle-Triggered DOM Search:** The wrapper component runs the expensive **Dynamic DOM Search and Confidence Calculation** (the stacked scoring logic) not on a continuous, unmanaged loop, but **only after component mount** and **after a host application re-render** (e.g., in React's `useEffect` or Vue's `watch`).
- **Weighted Confidence Calculation:** The component performs the weighted selector stacking to determine the **Confidence Score** for each found element:
  - **High Weights (e.g., +0.50):** `element_id` or `element_test_id`.
  - **Medium Weights (e.g., +0.25):** `compressed_element_tree`.
  - **Lower Weights (e.g., +0.15):** `element_parent_selector` + `element_nth_child`.
  - It generates a **live map** of `{DOM_Element_Reference: {Annotation_Count, Confidence_Score}}`.

---

### Phase 3: ✨ Dynamic Rendering & Interaction (Confidence-Based)

This final phase dictates the visual appearance and interactivity of the badge, using the wrapper to access necessary context.

- **Contextual Positioning:** The `<DevCaddyProvider>` ensures the Badge Overlay is positioned correctly relative to the entire application viewport, using `position: fixed` or `position: absolute` on the container, which is now guaranteed to wrap the whole app.
- **Confidence-Driven Styling (Graduated Scale):**
  - **High Confidence (> 0.90):** Normal styling.
  - **Medium Confidence (0.50 - 0.89):** Styled to be slightly less prominent.
  - **Low Confidence (< 0.50):** Renders with a **prominent warning indicator** (e.g., orange/red).
- **Implement Dual-Mode Interactivity:**
  - **Developer Mode (Actionable):** The Badge component accesses the host application's context (provided by the wrapper) to open the Triage Panel, displaying the **numeric Confidence Score** and selector details.
  - **Reviewer Mode (Informational):** The Badge remains subtle and disabled.
