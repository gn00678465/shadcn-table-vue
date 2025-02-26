<script setup lang="tsx" generic="TData">
import type { Row, Table as TanstackTable } from '@tanstack/vue-table'
import type { HTMLAttributes, VNodeChild } from 'vue'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { getCommonPinningStyles } from '@/utils/data-table'
import { FlexRender } from '@tanstack/vue-table'
import { computed, toRefs } from 'vue'

defineOptions({
  name: 'DataTable',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<DataTableProps<TData>>(), {
  class: '',
  flexHeight: false,
})

const { class: className, renderExpanded, flexHeight } = toRefs(props)

const isStickyLayout = computed(() => flexHeight.value)

function renderColGroup() {
  return (
    <colgroup>
      {props.table.getAllLeafColumns().map((column) => {
        return <col width={column.getSize() === 150 ? undefined : column.getSize()} />
      })}
    </colgroup>
  )
}
</script>

<script lang="tsx">
export interface DataTableProps<TData> {
  /**
   * The table instance returned from useDataTable hook with pagination, sorting, filtering, etc.
   * @type TanstackTable<TData>
   */
  table: TanstackTable<TData>
  class?: HTMLAttributes['class']
  /** */
  renderExpanded?: (row: Row<TData>, rowIndex: number) => VNodeChild
  flexHeight?: boolean
}
</script>

<template>
  <div :class="cn('w-full space-y-2.5 overflow-auto', className)">
    <div class="overflow-hidden rounded-md border">
      <template v-if="!isStickyLayout">
        <Table>
          <component :is="renderColGroup" />
          <TableHeader v-for="headerGroup of table.getHeaderGroups()" :key="headerGroup.id">
            <TableRow>
              <TableHead
                v-for="header of headerGroup.headers"
                :key="header.id"
                :col-span="header.colSpan"
                :style="{
                  ...getCommonPinningStyles({ column: header.column, withBorder: true }),
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
              <template v-for="(row, idx) of table.getRowModel().rows" :key="row.id">
                <TableRow

                  :data-state="row.getIsSelected() && 'selected'"
                >
                  <TableCell
                    v-for="cell of row.getVisibleCells()" :key="cell.id" :style="{
                      ...getCommonPinningStyles({ column: cell.column, withBorder: true }),
                    }"
                  >
                    <FlexRender
                      :render="cell.column.columnDef.cell"
                      :props="cell.getContext()"
                    />
                  </TableCell>
                </TableRow>
                <TableRow v-if="row.getIsExpanded() && !!renderExpanded">
                  <TableCell :colspan="row.getAllCells().length">
                    <component :is="renderExpanded(row, idx)" />
                  </TableCell>
                </TableRow>
              </template>
            </template>
          </TableBody>
        </Table>
      </template>
      <template v-else>
        <Table class="table-fixed">
          <component :is="renderColGroup" />
          <TableHeader v-for="headerGroup of table.getHeaderGroups()" :key="headerGroup.id">
            <TableRow>
              <TableHead
                v-for="header of headerGroup.headers"
                :key="header.id"
                :col-span="header.colSpan"
                :style="{
                  ...getCommonPinningStyles({ column: header.column, withBorder: true }),
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
        </Table>
        <Table class="table-fixed">
          <component :is="renderColGroup" />
          <TableBody>
            <template v-if="table.getRowModel().rows?.length">
              <template v-for="(row, idx) of table.getRowModel().rows" :key="row.id">
                <TableRow

                  :data-state="row.getIsSelected() && 'selected'"
                >
                  <TableCell
                    v-for="cell of row.getVisibleCells()" :key="cell.id" :style="{
                      ...getCommonPinningStyles({ column: cell.column, withBorder: true }),
                    }"
                  >
                    <FlexRender
                      :render="cell.column.columnDef.cell"
                      :props="cell.getContext()"
                    />
                  </TableCell>
                </TableRow>
                <TableRow v-if="row.getIsExpanded() && !!renderExpanded">
                  <TableCell :colspan="row.getAllCells().length">
                    <component :is="renderExpanded(row, idx)" />
                  </TableCell>
                </TableRow>
              </template>
            </template>
          </TableBody>
        </Table>
      </template>
    </div>
  </div>
</template>

<style scoped></style>
