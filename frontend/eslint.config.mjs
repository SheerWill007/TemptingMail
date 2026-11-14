import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt({
  rules: {
    // Email HTML is sanitized with DOMPurify before it is rendered.
    'vue/no-v-html': 'off',
    // Prettier writes void elements as <br />; keep the two tools in agreement.
    'vue/html-self-closing': ['warn', { html: { void: 'always', normal: 'always', component: 'always' } }],
  },
})
