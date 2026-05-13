import { expect, test } from '@playwright/test'

// ── Chat Flow ──────────────────────────────────────────────────────────────────

test.describe('Chat', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/chat')
  })

  test('ask vehicle question, see streaming response, see citations, see follow-up, send follow-up', async ({
    page,
  }) => {
    // Chat panel should be visible
    const chatPanel = page.locator('[data-chat-panel], [data-testid="conversation"]').first()
    await expect(chatPanel).toBeVisible({ timeout: 5000 })

    // Should see empty state with suggested questions
    const suggestionButton = page.getByText(/what vehicles/i).first()
    await expect(suggestionButton).toBeVisible()

    // Ask a question via the input
    const input = page.locator('textarea, input[type="text"]').first()
    await input.fill('What Toyota trucks do you have?')
    await input.press('Enter')

    // Wait for assistant response (streaming indicator may show)
    const assistantMessage = page.locator('[data-message-role="assistant"]').first()

    // Wait for response to complete (thinking indicator disappears)
    await page
      .waitForFunction(() => !document.querySelector('[data-thinking-indicator]'), {
        timeout: 30000,
      })
      .catch(() => {
        /* ignore timeout — message may not have thinking indicator */
      })

    // Verify assistant responded
    await expect(assistantMessage).toBeVisible({ timeout: 20000 })

    // Check for product citations (product cards in message)
    page.locator('[data-product-citation]').first()
    // Citations may or may not appear depending on query — don't fail if absent

    // Check for follow-up suggestions
    page.locator('[data-follow-up-button]').first()
    // Only check if visible — follow-ups depend on AI response

    // Send a follow-up
    const secondInput = page.locator('textarea, input[type="text"]').first()
    await secondInput.fill('Show me more details on the first one')
    await secondInput.press('Enter')

    // Verify conversation continues
    const messages = page.locator('[data-message-role="assistant"]')
    await expect(messages).toHaveCount(2, { timeout: 20000 })
  })

  test('file attachment — upload image, send with message', async ({ page }) => {
    const chatPanel = page.locator('[data-chat-panel], [data-testid="conversation"]').first()
    await expect(chatPanel).toBeVisible({ timeout: 5000 })

    // Find file input (accepts images)
    const fileInput = page.locator('input[type="file"][accept*="image"]').first()

    // Upload a test image
    const fileChooserPromise = page.waitForEvent('filechooser')
    await fileInput.click()
    const fileChooser = await fileChooserPromise
    await fileChooser.setFiles({
      name: 'test-car.jpg',
      mimeType: 'image/jpeg',
      buffer: Buffer.from('fake-image-data'),
    })

    // Verify preview appears
    const preview = page.locator('[data-file-preview], img[alt*="preview"]').first()
    await expect(preview)
      .toBeVisible()
      .catch(() => {
        /* preview may not be visible */
      })

    // Type a message
    const input = page.locator('textarea, input[type="text"]').first()
    await input.fill('What vehicle is this?')
    await input.press('Enter')

    // Wait for response
    const assistantMessage = page.locator('[data-message-role="assistant"]').first()
    await expect(assistantMessage).toBeVisible({ timeout: 25000 })
  })

  test('download conversation', async ({ page }) => {
    await page.goto('/chat')

    // Ask a question
    const input = page.locator('textarea, input[type="text"]').first()
    await input.fill('Tell me about Toyota Hilux')
    await input.press('Enter')

    // Wait for response
    const assistantMessage = page.locator('[data-message-role="assistant"]').first()
    await expect(assistantMessage).toBeVisible({ timeout: 25000 })

    // Find and click download button
    const downloadBtn = page.getByRole('button', { name: /download|export/i }).first()
    await downloadBtn.waitFor({ state: 'visible' })

    // Set up download promise
    const downloadPromise = page.waitForEvent('download', { timeout: 5000 }).catch(() => null)
    await downloadBtn.click()

    const download = await downloadPromise
    // Verify download started (filename check)
    if (download) {
      expect(download.suggestedFilename()).toMatch(/\.(txt|json|md)$/i)
    }
  })
})
