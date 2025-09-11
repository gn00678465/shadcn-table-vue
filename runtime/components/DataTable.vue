<script lang="ts">
import type { Row, Table as TanstackTable } from '@tanstack/vue-table'
import type { VariantProps } from 'class-variance-authority'
import type { CSSProperties, Directive, HTMLAttributes, VNodeChild } from 'vue'
import { FlexRender } from '@tanstack/vue-table'
import { cva } from 'class-variance-authority'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { getCommonPinningStyles } from '../utils/data-table'
import { toCssVarName } from '../utils/themes'
import { omit, pick } from '../utils/utils'
import Empty from './Empty.vue'
import Loading from './Loading.vue'

export const dataTableVariants = cva('', {
  variants: {
    size: {
      default: ['p-4'],
      sm: ['px-4', 'py-3.5'],
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
}

export interface ThemeOverrides {
  tdColor?: string
  tdColorHover?: string
  thColor?: string
  thColorHover?: string
  loadingColor?: string
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
  // 獲取正確的列順序：左固定列 + 中間列 + 右固定列
  const leftColumns = props.table.getLeftVisibleLeafColumns()
  const centerColumns = props.table.getCenterVisibleLeafColumns()
  const rightColumns = props.table.getRightVisibleLeafColumns()
  const orderedColumns = [...leftColumns, ...centerColumns, ...rightColumns]

  return h('colgroup', {}, orderedColumns.map((column) => {
    const isPinned = column.getIsPinned()
    const columnSize = column.getSize()

    // 對於 pinned 列，總是設定明確的寬度（即使是預設值 150）
    // 對於非 pinned 列，如果是預設值 150 則不設定 width 屬性
    const width = isPinned ? columnSize : (columnSize === 150 ? undefined : columnSize)

    return h('col', {
      width,
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
    // 設置選擇器，默認選擇第一個和第二個直接子元素
    const headerSelector = ':scope > div:first-child'
    const bodySelector = ':scope > div:last-child > div:first-child'

    // 獲取容器元素
    const headerContainer = el.querySelector(headerSelector) as HTMLElement
    const bodyContainer = el.querySelector(bodySelector) as HTMLElement

    if (!headerContainer || !bodyContainer) {
      console.warn('v-sync-horizontal-scroll: Could not find header or body container')
      return
    }

    // 滾動處理函數
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

    // 添加滾動事件監聽
    bodyContainer.addEventListener('scroll', handleScroll)
    handleScroll()

    // 存儲狀態到 WeakMap
    stateMap.set(el, {
      headerContainer,
      bodyContainer,
      handleScroll,
    })
  },

  beforeUnmount(el) {
    // 清理工作
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
      <Table
        :class="cn(
          'table-fixed',
          [scrollX && 'min-w-[var(--min-width)]'])"
      >
        <component :is="renderColGroup" />
        <TableHeader
          v-for="headerGroup of table.getHeaderGroups()"
          :key="headerGroup.id"
        >
          <TableRow data-slot="table-row">
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
          <Loading
            :colspan="table.getVisibleLeafColumns().length"
            :loading="loading"
            :loading-color="themeOverrides.loadingColor"
          />
        </TableHeader>
        <TableBody class="relative">
          <template v-if="isEmpty">
            <Empty :colspan="table.getVisibleLeafColumns().length">
              <template #default>
                <slot name="empty" />
              </template>
            </Empty>
          </template>
          <template v-else>
            <template
              v-for="(row, idx) of table.getRowModel().rows"
              :key="row.id"
            >
              <TableRow
                v-bind="rowAttrs(row, idx)"
                :data-state="row.getIsSelected() && 'selected'"
                :class="cn('group', 'data-[state=selected]:bg-transparent')"
                :data-row-index="idx"
                data-slot="table-row"
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
              <tr
                v-if="row.getIsExpanded() && !!renderExpanded"
                :data-row-index="idx"
                data-slot="table-row"
              >
                <td :colspan="row.getAllCells().length">
                  <component :is="renderExpanded(row, idx)" />
                </td>
              </tr>
            </template>
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
            <TableRow
              class="border-b-0"
              data-slot="table-row"
            >
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
            <Loading
              :colspan="table.getVisibleLeafColumns().length"
              :loading="loading"
              :loading-color="themeOverrides.loadingColor"
            />
          </TableHeader>
        </table>
      </div>
      <ScrollArea
        :style="{ ...pick(props.style || {}, ['height', 'min-height', 'max-height']) }"
      >
        <template v-if="isEmpty">
          <table
            :class="cn(
              'w-full caption-bottom text-sm',
              'table-fixed',
              [scrollX && 'min-w-[var(--min-width)]'],
            )"
          >
            <component :is="renderColGroup" />
            <TableBody>
              <Empty :colspan="table.getVisibleLeafColumns().length">
                <template #default>
                  <slot name="empty" />
                </template>
              </Empty>
            </TableBody>
          </table>
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
                <template
                  v-for="(row, idx) of table.getRowModel().rows"
                  :key="row.id"
                >
                  <TableRow
                    v-bind="rowAttrs(row, idx)"
                    :class="cn('group', 'data-[state=selected]:bg-transparent border-b-0')"
                    :data-state="row.getIsSelected() && 'selected'"
                    :data-last-row="idx === table.getRowModel().rows.length - 1 ? 'true' : 'false'"
                    :data-row-index="idx"
                    data-slot="table-row"
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
                  <tr
                    v-if="row.getIsExpanded() && !!renderExpanded"
                    :data-row-index="idx"
                    data-slot="table-row"
                  >
                    <td
                      :colspan="row.getAllCells().length"
                      :class="cn(dataTableVariants({ size: props.size }))"
                    >
                      <component :is="renderExpanded(row, idx)" />
                    </td>
                  </tr>
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
