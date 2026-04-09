/**
 * Creates product metafield definitions in Shopify and exposes them to the Storefront API.
 * Run from the repo root: bun scripts/setup-metafields.ts
 *
 * This script is idempotent — safe to run multiple times. It will skip definitions
 * that already exist and only create missing ones.
 */

const domain = (process.env.SHOPIFY_ADMIN_STORE_DOMAIN ?? process.env.SHOPIFY_STORE_DOMAIN)?.trim()
const token = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN?.trim()

if (!domain) {
  console.error("Missing SHOPIFY_ADMIN_STORE_DOMAIN or SHOPIFY_STORE_DOMAIN in .env.local")
  process.exit(1)
}

if (!token) {
  console.error("Missing SHOPIFY_ADMIN_ACCESS_TOKEN in .env.local")
  process.exit(1)
}

const API_VERSION = "2026-04"
const ENDPOINT = `https://${domain}/admin/api/${API_VERSION}/graphql.json`

// ── Metafield definitions to create ──────────────────────────────────────────

type MetafieldDef = {
  name: string
  key: string
  type: string
  description: string
  ownerType: "PRODUCT"
  access: {
    admin: string
    storefront: string
  }
}

const VEHICLE_METAFIELDS: MetafieldDef[] = [
  {
    name: "Make",
    key: "make",
    type: "single_line_text_field",
    description: "Vehicle manufacturer (e.g. Toyota, Lexus, Nissan)",
    ownerType: "PRODUCT",
    access: { admin: "merchant_read_write", storefront: "public_read" },
  },
  {
    name: "Model",
    key: "model",
    type: "single_line_text_field",
    description: "Vehicle model name (e.g. Land Cruiser 200 Series, LX 570)",
    ownerType: "PRODUCT",
    access: { admin: "merchant_read_write", storefront: "public_read" },
  },
  {
    name: "Year",
    key: "year",
    type: "number_integer",
    description: "Manufacturing year of the vehicle",
    ownerType: "PRODUCT",
    access: { admin: "merchant_read_write", storefront: "public_read" },
  },
  {
    name: "Mileage",
    key: "mileage",
    type: "single_line_text_field",
    description: "Odometer reading with unit (e.g. 28,500 km)",
    ownerType: "PRODUCT",
    access: { admin: "merchant_read_write", storefront: "public_read" },
  },
  {
    name: "Colour",
    key: "colour",
    type: "single_line_text_field",
    description: "Exterior paint colour",
    ownerType: "PRODUCT",
    access: { admin: "merchant_read_write", storefront: "public_read" },
  },
  {
    name: "Fuel Type",
    key: "fuel_type",
    type: "single_line_text_field",
    description: "Fuel type (e.g. Petrol, Diesel, Hybrid)",
    ownerType: "PRODUCT",
    access: { admin: "merchant_read_write", storefront: "public_read" },
  },
  {
    name: "Transmission",
    key: "transmission",
    type: "single_line_text_field",
    description: "Transmission type (e.g. Automatic, Manual)",
    ownerType: "PRODUCT",
    access: { admin: "merchant_read_write", storefront: "public_read" },
  },
  {
    name: "Origin Country",
    key: "origin_country",
    type: "single_line_text_field",
    description: "Country of origin or sourcing (e.g. Japan, UAE, UK)",
    ownerType: "PRODUCT",
    access: { admin: "merchant_read_write", storefront: "public_read" },
  },
  {
    name: "Condition",
    key: "condition",
    type: "single_line_text_field",
    description: "Vehicle condition (e.g. Used, New)",
    ownerType: "PRODUCT",
    access: { admin: "merchant_read_write", storefront: "public_read" },
  },
  {
    name: "Engine",
    key: "engine",
    type: "single_line_text_field",
    description: "Engine specification (e.g. 4.5L V8 Twin-Turbo Diesel)",
    ownerType: "PRODUCT",
    access: { admin: "merchant_read_write", storefront: "public_read" },
  },
]

const PART_METAFIELDS: MetafieldDef[] = [
  {
    name: "Part Number",
    key: "part_number",
    type: "single_line_text_field",
    description: "OEM or manufacturer part number",
    ownerType: "PRODUCT",
    access: { admin: "merchant_read_write", storefront: "public_read" },
  },
  {
    name: "Part Type",
    key: "part_type",
    type: "single_line_text_field",
    description: "Category of the part (e.g. Oil Filter, Brake Pads)",
    ownerType: "PRODUCT",
    access: { admin: "merchant_read_write", storefront: "public_read" },
  },
  {
    name: "Compatibility",
    key: "compatibility",
    type: "list.single_line_text_field",
    description: "List of compatible vehicle models",
    ownerType: "PRODUCT",
    access: { admin: "merchant_read_write", storefront: "public_read" },
  },
]

