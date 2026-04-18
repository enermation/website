#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { catalog } from './shopify-catalog-data.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, '..')

async function main() {
  const options = parseArgs(process.argv.slice(2))

  if (options.help) {
    printUsage()
    process.exit(0)
  }

  loadEnvFile(path.join(repoRoot, '.env.local'))
  loadEnvFile(path.join(repoRoot, 'web', '.env.local'))

  const storeDomain = getRequiredEnv('SHOPIFY_ADMIN_STORE_DOMAIN', [
    'PUBLIC_STORE_DOMAIN',
    'SHOPIFY_STORE_DOMAIN',
  ])
  const expectedCurrency =
    process.env.SHOPIFY_SEED_EXPECTED_CURRENCY?.trim() || catalog.store.currencyCode
  const publicationName =
    process.env.SHOPIFY_HEADLESS_PUBLICATION_NAME?.trim() || catalog.store.publicationName

  const auth = await getAdminAccess(storeDomain)
  const scopeSet = new Set(
    (auth.scope ?? '')
      .split(',')
      .map(entry => entry.trim())
      .filter(Boolean)
  )

  if (auth.scope && !scopeSet.has('read_products') && !scopeSet.has('write_products')) {
    fail(
      [
        'This script requires the Shopify Admin token to include `read_products` or `write_products`.',
        `Current scopes: ${auth.scope}`,
        'Update the app scopes in Shopify Dev Dashboard, release/install the app again, then rerun this script.',
      ].join('\n')
    )
  }

  if (
    !process.env.SHOPIFY_ADMIN_LOCATION_ID?.trim() &&
    auth.scope &&
    !scopeSet.has('read_locations')
  ) {
    fail(
      [
        'Inventory setup needs a Shopify location.',
        'Either set `SHOPIFY_ADMIN_LOCATION_ID` in `.env.local` or add the `read_locations` scope to the app and reinstall it.',
        `Current scopes: ${auth.scope}`,
      ].join('\n')
    )
  }

  console.log(`Using store: ${storeDomain}`)
  if (options.dryRun) {
    console.log('Dry run enabled: no Shopify mutations will be executed.')
  }

  const shopContext = await adminGraphql(auth.token, storeDomain, SHOP_CONTEXT_QUERY)
  const shop = shopContext.shop
  const publications = shopContext.publications.nodes

  if (!options.skipCurrencyCheck && shop.currencyCode !== expectedCurrency) {
    fail(
      [
        'Store currency mismatch.',
        `Expected: ${expectedCurrency}`,
        `Actual:   ${shop.currencyCode}`,
        'Change the store currency, update `SHOPIFY_SEED_EXPECTED_CURRENCY`, or rerun with `--skip-currency-check` if this is intentional.',
      ].join('\n')
    )
  }

  const publication = resolvePublication(publications, publicationName)
  const locationId = options.dryRun
    ? process.env.SHOPIFY_ADMIN_LOCATION_ID?.trim() || '(required at runtime)'
    : await resolveLocationId(auth, storeDomain)

  console.log(`Shop currency: ${shop.currencyCode}`)
  console.log(`Headless publication: ${publication.name}`)
  console.log(`Inventory location: ${locationId}`)

  const collectionsByHandle = await ensureCollections({
    auth,
    storeDomain,
    publicationId: publication.id,
    dryRun: options.dryRun,
  })

  if (options.archiveUnmanaged) {
    await archiveUnmanagedProducts({
      auth,
      storeDomain,
      keepHandles: new Set(catalog.products.map(product => product.handle)),
      dryRun: options.dryRun,
    })
  }

  for (const product of catalog.products) {
    const collectionIds = product.collections.map(handle => {
      const collectionId = collectionsByHandle.get(handle)

      if (!collectionId) {
        fail(`Missing collection id for handle \`${handle}\`.`)
      }

      return collectionId
    })

    const productInput = buildProductInput(product, collectionIds, locationId)

    if (options.dryRun) {
      console.log(`DRY RUN productSet ${product.handle}`)
      continue
    }

    const payload = await adminGraphql(auth.token, storeDomain, PRODUCT_SET_MUTATION, {
      identifier: { handle: product.handle },
      input: productInput,
      synchronous: true,
    })

    const userErrors = payload.productSet.userErrors ?? []
    if (userErrors.length > 0) {
      fail(formatUserErrors(`productSet ${product.handle}`, userErrors))
    }

    const createdProduct = payload.productSet.product
    if (!createdProduct?.id) {
      fail(`Shopify did not return a product id for \`${product.handle}\`.`)
    }

    await publishResource({
      auth,
      storeDomain,
      resourceId: createdProduct.id,
      publicationId: publication.id,
      label: `product ${product.handle}`,
      dryRun: false,
    })

    console.log(`Upserted product ${product.handle}`)
  }

  console.log('Seed complete.')
  console.log('Manual work still left: upload product images in Shopify Admin.')
}

