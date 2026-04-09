# Project Context: Enermation Workspace

## Overview

This is a monorepo containing two related projects:

### 1. `web/` - Enermation Website (Primary Project)
A **Next.js 16** application built with the App Router, serving as a website with Shopify Storefront API integration. The project uses:

- **Framework**: Next.js 16.2.2 with React 19
- **Styling**: Tailwind CSS v4 with shadcn/ui components (base-nova style)
- **Language**: TypeScript (strict mode)
- **Package Manager**: Bun (preferred)
- **UI Components**: shadcn/ui (base-nova style) with `@base-ui/react` primitives, Lucide icons
- **State/Animation**: embla-carousel, vaul (dialogs), recharts (data viz)
- **AI Integration**: Vercel AI SDK (`ai` package)
- **API Client**: Shopify Storefront API client (v2026-04)

### 2. `graphql/` - Storefront API Learning Kit
A collection of Shopify Storefront API GraphQL query examples organized by topic, with tooling to generate Insomnia collections for API testing.

- **Purpose**: Learning and reference for Shopify Storefront API usage
- **Topics**: Metafields, international pricing, collections, products, customers, cart management, shop content
- **Output**: Generates Insomnia-compatible JSON collections

## Project Structure

```
ew/
├── web/                          # Next.js application
│   ├── app/                      # App Router pages & layouts
│   │   ├── api/                  # API routes
│   │   ├── layout.tsx            # Root layout
│   │   └── page.tsx              # Home page
│   ├── components/               # React components
│   │   └── ui/                   # shadcn/ui components
│   ├── hooks/                    # Custom React hooks
│   ├── lib/                      # Utility libraries
│   │   ├── shopify.ts            # Shopify Storefront API client
│   │   └── utils.ts              # General utilities
│   ├── public/                   # Static assets
│   ├── .env.local                # Environment variables
│   ├── next.config.ts            # Next.js configuration
│   ├── tsconfig.json             # TypeScript configuration
│   ├── components.json           # shadcn/ui configuration
│   └── package.json              # Dependencies & scripts
│
└── graphql/                      # Shopify API learning kit
    ├── examples/                 # GraphQL query examples by topic
    ├── build.js                  # Insomnia collection generator
    └── package.json              # Dependencies & scripts
```

## Building and Running

### Web Application

All commands should be run from the `web/` directory using **bun**:

```bash
# Install dependencies
bun install

# Start development server
bun run dev

# Build for production
bun run build

# Start production server
bun run start

# Run linter
bun run lint
```

### GraphQL Learning Kit

Run from the `graphql/` directory:

```bash
# Install dependencies
bun install

# Build Insomnia collection
bun run build

# Generate README
bun run readme

# Run linter
bun run lint
```

## Key Configuration

### Environment Variables (web/.env.local)
- `SHOPIFY_STORE_DOMAIN` - Shopify store domain
- `SHOPIFY_STOREFRONT_ACCESS_TOKEN` - Storefront API access token

### TypeScript Configuration
- **Target**: ES2017
- **Strict Mode**: Enabled
- **Path Aliases**: `@/*` maps to project root
- **JSX**: react-jsx

### Next.js Configuration
- Minimal config in `next.config.ts` (default options)

### shadcn/ui Configuration
- **Style**: base-nova
- **RSC**: Enabled
- **CSS Variables**: Enabled
- **Icon Library**: Lucide
- **Component Path**: `@/components/ui`

## Development Conventions

### Code Style
- TypeScript with strict mode enabled
- IMPORTANT: **Never use `any` type** — always write a proper type or interface. Use `unknown` + narrowing if the shape is genuinely unknown
- Explicit over clever patterns
- Path aliases for imports (`@/`)

### Styling
- IMPORTANT: **Never use Tailwind arbitrary values** (e.g. `w-[100px]`, `text-[#ff0000]`, `mt-[13px]`) — always use a design token or a standard Tailwind scale step
- IMPORTANT: **Never hardcode colors, radii, or spacing values** in className strings or inline styles — all values must come from CSS custom properties defined in `web/app/globals.css`
- If a required token doesn't exist in `globals.css`, add it there first, then use it via Tailwind
- Strictly use Tailwind utility classes for all styling; no inline `style={{}}` props except for truly dynamic runtime values that cannot be expressed as a class

### Data & Content
- IMPORTANT: **All static data, page content, and copy** (e.g. nav links, feature lists, testimonials, pricing tiers, product descriptions) must live in `web/lib/` as typed `.ts` files (e.g. `lib/data.ts`, `lib/nav.ts`) — never hardcode them inside component JSX
- Components import and render data; they do not define it

