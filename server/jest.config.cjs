/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/test/**/*.spec.ts'],
  moduleNameMapper: {
    '^@skorify/domain/core$': '<rootDir>/libs/domain/core/index.js',
    '^@skorify/domain/(.+)$': '<rootDir>/libs/domain/features/$1/index.js',
    '^@skorify/shared/(.+)$': '<rootDir>/libs/shared/$1',
  },
  transform: {
    '^.+\\.ts$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.jest.json' }],
  },
};
