<script lang="ts">
import type { Row, Table as TanstackTable } from '@tanstack/vue-table'
import type { VariantProps } from 'class-variance-authority'
import type { CSSProperties, Directive, HTMLAttributes, VNodeChild } from 'vue'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { FlexRender } from '@tanstack/vue-table'
import { cva } from 'class-variance-authority'
import { computed, h, ref, toRefs } from 'vue'
import { getCommonPinningStyles } from '../../../utils/data-table'
import { toCssVarName } from '../../../utils/themes'
import { omit, pick } from '../../../utils/utils'
import LoadingRow from '../loading-row/index.vue'

export const dataTableVariants = cva('', {
  variants: {
    size: {
      default: ['p-4'],
      sm: ['px-4', 'py-3'],
    },
  },
  defaultVariants: {
    size: 'default',
  },
})
export type DataTableVariants = VariantProps<typeof dataTableVariants>

export interface DataTableProps<TData> {
  /**
   * The table instance returned from useDataTable hook with pagination, sorting, filtering, etc.
   * @type TanstackTable<TData>
   */
  table: TanstackTable<TData>
  class?: HTMLAttributes['class']
  style?: CSSProperties
  /** */
  renderExpanded?: (row: Row<TData>, rowIndex: number) => VNodeChild
  flexHeight?: boolean
  size?: DataTableVariants['size']
  scrollX?: number
  rowClassName?: string | ((row: Row<TData>, rowIndex: number) => string)
  rowProps?: (row: Row<TData>, rowIndex: number) => HTMLAttributes
  //
  themeOverrides?: ThemeOverrides
  //
  loading?: boolean
  loadingRowEstimateSize?: (index: number) => number
}

export interface ThemeOverrides {
  tdColor?: string
  tdColorHover?: string
  thColor?: string
  thColorHover?: string
}
</script>

