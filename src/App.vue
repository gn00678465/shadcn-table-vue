<script setup lang="ts">
import { useDataTable, type PaginationInfo } from '@/composables/use-data-table'
import type { ColumnDef } from '@tanstack/vue-table'
import { DataTable } from '@/components/data-table'
import { faker } from '@faker-js/faker/locale/zh_TW'
import { ref, onMounted } from 'vue'

interface Person {
  id: number
  firstName: string
  lastName: string
  email: string
  phone: string
  age: number
}

const columns: ColumnDef<Person>[] = [
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
    id: start + index + 1,
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
  } finally {
    loading.value = false
  }
}

// 初始化表格
const { table, pagination } = useDataTable<Person>({
  columns,
  data: currentData,
  remote: true,
  totalRows: totalItems,
  initialPagination: {
    pageIndex: 0,
    pageSize: 10,
  },
  onPageChange: async (page: number): Promise<void> => {
    await fetchData(page, pagination.value.pageSize)
  },
  onPageSizeChange: async (pageSize: number): Promise<void> => {
    await fetchData(pagination.value.pageIndex, pageSize)
  },
})

// 初始加載
onMounted(() => {
  fetchData(0, 10)
})
</script>

<template>
  <div class="container mx-auto py-10">
    <div v-if="!currentData.length && loading" class="flex h-[200px] items-center justify-center">
      <div class="text-lg">載入中...</div>
    </div>
    
    <template v-else>
      <DataTable :table="table" />
      
      <!-- 分頁信息 -->
      <div class="flex items-center justify-between space-x-2 py-4">
        <div class="flex-1 text-sm text-muted-foreground">
          第 {{ pagination.pageIndex + 1 }}/{{ pagination.pageCount }} 頁，
          共 {{ pagination.totalRows }} 條記錄
          <span v-if="loading" class="ml-2">載入中...</span>
        </div>
        <div class="flex items-center space-x-2">
          <button
            class="rounded-lg border px-2.5 py-0.5 text-sm disabled:opacity-50"
            :disabled="pagination.pageIndex === 0 || loading"
            @click="table.previousPage()"
          >
            上一頁
          </button>
          <button
            class="rounded-lg border px-2.5 py-0.5 text-sm disabled:opacity-50"
            :disabled="pagination.pageIndex === pagination.pageCount - 1 || loading"
            @click="table.nextPage()"
          >
            下一頁
          </button>
        </div>
      </div>
    </template>
  </div>
</template>
