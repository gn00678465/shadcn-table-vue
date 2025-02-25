<script setup lang="ts">
import type { ColumnDef } from '@tanstack/vue-table'
import { DataTable, DataTablePagination, DataTableSkeleton } from '@/components/data-table'
import { useDataTable } from '@/composables/use-data-table'
import { faker } from '@faker-js/faker/locale/zh_TW'
import { h, onMounted, ref } from 'vue'

interface Person {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  age: number
}

const columns: ColumnDef<Person>[] = [
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
    accessorKey: 'age',
    header: '年齡',
    cell: ({ getValue }) => getValue(),
  },
]

// 模擬遠程數據
const totalItems = 100
const loading = ref(false)
const currentData = ref<Person[]>([])

// 生成假數據
function generateFakeData(start: number, length: number): Person[] {
  return Array.from({ length }, (_, index) => ({
    id: `${start + index + 1}`,
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    email: faker.internet.email(),
    phone: faker.phone.number(),
    age: faker.number.int({ min: 18, max: 80 }),
  }))
}

// 模擬API調用
async function fetchData(page: number, pageSize: number): Promise<void> {
  loading.value = true
  try {
    // 模擬API延遲
    await new Promise(resolve => setTimeout(resolve, 500))
    const start = page * pageSize
    currentData.value = generateFakeData(start, pageSize)
  }
  finally {
    loading.value = false
  }
}

// 初始化表格
const { table, pagination } = useDataTable<Person>({
  columns,
  data: currentData,
  remote: true,
  itemCount: totalItems,
  initialPagination: {
    pageIndex: 0,
    pageSize: 10,
  },
  rowKey: row => `${row.id}`,
  initialRowSelection: ref(['10']),
  initialPinning: {
    left: ['select', 'id'],
    right: ['age'],
  },
  enableRowSelection: true,
  onPageChange: async (page: number): Promise<void> => {
    await fetchData(page, pagination.value.pageSize)
  },
  onPageSizeChange: async (pageSize: number): Promise<void> => {
    await fetchData(pagination.value.pageIndex, pageSize)
  },
  onUpdateCheckedRowKeys(keys) {
    // eslint-disable-next-line no-console
    console.log('🚀 ~ onUpdateCheckedRowKeys ~ keys:', keys)
  },
})

// 初始加載
onMounted(() => {
  fetchData(0, 10)
})
</script>

<template>
  <div class="container mx-auto py-10">
    <template v-if="!currentData.length && loading">
      <DataTableSkeleton :column-count="columns.length" :row-count="2" />
    </template>

    <template v-else>
      <DataTable :table="table" />

      <!-- 分頁信息 -->
      <DataTablePagination :table="table" :page="pagination.pageIndex" :item-count="pagination.itemCount" size="sm" />
    </template>
  </div>
</template>
