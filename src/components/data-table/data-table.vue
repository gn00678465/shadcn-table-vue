<script setup lang="tsx" generic="TData">
import type { Row, Table as TanstackTable } from '@tanstack/vue-table'
import type { HTMLAttributes, VNodeChild } from 'vue'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { getCommonPinningStyles } from '@/utils/data-table'
import { FlexRender } from '@tanstack/vue-table'
import { computed, Fragment, toRefs } from 'vue'

defineOptions({
  name: 'DataTable',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<DataTableProps<TData>>(), {
  class: '',
})

const { class: className, renderExpanded } = toRefs(props)
const columnCount = computed(() => [...Array.from({ length: props.table.getAllLeafColumns().length })])

function stickyHeaderLayout() {
  return (
    <Fragment>
      <Table class="table-fixed">
        { renderColGroup() }
        <TableHeader>
          {props.table.getHeaderGroups().map(headerGroup => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead
                    key={header.id}
                    col-span={header.colSpan}
                    style={{
                      ...getCommonPinningStyles({ column: header.column, withBorder: true }),
                    }}
                  >
                    {header.isPlaceholder
                      ? null
                      : (
                          <FlexRender
                            render={header.column.columnDef.header}
                            {...header.getContext()}
                          />
                        )}
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
      </Table>
      <Table class="table-fixed">
        { renderColGroup() }
        <TableBody>
          {props.table.getRowModel().rows?.length
            ? (
                props.table.getRowModel().rows.map(row => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                  >
                    {row.getVisibleCells().map(cell => (
                      <TableCell
                        key={cell.id}
                        style={{
                          ...getCommonPinningStyles({ column: cell.column, withBorder: true }),
                        }}
                      >
                        <FlexRender
                          render={cell.column.columnDef.cell}
                          {...cell.getContext()}
                        />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )
            : (
                <TableRow>
                  <TableCell
                    col-span={props.table.getAllColumns().length}
                    class="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
        </TableBody>
      </Table>
    </Fragment>
  )
}

function renderColGroup() {
  return (
    <colgroup>
      {columnCount.value.map(() => {
        return <col />
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
  renderExpanded?: (row: Row<TData>) => VNodeChild
}
</script>

<template>
  <div :class="cn('w-full space-y-2.5 overflow-auto', className)">
    <div class="overflow-hidden rounded-md border">
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
            <template v-for="row of table.getRowModel().rows" :key="row.id">
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
                  <component :is="renderExpanded(row)" />
                </TableCell>
              </TableRow>
            </template>
          </template>
        </TableBody>
      </Table>
    </div>
  </div>
</template>

<style scoped></style>
