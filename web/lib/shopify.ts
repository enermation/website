import { createStorefrontApiClient } from '@shopify/storefront-api-client'
import { connection } from 'next/server'

function getRequiredEnv(name: 'SHOPIFY_STORE_DOMAIN' | 'SHOPIFY_STOREFRONT_ACCESS_TOKEN') {
  const value = process.env[name]?.trim()

  if (!value) {
    throw new Error(`Missing required Shopify environment variable: ${name}`)
  }

  return value
}

export async function getClient() {
  await connection()

  return createStorefrontApiClient({
    storeDomain: getRequiredEnv('SHOPIFY_STORE_DOMAIN'),
    apiVersion: '2026-04',
    publicAccessToken: getRequiredEnv('SHOPIFY_STOREFRONT_ACCESS_TOKEN'),
  })
}
