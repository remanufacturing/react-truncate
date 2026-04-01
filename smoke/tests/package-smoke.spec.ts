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

test('packed package zh show-more interaction works', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByTestId('smoke-zh-show-more-state')).toHaveText(
    'collapsed',
  )

  const example = page.getByTestId('smoke-zh-show-more-example')
  const collapsedText = await example.innerText()

  await example.getByRole('link', { name: '展开' }).click()

  await expect(page.getByTestId('smoke-zh-show-more-state')).toHaveText(
    'expanded',
  )
  await expect(example.getByRole('link', { name: '收起' })).toBeVisible()

  const expandedText = await example.innerText()
  expect(expandedText.length).toBeGreaterThan(collapsedText.length)
})

test('packed package middle-truncate preserves suffix', async ({ page }) => {
  await page.goto('/')

  const middleExample = page.getByTestId('smoke-middle-example')
  await expect(middleExample).toContainText('.pdf')

  const text = await middleExample.innerText()

  expect(text).toContain('…')
  expect(text.endsWith('.pdf')).toBeTruthy()
})

test('packed package zh middle-truncate preserves suffix', async ({ page }) => {
  await page.goto('/')

  const middleExample = page.getByTestId('smoke-zh-middle-example')
  await expect(middleExample).toContainText('.pdf')

  const text = await middleExample.innerText()

  expect(text).toContain('…')
  expect(text.endsWith('.pdf')).toBeTruthy()
})
