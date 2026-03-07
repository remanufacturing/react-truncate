import { expect, test } from '@playwright/test'

test('renders packed package consumer page', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByTestId('smoke-page-ready')).toHaveText('true')
  await expect(page.getByTestId('smoke-package-imported')).toHaveText('true')
  await expect(page.getByTestId('smoke-truncate-example')).toContainText('…')
})

test('packed package show-more interaction works', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByTestId('smoke-show-more-state')).toHaveText(
    'collapsed',
  )

  await page.getByRole('link', { name: 'Expand' }).click()

  await expect(page.getByTestId('smoke-show-more-state')).toHaveText('expanded')
  await expect(page.getByRole('link', { name: 'Collapse' })).toBeVisible()
})
