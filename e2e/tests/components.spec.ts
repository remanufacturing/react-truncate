import { expect, test } from '@playwright/test'

test('renders truncate scenario in browser', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByTestId('e2e-ready')).toHaveText('true')

  const truncateExample = page.getByTestId('truncate-example')
  await expect(truncateExample).toContainText('…')

  const text = await truncateExample.innerText()

  expect(text).toContain('…')
  expect(text).not.toContain(
    'This sentence keeps going so the component must clamp it safely.',
  )
})

test('show-more expands and collapses', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByTestId('show-more-state')).toHaveText('collapsed')
  const collapsedText = await page.getByTestId('show-more-example').innerText()
  const showMoreExample = page.getByTestId('show-more-example')

  await showMoreExample.getByRole('link', { name: 'Expand' }).click()

  await expect(page.getByTestId('show-more-state')).toHaveText('expanded')
  await expect(
    showMoreExample.getByRole('link', { name: 'Collapse' }),
  ).toBeVisible()

  const expandedText = await page.getByTestId('show-more-example').innerText()
  expect(expandedText.length).toBeGreaterThan(collapsedText.length)

  await showMoreExample.getByRole('link', { name: 'Collapse' }).click()
  await expect(page.getByTestId('show-more-state')).toHaveText('collapsed')
})

test('middle-truncate preserves suffix', async ({ page }) => {
  await page.goto('/')

  const middleExample = page.getByTestId('middle-example')
  await expect(middleExample).toContainText('.pdf')

  const text = await middleExample.innerText()

  expect(text).toContain('…')
  expect(text.endsWith('.pdf')).toBeTruthy()
})

test('truncate recalculates after resize controls change width', async ({
  page,
}) => {
  await page.goto('/')

  const resizeExample = page.getByTestId('resize-example')
  await expect(resizeExample).toContainText('…')

  const wideText = await resizeExample.innerText()

  await page.getByRole('button', { name: 'Set narrow' }).click()
  await expect(page.getByTestId('resize-width')).toHaveText('120')

  const narrowText = await resizeExample.innerText()
  expect(narrowText).not.toBe(wideText)
  expect(narrowText).toContain('…')

  await page.getByRole('button', { name: 'Set wide' }).click()
  await expect(page.getByTestId('resize-width')).toHaveText('240')
})

test('zh show-more preserveMarkup should not add an extra collapsed line', async ({
  page,
}) => {
  await page.goto('/')

  const plain = page.getByTestId('zh-show-more-plain')
  const markup = page.getByTestId('zh-show-more-markup')

  const plainHeight = await plain.evaluate(
    (node) => node.getBoundingClientRect().height,
  )
  const markupHeight = await markup.evaluate(
    (node) => node.getBoundingClientRect().height,
  )

  expect(markupHeight).toBe(plainHeight)
})
