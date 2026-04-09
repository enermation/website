/**
 * Quick connectivity test for the Shopify Admin API.
 * Run from the repo root: bun scripts/test-admin.ts
 */

const domain = (process.env.SHOPIFY_ADMIN_STORE_DOMAIN ?? process.env.SHOPIFY_STORE_DOMAIN)?.trim()
let token = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN?.trim()
let scope: string | undefined

if (!domain) {
  console.error("Missing SHOPIFY_ADMIN_STORE_DOMAIN or SHOPIFY_STORE_DOMAIN in .env.local")
  process.exit(1)
}

if (!token) {
  const clientId = process.env.SHOPIFY_ADMIN_CLIENT_ID?.trim()
  const clientSecret = process.env.SHOPIFY_ADMIN_CLIENT_SECRET?.trim()

  if (!clientId || !clientSecret) {
    console.error(
      "Missing SHOPIFY_ADMIN_ACCESS_TOKEN or SHOPIFY_ADMIN_CLIENT_ID/SHOPIFY_ADMIN_CLIENT_SECRET in .env.local"
    )
    process.exit(1)
  }

  const authRes = await fetch(`https://${domain}/admin/oauth/access_token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "client_credentials",
    }),
  })

  if (!authRes.ok) {
    console.error(`Token exchange failed: HTTP ${authRes.status} ${authRes.statusText}`)
    console.error(await authRes.text())
    process.exit(1)
  }

  const authJson = await authRes.json() as { access_token?: string; scope?: string }
  token = authJson.access_token?.trim()
  scope = authJson.scope

  if (!token) {
    console.error("Token exchange succeeded but no access token was returned.")
    process.exit(1)
  }
}

const url = `https://${domain}/admin/api/2026-04/graphql.json`

const query = `{
  shop {
    name
    email
    myshopifyDomain
    plan { displayName }
  }
}`

const res = await fetch(url, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-Shopify-Access-Token": token,
  },
  body: JSON.stringify({ query }),
})

if (!res.ok) {
  console.error(`HTTP ${res.status} ${res.statusText}`)
  const body = await res.text()
  console.error(body)
  process.exit(1)
}

const json = await res.json() as { data?: { shop?: Record<string, unknown> }; errors?: unknown[] }

if (json.errors) {
  console.error("GraphQL errors:", JSON.stringify(json.errors, null, 2))
  process.exit(1)
}

console.log("Admin API connection successful!")
console.log("Shop:", JSON.stringify(json.data?.shop, null, 2))
if (scope) {
  console.log("Scopes:", scope)
}
