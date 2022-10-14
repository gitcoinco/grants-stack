const esmModules = [
  'suretype',
  'awesome-ajv-errors',
  'terminal-link',
  'ansi-escapes',
  'jsonpos',
  'leven',
]

module.exports = {
  transform: {
    '.*\\.(j|t)sx?$': ['@swc/jest'],
  },
  transformIgnorePatterns: [
    `node_modules/.pnpm/(?!(${esmModules.join('|')})@)`,
  ],
  testEnvironment: 'node',
}