const ALL_METAFIELDS = [...VEHICLE_METAFIELDS, ...PART_METAFIELDS]

// ── GraphQL mutations ────────────────────────────────────────────────────────

const CREATE_DEFINITION_MUTATION = `
  mutation MetafieldDefinitionCreate($definition: MetafieldDefinitionInput!) {
    metafieldDefinitionCreate(definition: $definition) {
      createdDefinition {
        id
        name
        namespace
        key
        type
      }
      userErrors {
        field
        message
      }
    }
  }
`

const LIST_DEFINITIONS_QUERY = `
  query MetafieldDefinitions($ownerType: MetafieldOwnerType!) {
    metafieldDefinitions(first: 50, ownerType: $ownerType) {
      nodes {
        id
        name
        namespace
        key
        type
      }
    }
  }
`

// ── Helpers ──────────────────────────────────────────────────────────────────

async function graphql(query: string, variables: Record<string, unknown> = {}) {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": token,
    },
    body: JSON.stringify({ query, variables }),
  })

  if (!res.ok) {
    const body = await res.text()
    console.error(`HTTP ${res.status}: ${body}`)
    process.exit(1)
  }

  const json = (await res.json()) as {
    data?: Record<string, unknown>
    errors?: { message: string; locations: unknown[] }[]
  }

  if (json.errors) {
    console.error("GraphQL errors:", JSON.stringify(json.errors, null, 2))
    process.exit(1)
  }

  return json.data
}

async function getExistingDefinitions(): Promise<Map<string, { id: string; key: string }>> {
  const data = (await graphql(LIST_DEFINITIONS_QUERY, { ownerType: "PRODUCT" })) as {
    metafieldDefinitions: { nodes: { id: string; key: string; namespace: string }[] }
  }

  const map = new Map<string, { id: string; key: string }>()
  for (const node of data.metafieldDefinitions.nodes) {
    // Only track definitions in the "vehicle" or "custom" namespace
    if (node.namespace === "vehicle" || node.namespace === "custom") {
      map.set(node.key, { id: node.id, key: node.key })
    }
  }
  return map
}

async function createDefinition(def: MetafieldDef): Promise<void> {
  const data = (await graphql(CREATE_DEFINITION_MUTATION, {
    definition: {
      name: def.name,
      namespace: "vehicle",
      key: def.key,
      description: def.description,
      type: def.type,
      ownerType: def.ownerType,
      access: def.access,
    },
  })) as {
    metafieldDefinitionCreate: {
      createdDefinition: { id: string; name: string; key: string } | null
      userErrors: { field: string[]; message: string }[]
    }
  }

  const { createdDefinition, userErrors } = data.metafieldDefinitionCreate

  if (userErrors.length > 0) {
    console.error(`  Failed to create "${def.name}":`)
    for (const err of userErrors) {
      console.error(`    ${err.field?.join(".") ?? "(unknown)"}: ${err.message}`)
    }
    return
  }

  if (createdDefinition) {
    console.log(`  Created: ${def.name} (vehicle.${def.key}) → ${def.type}`)
  }
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`Setting up metafield definitions for ${domain}...`)
  console.log("")

  const existing = await getExistingDefinitions()
  const toCreate = ALL_METAFIELDS.filter((def) => !existing.has(def.key))

  if (toCreate.length === 0) {
    console.log("All metafield definitions already exist. Nothing to do.")
    return
  }

  console.log(`Creating ${toCreate.length} metafield definition(s):\n`)

  for (const def of toCreate) {
    await createDefinition(def)
  }

  console.log("")
  console.log("Done. Metafields are now accessible via the Storefront API.")
  console.log("")
  console.log("Next steps:")
  console.log("  1. Run the seed script to populate product metafield values:")
  console.log("     bun scripts/seed-shopify-catalog.mjs")
  console.log("  2. Update web/lib/queries.ts to fetch metafields in product queries")
  console.log("  3. Update web/lib/types.ts with the new metafield types")
  console.log("  4. Update components to use structured metafield data")
}

await main()
