# Next Sprint — Testing & Foundation

**Goal:** Add a testing foundation and fix high-impact technical debt before building new features (Seller Review, Admin Override, etc.).

**Outcome:** Safer refactors, fewer regressions, and a clear pattern for testing new code.

---

## Sprint scope

### 1. Testing setup
- [ ] Add Vitest (or chosen test runner) and config for unit + component tests.
- [ ] Add `test` / `test:ui` script to `package.json`.
- [ ] Ensure `@` path alias and React/JSX work in tests (e.g. `jsdom` for DOM).
- **Done when:** `npm run test` runs and exits 0 with at least one placeholder test.

### 2. Unit tests — `src/utils/fraudLogic.ts`
- [ ] `generateFraudScore()` — returns number in 1–100 (run multiple times).
- [ ] `getStatusFromScore(score)` — returns `'approved'` / `'flagged'` / `'rejected'` for known bands (e.g. &lt;=70, 71–90, &gt;90).
- [ ] `getStatusBgColor(status)` — returns expected class strings for each status.
- [ ] `generateMockReturns(count)` — returns array of length `count`, each item has required `ReturnItem` fields (id, fraudScore, status, etc.).
- **Done when:** All fraudLogic behavior above is covered and green.

### 3. Unit tests — `src/context/DemoContext.tsx`
- [ ] Add return via `addReturn` — new item appears in context, has id, fraudScore, status, inspectionStage 0.
- [ ] `updateReturn(id, updates)` — target return is updated; others unchanged.
- [ ] `advanceInspectionStage` — when at stage 5, status becomes approved/flagged/rejected from fraud score; otherwise stage increments.
- **Done when:** DemoContext state changes are covered by tests (use a test wrapper that renders `DemoProvider` and uses the context).

### 4. Optional: one smoke / integration test
- [ ] One test that renders `App` (or a minimal route tree), submits a return (or triggers addReturn), and asserts inspection completes or status updates (e.g. via DemoContext or DOM).
- **Done when:** Single end-to-flow test passes; skip if time-boxed.

### 5. Error boundary
- [ ] Add an Error Boundary component that catches render errors and shows a fallback UI (e.g. “Something went wrong” + reload).
- [ ] Wrap the main app (or route tree) in `main.tsx` or `App.tsx`.
- **Done when:** Uncaught error in a child shows fallback instead of blank screen.

### 6. Mock/context merge fix (Seller & Admin)
- [ ] Resolve duplicate IDs: mock returns use a distinct ID range (e.g. `MOCK-1001`) or single source of “all returns” so context returns and mock data don’t collide.
- [ ] Ensure SellerPortal and AdminDashboard use the same strategy (one shared helper or context-driven list) so merging is predictable.
- **Done when:** No duplicate IDs in combined list; one clear place that defines “all returns” for demo.

---

## Out of scope this sprint (do after)

- Seller “Review” / Admin “Override” implementation.
- Full test coverage; only critical paths above.
- Other debt items (e.g. duplicate toast, form refactor) — backlog.

---

## Definition of done for the sprint

- [ ] Test suite runs in CI or locally with `npm run test`.
- [ ] fraudLogic and DemoContext have the tests listed above.
- [ ] Error boundary is in place and verified manually.
- [ ] Mock + context merge no longer produces duplicate IDs; strategy is documented (e.g. in FILE_REFERENCE or a short ADR/comment).

---

## Future sprints

- **Next:** Implement Seller “Review” (detail view + actions) and Admin “Override” + threshold behavior, **with tests for new logic**.
- Continue adding tests for new features as they’re built; backfill more coverage as needed.
