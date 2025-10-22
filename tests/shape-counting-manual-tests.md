# Shape Counting Quest Browser Test Plan

Use this checklist to guide manual or automated (e.g., Playwright/Selenium) verification of the Shape Counting Quest experience. Unless stated otherwise, start each test at `http://localhost:5173/` with the app freshly loaded.

## Environment & Preconditions
- Build and serve the Vite app (`npm run dev`).
- Browser window has developer tools available for viewport emulation.
- Ensure no service worker or hard browser cache is interfering (refresh with cache disabled if needed).

## Test Scenarios

### 1. Initial Load
- **Viewport:** Desktop (≥1280px width).
- **Steps:**
  1. Open `/`.
- **Expected:**
  - App renders a single page titled “Shape Counting Quest”.
  - Round badge displays `Round 1`.
  - Exactly **four** answer buttons appear in the `.game__options` container.
  - Game board shows six shape cards (`.shape-card` elements).
  - Status footer reads “Tap the right number to move on.”

### 2. Unique Answer Options
- **Viewport:** Desktop.
- **Steps:**
  1. Capture text of the four option buttons.
- **Expected:**
  - All options are numeric strings.
  - No duplicates; values are unique within the current round.

### 3. Correct Answer Flow
- **Viewport:** Desktop.
- **Steps:**
  1. Count shapes of the requested type using `svg[aria-label="…"]`.
  2. Click the button matching the correct count.
- **Expected:**
  - Buttons disable immediately (`disabled` attribute true).
  - Status text switches to the success message.
  - `.confetti` overlay appears with multiple `.confetti__piece` children.
  - After ~1.2s, confetti is removed, buttons re-enable, round number increments, status resets to info text, and a new set of shapes/options render.

### 4. Wrong Answer Feedback
- **Viewport:** Desktop.
- **Steps:**
  1. Click an incorrect option.
- **Expected:**
  - Status text updates to the error message.
  - `.game` root gains the `game--error` class (red pulse animation).
  - Option button remains enabled so another attempt can be made.
  - Within ~1s, `game--error` class is removed automatically.

### 5. Retry After Error
- **Viewport:** Desktop.
- **Steps:**
  1. After triggering an error, click the correct answer.
- **Expected:**
  - Flow matches Test 3 (confetti, new round, etc.).
  - Error state does not persist into the new round.

### 6. Auto-Advance Timing Guard
- **Viewport:** Desktop.
- **Steps:**
  1. Trigger a correct answer.
  2. Immediately attempt to click other buttons while confetti is showing.
- **Expected:**
  - Additional clicks are ignored (buttons stay disabled) until the next round starts.

### 7. Option Regeneration
- **Viewport:** Desktop.
- **Steps:**
  1. Progress through at least two rounds via correct answers.
- **Expected:**
  - Each new round generates four new numeric options.
  - The same round number never repeats during the session (1 → 2 → 3, …).

### 8. Confetti Cleanup
- **Viewport:** Desktop.
- **Steps:**
  1. Trigger confetti (correct answer).
  2. Wait 2 seconds.
- **Expected:**
  - `.confetti` overlay is removed from the DOM (no memory buildup between rounds).

### 9. Tablet Layout
- **Viewport:** Tablet (emulate 820×1180 iPad).
- **Steps:**
  1. Refresh the app in tablet mode.
  2. Observe option layout and shape grid.
- **Expected:**
  - Options render as a two-column responsive grid.
  - Shapes remain visible without vertical overflow; page scrolls if needed.
  - Typography scales down according to tablet styles.

### 10. Mobile Layout
- **Viewport:** Mobile (emulate 414×896 iPhone 12/13).
- **Steps:**
  1. Refresh in mobile viewport.
  2. Scroll vertically through the page.
- **Expected:**
  - Options form a two-column grid (or single column under 480px).
  - Shape cards shrink to fit; no horizontal scroll.
  - Status footer remains visible after scrolling to the bottom.

### 11. Extra-Small Mobile Layout
- **Viewport:** 360×640.
- **Steps:**
  1. Refresh and confirm usability.
- **Expected:**
  - Option buttons stack vertically.
  - Shape grid still shows two columns of smaller cards.
  - Text remains legible without overlapping.

### 12. Route Fallback
- **Viewport:** Desktop.
- **Steps:**
  1. Navigate to `/not-a-route`.
- **Expected:**
  - App immediately redirects to `/` without a blank screen.
  - Round counter resets to 1 and new shapes render.

### 13. Accessibility Labels
- **Viewport:** Desktop.
- **Steps:**
  1. Inspect DOM of one round.
- **Expected:**
  - Each shape `svg` has an `aria-label` describing its type.
  - Answer buttons have `aria-label` in the format `"X shape(s)"`.
  - Question text resides in the `aria-live="polite"` container.

### 14. Game Persistence Across Refresh
- **Viewport:** Desktop.
- **Steps:**
  1. Progress to Round ≥2.
  2. Refresh the page.
- **Expected:**
  - Round resets to 1 (expected behavior with in-memory state).
  - No errors during reload.

### 15. Rapid Interaction Stress Test
- **Viewport:** Desktop.
- **Steps:**
  1. Spam-click different option buttons quickly during a round (before picking correct answer).
- **Expected:**
  - App remains responsive; no console errors.
  - Only the pressed button triggers status updates; others behave independently.

---

Use this plan as structured input for converting into automated end-to-end scenarios. Each test lists clear preconditions, steps, and verification points that an automation script can implement.***
