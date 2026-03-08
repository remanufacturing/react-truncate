import { expect, test } from '@playwright/test'

const setRangeValue = async (page, testId: string, value: number) => {
  await page.getByTestId(testId).evaluate((node, nextValue) => {
    const input = node as HTMLInputElement
    input.value = String(nextValue)
    input.dispatchEvent(new Event('input', { bubbles: true }))
    input.dispatchEvent(new Event('change', { bubbles: true }))
  }, value)
}

const setCheckbox = async (page, testId: string, checked: boolean) => {
  const input = page.getByTestId(`${testId}-input`)

  if ((await input.isChecked()) !== checked) {
    await page.getByTestId(testId).click()
  }
}

const getContentHeight = (page, testId: string) => {
  return page.getByTestId(testId).evaluate((node) => {
    return node.getBoundingClientRect().height
  })
}

test('docs show-more demo preserves inline markup without extra lines in English', async ({
  page,
}) => {
  await page.goto('/reference/show-more/')

  await setRangeValue(page, 'docs-show-more-demo-en-width', 60)
  await setRangeValue(page, 'docs-show-more-demo-en-lines', 3)
  await setCheckbox(page, 'docs-show-more-demo-en-html', true)
  await setCheckbox(page, 'docs-show-more-demo-en-custom', false)
  await setCheckbox(page, 'docs-show-more-demo-en-preserve-markup', false)

  const plainHeight = await getContentHeight(
    page,
    'docs-show-more-demo-en-content',
  )
  await expect(
    page
      .getByTestId('docs-show-more-demo-en-content')
      .locator('[data-testid="docs-inline-rich-link-en"]'),
  ).toHaveCount(0)

  await setCheckbox(page, 'docs-show-more-demo-en-preserve-markup', true)

  const markupHeight = await getContentHeight(
    page,
    'docs-show-more-demo-en-content',
  )

  expect(markupHeight).toBeLessThanOrEqual(plainHeight)

  await expect(
    page
      .getByTestId('docs-show-more-demo-en-content')
      .locator('[data-testid="docs-inline-rich-link-en"]'),
  ).toHaveCount(1)
  await expect(
    page
      .getByTestId('docs-show-more-demo-en-content')
      .locator('[data-testid="docs-inline-rich-accent-en"]'),
  ).toHaveCount(1)

  const demo = page.getByTestId('docs-show-more-demo-en')

  await demo.getByRole('link', { name: 'Expand' }).click()
  await expect(demo.getByRole('link', { name: 'Collapse' })).toBeVisible()
})

test('docs show-more demo preserves inline markup without extra lines in Chinese', async ({
  page,
}) => {
  await page.goto('/zh/reference/show-more/')

  await setRangeValue(page, 'docs-show-more-demo-zh-width', 60)
  await setRangeValue(page, 'docs-show-more-demo-zh-lines', 3)
  await setCheckbox(page, 'docs-show-more-demo-zh-html', true)
  await setCheckbox(page, 'docs-show-more-demo-zh-custom', false)
  await setCheckbox(page, 'docs-show-more-demo-zh-preserve-markup', false)

  const plainHeight = await getContentHeight(
    page,
    'docs-show-more-demo-zh-content',
  )
  await expect(
    page
      .getByTestId('docs-show-more-demo-zh-content')
      .locator('[data-testid="docs-inline-rich-link-zh"]'),
  ).toHaveCount(0)

  await setCheckbox(page, 'docs-show-more-demo-zh-preserve-markup', true)

  const markupHeight = await getContentHeight(
    page,
    'docs-show-more-demo-zh-content',
  )

  expect(markupHeight).toBeLessThanOrEqual(plainHeight)

  const demo = page.getByTestId('docs-show-more-demo-zh')

  await demo.getByRole('link', { name: /(?:展开|Expand)/ }).click()
  await expect(
    demo.getByRole('link', { name: /(?:收起|Collapse)/ }),
  ).toBeVisible()
})
