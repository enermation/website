# Changelog

## 2026-04-09

**Mobile-first showroom and product experience launch**

The web app shipped major UX upgrades across homepage, collections, showroom, and product details, with a strong focus on mobile-first layouts and reusable UI primitives.

### New Features
- Delivered a mobile-first responsive homepage and header, including a hamburger drawer, responsive content blocks, and mobile/desktop-specific car listing layouts ([108d03c](https://github.com/syedaliabbas1/enermation-website/commit/108d03c)).
- Added a full product detail page structure (`/products/[handle]`) with gallery, specs, enquiry/contact sections, related cars, and related stories ([55d7744](https://github.com/syedaliabbas1/enermation-website/commit/55d7744)).
- Implemented Figma-aligned mobile layout updates for collections and refined showroom/product pages ([2312e5e](https://github.com/syedaliabbas1/enermation-website/commit/2312e5e), [ca26e5d](https://github.com/syedaliabbas1/enermation-website/commit/ca26e5d)).
- Added a Shopify catalog seed workflow to support data setup/automation ([4349d9f](https://github.com/syedaliabbas1/enermation-website/commit/4349d9f)).

### Bug Fixes
- Fixed semantic token usage, shared component consistency, and static data extraction in product/collection flows ([b0a796f](https://github.com/syedaliabbas1/enermation-website/commit/b0a796f), [6ab8817](https://github.com/syedaliabbas1/enermation-website/commit/6ab8817)).
- Corrected showroom links and Shopify query alignment, and removed duplicated footer rendering ([f091b81](https://github.com/syedaliabbas1/enermation-website/commit/f091b81), [eeb626f](https://github.com/syedaliabbas1/enermation-website/commit/eeb626f)).

### Refactoring
- Unified typography with semantic font tokens and migrated key UI blocks to shared shadcn-based components ([4c6a687](https://github.com/syedaliabbas1/enermation-website/commit/4c6a687), [a0b6fff](https://github.com/syedaliabbas1/enermation-website/commit/a0b6fff)).

### Documentation
- Added font usage mapping notes in global styles to improve maintainability ([cb6c8ac](https://github.com/syedaliabbas1/enermation-website/commit/cb6c8ac)).

## 2026-04-08

**Homepage-to-collections transition and Shopify data integration**

The project shifted from static scaffolding to a Shopify-backed, collections-driven experience, while establishing core shared layout/navigation components and repo tooling conventions.

### New Features
- Wired Shopify Storefront API into the homepage and added centralized GraphQL queries/types plus broader API test coverage ([258e0d4](https://github.com/syedaliabbas1/enermation-website/commit/258e0d4)).
- Introduced shared site header/footer/social components and initial showroom/cars navigation scaffolding ([883134e](https://github.com/syedaliabbas1/enermation-website/commit/883134e)).
- Replaced homepage product grid with collections-focused presentation and updated CTA routing to collections ([0c3431e](https://github.com/syedaliabbas1/enermation-website/commit/0c3431e), [a5cdd95](https://github.com/syedaliabbas1/enermation-website/commit/a5cdd95)).

### Refactoring
- Reworked routing from `/cars` to `/collections/*` and updated related query fields to match the new data/display model ([bb0846e](https://github.com/syedaliabbas1/enermation-website/commit/bb0846e)).

### Configuration
- Adopted Biome as the lint/format workflow and tuned includes/exclusions for project directories ([a011783](https://github.com/syedaliabbas1/enermation-website/commit/a011783), [a73a26b](https://github.com/syedaliabbas1/enermation-website/commit/a73a26b), [7ebc5ee](https://github.com/syedaliabbas1/enermation-website/commit/7ebc5ee)).
- Added Figma design token variables to global CSS and mapped them for theme usage ([c1591aa](https://github.com/syedaliabbas1/enermation-website/commit/c1591aa)).

## 2026-04-05

**Initial platform setup and repository structure**

This period established the project foundation, including the app baseline and early Shopify integration structure.

### New Features
- Restructured into `web/` and `graphql/` directories and introduced Shopify storefront client/test-route groundwork ([1cdd3e5](https://github.com/syedaliabbas1/enermation-website/commit/1cdd3e5)).
- Created the initial repository baseline and setup commits ([0158ec0](https://github.com/syedaliabbas1/enermation-website/commit/0158ec0), [bcbd2c8](https://github.com/syedaliabbas1/enermation-website/commit/bcbd2c8)).
