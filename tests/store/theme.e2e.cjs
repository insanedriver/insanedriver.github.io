const { test, expect } = require('../photos/browser.cjs');

const boxes = page => page.locator('[data-store-product]').evaluateAll(els =>
  Object.fromEntries(els.map(el => {
    const r = el.getBoundingClientRect();
    return [el.dataset.storeProduct, { x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width) }];
  })));

// Every element (and pseudo-element) inside the store shell whose animation-name is not `none`.
const animated = page => page.locator('[data-store]').evaluate(root => {
  const out = [];
  for (const el of [root, ...root.querySelectorAll('*')]) {
    for (const pseudo of [null, '::before', '::after']) {
      const name = getComputedStyle(el, pseudo).animationName;
      if (name && name !== 'none') out.push(`${el.className || el.tagName}${pseudo || ''}:${name}`);
    }
  }
  return out;
});

test('STORE-15: the backdrop shows through a transparent cyber zone', async ({ page }) => {
  await page.goto('/store/');
  expect(await page.locator('#content').evaluate(el => getComputedStyle(el).backgroundImage)).toContain('bodybg');
  await expect(page.locator('.store-shell.cyber-zone')).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
});

test('STORE-15: every card and the Brazil panel use the cyber panel structure', async ({ page }) => {
  await page.goto('/store/');
  for (const panel of await page.locator('[data-store-product], [data-store-brazil]').all()) {
    await expect(panel).toHaveClass(/cyber-panel/);
    await expect(panel.locator('> .cyber-panel-tab')).toHaveCount(1);
    const body = panel.locator('> .cyber-panel-body');
    await expect(body).toHaveCount(1);
    expect((await body.getAttribute('data-hud')).length).toBeGreaterThan(0);
    for (const part of ['.top-accent', '.corner-tl', '.corner-tr', '.corner-bl']) {
      await expect(body.locator(`> ${part}`)).toHaveCount(1);
    }
  }
});

test('STORE-15: the panels use the site palette and fonts', async ({ page }) => {
  await page.goto('/store/');
  await expect(page.locator('[data-store-product="silicon-fortress"] .cyber-panel-tab')).toHaveCSS('border-top-color', 'rgb(0, 243, 255)');
  await expect(page.locator('.corner-bl').first()).toHaveCSS('background-color', 'rgb(0, 95, 140)');
  await expect(page.locator('[data-store-badge]')).toHaveCSS('background-color', 'rgb(255, 0, 234)');
  await expect(page.locator('[data-store-price]').first()).toHaveCSS('color', 'rgb(252, 238, 10)');
  expect(await page.locator('.store-shell').evaluate(el => getComputedStyle(el).fontFamily)).toContain('Rajdhani');
  expect(await page.locator('[data-store-price]').first().evaluate(el => getComputedStyle(el).fontFamily)).toContain('Share Tech Mono');
});

test('STORE-16: at 1280px the cards share one row: Silicon Fortress, combo, Insane Driver', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/store/');
  const b = await boxes(page);
  expect(b['silicon-fortress'].y).toBe(b.combo.y);
  expect(b['insane-driver'].y).toBe(b.combo.y);
  expect(b['silicon-fortress'].x).toBeLessThan(b.combo.x);
  expect(b.combo.x).toBeLessThan(b['insane-driver'].x);
});

test('STORE-16: at exactly 992px the row layout already applies', async ({ page }) => {
  await page.setViewportSize({ width: 992, height: 900 });
  await page.goto('/store/');
  const b = await boxes(page);
  expect(b['silicon-fortress'].y).toBe(b.combo.y);
  expect(b['silicon-fortress'].x).toBeLessThan(b.combo.x);
});

for (const width of [375, 991]) {
  test(`STORE-17: at ${width}px the cards stack in one column, combo first`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/store/');
    const b = await boxes(page);
    expect(b['silicon-fortress'].x).toBe(b.combo.x);
    expect(b['insane-driver'].x).toBe(b.combo.x);
    expect(b.combo.y).toBeLessThan(b['silicon-fortress'].y);
    expect(b['silicon-fortress'].y).toBeLessThan(b['insane-driver'].y);
  });
}

