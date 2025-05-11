const config = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js', '**/__tests__/**/*.test.js'],
  moduleFileExtensions: ['js', 'json', 'node'],
  verbose: true,
  coverageDirectory: 'coverage',
  collectCoverage: true,
  coveragePathIgnorePatterns: ['/node_modules/', '/logs/'],
  transform: {},
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
};

export default config;
