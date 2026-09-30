// Shared locators for the home e2e suites. Not a test file itself.
const panelByTab = (page, tab) => page.locator('.cyber-panel', { has: page.locator('.cyber-panel-tab', { hasText: tab }) });
const optionValues = page => page.locator('select[name="COUNTRY"] option').evaluateAll(els => els.map(el => el.value));

// Waits for the boot loader to leave on its own, so the page is no longer inert.
const loaderGone = page => page.waitForFunction(() => !document.documentElement.classList.contains('home-loading'));

module.exports = { panelByTab, optionValues, loaderGone };
