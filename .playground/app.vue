<script setup lang="ts">
import type { Row, ColumnDef } from '@tanstack/vue-table'
import { DataTable, ClientOnly } from '#components'
import { useDataTable } from '#imports'

interface Person {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  age: number
  gender: string
}

function renderExpanded(row: Row<Person>) {
  if (!row.getCanExpand()) {
    return h('p', '🔵')
  }
  return h(
    'button',
    {
      onClick: row.getToggleExpandedHandler(),
      style: { cursor: 'pointer' },
    },
    row.getIsExpanded() ? '👇' : '👉',
  )
}

const columns: ColumnDef<Person>[] = [
  {
    id: 'expander',
    header: () => null,
    cell: ({ row }) => renderExpanded(row),
    size: 30,
  },
  {
    id: 'select',
    header: ({ table }) => {
      return h('input', {
        type: 'checkbox',
        checked: table.getIsAllRowsSelected(),
        onChange: table.getToggleAllRowsSelectedHandler(),
      })
    },
    cell: ({ row }) => {
      return h('div', [
        h('input', {
          type: 'checkbox',
          checked: row.getIsSelected(),
          onChange: row.getToggleSelectedHandler(),
        }),
      ])
    },
    size: 60,
  },
  {
    accessorKey: 'id',
    header: 'ID',
    cell: ({ getValue }) => getValue(),
  },
  {
    accessorKey: 'firstName',
    header: '名',
    cell: ({ getValue }) => getValue(),
  },
  {
    accessorKey: 'lastName',
    header: '姓',
    cell: ({ getValue }) => getValue(),
  },
  {
    accessorKey: 'email',
    header: 'Email',
    cell: ({ getValue }) => getValue(),
  },
  {
    accessorKey: 'phone',
    header: '電話',
    cell: ({ getValue }) => getValue(),
  },
  {
    accessorKey: 'gender',
    header: '性別',
    cell: ({ getValue }) => getValue(),
    size: 200,
  },
  {
    accessorKey: 'age',
    header: '年齡',
    cell: ({ getValue }) => getValue(),
    size: 120,
  },
]

// 模擬遠程數據
const paginationState = ref({
  pageIndex: 0,
  pageSize: 10,
})

// 模擬API調用
const { data, status, refresh } = useAsyncData('fetch-initial-data', async () => {
  const res = await $fetch<{ total: number, data: Person[] }>('/api/users', {
    method: 'POST',
    body: {
      page: paginationState.value.pageIndex + 1,
      size: paginationState.value.pageSize,
    },
  })
  return {
    total: res.total || 0,
    data: res.data || [],
  }
}, {
  watch: [paginationState],
  server: true,
  default: () => ({
    total: 0,
    data: [],
  }),
})

// 初始化表格
const { table, pagination } = useDataTable<Person>({
  columns,
  data: computed(() => data.value?.data ?? []),
  rowKey: row => `${row.id}`,
  pagination: paginationState.value,
  paginationOptions: {
    remote: true,
    itemCount: data.value.total,
  },
  rowSelection: ref(['10', '20']),
  rowSelectionOptions: {
    multi: true,
  },
  // expanded: ref(['1', '2']),
  expandedOptions: {
    enableExpanding: true,
  },
  columnVisibility: {
    id: false,
    age: false,
  },
  columnPinning: {
    left: [
      'expander',
      'select',
      // 'id',
    ],
    right: ['age'],
  },
  persistOptions: {
    persistKey: 'my-table',
    ssr: false, // 默認值
    storageType: 'local', // 默認值
  },
  debug: import.meta.env.DEV,
  onPageChange: async (page: number): Promise<void> => {
    paginationState.value.pageIndex = page
    refresh()
  },
  onPageSizeChange: async (pageSize: number): Promise<void> => {
    paginationState.value.pageSize = pageSize
    refresh()
  },
  onUpdateCheckedRowKeys(keys) {
    console.log('🚀 ~ onUpdateCheckedRowKeys ~ keys:', keys)
  },
  onUpdateExpandedKeys: (keys) => {
    console.log('🚀 ~ onUpdateExpandedKeys ~ keys:', keys)
  },
})
</script>

<template>
  <div class="container mx-auto py-10 space-y-10">
    <div class="space-y-4">
      <ClientOnly>
        <div class="flex justify-between">
          <h2 class="text-xl font-semibold">
            Table(Client)
          </h2>
          <DataTableViewOptions :table="table" />
        </div>
        <DataTable
          :loading="status === 'pending'"
          :table="table"
          :render-expanded="(row) => h('pre', { style: 'fontSize: 10px' }, [
            h('code', JSON.stringify(row.original, null, 2)),
          ])"
          :scroll-x="1920"
          :pinning-options="{
            withBorder: true,
          }"
        >
          <template #empty>
            <div class="text-center absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              Empty
            </div>
          </template>
        </DataTable>
        <DataTablePagination
          :table="table"
          :page="pagination.currentPage"
          :page-count="pagination.pageCount"
          :page-size="pagination.currentPageSize"
          :item-count="pagination.itemCount"
          :is-first-page="pagination.isFirstPage"
          :is-last-page="pagination.isLastPage"
          size="sm"
        >
          <template #prefix="props">
            <span>{{ `${props.startIndex}`.padStart(2, '0') }} of {{ `${props.endIndex}`.padStart(2, '0') }}</span>
          </template>
        </DataTablePagination>
      </ClientOnly>
    </div>
    <!-- <div class="space-y-4">
      <div class="flex justify-between">
        <h2 class="text-xl font-semibold">
          Table(Flex height)
        </h2>
        <DataTableViewOptions :table="table" />
      </div>
      <DataTable
        :loading="status === 'pending'"
        :table="table"
        :flex-height="true"
        :render-expanded="(row) => h('pre', { style: 'fontSize: 10px' }, [
          h('code', JSON.stringify(row.original, null, 2)),
        ])"
        style="max-height: 100%; height: 600px;"
        :scroll-x="1920"
        :pinning-options="{
          withBorder: true,
        }"
      >
        <template #empty>
          <div class="text-center absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            Empty
          </div>
        </template>
      </DataTable>
      <DataTablePagination
        :table="table"
        :page="pagination.currentPage"
        :page-count="pagination.pageCount"
        :page-size="pagination.currentPageSize"
        :item-count="pagination.itemCount"
        :is-first-page="pagination.isFirstPage"
        :is-last-page="pagination.isLastPage"
        :show-edges="true"
        size="sm"
      >
        <template #prefix="props">
          <span>{{ `${props.startIndex}`.padStart(2, '0') }} of {{ `${props.endIndex}`.padStart(2, '0') }}</span>
        </template>
      </DataTablePagination>
    </div> -->
  </div>
</template>
