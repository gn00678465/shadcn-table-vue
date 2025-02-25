<script setup lang="tsx">
import type { HTMLAttributes } from 'vue'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { toRefs } from 'vue'

defineOptions({
  name: 'DataTableSkeleton',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<DataTableSkeletonProps>(), {
  rowCount: 10,
  cellWidths: () => ['auto'],
  shrinkZero: false,
})

const { rowCount, columnCount, cellWidths, shrinkZero } = toRefs(props)
</script>

<script lang="tsx">
interface DataTableSkeletonProps {
  /**
   * The number of columns in the table.
   * @type number
   */
  columnCount: number

  /**
   * The number of rows in the table.
   * @default 10
   * @type number | undefined
   */
  rowCount?: number

  /**
   * The width of each cell in the table.
   * The length of the array should be equal to the columnCount.
   * Any valid CSS width value is accepted.
   * @default ["auto"]
   * @type string[] | undefined
   */
  cellWidths?: string[]

  /**
   * Flag to prevent the table cells from shrinking.
   * @default false
   * @type boolean | undefined
   */
  shrinkZero?: boolean
  class?: HTMLAttributes['class']
  /**
   * only show table body skeleton
   */
  onlyTableBody?: boolean
}
</script>

<template>
  <div :class="cn('w-full space-y-2.5 overflow-auto', props.class)">
    <div class="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow v-for="(_, i) of Array.from({ length: 1 })" :key="i" class="hover:bg-transparent">
            <TableHead
              v-for="(__, j) of Array.from({ length: columnCount })" :key="j"
              :style="{ width: cellWidths[j], minWidth: shrinkZero ? cellWidths[j] : 'auto' }"
            >
              <Skeleton class="h-6 w-full" />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="(_, i) of Array.from({ length: rowCount })" :key="i" class="hover:bg-transparent">
            <TableCell
              v-for="(__, j) of Array.from({ length: columnCount })" :key="j"
              :style="{ width: cellWidths[j], minWidth: shrinkZero ? cellWidths[j] : 'auto' }"
            >
              <Skeleton class="h-6 w-full" />
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  </div>
</template>

<style scoped>

</style>
