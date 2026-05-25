---
name: conventions
description: Code style, patterns, and development conventions for the Enermation workspace
metadata:
  type: codebase
---

# Coding Conventions

**Analysis Date:** 2026-05-25

## TypeScript

**Strict Mode:** Enabled (`"strict": true` in `tsconfig.json`)

**Path Alias:**
- `@/*` maps to project root (`web/`)
- Usage: `import { cn } from '@/lib/utils'` not `import { cn } from '../../lib/utils'`

**No `any` Types:**
- Biome rule: `noExplicitAny: "error"` in `biome.json`
- Use `unknown` + narrowing when shape is genuinely unknown
- `React.ComponentProps<"element">` for HTML element props

**Type Exports:**
- Use named exports only (no `export default` for components)
- Example: `export { Button, buttonVariants }` from `web/components/ui/button.tsx`

## Linting and Formatting

**Tool:** Biome v2.4.10

**Config:** `web/biome.json`

**Formatter Settings:**
- Indent: 2 spaces (not tabs)
- Line width: 100 characters
- Quote style: single quotes
- Trailing commas: ES5 style
- Semicolons: as needed

**Key Lint Rules:**
- `noUnusedVariables`: error
- `useExhaustiveDependencies`: warn
- `noNonNullAssertion`: warn
- `useImportType`: error
- `noExplicitAny`: error
- `noConsole`: warn

**Run Commands:**
```bash
bun run lint              # Check for issues
bun run lint:fix         # Auto-fix issues
bun run format           # Format code
bun run format:check     # Check formatting without fixing
```

## Styling

**Framework:** Tailwind CSS v4 (no `tailwind.config.js` — uses `@import "tailwindcss"`)

**Design Tokens:** All defined as CSS custom properties in `web/app/globals.css` using oklch color space

**Color Tokens (examples from `globals.css`):**
```css
--background: oklch(0.98 0 0);
--foreground: oklch(0.2 0 0);
--primary: oklch(0.2 0 0);
--border: oklch(0.9 0 0);
--radius: 0.625rem;
```

**Tailwind Classes:**
- Use semantic tokens: `bg-primary`, `text-foreground`, `border-border` (not `bg-[#hex]`)
- Never use arbitrary values: no `w-[100px]`, `text-[#ff0000]`, `mt-[13px]`
- Never hardcode colors, radii, or spacing in `className` or inline `style={{}}`
- Responsive breakpoints: `sm:` (640px), `md:` (768px), `lg:` (1024px), `xl:` (1280px), `2xl:` (1536px)

**Dark Mode:**
- Activate via `.dark` class on container (not `prefers-color-scheme`)
- Token overrides defined under `.dark { }` in `globals.css`

**Radius Variants:**
```css
--radius-sm: calc(var(--radius) * 0.6);
--radius-md: calc(var(--radius) * 0.8);
--radius-lg: var(--radius);
--radius-xl: calc(var(--radius) * 1.4);
/* etc. */
```

**Utility Functions:**
- `cn()` from `@/lib/utils` merges Tailwind classes: `cn("base-classes", className)`
- Never use `clsx` or `tailwind-merge` directly

## Component Patterns

**Authoring Pattern (from `web/components/ui/button.tsx`):**
```tsx
'use client'  // Only when component needs interactivity

import { cn } from '@/lib/utils'

function MyComponent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="my-component"
      className={cn("base-classes", className)}
      {...props}
    />
  )
}

export { MyComponent }  // Named export, not default
```

**Variant Pattern (CVA):**
```tsx
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const myVariants = cva("base-classes", {
  variants: {
    variant: { default: "...", outline: "..." },
    size: { default: "...", sm: "...", lg: "..." },
  },
  defaultVariants: { variant: "default", size: "default" },
})

function MyComponent({
  className,
  variant,
  size,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof myVariants>) {
  return <div className={cn(myVariants({ variant, size, className }))} {...props} />
}
```

**Server vs Client Components:**
- Server components by default (no `"use client"`)
- Add `"use client"` only when needing: React hooks, navigation hooks, browser APIs, event handlers
- Shopify client from `@/lib/shopify` runs server-side only — never import in client components

**Data in lib/, Not Components:**
- Static data, page content, copy lives in `web/lib/` as typed `.ts` files
- Components import and render data; they do not define it

**Single-Use Rule:**
- Do not create a new component file for something used only once
- Import shadcn/ui primitive directly and compose inline
- Exception: if single-use block exceeds ~80 lines of JSX and extraction improves readability

**Icon Imports:**
```tsx
import { IconName } from '@heroicons/react/24/outline'  // or solid
import { IconName } from 'lucide-react'
// Usage: <IconName className="size-5" />
```

## Git Commit Conventions

**Rule:** Never add `Co-Authored-By: Claude` or any Claude attribution in commit messages.

**Project:** Uses Husky for pre-commit hooks and Changesets for versioning.

**Commit Commands:**
```bash
bun run changeset      # Create a changeset
bun run version-packages  # Version packages based on changesets
```

**Commit Message Style:** Conventional commits (enforced via `@commitlint/config-conventional`)

## Import Organization

**Order (enforced by Biome auto-import):**
1. Node.js built-ins
2. External packages
3. Internal path aliases (`@/...`)

**Path Aliases:**
- `@/*` — project root (`web/`)
- Example: `import { cn } from '@/lib/utils'`

## Error Handling

- Never return `null` or `[]` from persistently cached functions (`'use cache'`, Redis) — throw instead
- Callers use `.catch(() => null)` for graceful degradation
- Persistent caches store whatever is returned, including failures

## React 19 + useChat

- Always include `experimental_throttle: 50` on `useChat`
- Fast streaming fires one `useSyncExternalStore` notification per token, which React 19 processes synchronously and exceeds its 50-nested-update limit without throttling

## Vercel AI Gateway BYOK

- Dashboard-configured BYOK alone is insufficient
- Every request must include `providerOptions.gateway.byok` with actual provider API keys
- Export byok helpers: `chatModelByok()`, `visionModelByok()`

---

*Convention analysis: 2026-05-25*