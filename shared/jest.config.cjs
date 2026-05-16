/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/tests/**/*.spec.ts'],
  moduleNameMapper: {
    '^@skorify/domain/core$': '<rootDir>/node_modules/@skorify/domain/core/index.js',
    '^@skorify/domain/(.+)$': '<rootDir>/node_modules/@skorify/domain/features/$1/index.js',
  },
  transform: {
    '^.+\\.ts$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.jest.json' }],
  },
};
