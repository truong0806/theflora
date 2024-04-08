module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/*.test.js'],
  testTimeout: 15000,
  verbose: true,
  collectCoverage: true,
  collectCoverageFrom: ['src/__test___/*.{js,jsx}'],
  coverageDirectory: './coverage/',
}
