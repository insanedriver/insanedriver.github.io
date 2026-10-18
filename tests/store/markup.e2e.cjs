const { test, expect } = require('../photos/browser.cjs');
const catalog = require('../../_data/discography.json');

const album = slug => catalog.albums.find(a => a.slug === slug);
const titles = slug => [...album(slug).tracks].sort((a, b) => a.position - b.position).map(t => t.title);
const card = (page, id) => page.locator(`[data-store-product="${id}"]`);
const formFields = form => form.evaluate(f => ({
  action: f.action,
  method: f.method,
  fields: Object.fromEntries([...f.querySelectorAll('input[type="hidden"]')].map(i => [i.name, i.value])),
}));

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('STORE-01: three product cards in DOM order combo, Silicon Fortress, Insane Driver', async ({ page }) => {
    await page.goto('/store/');
    const ids = await page.locator('[data-store-product]').evaluateAll(els => els.map(el => el.dataset.storeProduct));
    expect(ids).toEqual(['combo', 'silicon-fortress', 'insane-driver']);
  });

  test('STORE-02: each card shows its USD price', async ({ page }) => {
    await page.goto('/store/');
    await expect(card(page, 'combo').locator('[data-store-price]')).toHaveText(/^\s*\$35\.00\s*USD\s*$/);
    await expect(card(page, 'silicon-fortress').locator('[data-store-price]')).toHaveText(/^\s*\$25\.00\s*USD\s*$/);
    await expect(card(page, 'insane-driver').locator('[data-store-price]')).toHaveText(/^\s*\$22\.00\s*USD\s*$/);
  });

  test('STORE-03: the combo form posts the combo option to the cart button', async ({ page }) => {
    await page.goto('/store/');
    const forms = card(page, 'combo').locator('form');
    await expect(forms).toHaveCount(1);
    const f = await formFields(forms);
    expect(f.action).toBe('https://www.paypal.com/cgi-bin/webscr');
    expect(f.method).toBe('post');
    expect(f.fields).toMatchObject({
      cmd: '_s-xclick',
      hosted_button_id: 'JYP8YSM95V69A',
      currency_code: 'USD',
      os0: 'COMBO: CD Silicon Fortress + Insane Driver',
    });
  });

  test('STORE-04: the Silicon Fortress form posts the single-CD option to the cart button', async ({ page }) => {
    await page.goto('/store/');
    const forms = card(page, 'silicon-fortress').locator('form');
    await expect(forms).toHaveCount(1);
    const f = await formFields(forms);
    expect(f.action).toBe('https://www.paypal.com/cgi-bin/webscr');
    expect(f.method).toBe('post');
    expect(f.fields).toMatchObject({
      cmd: '_s-xclick',
      hosted_button_id: 'JYP8YSM95V69A',
      currency_code: 'USD',
      os0: 'CD Silicon Fortress',
    });
  });

  test('STORE-05: the Insane Driver form posts to its own hosted button', async ({ page }) => {
    await page.goto('/store/');
    const forms = card(page, 'insane-driver').locator('form');
    await expect(forms).toHaveCount(1);
    const f = await formFields(forms);
    expect(f.action).toBe('https://www.paypal.com/cgi-bin/webscr');
    expect(f.method).toBe('post');
    expect(f.fields).toMatchObject({ cmd: '_s-xclick', hosted_button_id: 'ACB6SNWZ97592' });
    expect(f.fields).not.toHaveProperty('os0');
  });

  test('STORE-06: each card shows title, one cover per album with alt text and the release-year tag', async ({ page }) => {
    await page.goto('/store/');
    const expected = {
      combo: { title: /^\s*Silicon Fortress \+ Insane Driver\s*$/, year: '2021 + 2016',
        src: ['/assets/images/releases/silicon-fortress.jpg', '/assets/images/releases/insane-driver.jpg'] },
      'silicon-fortress': { title: /^\s*Silicon Fortress\s*$/, year: '2021', src: ['/assets/images/releases/silicon-fortress.jpg'] },
      'insane-driver': { title: /^\s*Insane Driver\s*$/, year: '2016', src: ['/assets/images/releases/insane-driver.jpg'] },
    };
    for (const [id, e] of Object.entries(expected)) {
      const c = card(page, id);
      await expect(c.locator('[data-store-title]')).toHaveText(e.title);
      await expect(c.locator('[data-store-year]')).toHaveText(e.year);
      const imgs = c.locator('img');
      expect(await imgs.evaluateAll(els => els.map(el => el.getAttribute('src')))).toEqual(e.src);
      for (const alt of await imgs.evaluateAll(els => els.map(el => el.getAttribute('alt') || ''))) {
        expect(alt.trim().length).toBeGreaterThan(0);
      }
      expect(await imgs.evaluateAll(els => els.every(el => el.complete && el.naturalWidth > 0))).toBe(true);
    }
  });

  test('STORE-07: only the combo card carries a visible BEST DEAL badge', async ({ page }) => {
    await page.goto('/store/');
    await expect(page.locator('[data-store-badge]')).toHaveCount(1);
    await expect(card(page, 'combo').locator('[data-store-badge]')).toHaveText('BEST DEAL');
    await expect(card(page, 'combo').locator('[data-store-badge]')).toBeVisible();
  });

  test('STORE-08: the shipping line sits above the product cards', async ({ page }) => {
    await page.goto('/store/');
    const line = page.locator('[data-store-shipping]');
    await expect(line).toHaveText('Ships worldwide · PayPal');
    await expect(line).toBeVisible();
    const lineIsBefore = await line.evaluate(el =>
      !!(el.compareDocumentPosition(document.querySelector('[data-store-product]')) & Node.DOCUMENT_POSITION_FOLLOWING));
    expect(lineIsBefore).toBe(true);
  });

  test('STORE-09: each single-CD card has one collapsed tracklist matching the catalog', async ({ page }) => {
    await page.goto('/store/');
    for (const slug of ['silicon-fortress', 'insane-driver']) {
      const lists = card(page, slug).locator('details[data-store-tracklist]');
      await expect(lists).toHaveCount(1);
      await expect(lists).toHaveAttribute('data-store-tracklist', slug);
      expect(await lists.evaluate(d => d.open)).toBe(false);
      await expect(lists.locator('[data-store-track]')).toHaveText(titles(slug));
    }
  });

  test('STORE-10: the combo card has one collapsed tracklist per album, Silicon Fortress first', async ({ page }) => {
    await page.goto('/store/');
    const lists = card(page, 'combo').locator('details[data-store-tracklist]');
    expect(await lists.evaluateAll(els => els.map(d => d.dataset.storeTracklist))).toEqual(['silicon-fortress', 'insane-driver']);
    expect(await lists.evaluateAll(els => els.map(d => d.open))).toEqual([false, false]);
    await expect(lists.nth(0).locator('[data-store-track]')).toHaveText(titles('silicon-fortress'));
    await expect(lists.nth(1).locator('[data-store-track]')).toHaveText(titles('insane-driver'));
  });

  test('STORE-11: activating a tracklist summary reveals its track titles', async ({ page }) => {
    await page.goto('/store/');
    const list = card(page, 'insane-driver').locator('details[data-store-tracklist]');
    const first = list.locator('[data-store-track]').first();
    await expect(first).toBeHidden();
    await list.locator('summary').click();
    await expect(first).toBeVisible();
    await expect(first).toHaveText(titles('insane-driver')[0]);
  });

  test('STORE-12: the Brazil panel follows the product cards and links to Die Hard', async ({ page }) => {
    await page.goto('/store/');
    const br = page.locator('[data-store-brazil]');
    await expect(br).toBeVisible();
    await expect(br.locator('h3')).toHaveText('No Brasil? Compre pela Die Hard 🇧🇷');
    const buy = br.getByRole('link', { name: 'Comprar na Die Hard', exact: true });
    await expect(buy).toHaveAttribute('href',
      'https://www.diehard.com.br/resultado_pesquisa.php?tipoPesquisa=artista&estoque=estoque&cod_tipo=0&pesquisa=Insane+Driver');
    const after = await page.evaluate(() => {
      const cards = document.querySelectorAll('[data-store-product]');
      const panel = document.querySelector('[data-store-brazil]');
      return Boolean(cards[cards.length - 1].compareDocumentPosition(panel) & Node.DOCUMENT_POSITION_FOLLOWING);
    });
    expect(after).toBe(true);
  });

  test('STORE-25: the Brazil panel shows the payment and shipping line between heading and link', async ({ page }) => {
    await page.goto('/store/');
    const br = page.locator('[data-store-brazil]');
    const benefit = br.locator('[data-store-brazil-benefit]');
    await expect(benefit).toHaveText('Pague em reais · Pix ou cartão · Envio para todo o Brasil');
    const order = await br.evaluate(el => {
      const [h, b, a] = [el.querySelector('h3'), el.querySelector('[data-store-brazil-benefit]'), el.querySelector('a[href*="diehard"]')];
      const follows = (x, y) => Boolean(x.compareDocumentPosition(y) & Node.DOCUMENT_POSITION_FOLLOWING);
      return [follows(h, b), follows(b, a)];
    });
    expect(order).toEqual([true, true]);
  });

  test('STORE-26: the Brazil panel shows the Silicon Fortress then Insane Driver covers', async ({ page }) => {
    await page.goto('/store/');
    const imgs = page.locator('[data-store-brazil] img');
    expect(await imgs.evaluateAll(els => els.map(el => el.getAttribute('src'))))
      .toEqual(['/assets/images/releases/silicon-fortress.jpg', '/assets/images/releases/insane-driver.jpg']);
    for (const alt of await imgs.evaluateAll(els => els.map(el => el.getAttribute('alt') || ''))) {
      expect(alt.trim().length).toBeGreaterThan(0);
    }
  });

  test('STORE-27: the Die Hard link opens in a new tab', async ({ page }) => {
    await page.goto('/store/');
    const buy = page.locator('[data-store-brazil]').getByRole('link', { name: 'Comprar na Die Hard', exact: true });
    await expect(buy).toHaveAttribute('target', '_blank');
    expect((await buy.getAttribute('rel')).split(/\s+/)).toContain('noopener');
  });

  test('STORE-31: the Brazil panel is Portuguese and its note is English', async ({ page }) => {
    await page.goto('/store/');
    await expect(page.locator('[data-store-brazil]')).toHaveAttribute('lang', 'pt-BR');
    await expect(page.locator('[data-store-brazil-note]')).toHaveAttribute('lang', 'en');
  });

  test('STORE-13: the Brazil panel tells international buyers to use PayPal', async ({ page }) => {
    await page.goto('/store/');
    const note = page.locator('[data-store-brazil-note]');
    await expect(note).toBeVisible();
    await expect(note).toContainText('ships only within Brazil');
    await expect(note).toContainText('PayPal');
  });
});

test.describe('with JavaScript', () => {
  for (const query of ['', '?imInBrazil=true', '?imInBrazil=false']) {
    test(`STORE-14: /store/${query} shows every card and the Brazil panel without a geo-IP call`, async ({ page }) => {
      const hosts = [];
      page.on('request', r => hosts.push(new URL(r.url()).hostname));
      await page.goto(`/store/${query}`);
      await page.waitForLoadState('networkidle');
      await expect(page.locator('[data-store-product]')).toHaveCount(3);
      for (const id of ['combo', 'silicon-fortress', 'insane-driver']) await expect(card(page, id)).toBeVisible();
      await expect(page.locator('[data-store-brazil]')).toBeVisible();
      expect(hosts.filter(h => h.includes('ip-api'))).toEqual([]);
    });
  }
});
