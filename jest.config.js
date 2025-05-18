module.exports = {
  testEnvironment: 'node',
  moduleFileExtensions: ['js', 'ts', 'json', 'node'],
  testMatch: ['**/src/**/*.test.(js|ts)'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
};