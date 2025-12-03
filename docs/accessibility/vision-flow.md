# Vision Flow Accessibility Notes

Last updated: 2025-10-20 (UTC)

## Summary

The vision navigator introduces guided prompts, live preview, and alignment cues. This document records how the UI satisfies
WCAG 2.2 AA checkpoints referenced in PRD §5.2/§7.6 and captures heuristics for alignment chips so QA and future contributors
can validate behaviour.

## WCAG 2.2 AA Coverage

| Guideline | Implementation Detail | Verification |
| --- | --- | --- |
| 1.3.1 Info and Relationships | Every prompt uses a `<label>` tied to its `<textarea>` via `htmlFor`. Helper text is connected with `aria-describedby`. | Screen reader traversal with VoiceOver/NVDA announces label and hint together. |
| 1.4.3 Contrast (Minimum) | Foreground/background combinations meet ≥4.5:1. Primary button gradient (#7F56D9→#6366F1) on dark navy background yields 5.1:1; secondary button (#E2E8F0 on rgba(226,232,240,0.08)) yields 4.8:1. | Verified with Stark plugin + manual contrast calculator. |
| 1.4.11 Non-text Contrast | Focus outline uses 3px rgba(94,234,212,0.6) with 3:1 contrast. Alignment chips include border and hover states exceeding 3:1. | Keyboard tabbing shows outline for inputs/buttons. |
| 2.1.1 Keyboard | All controls are native form elements or `<button>` tags. Undo, reset, and dismiss actions are accessible via keyboard. | Tab order tested in Chrome (Mac) and Firefox (Linux). |
| 2.4.3 Focus Order | Layout uses DOM order consistent with visual order: prompts (left) precede preview (right). | Keyboard traversal follows same sequence as reading order. |
| 2.4.6 Headings and Labels | Page uses semantic `<h1>`/`<h2>`/`<h3>` hierarchy. Alignment sections expose descriptive headings. | VoiceOver rotor shows correct outline. |
| 3.2.4 Consistent Identification | Buttons share `.primary-button` / `.secondary-button` styles across flows for recognition. | Visual regression check. |
| 3.3.1 Error Identification | Field errors render via `role="alert"` and red copy. | Triggered by submitting empty daily vision field. |
| 3.3.3 Error Suggestion | Tag limits return explicit guidance “Limit tags to 12 unique entries.” | Validated with >12 tags input. |
| 3.3.7 Accessible Authentication | Flow reuses Supabase session guard; no cognitive challenge added. | Login redirect tested manually. |

## Keyboard Interaction Checklist

1. Tab into the first prompt (Daily Vision). `Shift+Tab` returns to undo/reset cluster.
2. `Space/Enter` on “Undo last change” reverts to the previous draft snapshot.
3. `Enter` on “Save vision” triggers the server action; focus remains on the button while pending.
4. Chip dismissals: focus lands on “Mark as aligned” and returns to the next chip after activation.

## Screen Reader Notes

- Vision preview is wrapped in an `<aside>` with `aria-label="Vision board preview"`, allowing rotor navigation.
- Alignment chip tag containers expose `aria-label="Task tags"` to clarify context before enumerating hash-tags.
- Status messages (success/error) use `role="status"` for polite announcements.

## Alignment Heuristics & Overrides

- **Matching logic:** plan items are considered aligned if any associated task tag matches a saved vision tag (case-insensitive).
- **Missing tags:** items without tags flag the message “Add tags to this task to enable alignment checks.”
- **Weekly focus:** chips in the “This Week” column filter by the latest cycle’s `current_week` value.
- **Overrides:** dismissing a chip via “Mark as aligned” hides it locally and documents the user’s intentional exception.
  Persisted overrides will be handled in A-6 once plan APIs land.

## Test Checklist

- Save flow with populated prompts and ≤12 tags.
- Attempt to save with blank “Daily Vision” to confirm error handling.
- Enter 15 tags (comma separated) to confirm guard prevents save.
- Add a plan item with tags not matching the vision and verify chip appears.
- Keyboard-only traversal ensuring focus ring visibility and logical order.
