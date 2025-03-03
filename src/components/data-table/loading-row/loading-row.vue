<script setup lang="ts" generic="TData">
import type { PinningStyleOptions } from '@/utils/data-table'
import type { Column } from '@tanstack/vue-table'
import type { DataTableVariants } from '../index'
import { Skeleton } from '@/components/ui/skeleton'
import { TableCell, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { getCommonPinningStyles } from '../../../utils/data-table'
import { dataTableVariants } from '../index'

const props = withDefaults(defineProps<LoadingRowProps<TData>>(), {
  size: 'default',
})
</script>

<script lang="ts">
export interface LoadingRowProps<TData> {
  columns: Column<TData>[]
  size?: DataTableVariants['size']
  pinningOptions?: PinningStyleOptions
}
</script>

<template>
  <TableRow>
    <TableCell
      v-for="column of props.columns" :key="column.id"
      :class="cn(dataTableVariants({ size: props.size }), 'bg-[var(--td-color)]', 'group-hover:bg-[--td-color-hover]')"
      :style="getCommonPinningStyles({ column, options: props.pinningOptions })"
    >
      <Skeleton class="h-5 w-full" />
    </TableCell>
  </TableRow>
</template>
