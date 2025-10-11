// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.vue', '**/*.js', '**/*.mjs'],
    rules: {
      // Vue-specific rules
      'vue/multi-word-component-names': 'off',
      'vue/no-v-html': 'warn',

      // TypeScript rules
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_'
        }
      ],
      '@typescript-eslint/no-explicit-any': 'warn',

      // General rules
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'prefer-const': 'warn',
      'no-debugger': 'warn'
    }
  },
  {
    ignores: ['dist', '.output', '.nuxt', 'node_modules', '**/api/**', '**/*.gen.ts']
  }
)
