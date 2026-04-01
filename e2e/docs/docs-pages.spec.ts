import { expect, test } from '@playwright/test'

const setRangeValue = async (page, testId: string, value: number) => {
  await page.getByTestId(testId).evaluate((node, nextValue) => {
    const input = node as HTMLInputElement
    const descriptor = Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      'value',
    )

    descriptor?.set?.call(input, String(nextValue))
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

const getVisibleByTestId = (page, testId: string) => {
  return page.locator(`[data-testid="${testId}"]:visible`).first()
}

const getContentHeight = (page, testId: string) => {
  return getVisibleByTestId(page, testId).evaluate((node) => {
    return node.getBoundingClientRect().height
  })
}

const hoverVisibleTooltip = async (page, triggerTestId: string) => {
  await page.getByTestId(triggerTestId).hover()

  const visibleTooltip = page.getByTestId(`${triggerTestId}-content`)
  await visibleTooltip.waitFor({ state: 'visible' })

  return visibleTooltip
}

const docsLocales = [
  {
    lang: 'en',
    prefix: '',
    showMoreTitle: 'ShowMore',
    middleTitle: 'MiddleTruncate',
    truncateTitle: 'Truncate',
    moreLabel: /(?:Expand|Show More)/,
    lessLabel: /(?:Collapse|Show Less)/,
    dialogButtonName: 'Expand full content',
    dialogTitle: 'Here is the full content',
    tooltipText: /Hover the mouse over the text to view the full text\./,
    preserveMarkupText:
      /If you need the collapsed state to keep rendered inline markup/,
  },
  {
    lang: 'zh',
    prefix: '/zh',
    showMoreTitle: 'ShowMore',
    middleTitle: 'MiddleTruncate',
    truncateTitle: 'Truncate',
    moreLabel: /(?:展开|Expand|Show More)/,
    lessLabel: /(?:收起|Collapse|Show Less)/,
    dialogButtonName: '展开完整内容',
    dialogTitle: '这里是完整的内容',
    tooltipText: /将鼠标悬停在这段文字上面以查看全文。/,
    preserveMarkupText: /如果希望折叠态尽量保留已经渲染出来的内联富文本结构/,
  },
] as const

test('docs home switches between English and Chinese', async ({ page }) => {
  await page.goto('/')
  await expect(
    page.getByRole('heading', { name: 'React Truncate' }),
  ).toBeVisible()

  const languageSelect = page.locator('starlight-lang-select select')

  await languageSelect.selectOption('/zh/')
  await expect(page).toHaveURL(/\/zh\/$/)

  await languageSelect.selectOption('/')
  await expect(page).toHaveURL(/\/$/)
})

for (const locale of docsLocales) {
  test(`docs show-more basic demo toggles in ${locale.lang}`, async ({
    page,
  }) => {
    await page.goto(`${locale.prefix}/reference/show-more/`)
    await expect(
      page.getByRole('heading', { name: locale.showMoreTitle }),
    ).toBeVisible()

    const basicDemo = page.getByTestId(`docs-basic-show-more-${locale.lang}`)

    await basicDemo.getByRole('link', { name: locale.moreLabel }).click()
    const collapseLink = basicDemo.getByRole('link', { name: locale.lessLabel })

    await expect(collapseLink).toBeVisible()
    await collapseLink.click()
    await expect(
      basicDemo.getByRole('link', { name: locale.moreLabel }),
    ).toBeVisible()
  })

  test(`docs show-more custom button demo toggles in ${locale.lang}`, async ({
    page,
  }) => {
    await page.goto(`${locale.prefix}/reference/show-more/`)

    const customDemo = page.getByTestId(`docs-custom-show-more-${locale.lang}`)

    await customDemo.getByRole('button', { name: locale.moreLabel }).click()
    await expect(
      customDemo.getByRole('button', { name: locale.lessLabel }),
    ).toBeVisible()
  })

  test(`docs show-more dialog demo opens in ${locale.lang}`, async ({
    page,
  }) => {
    await page.goto(`${locale.prefix}/reference/show-more/`)

    await page.getByRole('button', { name: locale.dialogButtonName }).click()

    const dialog = page.getByTestId(
      `docs-dialog-show-more-${locale.lang}-content`,
    )
    await expect(dialog).toBeVisible()
    await expect(dialog).toContainText(locale.dialogTitle)

    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
  })

  test(`docs show-more tooltip demo reveals full text in ${locale.lang}`, async ({
    page,
  }) => {
    await page.goto(`${locale.prefix}/reference/show-more/`)
    await expect(page.getByText(locale.tooltipText)).toBeVisible()

    const tooltip = await hoverVisibleTooltip(
      page,
      `docs-tooltip-show-more-${locale.lang}`,
    )
    await expect(tooltip).toContainText(/Lorem ipsum|从前有座山/)
  })

  test(`docs middle-truncate live demo responds to controls in ${locale.lang}`, async ({
    page,
  }) => {
    await page.goto(`${locale.prefix}/reference/middle-truncate/`)
    await expect(
      page.getByRole('heading', { name: locale.middleTitle }),
    ).toBeVisible()

    const testIdPrefix = `docs-middle-truncate-demo-${locale.lang}`
    const content = getVisibleByTestId(page, `${testIdPrefix}-content`)
    const container = page.getByTestId(`${testIdPrefix}-container`)

    const initialText = await content.innerText()
    expect(initialText).toContain('…')
    expect(initialText.endsWith('…')).toBeFalsy()

    await setRangeValue(page, `${testIdPrefix}-width`, 60)
    await setRangeValue(page, `${testIdPrefix}-end`, 12)

    await expect(page.getByTestId(`${testIdPrefix}-width`)).toHaveValue('60')
    await expect(page.getByTestId(`${testIdPrefix}-end`)).toHaveValue('12')
    await expect(container).toHaveAttribute('style', /width: 60%/)

    const adjustedText = await content.innerText()
    expect(adjustedText).toContain('…')
    expect(adjustedText.endsWith('…')).toBeFalsy()
  })

  test(`docs truncate page exposes localized preserveMarkup guidance in ${locale.lang}`, async ({
    page,
  }) => {
    await page.goto(`${locale.prefix}/reference/truncate/`)
    await expect(
      page.getByRole('heading', { name: locale.truncateTitle }),
    ).toBeVisible()
    await expect(page.getByText(locale.preserveMarkupText)).toBeVisible()
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
    getVisibleByTestId(page, 'docs-show-more-demo-en-content').locator(
      '[data-testid="docs-inline-rich-link-en"]',
    ),
  ).toHaveCount(0)

  await setCheckbox(page, 'docs-show-more-demo-en-preserve-markup', true)

  const markupHeight = await getContentHeight(
    page,
    'docs-show-more-demo-en-content',
  )

  expect(markupHeight).toBeLessThanOrEqual(plainHeight)

  await expect(
    getVisibleByTestId(page, 'docs-show-more-demo-en-content').locator(
      '[data-testid="docs-inline-rich-link-en"]',
    ),
  ).toHaveCount(1)
  await expect(
    getVisibleByTestId(page, 'docs-show-more-demo-en-content').locator(
      '[data-testid="docs-inline-rich-accent-en"]',
    ),
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
    getVisibleByTestId(page, 'docs-show-more-demo-zh-content').locator(
      '[data-testid="docs-inline-rich-link-zh"]',
    ),
  ).toHaveCount(0)

  await setCheckbox(page, 'docs-show-more-demo-zh-preserve-markup', true)

  const markupHeight = await getContentHeight(
    page,
    'docs-show-more-demo-zh-content',
  )

  expect(markupHeight).toBeLessThanOrEqual(plainHeight)

  await expect(
    getVisibleByTestId(page, 'docs-show-more-demo-zh-content').locator(
      '[data-testid="docs-inline-rich-link-zh"]',
    ),
  ).toHaveCount(1)
  await expect(
    getVisibleByTestId(page, 'docs-show-more-demo-zh-content').locator(
      '[data-testid="docs-inline-rich-accent-zh"]',
    ),
  ).toHaveCount(1)

  const demo = page.getByTestId('docs-show-more-demo-zh')

  await demo.getByRole('link', { name: /(?:展开|Expand)/ }).click()
  await expect(
    demo.getByRole('link', { name: /(?:收起|Collapse)/ }),
  ).toBeVisible()
})
