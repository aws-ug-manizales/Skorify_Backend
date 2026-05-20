/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/test/**/*.spec.ts'],
  modulePathIgnorePatterns: ['<rootDir>/dist/'],
  moduleNameMapper: {
    '^@skorify/domain$': '<rootDir>/../domain/src/index.ts',
    '^@skorify/domain/core$': '<rootDir>/../domain/src/core/index.ts',
    '^@skorify/domain/(.*)$': '<rootDir>/../domain/src/features/$1',
    '^@skorify/shared$': '<rootDir>/../shared/src/index.ts',
    '^@skorify/shared/(.*)$': '<rootDir>/../shared/src/$1',
  },
  transform: {
    '^.+\\.ts$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.jest.json' }],
  },
};