<script setup lang="ts" generic="TData">
defineOptions({
  name: 'DataTable',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<DataTableProps<TData>>(), {
  class: undefined,
  flexHeight: false,
  size: 'default',
  scrollX: undefined,
  rowClassName: undefined,
  rowProps: undefined,
  themeOverrides: () => ({
    thColor: 'hsl(var(--data-table-header, 0 0% 98%))',
    thColorHover: 'hsl(var(--data-table-header-hover, 0 0% 96.1%))',
    tdColor: 'hsl(var(--data-table-cell, 0 0% 100%))',
    tdColorHover: 'hsl(var(--data-table-cell-hover, 0 0% 97.5%))',
  }),
  loading: false,
})

defineSlots<{
  empty: () => any
}>()

const { renderExpanded, flexHeight, scrollX, rowClassName, rowProps, themeOverrides, loading } = toRefs(props)

const isAtLeftEdge = ref(true)
const isAtRightEdge = ref(false)

const isStickyLayout = computed(() => flexHeight.value)
const isEmpty = computed(() => !props.table.getCoreRowModel().rows?.length)

const tableStyles = computed(() => {
  const result: Record<string, string> = {}

  for (const key in themeOverrides.value) {
    if (Object.prototype.hasOwnProperty.call(themeOverrides.value, key)) {
      const value = themeOverrides.value[key as keyof ThemeOverrides]
      if (value !== undefined) {
        const cssVarName = toCssVarName(key)
        result[cssVarName] = value
      }
    }
  }

  return result as CSSProperties
})

function renderColGroup() {
  return h('colgroup', {}, props.table.getVisibleLeafColumns().map((column) => {
    return h('col', {
      width: column.getSize() === 150 ? undefined : column.getSize(),
    })
  }))
}

const rowAttrs = computed(() => (row: Row<TData>, rowIndex: number) => {
  const className = rowClassName.value ? typeof rowClassName.value === 'string' ? rowClassName.value : rowClassName.value(row, rowIndex) : undefined
  return {
    class: className,
    ...(rowProps.value?.(row, rowIndex) ?? {}),
  }
})

/** */
interface ScrollSyncState {
  headerContainer: HTMLElement | null
  bodyContainer: HTMLElement | null
  handleScroll: () => void
}
const stateMap = new WeakMap<HTMLElement, ScrollSyncState>()

const vScrollSync: Directive<HTMLDivElement> = {
  mounted(el, binding) {
    const headerSelector = ':scope > div:first-child'
    const bodySelector = ':scope > div:last-child > div:first-child'

    const headerContainer = el.querySelector(headerSelector) as HTMLElement
    const bodyContainer = el.querySelector(bodySelector) as HTMLElement

    if (!headerContainer || !bodyContainer) {
      console.warn('v-sync-horizontal-scroll: Could not find header or body container')
      return
    }

    const handleScroll = () => {
      if (headerContainer && bodyContainer) {
        requestAnimationFrame(() => {
          headerContainer.scrollLeft = bodyContainer.scrollLeft

          const { scrollLeft, scrollWidth, clientWidth } = bodyContainer
          isAtLeftEdge.value = scrollLeft <= 0
          isAtRightEdge.value = Math.ceil(scrollLeft + clientWidth) >= scrollWidth
        })
      }
    }

    bodyContainer.addEventListener('scroll', handleScroll)
    handleScroll()

    stateMap.set(el, {
      headerContainer,
      bodyContainer,
      handleScroll,
    })
  },

  beforeUnmount(el) {
    const state = stateMap.get(el)
    if (state) {
      state.bodyContainer?.removeEventListener('scroll', state.handleScroll)
      stateMap.delete(el)
    }
  },
}
</script>

<template>
  <template v-if="!isStickyLayout">
    <div
      :class="cn('overflow-hidden rounded-md border', props.class)"
      :style="{
        '--min-width': scrollX && `${scrollX}px`,
        ...props.style,
        ...tableStyles,
      }"
    >
      <Table>
        <component :is="renderColGroup" />
        <TableHeader
          v-for="headerGroup of table.getHeaderGroups()"
          :key="headerGroup.id"
        >
          <TableRow>
            <TableHead
              v-for="header of headerGroup.headers"
              :key="header.id"
              :colspan="header.colSpan"
              :class="cn(
                dataTableVariants({ size: props.size }),
                'bg-[var(--th-color)]')"
              :style="getCommonPinningStyles({
                column: header.column,
                isAtLeftEdge,
                isAtRightEdge,
              })"
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
                v-bind="rowAttrs(row, idx)"
                :data-state="row.getIsSelected() && 'selected'"
                :class="cn('group', 'data-[state=selected]:bg-transparent')"
              >
                <TableCell
                  v-for="cell of row.getVisibleCells()"
                  :key="cell.id"
                  :class="cn(dataTableVariants({ size: props.size }),
                             'group-data-[last-row=false]:border-b',
                             'bg-[var(--td-color)]', 'group-hover:bg-[--td-color-hover]',
                  )"
                  :style="getCommonPinningStyles({
                    column: cell.column,
                    isAtLeftEdge,
                    isAtRightEdge,
                  })"
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
          <template v-else>
            <TableCell :colspan="table.getVisibleLeafColumns().length">
              <div class="py-4">
                <slot name="empty">
                  <div class="flex flex-col items-center justify-center text-center">
                    <svg class="h-28 w-28 text-muted-foreground/30" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M5 4v6.025V10v10zv5zm0 18q-.825 0-1.412-.587T3 20V4q0-.825.588-1.412T5 2h7.175q.4 0 .763.15t.637.425l4.85 4.85q.275.275.425.638t.15.762v.7q0 .425-.288.7T18 10.5t-.712-.288T17 9.5V9h-4q-.425 0-.712-.288T12 8V4H5v16h5.5q.425 0 .713.288T11.5 21t-.288.713T10.5 22zm11.5-3q1.05 0 1.775-.725T19 16.5t-.725-1.775T16.5 14t-1.775.725T14 16.5t.725 1.775T16.5 19m5.8 3.3q-.275.275-.7.275t-.7-.275l-2-2q-.525.35-1.137.525T16.5 21q-1.875 0-3.187-1.312T12 16.5t1.313-3.187T16.5 12t3.188 1.313T21 16.5q0 .65-.175 1.263T20.3 18.9l2 2q.275.275.275.7t-.275.7" /></svg>
                    <p class="text-xl font-medium text-muted-foreground/30 mt-4">
                      No Data Found
                    </p>
                  </div>
                </slot>
              </div>
            </TableCell>
          </template>
        </TableBody>
      </Table>
    </div>
  </template>
  <template v-else>
    <div
      v-scroll-sync
      :class="cn('overflow-hidden rounded-md border', props.class)"
      :style="{
        '--min-width': scrollX && `${scrollX}px`,
        ...omit(props.style || {}, ['height', 'min-height', 'max-height']),
        ...tableStyles,
      }"
    >
      <div class="relative w-full overflow-x-hidden bg-[var(--th-color)]">
        <table
          :class="cn(
            'w-full caption-bottom text-sm',
            'table-fixed',
            'border-spacing-0 border-separate',
            [scrollX && 'min-w-[var(--min-width)]'])"
        >
          <component :is="renderColGroup" />
          <TableHeader
            v-for="headerGroup of table.getHeaderGroups()"
            :key="headerGroup.id"
          >
            <TableRow class="border-b-0">
              <TableHead
                v-for="header of headerGroup.headers"
                :key="header.id"
                :colspan="header.colSpan"
                :class="cn(
                  dataTableVariants({ size: props.size }),
                  'bg-[var(--th-color)] border-b')"
                :style="getCommonPinningStyles({
                  column: header.column,
                  isAtLeftEdge,
                  isAtRightEdge,
                })"
              >
                <FlexRender
                  v-if="!header.isPlaceholder"
                  :render="header.column.columnDef.header"
                  :props="header.getContext()"
                />
              </TableHead>
            </TableRow>
          </TableHeader>
        </table>
      </div>
      <ScrollArea
        :style="{ ...pick(props.style || {}, ['height', 'min-height', 'max-height']) }"
      >
        <template v-if="loading">
          <table
            :class="cn(
              'w-full caption-bottom text-sm',
              'table-fixed',
              [scrollX && 'min-w-[var(--min-width)]'],
            )"
          >
            <component :is="renderColGroup" />
            <TableBody>
              <LoadingRow
                v-for="(_, i) of Array.from({ length: 10 })"
                :key="i"
                :index="i"
                class="hover:bg-transparent"
                :columns="props.table.getAllLeafColumns()"
                :estimate-size="!props.loadingRowEstimateSize ? undefined : (() => props.loadingRowEstimateSize!(i))"
              />
            </TableBody>
          </table>
        </template>
        <template v-else-if="isEmpty">
          <div class="absolute top-1/2 left-1/2 -translate-y-1/2">
            <slot name="empty">
              <div class="flex flex-col items-center justify-center text-center">
                <svg class="h-28 w-28 text-muted-foreground/30" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M5 4v6.025V10v10zv5zm0 18q-.825 0-1.412-.587T3 20V4q0-.825.588-1.412T5 2h7.175q.4 0 .763.15t.637.425l4.85 4.85q.275.275.425.638t.15.762v.7q0 .425-.288.7T18 10.5t-.712-.288T17 9.5V9h-4q-.425 0-.712-.288T12 8V4H5v16h5.5q.425 0 .713.288T11.5 21t-.288.713T10.5 22zm11.5-3q1.05 0 1.775-.725T19 16.5t-.725-1.775T16.5 14t-1.775.725T14 16.5t.725 1.775T16.5 19m5.8 3.3q-.275.275-.7.275t-.7-.275l-2-2q-.525.35-1.137.525T16.5 21q-1.875 0-3.187-1.312T12 16.5t1.313-3.187T16.5 12t3.188 1.313T21 16.5q0 .65-.175 1.263T20.3 18.9l2 2q.275.275.275.7t-.275.7" /></svg>
                <p class="text-xl font-medium text-muted-foreground/30 mt-4">
                  No Data Found
                </p>
              </div>
            </slot>
          </div>
        </template>
        <template v-else>
          <table
            :class="cn(
              'w-full caption-bottom text-sm',
              'table-fixed',
              'border-spacing-0 border-separate',
              [scrollX && 'min-w-[var(--min-width)]'],
            )"
          >
            <component :is="renderColGroup" />
            <TableBody>
              <template v-if="table.getRowModel().rows?.length">
                <template v-for="(row, idx) of table.getRowModel().rows" :key="row.id">
                  <TableRow
                    v-bind="rowAttrs(row, idx)"
                    :class="cn('group', 'data-[state=selected]:bg-transparent border-b-0')"
                    :data-state="row.getIsSelected() && 'selected'"
                    :data-last-row="idx === table.getRowModel().rows.length - 1 ? 'true' : 'false'"
                  >
                    <TableCell
                      v-for="cell of row.getVisibleCells()"
                      :key="cell.id"
                      v-bind="(cell.column.columnDef.meta?.cellProps?.(row, idx) ?? {})"
                      :class="cn(dataTableVariants({ size: props.size }),
                                 'group-data-[last-row=false]:border-b',
                                 'bg-[var(--td-color)]', 'group-hover:bg-[--td-color-hover]',
                      )"
                      :style="getCommonPinningStyles({
                        column: cell.column,
                        isAtLeftEdge,
                        isAtRightEdge,
                      })"
                    >
                      <FlexRender
                        :render="cell.column.columnDef.cell"
                        :props="cell.getContext()"
                      />
                    </TableCell>
                  </TableRow>
                  <TableRow v-if="row.getIsExpanded() && !!renderExpanded">
                    <TableCell :colspan="row.getAllCells().length" :class="cn(dataTableVariants({ size: props.size }))">
                      <component :is="renderExpanded(row, idx)" />
                    </TableCell>
                  </TableRow>
                </template>
              </template>
            </TableBody>
          </table>
        </template>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  </template>
</template>

<style scoped>
[data-orientation="horizontal"] {
  z-index: 10;
  cursor: grab;
  &:active {
    cursor: grabbing;
  }
}

:deep([data-orientation="vertical"]) {
  z-index: 10;
  cursor: grab;
  &:active {
    cursor: grabbing;
  }
}
</style>