function parseArgs(args) {
  return {
    archiveUnmanaged: args.includes('--archive-unmanaged'),
    dryRun: args.includes('--dry-run'),
    help: args.includes('--help') || args.includes('-h'),
    skipCurrencyCheck: args.includes('--skip-currency-check'),
  }
}

function printUsage() {
  console.log(`Usage:
  node scripts/seed-shopify-catalog.mjs [--dry-run] [--archive-unmanaged] [--skip-currency-check]

Environment:
  SHOPIFY_ADMIN_STORE_DOMAIN     preferred
  PUBLIC_STORE_DOMAIN            accepted fallback
  SHOPIFY_STORE_DOMAIN           legacy fallback
  SHOPIFY_ADMIN_CLIENT_ID        required unless SHOPIFY_ADMIN_ACCESS_TOKEN is set
  SHOPIFY_ADMIN_CLIENT_SECRET    required unless SHOPIFY_ADMIN_ACCESS_TOKEN is set
  SHOPIFY_ADMIN_ACCESS_TOKEN     optional shortcut if you already have a token
  SHOPIFY_HEADLESS_PUBLICATION_NAME optional, defaults to "${catalog.store.publicationName}"
  SHOPIFY_SEED_EXPECTED_CURRENCY optional, defaults to "${catalog.store.currencyCode}"
  SHOPIFY_ADMIN_LOCATION_ID      optional if the app token includes read_locations
`)
}

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return
  }

  const content = fs.readFileSync(filePath, 'utf8')

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#') || !line.includes('=')) {
      continue
    }

    const separatorIndex = rawLine.indexOf('=')
    const key = rawLine.slice(0, separatorIndex).trim()
    if (!key || process.env[key]) {
      continue
    }

    let value = rawLine.slice(separatorIndex + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }

    process.env[key] = value
  }
}

function getRequiredEnv(name, aliases = []) {
  for (const candidate of [name, ...aliases]) {
    const value = process.env[candidate]?.trim()
    if (value) {
      return value
    }
  }

  const aliasText = aliases.length > 0 ? ` (also checked: ${aliases.join(', ')})` : ''
  fail(`Missing required environment variable: ${name}${aliasText}`)
}

async function getAdminAccess(storeDomain) {
  const directToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN?.trim()
  if (directToken) {
    return { token: directToken, scope: null }
  }

  const clientId = getRequiredEnv('SHOPIFY_ADMIN_CLIENT_ID')
  const clientSecret = getRequiredEnv('SHOPIFY_ADMIN_CLIENT_SECRET')

  const response = await fetch(`https://${storeDomain}/admin/oauth/access_token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'client_credentials',
    }),
  })

  const text = await response.text()
  const payload = text ? JSON.parse(text) : {}

  if (!response.ok || !payload.access_token) {
    fail(`Failed to exchange Shopify Admin token.\n${text}`)
  }

  return {
    token: payload.access_token,
    scope: payload.scope ?? null,
  }
}

async function adminGraphql(token, storeDomain, query, variables = {}) {
  const response = await fetch(`https://${storeDomain}/admin/api/2026-04/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': token,
    },
    body: JSON.stringify({ query, variables }),
  })

  const text = await response.text()
  const payload = text ? JSON.parse(text) : {}

  if (!response.ok) {
    fail(`Shopify Admin API HTTP ${response.status}: ${text}`)
  }

  if (payload.errors?.length) {
    fail(`Shopify Admin GraphQL errors:\n${JSON.stringify(payload.errors, null, 2)}`)
  }

  return payload.data
}

function resolvePublication(publications, requestedName) {
  const directMatch = publications.find(publication => publication.name === requestedName)
  if (directMatch) {
    return directMatch
  }

  const headlessMatch = publications.find(publication =>
    publication.name.toLowerCase().includes('headless')
  )
  if (headlessMatch) {
    return headlessMatch
  }

  fail(
    [
      `Could not find publication "${requestedName}".`,
      `Available publications: ${publications.map(publication => publication.name).join(', ')}`,
    ].join('\n')
  )
}

async function resolveLocationId(auth, storeDomain) {
  const explicitLocationId = process.env.SHOPIFY_ADMIN_LOCATION_ID?.trim()
  if (explicitLocationId) {
    return explicitLocationId
  }

  const data = await adminGraphql(auth.token, storeDomain, LOCATIONS_QUERY)
  const firstLocation = data.locations.nodes[0]

  if (!firstLocation?.id) {
    fail('No Shopify locations were returned. Set SHOPIFY_ADMIN_LOCATION_ID explicitly.')
  }

  return firstLocation.id
}

