# Lessons

## Naming / References
- Do not use the external reference site's name in plans, notes, code, or commit-related text.
- Refer to it generically as "reference site".

## Shopify Metafields — Adding New Named Vehicle Fields
When adding a new vehicle metafield in Shopify (e.g. `custom.towing_capacity`, `shopify.some-new-field`) that should appear as a top-level named field on `ShopifyProduct`:

1. **lib/types.ts** — Add `fieldName?: ShopifyMetafield | null` to `ShopifyProduct`
2. **lib/shopify.ts** — Add `fieldName: { value: getResolved('namespace', 'key'), type: '...' }` to `ResolvedVehicleData` return
3. **lib/shopify.ts** — Add `fieldName: vehicle.fieldName` to `buildProductFromRawAdmin` return
4. **lib/shopify.ts** — `fetchCollectionProducts` already spreads `...vehicle` via `resolveVehicleData` — no change needed there

The field will already appear in `resolvedSpecs[]` dynamically. The above steps only needed if it should be a named top-level field.

This is not automatic by design — adding a named field is a deliberate UI decision per field.
