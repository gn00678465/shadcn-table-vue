<script setup lang="ts" generic="TData">
import type { Table as TanstackTable } from '@tanstack/vue-table'
import type { HTMLAttributes } from 'vue'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { getCommonPinningStyles } from '@/utils/data-table'
import { FlexRender } from '@tanstack/vue-table'
import { toRefs } from 'vue'

const props = withDefaults(defineProps<DataTableProps<TData>>(), {
  class: '',
})

const { class: className } = toRefs(props)
</script>

<script lang="ts">
export interface DataTableProps<TData> {
  /**
   * The table instance returned from useDataTable hook with pagination, sorting, filtering, etc.
   * @type TanstackTable<TData>
   */
  table: TanstackTable<TData>
  class?: HTMLAttributes['class']
}
</script>

<template>
  <div :class="cn('w-full space-y-2.5 overflow-auto', className)">
    <div class="overflow-hidden rounded-md border">
      <Table>
        <TableHeader v-for="headerGroup of table.getHeaderGroups()" :key="headerGroup.id">
          <TableRow>
            <TableHead
              v-for="header of headerGroup.headers"
              :key="header.id"
              :col-span="header.colSpan"
              :style="{
                ...getCommonPinningStyles({ column: header.column }),
              }"
            >
              <FlexRender
                v-if="!header.isPlaceholder"
                :render="header.column.columnDef.header"
                :props="header.getContext()"
              />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <template v-if="table.getRowModel().rows?.length">
            <TableRow v-for="row of table.getRowModel().rows" :key="row.id" :data-state="row.getIsSelected() && 'selected'">
              <TableCell
                v-for="cell of row.getVisibleCells()" :key="cell.id" :style="{
                  ...getCommonPinningStyles({ column: cell.column }),
                }"
              >
                <FlexRender
                  :render="cell.column.columnDef.cell"
                  :props="cell.getContext()"
                />
              </TableCell>
            </TableRow>
          </template>
        </TableBody>
      </Table>
    </div>
  </div>
</template>

<style scoped></style>
