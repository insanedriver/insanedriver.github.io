const { test, expect } = require('../photos/browser.cjs');

// The shared fixture aborts every outside host, so the Bandsintown embed never
// loads here: these tests read our markup, never the content inside the iframe.
const EMBED = 'https://bandsintown.com/artist/10752930/email_signup_form?';
const panel = page => page.locator('.cyber-panel', { has: page.locator('.cyber-panel-tab', { hasText: 'USER::ENROLL' }) });
const frame = page => panel(page).locator('iframe');
const params = async page => new URL(await frame(page).getAttribute('src')).searchParams;
const fallback = page => panel(page).getByRole('link', { name: 'Sign up on Bandsintown' });

test.beforeEach(async ({ page }) => {
  await page.goto('/newsletter/', { waitUntil: 'domcontentloaded' });
});

test('BIT-07: the enrol panel holds exactly one Bandsintown signup iframe and no form', async ({ page }) => {
  await expect(frame(page)).toHaveCount(1);
  expect((await frame(page).getAttribute('src')).startsWith(EMBED)).toBe(true);
  await expect(panel(page).locator('form')).toHaveCount(0);
});

test('BIT-08: the page carries no Mailchimp endpoint, field, or required-field marker', async ({ page }) => {
  const html = await page.content();
  expect(html).not.toContain('list-manage.com');
  expect(html).not.toContain('b_31b9d99c4318b90997348c1ed_79f822eba5');
  await expect(page.locator('[name="EMAIL"], [name="COUNTRY"]')).toHaveCount(0);
  await expect(page.getByText('Required field')).toHaveCount(0);
});

test('BIT-09: the enrol panel keeps its heading and copy', async ({ page }) => {
  await expect(panel(page).locator('h3')).toHaveText('Initialize Connection');
  await expect(panel(page).locator('p')).toHaveText('Enter your coordinates to join the Insane Family.');
});

test('BIT-10: the signup iframe loads eagerly', async ({ page }) => {
  expect(await frame(page).getAttribute('loading')).toBeNull();
});

test('BIT-11: the embed hides its own title and header text', async ({ page }) => {
  const p = await params(page);
  expect(p.get('title')).toBe('');
  expect(p.get('headerText')).toBe('');
});

test('BIT-12: the embed uses the cyberpunk colours, square CTA, and English', async ({ page }) => {
  const p = await params(page);
  expect(Object.fromEntries(['backgroundColor', 'headerTextColor', 'ctaBackgroundColor', 'ctaBorderColor', 'ctaFontColor',
    'ctaBorderRadius', 'ctaLabel', 'emailInputField', 'locale'].map(k => [k, p.get(k)]))).toEqual({
    backgroundColor: 'rgba(0,0,0,0)',
    headerTextColor: 'rgba(0,243,255,1)',
    ctaBackgroundColor: 'rgba(252,238,10,1)',
    ctaBorderColor: 'rgba(252,238,10,1)',
    ctaFontColor: 'rgba(0,0,0,1)',
    ctaBorderRadius: '0px',
    ctaLabel: 'Subscribe',
    emailInputField: 'show',
    locale: 'en'
  });
});

test('BIT-13: the iframe has a meaningful accessible title', async ({ page }) => {
  await expect(frame(page)).toHaveAttribute('title', 'Insane Driver mailing list signup');
});

test('BIT-14: the iframe is full width and 240px tall', async ({ page }) => {
  await expect(frame(page)).toHaveAttribute('width', '100%');
  await expect(frame(page)).toHaveAttribute('height', '240');
});

test('BIT-16: the panel links straight to Bandsintown in a new tab', async ({ page }) => {
  await expect(fallback(page)).toHaveAttribute('href', 'https://www.bandsintown.com/a/10752930');
  await expect(fallback(page)).toHaveAttribute('target', '_blank');
  await expect(fallback(page)).toHaveAttribute('rel', 'noopener');
});

test('BIT-17: with the embed blocked the heading, copy, and fallback link stay visible', async ({ page }) => {
  await panel(page).scrollIntoViewIfNeeded();
  await expect(panel(page).locator('h3')).toBeVisible();
  await expect(panel(page).locator('p')).toBeVisible();
  await expect(fallback(page)).toBeVisible();
});
