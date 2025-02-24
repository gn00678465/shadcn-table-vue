<script setup lang="ts" generic="TData">
import type { Table } from '@tanstack/vue-table'
import { Button } from '@/components/ui/button'
import {
  Pagination,
  PaginationEllipsis,
  PaginationFirst,
  PaginationLast,
  PaginationList,
  PaginationListItem,
  PaginationNext,
  PaginationPrev,
} from '@/components/ui/pagination'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const props = withDefaults(defineProps<DataTablePaginationProps<TData>>(), {
  pageSizes: () => [10, 20, 30, 40],
  defaultPage: 0,
  itemCount: 0,
  showEdges: true,
  disabled: false,
})
</script>

<script lang="ts">
export interface DataTablePaginationProps<TData> {
  table: Table<TData>
  pageSizes?: number[]
  defaultPage?: number
  itemCount?: number
  showEdges?: boolean
  disabled?: boolean
}
</script>

<template>
  <div class="flex items-center gap-2 overflow-auto p-1">
    <Pagination
      v-slot="{ page }"
      :items-per-page="table.getState().pagination.pageSize"
      :total="props.itemCount"
      :sibling-count="1"
      :show-edges="props.showEdges"
      :default-page="props.defaultPage"
      :disabled="props.disabled"
    >
      <PaginationList v-slot="{ items }" class="flex items-center gap-1">
        <PaginationFirst v-if="!props.showEdges" :disabled="!table.getCanPreviousPage() || props.disabled" @click="table.setPageIndex(0)" />
        <PaginationPrev :disabled="!table.getCanPreviousPage() || props.disabled" @click="table.previousPage()" />

        <template v-for="(item, index) in items">
          <PaginationListItem v-if="item.type === 'page'" :key="index" :value="item.value - 1" as-child>
            <Button class="w-10 h-10 p-0" :variant="item.value - 1 === page ? 'default' : 'outline'" @click="table.setPageIndex(item.value - 1)">
              {{ item.value }}
            </Button>
          </PaginationListItem>
          <PaginationEllipsis v-else :key="item.type" :index="index" />
        </template>

        <PaginationNext :disabled="!table.getCanNextPage() || props.disabled" @click="table.nextPage()" />
        <PaginationLast v-if="!props.showEdges" :disabled="!table.getCanNextPage() || props.disabled" @click="table.setPageIndex(table.getPageCount() - 1)" />
      </PaginationList>
    </Pagination>
    <div class="flex items-center space-x-2">
      <Select

        :model-value="`${table.getState().pagination.pageSize}`"
        @update:model-value="(pageSize) => { table.setPageSize(Number(pageSize)) }"
      >
        <SelectTrigger class="h-10 w-[auto]">
          <SelectValue :placeholder="`${props.table.getState().pagination.pageSize} pre page`" />
        </SelectTrigger>
        <SelectContent side="top">
          <SelectItem v-for="pageSize of pageSizes" :key="pageSize" :value="`${pageSize}`">
            {{ pageSize }} pre page
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  </div>
</template>

<style scoped>

</style>
