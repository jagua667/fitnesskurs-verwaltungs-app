// jest.config.js
module.exports = {
  testEnvironment: 'node',
  verbose: true,
  coverageDirectory: './coverage',
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/server.js',
    '!src/db/**/*.js',
    '!src/config/**/*.js'
  ],
  coverageReporters: ['text', 'lcov', 'json-summary'],
  testMatch: ['**/test/unit/**/*.test.js']
};
