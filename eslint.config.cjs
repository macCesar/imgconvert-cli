module.exports = [
  {
    files: ['src/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs'
    },
    rules: {
      'no-unreachable': 'error',
      'no-dupe-args': 'error',
      'no-dupe-keys': 'error',
      'no-constant-condition': 'error',
      'valid-typeof': 'error',
      'constructor-super': 'error'
    }
  }
];
