module.exports = {
  roots: ['<rootDir>/src'],
  testEnvironment: 'node',
  transform: { '^.+\\.(js|jsx|mjs|cjs|ts|tsx)$': 'esbuild-jest' },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
}
