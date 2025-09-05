import withNuxt from './.playground/.nuxt/eslint.config.mjs'

export default withNuxt()
  .prepend()
  .override('nuxt/typescript/rules', {
    rules: {
      '@typescript-eslint/no-explicit-any': ['off'],
      '@typescript-eslint/no-unused-vars': ['off'],
    },
  })
