<script setup lang="ts" generic="TData">
import type { Table } from '@tanstack/vue-table'
import type { VNodeChild } from 'vue'
import type { DataTablePaginationVariants } from './index'
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
import { cn } from '@/lib/utils'
import { computed } from 'vue'
import { dataTablePaginationVariants } from './index'

defineOptions({
  name: 'DataTablePagination',
})

const props = withDefaults(defineProps<DataTablePaginationProps<TData>>(), {
  page: 1,
  pageSize: 10,
  pageCount: 1,
  pageSizes: () => [10, 20, 30, 40],
  itemCount: 0,
  showEdges: true,
  disabled: false,
  size: undefined,
  prefix: undefined,
  suffix: undefined,
  isFirstPage: false,
  isLastPage: false,
})

const slots = defineSlots<{
  prefix: (info: PaginationInfo) => any
  suffix: (info: PaginationInfo) => any
}>()

const paginationInfo = computed<PaginationInfo>(() => {
  return {
    page: props.page,
    pageSize: props.pageSize,
    itemCount: props.itemCount,
    pageCount: props.pageCount,
    startIndex: ((props.page - 1) * props.pageSize) + 1,
    endIndex: props.isLastPage ? props.itemCount : props.page * props.pageSize,
  }
})
</script>

<script lang="ts">
export interface DataTablePaginationProps<TData> {
  table: Table<TData>
  page?: number
  pageSize?: number
  pageSizes?: number[]
  pageCount?: number
  itemCount?: number
  showEdges?: boolean
  disabled?: boolean
  size?: DataTablePaginationVariants['size']
  prefix?: (info: PaginationInfo) => VNodeChild
  suffix?: (info: PaginationInfo) => VNodeChild
  isFirstPage?: boolean
  isLastPage?: boolean
}

export interface PaginationInfo {
  startIndex: number
  endIndex: number
  page: number
  pageSize: number
  pageCount: number
  itemCount: number | undefined
}
</script>

<template>
  <div class="flex items-center gap-2 overflow-auto">
    <template v-if="!!slots.prefix">
      <slot name="prefix" v-bind="paginationInfo" />
    </template>
    <template v-else-if="!!props.prefix">
      <component :is="props.prefix(paginationInfo)" v-if="!!props.prefix" />
    </template>
    <Pagination
      v-slot="{ page: currentPage }"
      :page="props.page"
      :items-per-page="table.getState().pagination.pageSize"
      :total="props.itemCount"
      :sibling-count="1"
      :show-edges="props.showEdges"
      :default-page="1"
      :disabled="props.disabled"
    >
      <PaginationList v-slot="{ items }" class="flex items-center gap-1">
        <PaginationFirst
          v-if="!props.showEdges"
          :class="cn(dataTablePaginationVariants({ size: props.size, disabled: props.isFirstPage || props.disabled }))"
          :disabled="props.isFirstPage || props.disabled"
          @click="table.setPageIndex(0)"
        />
        <PaginationPrev
          :class="cn(dataTablePaginationVariants({ size: props.size, disabled: props.isFirstPage || props.disabled }))"
          :disabled="props.isFirstPage || props.disabled"
          @click="table.previousPage()"
        />

        <template v-for="(item, index) in items">
          <PaginationListItem v-if="item.type === 'page'" :key="index" :value="item.value" as-child>
            <Button
              :class="
                cn(dataTablePaginationVariants({ size: props.size, disabled: props.disabled }),
                   item.value === currentPage ? 'border-primary text-primary hover:border-primary hover:text-primary hover:bg-transparent' : undefined,
                )"
              variant="outline"
              @click="table.setPageIndex(item.value - 1)"
            >
              {{ item.value }}
            </Button>
          </PaginationListItem>
          <PaginationEllipsis v-else :key="item.type" :index="index" />
        </template>

        <PaginationNext
          :class="cn(dataTablePaginationVariants({ size: props.size, disabled: props.isLastPage || props.disabled }))"
          :disabled="props.isLastPage || props.disabled"
          @click="table.nextPage()"
        />
        <PaginationLast
          v-if="!props.showEdges"
          :class="cn(dataTablePaginationVariants({ size: props.size, disabled: props.isLastPage || props.disabled }))"
          :disabled="props.isLastPage || props.disabled"
          @click="table.setPageIndex(table.getPageCount() - 1)"
        />
      </PaginationList>
    </Pagination>
    <div class="flex items-center space-x-2">
      <Select
        :model-value="`${table.getState().pagination.pageSize}`"
        :disabled="props.disabled"
        @update:model-value="(pageSize) => { table.setPageSize(Number(pageSize)) }"
      >
        <SelectTrigger
          :class="cn(dataTablePaginationVariants({ size: props.size }),
                     'w-[auto] px-2', 'focus:ring-0 focus:ring-none focus:ring-offset-0')"
        >
          <SelectValue :placeholder="`${props.table.getState().pagination.pageSize} pre page`" />
        </SelectTrigger>
        <SelectContent side="top">
          <SelectItem v-for="_pageSize of pageSizes" :key="_pageSize" :value="`${_pageSize}`">
            {{ _pageSize }} per page
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
    <template v-if="!!slots.suffix">
      <slot name="suffix" v-bind="paginationInfo" />
    </template>
    <template v-else-if="!!props.suffix">
      <component :is="props.suffix(paginationInfo)" v-if="!!props.prefix" />
    </template>
  </div>
</template>

<style scoped>

</style>
