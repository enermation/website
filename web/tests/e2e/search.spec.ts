import { expect, test } from '@playwright/test'

// ── Search Flow ────────────────────────────────────────────────────────────────

test.describe('Search', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('type query, see product results, click product, navigate to PDP', async ({ page }) => {
    // Use the search bar in the header
    const searchInput = page.getByPlaceholder(/search/i).first()
    await searchInput.waitFor({ state: 'visible' })

    // Type a vehicle query
    await searchInput.fill('Toyota Hilux')
    await searchInput.press('Enter')

    // Wait for search results page
    await page.waitForURL(/\/search/)

    // Verify results loaded
    await expect(page.getByText(/results/i).first()).toBeVisible({ timeout: 5000 })

    // Should see at least one product card
    const firstResult = page.locator('[data-product-card]').first()
    await expect(firstResult).toBeVisible({ timeout: 5000 })

    // Verify product title contains our search terms
    const productTitle = firstResult.locator('text=/toyota|hilux/i').first()
    await expect(productTitle).toBeVisible()

    // Click the product
    await firstResult.locator('a').first().click()

    // Verify we're on a PDP
    await page.waitForURL(/\/products\//, { timeout: 10000 })

    // Verify product details loaded
    await expect(page.locator('text=/add to cart/i')).toBeVisible({ timeout: 5000 })
  })

  test('empty query returns to home with no results shown', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/search/i).first()
    await searchInput.fill('')
    await searchInput.press('Enter')

    // Should not show results page for empty query
    await page.waitForURL({ timeout: 5000 })
    expect(page.url()).not.toContain('/search')
  })

  test('search with no results shows empty state', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/search/i).first()
    await searchInput.fill('xyzabcnonexistentvehicle12345')
    await searchInput.press('Enter')

    await page.waitForURL(/\/search/)

    // Should show "no results" or similar empty state
    await expect(page.getByText(/no results|not found|couldn't find/i).first()).toBeVisible({
      timeout: 5000,
    })
  })
})
