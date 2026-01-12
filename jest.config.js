export default {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testMatch: ['**/tests/**/*.test.js'],
  collectCoverageFrom: [
    'src/js/**/*.js',
    '!src/js/main.js',
    '!src/js/road.js',
    '!src/js/player.js',
    '!src/js/ui.js',
    '!src/js/audio.js'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  moduleNameMapper: {
    '^three$': '<rootDir>/tests/__mocks__/three.js'
  },
  transform: {},
  verbose: true
};
