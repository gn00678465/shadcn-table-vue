import { addComponent, createResolver, defineNuxtModule, addImports } from 'nuxt/kit'

export default defineNuxtModule({
  meta: {
    name: '@nuxtjs/data-table',
    compatibility: {
      nuxt: '^3.18.0',
    },
  },
  async setup(_) {
    const resolver = createResolver(import.meta.url)

    // inject components
    /**
     * 註冊 DataTable 元件
     */
    addComponent({
      name: 'DataTable',
      filePath: resolver.resolve('../runtime/components/DataTable.vue'),
      global: true, // 設為全域可用
      mode: 'all', // 同時支援 client 和 server
      kebabName: 'data-table', // 同時支援 kebab-case
      export: 'default',
      priority: 10, // 提高優先級以確保正確解析
    })

    /**
     * 註冊 ClientDataTable 元件 (僅在 client 端渲染)
     */
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

    addComponent({
      name: 'DataTablePagination',
      filePath: resolver.resolve('../runtime/components/Pagination.vue'),
      global: true, // 設為全域可用
      kebabName: 'data-table-pagination', // 同時支援 kebab-case
      export: 'default',
    })

    addComponent({
      name: 'DataTableViewOptions',
      filePath: resolver.resolve('../runtime/components/ViewOptions.vue'),
      global: true, // 設為全域可用
      kebabName: 'data-table-view-options', // 同時支援 kebab-case
      export: 'default',
    })

    // inject composables
    /**
     * 註冊 useDataTable Composable
     */
    addImports({
      name: 'useDataTable',
      as: 'useDataTable',
      from: resolver.resolve('../runtime/composables/useDataTable.ts'),
    })
  },
})
