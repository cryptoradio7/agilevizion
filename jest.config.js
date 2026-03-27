/** @type {import('jest').Config} */
module.exports = {
    testEnvironment: 'jsdom',
    testMatch: ['**/tests/unit/**/*.test.js'],
    collectCoverageFrom: ['js/*.js'],
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov'],
    testEnvironmentOptions: {
        url: 'http://localhost/'
    }
};
