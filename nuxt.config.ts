// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxtjs/i18n'],
  devtools: { enabled: true },
  i18n: {
    locales: [
      { code: 'en-US', file: 'enUS.json' },
      { code: 'zh-TW', file: 'zhTW.json' },
    ],
  },
})
