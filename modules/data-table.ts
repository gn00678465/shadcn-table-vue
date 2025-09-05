import { addComponent, createResolver, defineNuxtModule } from 'nuxt/kit'

export default defineNuxtModule({
  meta: {
    name: 'data-table',
    configKey: 'DataTable',
    compatibility: {
      nuxt: '^3.18.0',
    },
  },
  async setup(_) {
    const resolver = createResolver(import.meta.url)

    // 註冊 DataTable 元件
    addComponent({
      name: 'DataTable',
      filePath: resolver.resolve('../runtime/components/DataTable.vue'),
      global: true, // 設為全域可用
      mode: 'all', // 同時支援 client 和 server
      kebabName: 'data-table', // 同時支援 kebab-case
      export: 'default',
      priority: 10, // 提高優先級以確保正確解析
    })

    addComponent({
      name: 'ClientDataTable',
      filePath: resolver.resolve('../runtime/components/DataTable.vue'),
      global: true, // 設為全域可用
      mode: 'client', // 支援 client 端
      kebabName: 'client-data-table', // 同時支援 kebab-case
      export: 'default',
    })

    addComponent({
      name: 'LazyVisibleDataTable',
      filePath: resolver.resolve('../runtime/components/LazyVisibleDataTable.vue'),
      global: true, // 設為全域可用
      kebabName: 'lazy-visible-data-table', // 同時支援 kebab-case
      export: 'default',
    })
  },
})
