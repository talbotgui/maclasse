// @ts-check
const eslint = require('@eslint/js');
const { defineConfig } = require('eslint/config');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');

/** Préfixes de sélecteurs autorisés : composants partagés, écrans, popins et sous-composants d'écran. */
const PREFIXES_SELECTEURS = ['mc', 'app', 'ecran', 'popin', 'fe', 'fp', 'edt', 'edtc', 'cj'];

module.exports = defineConfig([
  {
    ignores: ['dist/', 'coverage/', '.angular/', '.e2e/', 'node_modules/'],
  },
  {
    files: ['**/*.ts'],
    extends: [
      eslint.configs.recommended,
      tseslint.configs.recommended,
      tseslint.configs.stylistic,
      angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      '@angular-eslint/directive-selector': [
        'error',
        { type: 'attribute', prefix: PREFIXES_SELECTEURS, style: 'camelCase' },
      ],
      '@angular-eslint/component-selector': [
        'error',
        { type: 'element', prefix: PREFIXES_SELECTEURS, style: 'kebab-case' },
      ],
      '@angular-eslint/prefer-on-push-component-change-detection': 'error',
      '@angular-eslint/prefer-signals': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/explicit-member-accessibility': [
        'error',
        { overrides: { constructors: 'off' } },
      ],
      '@typescript-eslint/no-empty-function': ['error', { allow: ['methods', 'arrowFunctions'] }],
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'memberLike',
          modifiers: ['private'],
          format: null,
          leadingUnderscore: 'forbid',
        },
        {
          selector: 'memberLike',
          modifiers: ['protected'],
          format: null,
          leadingUnderscore: 'forbid',
        },
        {
          selector: 'parameter',
          format: null,
          leadingUnderscore: 'allow',
        },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@angular/core',
              importNames: ['Input', 'Output', 'HostBinding', 'HostListener'],
              message:
                'Utiliser input()/output() et l’objet host: du décorateur (angular-typescript.md).',
            },
            {
              name: '@angular/common',
              importNames: ['NgClass', 'NgStyle', 'NgIf', 'NgFor', 'NgSwitch'],
              message:
                'Utiliser [class.x], [style.x] et le contrôle de flux natif @if/@for/@switch (angular-typescript.md).',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['**/*.spec.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@angular-eslint/prefer-on-push-component-change-detection': 'off',
    },
  },
  {
    files: ['e2e/fixtures/**/*.ts'],
    rules: {
      'no-empty-pattern': 'off',
    },
  },
  {
    files: ['**/*.html'],
    extends: [angular.configs.templateRecommended, angular.configs.templateAccessibility],
    rules: {
      '@angular-eslint/template/prefer-control-flow': 'error',
    },
  },
]);