### Component Architecture
- App Router pattern with server components by default
- shadcn/ui for base UI components
- Custom hooks in `hooks/` directory
- Utilities and data files in `lib/` directory
- IMPORTANT: **Do not create a new component file for something used only once** — import the shadcn/ui primitive directly and compose it inline in the file where it's needed. Only extract into a separate component when it is (or will be) used in more than one place. Exception: if the single-use block exceeds ~80 lines of JSX and extraction meaningfully improves readability, extraction is acceptable — but reusability, not tidiness, should be the default reason to create a component

### Shopify Integration
- Storefront API client configured in `lib/shopify.ts`
- API version: 2026-04
- Uses `@shopify/storefront-api-client` package

## Agent Instructions

For AI coding assistants working on this project:

### Skill Loading (Before Any Work)
Before starting any task, load the following skills:

1. **vercel-react-best-practices** — React and Next.js performance optimization guidelines
2. **web-design-guidelines** — Web interface design best practices and accessibility
3. **next-best-practices** — Next.js best practices (file conventions, RSC boundaries, data patterns, etc.)

**Load upon user discretion:**
- **next-cache-components** — Next.js 16 Cache Components (PPR, use cache directive, cacheLife, cacheTag, updateTag)

### Development Guidelines
1. **Next.js 16**: This version has breaking changes from earlier versions. Check `node_modules/next/dist/docs/` for current documentation before writing code.
2. **Use Bun**: Prefer `bun`/`bunx` over `npm`/`npx`/`pnpm`.
3. **shadcn/ui**: Use existing UI components from `@/components/ui` before creating new ones.
4. **TypeScript**: Maintain strict type safety; avoid `any` types.
5. **Tailwind v4**: Use Tailwind CSS v4 syntax and conventions.

---

## Figma MCP Integration

### Required Workflow (do not skip steps)

1. Call `get_design_context` with the Figma `fileKey` and `nodeId` to get structured design output
2. Call `get_screenshot` on the same node for visual reference
3. If `get_design_context` is too large or truncated, call `get_metadata` first to get the node map, then re-fetch only the needed nodes
4. Download any assets returned by the Figma MCP server (images, SVGs)
5. Translate the output — which is React + Tailwind — into this project's conventions (see rules below)
6. Validate the final UI against the Figma screenshot for 1:1 visual parity before marking complete

### Design Token Rules

Design tokens are defined as CSS custom properties in `web/app/globals.css` and exposed to Tailwind v4 via the `@theme inline` block. **Always use semantic tokens; never hardcode color values.**

Token categories and their Tailwind class equivalents:

| Token | CSS Variable | Tailwind Class |
|---|---|---|
| Background | `--background` | `bg-background` |
| Foreground text | `--foreground` | `text-foreground` |
| Primary | `--primary` / `--primary-foreground` | `bg-primary`, `text-primary-foreground` |
| Secondary | `--secondary` / `--secondary-foreground` | `bg-secondary`, `text-secondary-foreground` |
| Muted | `--muted` / `--muted-foreground` | `bg-muted`, `text-muted-foreground` |
| Accent | `--accent` / `--accent-foreground` | `bg-accent`, `text-accent-foreground` |
| Destructive | `--destructive` | `bg-destructive`, `text-destructive` |
| Card | `--card` / `--card-foreground` | `bg-card`, `text-card-foreground` |
| Border | `--border` | `border-border` |
| Input | `--input` | `border-input` |
| Ring | `--ring` | `ring-ring` |
| Border radius | `--radius` (base: `0.625rem`) | `rounded-sm/md/lg/xl/2xl/3xl/4xl` |

- IMPORTANT: Colors use the **oklch** color space — do not convert to hex
- Radius variants: `--radius-sm` through `--radius-4xl` (computed from `--radius` base)
- Dark mode uses `.dark` class (not `prefers-color-scheme`)

### Typography

- **Sans font**: `font-sans` → Geist Sans (CSS var: `--font-geist-sans`)
- **Mono font**: `font-mono` → Geist Mono (CSS var: `--font-geist-mono`)
- **Heading font**: `font-heading` → same as `font-sans`
- Set via `next/font/google` in `web/app/layout.tsx`

### Component Library Rules

All base UI components live in `web/components/ui/`. **Always reuse existing components before creating new ones.**

Available components include: `Button`, `Card`, `Input`, `Badge`, `Dialog`, `Sheet`, `Sidebar`, `Tabs`, `Table`, `Select`, `Checkbox`, `Avatar`, `Tooltip`, `Dropdown`, `NavigationMenu`, `Carousel`, `Chart`, and many more (see `web/components/ui/`).

