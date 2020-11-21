module.exports = {
  moduleFileExtensions: ['js'],
  modulePaths: ['./lib', './'],
  moduleNameMapper: {
    '^/(.*)': '<rootDir>/lib/$1'
  },
  testPathIgnorePatterns: ['node_modules', '.cache', 'dist'],
  globals: {
    __PATH_PREFIX__: ''
  },
  testURL: 'http://localhost:3000',
  collectCoverageFrom: ['lib/**/*.js', '!lib/index.js', '!lib/**/*.spec.js', '!lib/**/index.js'],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['lcov', 'text-summary']
};
