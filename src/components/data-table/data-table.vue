<script setup lang="ts" generic="TData">
import type { PinningStyleOptions } from '@/utils/data-table'
import type { Row, Table as TanstackTable } from '@tanstack/vue-table'
import type { CSSProperties, Directive, HTMLAttributes, VNodeChild } from 'vue'
import type { DataTableVariants } from '.'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { FlexRender } from '@tanstack/vue-table'
import { computed, h, toRefs } from 'vue'
import { dataTableVariants } from '.'
import { getCommonPinningStyles } from '../../utils/data-table'
import { toCssVarName } from '../../utils/themes'
import { omit, pick } from '../../utils/utils'
import { LoadingRow } from './loading-row'

defineOptions({
  name: 'DataTable',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<DataTableProps<TData>>(), {
  class: '',
  flexHeight: false,
  size: 'default',
  scrollX: undefined,
  rowClassName: undefined,
  rowProps: undefined,
  pinningOptions: undefined,
  themeOverrides: () => ({
    thColor: 'rgba(250, 250, 252, 1)',
    thColorHover: 'rgba(243, 243, 247, 1)',
    tdColor: '#fff',
    tdColorHover: 'rgba(247, 247, 250, 1)',
  }),
  loading: false,
})

defineSlots<{
  empty: () => any
}>()

const { renderExpanded, flexHeight, scrollX, rowClassName, rowProps, pinningOptions, themeOverrides, loading } = toRefs(props)

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
        // 使用 requestAnimationFrame 確保在最佳渲染時機更新
        requestAnimationFrame(() => {
          headerContainer.scrollLeft = bodyContainer.scrollLeft
        })
      }
    }

    // 添加滾動事件監聽
    bodyContainer.addEventListener('scroll', handleScroll)

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

<script lang="ts">
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
  // pinning 樣式配置
  pinningOptions?: PinningStyleOptions
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
}
</script>

<template>
  <template v-if="!isStickyLayout">
    <div class="overflow-hidden rounded-md border">
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
              :col-span="header.colSpan"
              :style="getCommonPinningStyles({ column: header.column, options: pinningOptions })"
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
                  :style="{
                    ...getCommonPinningStyles({
                      column: cell.column,
                      options: pinningOptions,
                    }),
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
    </div>
  </template>
  <template v-else>
    <div
      v-scroll-sync
      class="overflow-hidden rounded-md border"
      :style="{
        '--min-width': scrollX && `${scrollX}px`,
        ...omit(props.style || {}, ['height', 'min-height', 'max-height']),
        ...tableStyles,
      }"
    >
      <div class="relative w-full overflow-x-hidden bg-[var(--th-color)]">
        <table :class="cn('w-full caption-bottom text-sm table-fixed', [scrollX && 'min-w-[var(--min-width)]'])">
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
                :class="cn(dataTableVariants({ size: props.size }), 'bg-[var(--th-color)]')"
                :style="getCommonPinningStyles({ column: header.column, options: pinningOptions })"
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
                class="hover:bg-transparent"
                :columns="props.table.getAllLeafColumns()"
                :size="props.size"
                :pinning-options="pinningOptions"
              />
            </TableBody>
          </table>
        </template>
        <template v-else-if="isEmpty">
          <div class="w-full h-full relative">
            <slot name="empty" />
          </div>
        </template>
        <template v-else>
          <table
            :class="cn(
              'w-full caption-bottom text-sm',
              'table-fixed',
              [scrollX && 'min-w-[var(--min-width)]'],
            )"
          >
            <component :is="renderColGroup" />
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
                      v-bind="(cell.column.columnDef.meta?.cellProps?.(row, idx) ?? {})"
                      :class="cn(dataTableVariants({ size: props.size }), 'bg-[var(--td-color)]', 'group-hover:bg-[--td-color-hover]')"
                      :style="getCommonPinningStyles({ column: cell.column, options: pinningOptions })"
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

/* 增加防抖動模式樣式 */
:deep(th[style*="position: sticky"]),
:deep(td[style*="position: sticky"]) {
  /* 防止抖動 */
  transform: translateZ(0);
  will-change: transform; 
  backface-visibility: hidden;
  /* 防止邊界模糊 */
  image-rendering: crisp-edges;
  /* 確保流暢滾動 */
  transition: none;
}

/* 優化滾動性能 */
:deep(.relative.w-full.overflow-x-hidden) {
  transform: translateZ(0);
  will-change: transform;
  backface-visibility: hidden;
}
</style>
