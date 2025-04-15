<script setup lang="ts" generic="TData">
import type { Column } from '@tanstack/vue-table'
import { Skeleton } from '@/components/ui/skeleton'
import { TableCell, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { getCommonPinningStyles } from '../../../utils/data-table'

const props = withDefaults(defineProps<LoadingRowProps<TData>>(), {
  estimateSize: () => 52,
})
</script>

<script lang="ts">
export interface LoadingRowProps<TData> {
  index?: number
  columns: Column<TData>[]
  isAtLeftEdge?: boolean
  isAtRightEdge?: boolean
  estimateSize?: () => number
}
</script>

<template>
  <TableRow
    :style="{
      '--height': props.estimateSize ? `${props.estimateSize()}px` : undefined,
    }"
  >
    <TableCell
      v-for="(column) of props.columns" :key="column.id"
      :class="cn('px-4 py-0', 'bg-[var(--td-color)]', 'group-hover:bg-[--td-color-hover]', 'h-[var(--height)]')"
      :style="getCommonPinningStyles({
        column,
        isAtLeftEdge: props.isAtLeftEdge,
        isAtRightEdge: props.isAtRightEdge,
      })"
    >
      <Skeleton class="h-5 w-full" />
    </TableCell>
  </TableRow>
</template>
