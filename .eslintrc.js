module.exports = {
  env: {
    browser: false,
    es6: true,
    node: true,
    jest: true
  },
  extends: ['strongloop'],
  globals: {},
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module'
  },
  rules: {
    'max-len': ['error', { code: 107 }],
    'no-duplicate-imports': ['error'],
    'no-new-func': ['off'],
    'comma-dangle': ['off']
  }
};
