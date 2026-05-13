import { expect, test } from '@playwright/test'

// -- Cart Flow -----------------------------------------------------------------

test.describe('Cart', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('add product to cart, view cart, update quantity, remove item', async ({ page }) => {
    await page.goto('/collections/pickup-trucks')
    await page.waitForSelector('[data-product-card], .grid > div', { timeout: 10000 })

    await page
      .locator('[data-cart-count]')
      .textContent()
      .catch(() => '0')

    const firstProduct = page.locator('[data-product-card]').first()
    await firstProduct.click()
    await page.waitForURL(/\/products\//)

    const addToCartBtn = page.getByRole('button', { name: /add to cart/i })
    await addToCartBtn.waitFor({ state: 'visible' })
    await addToCartBtn.click()

    await expect(page.locator('[data-cart-count]')).toHaveText(/[1-9]/, { timeout: 5000 })

    await page.getByRole('link', { name: /cart/i }).click()
    await page.waitForURL(/\/cart/)

    await expect(page.getByText(/your cart/i, { exact: false })).toBeVisible()

    const qtyInput = page.locator('input[type="number"]').first()
    await qtyInput.fill('2')
    await qtyInput.blur()
    await page.waitForTimeout(1000)

    const removeBtn = page.getByRole('button', { name: /remove/i }).first()
    await removeBtn.click()

    await expect(page.getByText(/your cart is empty/i, { exact: false })).toBeVisible({
      timeout: 5000,
    })
  })

  test('wishlist flow -- add to wishlist, view wishlist, remove', async ({ page }) => {
    await page.goto('/collections/pickup-trucks')
    await page.waitForSelector('[data-product-card], .grid > div', { timeout: 10000 })

    const firstProduct = page.locator('[data-product-card]').first()
    await firstProduct.click()
    await page.waitForURL(/\/products\//)

    const wishlistBtn = page.getByRole('button', { name: /wishlist|save/i }).first()
    await wishlistBtn.waitFor({ state: 'visible' })
    await wishlistBtn.click()

    await page.goto('/wishlist')
    await expect(page.getByText(/wishlist/i, { exact: false })).toBeVisible()

    const removeBtn = page.getByRole('button', { name: /remove/i }).first()
    await removeBtn.click()

    await expect(page.getByText(/your wishlist is empty/i, { exact: false })).toBeVisible({
      timeout: 5000,
    })
  })
})
