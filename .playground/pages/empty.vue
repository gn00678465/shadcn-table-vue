<script setup lang="ts">
import type { Row, ColumnDef } from '@tanstack/vue-table'
import { DataTable, ClientOnly, DataTableColumnHeader } from '#components'
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
    header: ({ column, table }) => {
      return h(DataTableColumnHeader<Person>, {
        title: 'ID',
        column: column,
      })
    },
    cell: ({ getValue }) => getValue(),
  },
  {
    accessorKey: 'firstName',
    header: ({ column, table }) => {
      return h(DataTableColumnHeader<Person>, {
        title: '名',
        column: column,
      })
    },
    cell: ({ getValue }) => getValue(),
  },
  {
    accessorKey: 'lastName',
    enablePinning: false,
    header: ({ column, table }) => {
      return h(DataTableColumnHeader<Person>, {
        title: '姓',
        column: column,
      })
    },
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
  data: computed(() => []),
  rowKey: row => `${row.id}`,
  pagination: paginationState.value,
  paginationOptions: {
    remote: true,
    itemCount: 0,
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
  // sorting
  sortingOptions: {
    manualSorting: true,
    enableMultiSort: true,
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
    <div class="space-y-[16px]">
      <ClientOnly>
        <div class="flex justify-between">
          <h2 class="text-xl font-semibold">
            Table(Flex Height)
          </h2>
          <DataTableViewOptions :table="table" />
        </div>
        <DataTable
          :style="{ 'max-height': '100%', 'height': '600px' }"
          :loading="status === 'pending'"
          :table="table"
          :render-expanded="(row) => h('pre', { style: 'fontSize: 10px' }, [
            h('code', JSON.stringify(row.original, null, 2)),
          ])"
          :scroll-x="1920"
          :flex-height="true"
          :pinning-options="{
            withBorder: true,
          }"
        />
      </ClientOnly>
      <ClientOnly>
        <div class="flex justify-between">
          <h2 class="text-xl font-semibold">
            Table(Auto Height)
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
        />
      </ClientOnly>
    </div>
  </div>
</template>
