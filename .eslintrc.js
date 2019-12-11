module.exports = {
  extends: ['plugin:standard-typescript/recommended'],
  parserOptions: {
    project: 'tsconfig-spec.json',
    tsconfigRootDir: './'
  },
  env: {
    jasmine: true
  },
  rules: {
    '@typescript-eslint/no-explicit-any': 0
  }
}
