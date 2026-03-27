const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
    testDir: './tests/e2e',
    timeout: 30000,
    retries: 0,
    reporter: 'list',
    use: {
        baseURL: 'http://localhost:8099',
        trace: 'on-first-retry',
    },
    webServer: {
        command: 'python3 -m http.server 8099',
        url: 'http://localhost:8099',
        reuseExistingServer: true,
    },
    projects: [
        {
            name: 'desktop',
            use: { ...devices['Desktop Chrome'] },
        },
        {
            name: 'mobile',
            use: { ...devices['iPhone 12'] },
        },
    ],
});
