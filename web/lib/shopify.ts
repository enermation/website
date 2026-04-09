import { createStorefrontApiClient } from '@shopify/storefront-api-client'

function getRequiredEnv(name: 'SHOPIFY_STORE_DOMAIN' | 'SHOPIFY_STOREFRONT_ACCESS_TOKEN') {
  const value = process.env[name]?.trim()

  if (!value) {
    throw new Error(`Missing required Shopify environment variable: ${name}`)
  }

  return value
}

const client = createStorefrontApiClient({
  storeDomain: getRequiredEnv('SHOPIFY_STORE_DOMAIN'),
  apiVersion: '2026-04',
  publicAccessToken: getRequiredEnv('SHOPIFY_STOREFRONT_ACCESS_TOKEN'),
})

export default client
