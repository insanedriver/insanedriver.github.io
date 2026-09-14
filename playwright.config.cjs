const { defineConfig } = require('@playwright/test');
const fs = require('node:fs');
module.exports = defineConfig({
  testDir: './tests/photos', testMatch: '**/*.e2e.cjs', workers: 1,
  use: { baseURL: 'http://127.0.0.1:4178', headless: true,
    launchOptions: { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || (fs.existsSync('/usr/bin/google-chrome') ? '/usr/bin/google-chrome' : undefined), args: ['--no-sandbox'] } },
  webServer: { command: 'npx @11ty/eleventy --serve --port=4178', url: 'http://127.0.0.1:4178/photos/', reuseExistingServer: false },
  reporter: 'list'
});