**Component authoring pattern:**

```tsx
// Server components (default): no "use client"
// Client components: add "use client" at the top

import { cn } from "@/lib/utils"

function MyComponent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="my-component"   // always add data-slot for CSS targeting
      className={cn("base-classes", className)}
      {...props}
    />
  )
}

export { MyComponent }  // named export, not default
```

**Component variant pattern (CVA):**

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

**Key rules:**
- IMPORTANT: Primitive components come from `@base-ui/react` (not Radix UI)
- Always accept `className` prop and merge with `cn()` from `@/lib/utils`
- Always add `data-slot="component-name"` on the root element
- Use `cva` for multi-variant components
- Named exports only (no `export default` for components)
- No `any` types; use `React.ComponentProps<"element">` for HTML element props

### Icon System

- **Library**: `lucide-react` (v1.7+)
- **Import**: `import { IconName } from "lucide-react"`
- **Default size**: SVGs without an explicit `size-*` class default to `size-4` (set by parent component styles via `[&_svg:not([class*='size-'])]:size-4`)
- IMPORTANT: Do NOT install additional icon packages — use only `lucide-react`
- IMPORTANT: If Figma MCP returns a localhost asset URL for an SVG icon, use it directly — do not substitute a Lucide icon unless it is a clear match

### Styling Rules

- **Framework**: Tailwind CSS v4 (`@import "tailwindcss"` — no `tailwind.config.js`)
- **Utility**: Always use `cn()` from `@/lib/utils` to merge class names (clsx + tailwind-merge)
- **Animations**: `tw-animate-css` is available via `@import "tw-animate-css"`
- **Global styles**: `web/app/globals.css` — add project-wide base styles in `@layer base`; all design tokens (colors, radius, spacing, typography) must be defined here
- **No CSS Modules, no styled-components** — Tailwind utility classes only
- IMPORTANT: **No arbitrary Tailwind values** — never write `w-[...]`, `h-[...]`, `text-[...]`, `bg-[#...]`, etc. Use the token scale or standard Tailwind steps
- IMPORTANT: **No inline `style={{}}` props** for values that can be expressed as Tailwind classes or CSS variables
- Responsive breakpoints: `sm:` (640px), `md:` (768px), `lg:` (1024px), `xl:` (1280px), `2xl:` (1536px)
- Mobile detection: use `useIsMobile()` hook from `@/hooks/use-mobile` (breakpoint: 768px)
- Dark mode: apply with `dark:` Tailwind prefix (activated via `.dark` class, not media query)

### Asset Handling

- Static assets live in `web/public/`; reference as `/filename.ext` in code
- Always use `next/image` (`Image` from `"next/image"`) for images — never `<img>` tags
- IMPORTANT: If the Figma MCP server returns a `localhost` source for an image or SVG, use that URL directly
- IMPORTANT: Do NOT create placeholder images when a Figma asset is available
- SVG assets can be placed in `web/public/` and used as `src` in `<Image>` or inline

### Next.js App Router Rules

- Components are **Server Components by default** — only add `"use client"` when a component requires one of the following:
  - React hooks: `useState`, `useEffect`, `useReducer`, `useRef`, etc.
  - Navigation hooks: `useRouter`, `usePathname`, `useSearchParams`, `useParams`
  - Browser APIs: `window`, `document`, `localStorage`, etc.
  - Event handlers: `onClick`, `onChange`, `onSubmit`, etc.
  - Everything else — layout, static UI, data fetching, passing props — stays as a Server Component
- Pages go in `web/app/` following App Router file conventions (`page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`)
- API routes go in `web/app/api/[route]/route.ts`
- Use `@/` path alias for all internal imports (maps to `web/` root)
- Shopify data fetching: use the client from `@/lib/shopify` — this runs server-side only; never import it in client components

### Figma-to-Code Translation

When the Figma MCP returns React + Tailwind output, apply these transformations:

1. **Colors**: Replace any hex/rgb/hsl values with the semantic token equivalents from the table above
2. **Radius**: Replace hardcoded `rounded-*` with the token-based radius classes (`rounded-lg` = `var(--radius)`)
3. **Components**: Replace generic `<div>` / `<button>` implementations with existing `@/components/ui` equivalents
4. **Icons**: Map Figma icon names to the nearest `lucide-react` icon; use localhost asset if provided
5. **Fonts**: Do not add new font imports — use `font-sans` / `font-mono` / `font-heading`
6. **Spacing**: Use Tailwind's default spacing scale (4px base); do not hardcode px values
7. **`"use client"`**: Add only if the component requires interactivity (state, effects, event handlers)