for (const width of [320, 375, 768, 1024, 1440]) {
  test(`STORE-18: no store element overflows at ${width}px, tracklists open`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/store/');
    await page.locator('details[data-store-tracklist]').evaluateAll(els => els.forEach(d => { d.open = true; }));
    const overflowing = await page.locator('[data-store]').evaluate(root => {
      const limit = window.innerWidth + 0.5;
      return [root, ...root.querySelectorAll('*')]
        .filter(el => el.getBoundingClientRect().right > limit)
        .map(el => `${el.tagName}.${el.className}`);
    });
    expect(overflowing).toEqual([]);
  });
}

test('STORE-19: reduced motion stops every store animation that runs by default', async ({ browser }) => {
  const normal = await browser.newPage();
  await normal.goto('/store/');
  expect((await animated(normal)).length).toBeGreaterThan(0);
  await normal.close();

  const context = await browser.newContext({ reducedMotion: 'reduce' });
  const reduced = await context.newPage();
  await reduced.goto('/store/');
  expect(await animated(reduced)).toEqual([]);
  await context.close();
});

test('STORE-20: keyboard focus on a buy button and a tracklist summary shows a visible outline', async ({ page }) => {
  await page.goto('/store/');
  for (const selector of ['[data-store-product="combo"] .store-buy', '[data-store-product="combo"] summary', '[data-store-brazil] .store-buy']) {
    const target = page.locator(selector).first();
    for (let i = 0; i < 80 && !(await target.evaluate(el => el === document.activeElement)); i++) {
      await page.keyboard.press('Tab');
    }
    expect(await target.evaluate(el => el === document.activeElement)).toBe(true);
    const style = await target.evaluate(el => {
      const s = getComputedStyle(el);
      return { style: s.outlineStyle, width: parseFloat(s.outlineWidth), color: s.outlineColor };
    });
    expect(style.style).not.toBe('none');
    expect(style.width).toBeGreaterThanOrEqual(2);
    expect(style.color).toBe('rgb(252, 238, 10)');
  }
});

// Boxes of the Brazil panel parts, plus the content width of its body.
const brazil = page => page.locator('[data-store-brazil]').evaluate(el => {
  const box = n => { const r = n.getBoundingClientRect(); return { left: r.left, right: r.right, top: r.top, bottom: r.bottom, width: r.width, height: r.height }; };
  const body = el.querySelector('.cyber-panel-body');
  const cs = getComputedStyle(body);
  const imgs = [...el.querySelectorAll('img')].map(box);
  return {
    heading: box(el.querySelector('h3')),
    benefit: box(el.querySelector('[data-store-brazil-benefit]')),
    note: box(el.querySelector('[data-store-brazil-note]')),
    link: box(el.querySelector('a[href*="diehard"]')),
    imgs,
    covers: { top: Math.min(...imgs.map(i => i.top)), bottom: Math.max(...imgs.map(i => i.bottom)), left: Math.min(...imgs.map(i => i.left)) },
    content: body.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight),
  };
});

for (const width of [375, 1280]) {
  test(`STORE-26: at ${width}px each Brazil cover renders 96px wide`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/store/');
    const b = await brazil(page);
    expect(b.imgs).toHaveLength(2);
    for (const img of b.imgs) expect(Math.abs(img.width - 96)).toBeLessThanOrEqual(0.5);
  });
}

for (const width of [375, 768, 1280]) {
  test(`STORE-28: at ${width}px the Die Hard link is at least 56px tall`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/store/');
    expect((await brazil(page)).link.height).toBeGreaterThanOrEqual(56);
  });
}

for (const width of [768, 1280]) {
  test(`STORE-29: at ${width}px the Brazil text sits left, covers above the link on the right`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/store/');
    const b = await brazil(page);
    const media = Math.min(b.covers.left, b.link.left);
    for (const part of [b.heading, b.benefit, b.note]) expect(part.right).toBeLessThanOrEqual(media);
    expect(b.covers.bottom).toBeLessThanOrEqual(b.link.top);
    expect(b.link.width).toBeGreaterThanOrEqual(280);
  });
}

for (const width of [320, 375, 767]) {
  test(`STORE-30: at ${width}px the Brazil panel stacks heading, benefit, covers, link, note`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/store/');
    const b = await brazil(page);
    const tops = [b.heading.bottom <= b.benefit.top, b.benefit.bottom <= b.covers.top, b.covers.bottom <= b.link.top, b.link.bottom <= b.note.top];
    expect(tops).toEqual([true, true, true, true]);
    expect(Math.abs(b.link.width - b.content)).toBeLessThanOrEqual(1);
  });
}
