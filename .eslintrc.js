module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: ['eslint:recommended', 'airbnb-base', 'plugin:import/recommended'],
  parser: '@babel/eslint-parser',
  parserOptions: {
    ecmaVersion: 13,
    sourceType: 'module',
  },
  plugins: [],
  settings: {
    'import/resolver': {
      node: {
        paths: ['src'],
        extensions: ['.js', '.jsx'],
      },
    },
  },
  rules: {
    'no-plusplus': 'off',
    'no-new': 'off',
    'no-mixed-operators': 'off',
    'no-param-reassign': 'off',
    'no-return-assign': 'off',
    'no-use-before-define': 'off',
    'prefer-arrow-callback': 'off',
  },
};
