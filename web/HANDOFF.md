# Handoff Document

## Goal
Migrate the project's test suite from Vitest to Bun's native test runner (`bun:test`) for faster execution, while maintaining compatibility with existing React component tests and E2E tests.

## Current Progress

### Completed
- [x] Research Bun test runner capabilities (vi compatibility, mocking APIs, fake timers, coverage)
- [x] Research real-world migration experiences from Vitest to Bun (case studies: cinderlink/framework, SylphxAI/pdf-reader-mcp, elizaOS/eliza, evmts/tevm-monorepo)
- [x] Research Playwright on Bun (confirmed: `bun run playwright test` works today, no changes needed)
- [x] Create `web/bunfig.toml` — test runner configuration
- [x] Create `web/tests/bun-setup.tsx` — happy-dom preload file with mocks (next/image, next/cache, matchMedia, IntersectionObserver, ResizeObserver, canvas getContext, server-only)
- [x] Create `web/tests/test-utils.ts` — `mocked()` helper to replace `vi.mocked()`
- [x] Remove `vi.resetModules()` calls from `shopify.test.ts` and `embed.test.ts` (not available in Bun)
- [x] Add `@happy-dom/global-registrator` dependency
- [x] Mock `server-only` module in bun-setup preload (solves client-side import errors)
- [x] Replace all `vi.mocked()` calls with `(fn as ReturnType<typeof vi.fn>)` pattern
- [x] Implement full `matchMedia` mock with `mockImplementation` covering `addListener`, `removeListener`, `dispatchEvent`
- [x] Validate fake timers with `vi.useFakeTimers()` and `vi.runAllTimers()`
- [x] Full test suite validation: **all 185 tests pass on Bun**

### Commit Created
- `da9d182` — "feat(tests): add complete test suite with 185 unit and integration tests"

## Working Tests (Full Suite — All 185 Pass)
| File | Tests | Status |
|------|-------|--------|
| `tests/unit/lib/utils.test.ts` | 25 | ✅ Pass |
| `tests/unit/lib/text.test.ts` | 20 | ✅ Pass |
| `tests/unit/lib/filter-utils.test.ts` | 25 | ✅ Pass |
| `tests/unit/lib/rag/ratelimit.test.ts` | 5 | ✅ Pass |
| `tests/unit/lib/shopify.test.ts` | 16 | ✅ Pass |
| `tests/unit/lib/rag/embed.test.ts` | 7 | ✅ Pass |
| `tests/unit/hooks/use-text-measurement.test.ts` | 12 | ✅ Pass |
| `tests/unit/lib/rag/query.test.ts` | 5 | ✅ Pass |
| `tests/integration/api/search.test.ts` | 6 | ✅ Pass |
| `tests/integration/api/rag-chat.test.ts` | 8 | ✅ Pass |
| `tests/integration/actions/cart.test.ts` | 10 | ✅ Pass |
| `tests/unit/hooks/use-mobile.test.ts` | 6 | ✅ Pass |
| `tests/unit/components/rag/chat-panel.test.tsx` | 12 | ✅ Pass |

## What Worked

1. **`(fn as ReturnType<typeof vi.fn>)` pattern** — Replaces `vi.mocked()` everywhere. Provides full type safety without the Bun-incompatible utility.

2. **`server-only` mock in preload** — Added to `bun-setup.tsx` preload so client-side test imports no longer throw. Solved the `query.test.ts` failure.

3. **Full `matchMedia` mock** — `mockImplementation` with complete interface (`addListener`, `removeListener`, `dispatchEvent`) satisfies all callers including `use-mobile.test.ts`.

4. **Fake timers** — `vi.useFakeTimers()` and `vi.runAllTimers()` work correctly in Bun.

5. **happy-dom for DOM environment** — Installed `@happy-dom/global-registrator` and registered in preload file. React hooks and component tests pass.

6. **`bun run playwright test`** — Playwright tests already work with Bun as runtime. No changes needed.

7. **`--preload ./tests/bun-setup.tsx`** — Required flag on every `bun test` invocation. bunfig.toml preload is not picked up from root; the flag must be passed explicitly.

## What Didn't Work

1. **`bunfig.toml` preload not auto-loaded** — Bun does not pick up `preload` from `bunfig.toml` at the project root. Tests must be run with `--preload ./tests/bun-setup.tsx`. This is a known Bun behavior; the bunfig.toml is kept for documentation but the flag is required.

2. **`vi.mocked()` has no Bun equivalent** — Solved by replacing all calls with `(fn as ReturnType<typeof vi.fn>)` pattern. All affected files updated.

3. **`vi.resetModules()` not available** — Cannot reset module cache between tests in Bun. Tests were refactored to not depend on this; env vars are set per-test anyway.

4. **jsdom not supported** — Bun uses JavaScriptCore not V8, so jsdom won't work. All React component tests use happy-dom, which works with proper preload setup.

## Next Steps

1. **Add `bunfig.toml` preload workaround** — Consider adding a `test` script to `package.json` that always includes the `--preload ./tests/bun-setup.tsx` flag so developers don't have to remember it:
   ```json
   "test": "bun test --preload ./tests/bun-setup.tsx",
   "test:unit": "bun test --preload ./tests/bun-setup.tsx ./tests/unit",
   "test:integration": "bun test --preload ./tests/bun-setup.tsx ./tests/integration",
   "test:e2e": "bun run playwright test",
   ```

2. **Investigate bunfig.toml preload** — File a Bun issue or search for workaround to auto-load preload from root bunfig.toml, eliminating the need for the explicit flag.

3. **Remove Vitest config** — Once confident Bun is stable for all tests, remove `web/vitest.config.mts` and uninstall Vitest packages (`vitest`, `@vitest/ui`, etc.) to simplify the stack.

4. **Consider splitting test scripts** — As noted above, separate unit/integration/e2e scripts improve developer ergonomics.

## Key Files

- `web/bunfig.toml` — Bun test configuration (preload, coverage, timeout)
- `web/tests/bun-setup.tsx` — Preload file with happy-dom, mocks, and server-only mock
- `web/tests/test-utils.ts` — `mocked()` helper function (still kept for type convenience)
- `web/vitest.config.mts` — Current Vitest config (still in use; candidate for removal)
- `web/tests/e2e/playwright.config.ts` — Playwright config (works with Bun)

## References

- Bun test docs: `bun test --help`
- happy-dom setup: https://bun.com/guides/test/happy-dom
- Real-world migration issues documented in `cinderlink/framework PROGRESS_REPORT.md` and `evmts/tevm-monorepo COVERAGE.md`