/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/test/**/*.spec.ts'],
  moduleNameMapper: {
    '^@skorify/domain$': '<rootDir>/../domain/src/index.ts',
    '^@skorify/domain/core$': '<rootDir>/../domain/src/core/index.ts',
    '^@skorify/domain/(.*)$': '<rootDir>/../domain/src/features/$1',
    '^@skorify/shared$': '<rootDir>/../shared/src/index.ts',
    '^@skorify/shared/(.*)$': '<rootDir>/../shared/src/$1',
    '^@skorify/domain/core$': '<rootDir>/libs/domain/core/index.js',
    '^@skorify/domain/(.+)$': '<rootDir>/libs/domain/features/$1/index.js',
    '^@skorify/shared/(.+)$': '<rootDir>/libs/shared/$1',
  },
  transform: {
    '^.+\\.ts$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.jest.json' }],
  },
};