async function ensureCollections({ auth, storeDomain, publicationId, dryRun }) {
  const collectionsByHandle = new Map()

  for (const collection of catalog.collections) {
    const existing = await findCollectionByHandle(auth.token, storeDomain, collection.handle)

    if (existing) {
      collectionsByHandle.set(collection.handle, existing.id)

      if (dryRun) {
        console.log(`DRY RUN collectionUpdate ${collection.handle}`)
      } else {
        const updated = await adminGraphql(auth.token, storeDomain, COLLECTION_UPDATE_MUTATION, {
          input: {
            id: existing.id,
            handle: collection.handle,
            title: collection.title,
            descriptionHtml: asParagraph(collection.description),
          },
        })

        const userErrors = updated.collectionUpdate.userErrors ?? []
        if (userErrors.length > 0) {
          fail(formatUserErrors(`collectionUpdate ${collection.handle}`, userErrors))
        }

        await publishResource({
          auth,
          storeDomain,
          resourceId: existing.id,
          publicationId,
          label: `collection ${collection.handle}`,
          dryRun: false,
        })
      }

      continue
    }

    if (dryRun) {
      console.log(`DRY RUN collectionCreate ${collection.handle}`)
      collectionsByHandle.set(collection.handle, `dry-run:${collection.handle}`)
      continue
    }

    const created = await adminGraphql(auth.token, storeDomain, COLLECTION_CREATE_MUTATION, {
      input: {
        handle: collection.handle,
        title: collection.title,
        descriptionHtml: asParagraph(collection.description),
      },
    })

    const userErrors = created.collectionCreate.userErrors ?? []
    if (userErrors.length > 0) {
      fail(formatUserErrors(`collectionCreate ${collection.handle}`, userErrors))
    }

    const createdCollection = created.collectionCreate.collection
    if (!createdCollection?.id) {
      fail(`Shopify did not return a collection id for \`${collection.handle}\`.`)
    }

    collectionsByHandle.set(collection.handle, createdCollection.id)

    await publishResource({
      auth,
      storeDomain,
      resourceId: createdCollection.id,
      publicationId,
      label: `collection ${collection.handle}`,
      dryRun: false,
    })
  }

  return collectionsByHandle
}

async function findCollectionByHandle(token, storeDomain, handle) {
  const data = await adminGraphql(token, storeDomain, COLLECTIONS_BY_HANDLE_QUERY, {
    query: `handle:${handle}`,
  })

  return data.collections.nodes.find(collection => collection.handle === handle) ?? null
}

async function archiveUnmanagedProducts({ auth, storeDomain, keepHandles, dryRun }) {
  const products = await listAllProducts(auth.token, storeDomain)
  const unmanaged = products.filter(product => !keepHandles.has(product.handle))

  if (unmanaged.length === 0) {
    console.log('No unmanaged products found.')
    return
  }

  console.log(`Found ${unmanaged.length} unmanaged product(s).`)

  for (const product of unmanaged) {
    if (dryRun) {
      console.log(`DRY RUN archive product ${product.handle}`)
      continue
    }

    const result = await adminGraphql(auth.token, storeDomain, PRODUCT_SET_MUTATION, {
      identifier: { id: product.id },
      input: {
        status: 'ARCHIVED',
      },
      synchronous: true,
    })

    const userErrors = result.productSet.userErrors ?? []
    if (userErrors.length > 0) {
      fail(formatUserErrors(`archive product ${product.handle}`, userErrors))
    }

    console.log(`Archived unmanaged product ${product.handle}`)
  }
}

async function listAllProducts(token, storeDomain) {
  const products = []
  let hasNextPage = true
  let after = null

  while (hasNextPage) {
    const data = await adminGraphql(token, storeDomain, PRODUCTS_QUERY, { after })
    products.push(...data.products.nodes)
    hasNextPage = data.products.pageInfo.hasNextPage
    after = data.products.pageInfo.endCursor
  }

  return products
}

async function publishResource({ auth, storeDomain, resourceId, publicationId, label, dryRun }) {
  if (dryRun) {
    console.log(`DRY RUN publish ${label}`)
    return
  }

  const result = await adminGraphql(auth.token, storeDomain, PUBLISHABLE_PUBLISH_MUTATION, {
    id: resourceId,
    input: [{ publicationId }],
  })

  const userErrors = result.publishablePublish.userErrors ?? []
  if (userErrors.length > 0) {
    fail(formatUserErrors(`publish ${label}`, userErrors))
  }
}

