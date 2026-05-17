# Handoff Document

## Goal
Complete migration from Vitest to Bun's native test runner (`bun:test`) for faster test execution. Maintain all existing tests (185 total) with happy-dom for DOM environment.

## Current Progress

### Completed
- [x] Bun test runner infrastructure (bunfig.toml, bun-setup.tsx, test-utils.ts)
- [x] happy-dom for DOM environment via `@happy-dom/global-registrator`
- [x] Preload file with mocks: next/image, next/cache, server-only, matchMedia, IntersectionObserver, ResizeObserver, canvas
- [x] Test env vars set in preload (PRIVATE_STOREFRONT_API_TOKEN, etc.)
- [x] Remove `vi.resetModules()` calls (not available in Bun)
- [x] Replace all `vi.mocked()` calls with `(fn as ReturnType<typeof vi.fn>)` pattern
- [x] Add `server-only` mock to preload (prevents client-side import throw)
- [x] Full `matchMedia` mock with `addListener`, `removeListener`, `dispatchEvent`
- [x] Validate fake timers (`vi.useFakeTimers()`, `vi.runAllTimers()`)
- [x] **All 185 tests pass** on Bun
- [x] Remove Vitest from dependencies (`vitest`, `@vitejs/plugin-react`, `vite-tsconfig-paths`, `jsdom`)
- [x] Replace package.json scripts with Bun equivalents
- [x] Delete `vitest.config.mts`
- [x] Add `docs/BUN_TESTS.md` quick reference
- [x] Add test section to README with commands, mock patterns, and mermaid diagrams
- [x] Add Bun Test Runner section to `CLAUDE.md`

### Commits (6 total)
| Commit | Description |
|--------|-------------|
| `70464f2` | docs: add test section to README with commands, mock patterns, and flow diagrams |
| `20535bd` | docs: add Bun test runner section to CLAUDE.md |
| `10f2123` | fix: restore tailwindcss v4 dependency that was accidentally removed |
| `0f80d71` | chore(tests): remove Vitest, use Bun test runner |
| `66034c7` | docs: add Bun test reference guide and update handoff |
| `a5ef4ed` | feat(tests): migrate vi.mocked() calls to Bun-compatible type assertions |
| `046e3fd` | feat(tests): add Bun test runner infrastructure with happy-dom |

## Working Tests — All 185 Pass
| File | Tests | Status |
|------|-------|--------|
| `tests/unit/lib/utils.test.ts` | 25 | Pass |
| `tests/unit/lib/text.test.ts` | 20 | Pass |
| `tests/unit/lib/filter-utils.test.ts` | 25 | Pass |
| `tests/unit/lib/rag/ratelimit.test.ts` | 5 | Pass |
| `tests/unit/lib/shopify.test.ts` | 16 | Pass |
| `tests/unit/lib/rag/embed.test.ts` | 7 | Pass |
| `tests/unit/lib/rag/query.test.ts` | 7 | Pass |
| `tests/unit/hooks/use-text-measurement.test.ts` | 12 | Pass |
| `tests/unit/hooks/use-mobile.test.ts` | 5 | Pass |
| `tests/integration/api/search.test.ts` | 4 | Pass |
| `tests/integration/api/rag-chat.test.ts` | 10 | Pass |
| `tests/integration/actions/cart.test.ts` | 17 | Pass |
| `tests/unit/components/rag/chat-panel.test.tsx` | 10 | Pass |
| `tests/unit/components/ai-elements/conversation.test.tsx` | 12 | Pass |

## What Worked

1. **`(fn as ReturnType<typeof vi.fn>)`** — Replaces `vi.mocked()` everywhere. Type assertion works since `vi.fn` is the mock factory in both Vitest and Bun.

2. **`server-only` mock in preload** — `mock.module('server-only', () => ({}))` in bun-setup.tsx prevents the module from throwing when imported in client test context.

3. **`--preload ./tests/bun-setup.tsx`** — Required flag on every `bun test` invocation. bunfig.toml preload is not auto-read by Bun CLI.

4. **Full `matchMedia` mock** — `mockImplementation` with complete MediaQueryList interface (addListener, removeListener, dispatchEvent) satisfies all callers.

5. **`vi.useFakeTimers()` + `vi.runAllTimers()`** — Same API as Vitest, no changes needed in test files.

6. **happy-dom via `@happy-dom/global-registrator`** — Works for React hooks and component tests. jsdom not supported (Bun uses JavaScriptCore).

7. **`bun run playwright test`** — E2E tests work with Bun runtime, no changes needed.

## What Didn't Work / Gotchas

1. **`bunfig.toml` preload not auto-read** — Bun does not pick up `[test].preload` from root bunfig.toml. Must pass `--preload ./tests/bun-setup.tsx` explicitly on CLI.

2. **`vi.mocked()` no Bun equivalent** — Solved with `(fn as ReturnType<typeof vi.fn>)` pattern. The `mocked()` helper in test-utils.ts is kept but not needed.

3. **`vi.resetModules()` not available** — Tests refactored to not depend on it; env vars are set per-test anyway.

4. **jsdom incompatible** — Bun uses JavaScriptCore not V8, so jsdom won't work. All DOM tests use happy-dom.

## Next Steps

No immediate next steps — migration is complete. All tests pass, Vitest removed, documentation updated.

If issues arise:
1. Check `docs/BUN_TESTS.md` for quick reference
2. Check `tests/bun-setup.tsx` for preload configuration
3. Run tests with `bun run test` (uses the `--preload` flag in package.json script)