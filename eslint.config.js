import js from '@eslint/js';
import n from 'eslint-plugin-n';
import prettier from 'eslint-config-prettier';

export default [
  { ignores: ['node_modules/'] },
  js.configs.recommended,
  n.configs['flat/recommended'],
  prettier,
];