function buildProductInput(product, collectionIds, locationId) {
  const metafields = buildMetafields(product)
  const base = {
    collections: collectionIds,
    descriptionHtml: asParagraph(product.description),
    handle: product.handle,
    metafields,
    productType: product.productType,
    status: product.status,
    tags: product.tags,
    title: product.title,
    vendor: product.vendor,
  }

  if (product.kind === 'vehicle') {
    const year = product.metafields.year
    const transmission = product.metafields.transmission
    const fuelType = product.metafields.fuel_type

    return {
      ...base,
      productOptions: [
        { name: 'Year', position: 1, values: [{ name: year }] },
        { name: 'Transmission', position: 2, values: [{ name: transmission }] },
        { name: 'Fuel Type', position: 3, values: [{ name: fuelType }] },
      ],
      variants: [
        buildVariantInput({
          price: product.price,
          inventoryQuantity: product.inventoryQuantity,
          locationId,
          optionValues: [
            { optionName: 'Year', name: year },
            { optionName: 'Transmission', name: transmission },
            { optionName: 'Fuel Type', name: fuelType },
          ],
          requiresShipping: product.requiresShipping,
          trackInventory: product.trackInventory,
        }),
      ],
    }
  }

  return {
    ...base,
    productOptions: [{ name: 'Title', position: 1, values: [{ name: 'Default Title' }] }],
    variants: [
      buildVariantInput({
        price: product.price,
        inventoryQuantity: product.inventoryQuantity,
        locationId,
        optionValues: [{ optionName: 'Title', name: 'Default Title' }],
        requiresShipping: product.requiresShipping,
        trackInventory: product.trackInventory,
      }),
    ],
  }
}

function buildVariantInput({
  price,
  inventoryQuantity,
  locationId,
  optionValues,
  requiresShipping,
  trackInventory,
}) {
  return {
    inventoryItem: {
      requiresShipping,
      tracked: trackInventory,
    },
    inventoryPolicy: 'DENY',
    inventoryQuantities: [
      {
        locationId,
        name: 'available',
        quantity: inventoryQuantity,
      },
    ],
    optionValues,
    price: String(price),
  }
}

function buildMetafields(product) {
  const namespace = product.kind === 'vehicle' ? 'vehicle' : 'part'

  return Object.entries(product.metafields).map(([key, value]) => ({
    key,
    namespace,
    type: key === 'compatibility' ? 'list.single_line_text_field' : 'single_line_text_field',
    value: Array.isArray(value) ? JSON.stringify(value) : String(value),
  }))
}

function asParagraph(text) {
  return `<p>${escapeHtml(text)}</p>`
}

function escapeHtml(text) {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function formatUserErrors(label, userErrors) {
  return [
    `Shopify returned userErrors for ${label}:`,
    ...userErrors.map(error => {
      const field = Array.isArray(error.field)
        ? error.field.join('.')
        : (error.field ?? '(unknown field)')
      return `- ${field}: ${error.message}`
    }),
  ].join('\n')
}

function fail(message) {
  console.error(message)
  process.exit(1)
}

const SHOP_CONTEXT_QUERY = `
  query ShopContext {
    shop {
      name
      currencyCode
      myshopifyDomain
    }
    publications(first: 20) {
      nodes {
        id
        name
      }
    }
  }
`

const LOCATIONS_QUERY = `
  query Locations {
    locations(first: 20) {
      nodes {
        id
        name
      }
    }
  }
`

const COLLECTIONS_BY_HANDLE_QUERY = `
  query CollectionsByHandle($query: String!) {
    collections(first: 10, query: $query) {
      nodes {
        id
        handle
        title
      }
    }
  }
`

const PRODUCTS_QUERY = `
  query Products($after: String) {
    products(first: 250, after: $after) {
      nodes {
        id
        handle
        title
        status
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`

const COLLECTION_CREATE_MUTATION = `
  mutation CollectionCreate($input: CollectionInput!) {
    collectionCreate(input: $input) {
      collection {
        id
        handle
        title
      }
      userErrors {
        field
        message
      }
    }
  }
`

const COLLECTION_UPDATE_MUTATION = `
  mutation CollectionUpdate($input: CollectionInput!) {
    collectionUpdate(input: $input) {
      collection {
        id
        handle
        title
      }
      userErrors {
        field
        message
      }
    }
  }
`

const PRODUCT_SET_MUTATION = `
  mutation ProductSet($identifier: ProductSetIdentifiers, $input: ProductSetInput!, $synchronous: Boolean) {
    productSet(identifier: $identifier, input: $input, synchronous: $synchronous) {
      product {
        id
        handle
        title
        status
      }
      userErrors {
        field
        message
      }
    }
  }
`

const PUBLISHABLE_PUBLISH_MUTATION = `
  mutation PublishablePublish($id: ID!, $input: [PublicationInput!]!) {
    publishablePublish(id: $id, input: $input) {
      userErrors {
        field
        message
      }
    }
  }
`

await main()
