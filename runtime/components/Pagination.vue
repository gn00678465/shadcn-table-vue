<script lang="ts">
import type { Table } from '@tanstack/vue-table'
import type { VariantProps } from 'class-variance-authority'
import type { VNodeChild } from 'vue'
import { cva } from 'class-variance-authority'
import { computed } from 'vue'
import { Button } from '@/components/ui/button'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '../lib/utils'
import { First, Last } from './helpers/Pagination'

export const paginationVariants = cva('p-0', {
  variants: {
    size: {
      lg: 'h-10 w-10 size-10',
      default: 'h-8 w-8 size-8',
      sm: 'h-7 w-7 text-sm size-7',
    },
    disabled: {
      true: 'disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:pointer-events-auto',
      false: '',
    },
    activated: {
      true: 'border-primary text-primary hover:border-primary hover:enabled:text-primary hover:bg-transparent',
      false: 'cursor-pointer',
    },
  },
  defaultVariants: {
    size: 'default',
    disabled: false,
    activated: false,
  },
})

export type PaginationVariants = VariantProps<typeof paginationVariants>

export interface PaginationProps<TData> {
  table: Table<TData>
  page?: number
  pageSize?: number
  pageSizes?: number[]
  pageCount?: number
  itemCount?: number
  showEdges?: boolean
  disabled?: boolean
  size?: PaginationVariants['size']
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

<script setup lang="ts" generic="TData">
defineOptions({
  name: 'DataTablePagination',
})

const props = withDefaults(defineProps<PaginationProps<TData>>(), {
  page: 1,
  pageSize: 10,
  pageCount: 1,
  pageSizes: () => [10, 20, 30, 40],
  itemCount: 0,
  showEdges: true,
  disabled: false,
  size: 'default',
  prefix: undefined,
  suffix: undefined,
  isFirstPage: false,
  isLastPage: false,
})

const slots = defineSlots<{
  prefix: (info: PaginationInfo) => any
  suffix: (info: PaginationInfo) => any
  first: () => any
  previous: () => any
  next: () => any
  last: () => any
}>()

const { t } = useI18n()

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

const edgeButtonClass = '[&>span]:hidden [&>span]:sr-only border bg-background shadow-xs dark:bg-input/30 dark:border-input'
</script>

<template>
  <div class="flex items-center gap-2 overflow-auto">
    <template v-if="!!slots.prefix">
      <slot
        name="prefix"
        v-bind="paginationInfo"
      />
    </template>
    <template v-else-if="!!props.prefix">
      <component
        :is="props.prefix(paginationInfo)"
        v-if="!!props.prefix"
      />
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
      class="w-auto"
    >
      <PaginationContent
        v-slot="{ items }"
        class="flex items-center gap-1 py-0"
      >
        <First
          v-if="props.showEdges"
          :class="cn(edgeButtonClass, paginationVariants({ size: props.size, disabled: props.isFirstPage || props.disabled }))"
          :disabled="props.isFirstPage || props.disabled"
          @click="table.setPageIndex(0)"
        >
          <template #default>
            <slot name="first" />
          </template>
        </First>
        <PaginationPrevious
          :class="cn(edgeButtonClass, paginationVariants({ size: props.size, disabled: props.isFirstPage || props.disabled }))"
          :disabled="props.isFirstPage || props.disabled"
          @click="table.previousPage()"
        >
          <template #default>
            <slot name="previous" />
          </template>
        </PaginationPrevious>

        <template v-for="(item, index) in items">
          <PaginationItem
            v-if="item.type === 'page'"
            :key="index"
            :value="item.value"
            as-child
          >
            <Button
              :class="
                cn(paginationVariants({ size: props.size, disabled: props.disabled, activated: item.value === currentPage }),
                )"
              variant="outline"
              @click="table.setPageIndex(item.value - 1)"
            >
              {{ item.value }}
            </Button>
          </PaginationItem>
          <PaginationEllipsis
            v-else
            :key="item.type"
            :index="index"
            :class="cn(paginationVariants({ size: props.size }), 'rounded-md')"
          />
        </template>

        <PaginationNext
          :class="cn(edgeButtonClass, paginationVariants({ size: props.size, disabled: props.isLastPage || props.disabled }))"
          :disabled="props.isLastPage || props.disabled"
          @click="table.nextPage()"
        >
          <template #default>
            <slot name="next" />
          </template>
        </PaginationNext>
        <Last
          v-if="props.showEdges"
          :class="cn(edgeButtonClass, paginationVariants({ size: props.size, disabled: props.isLastPage || props.disabled }))"
          :disabled="props.isLastPage || props.disabled"
          @click="table.setPageIndex(table.getPageCount() - 1)"
        >
          <template #default>
            <slot name="last" />
          </template>
        </Last>
      </PaginationContent>
    </Pagination>
    <div class="flex items-center space-x-2">
      <Select
        :model-value="`${table.getState().pagination.pageSize}`"
        :disabled="props.disabled"
        @update:model-value="(pageSize) => { table.setPageSize(Number(pageSize)) }"
      >
        <SelectTrigger
          :class="cn(
            'w-[auto] px-2', 'focus-visible:ring-0 focus-visible:ring-none focus-visible:ring-offset-0',
            { 'data-[size=lg]:h-10': props.size === 'lg' },
            { 'data-[size=default]:h-8': props.size === 'default' },
            { 'data-[size=sm]:h-7 text-sm': props.size === 'sm' },
          )"
          :data-size="props.size"
          :disabled="props.disabled"
        >
          <SelectValue :placeholder="`${props.table.getState().pagination.pageSize} pre page`">
            {{ t('data_table.pre_page', table.getState().pagination.pageSize) }}
          </SelectValue>
        </SelectTrigger>
        <SelectContent side="top">
          <SelectItem
            v-for="_pageSize of pageSizes"
            :key="_pageSize"
            :value="`${_pageSize}`"
          >
            {{ t('data_table.pre_page', _pageSize) }}
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
    <template v-if="!!slots.suffix">
      <slot
        name="suffix"
        v-bind="paginationInfo"
      />
    </template>
    <template v-else-if="!!props.suffix">
      <component
        :is="props.suffix(paginationInfo)"
        v-if="!!props.prefix"
      />
    </template>
  </div>
</template>

<style scoped>

</style>
