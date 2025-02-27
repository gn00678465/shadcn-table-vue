<script setup lang="tsx" generic="TData">
import type { Row, Table as TanstackTable } from '@tanstack/vue-table'
import type { CSSProperties, Directive, HTMLAttributes, VNodeChild } from 'vue'
import type { DataTableVariants } from '.'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { getCommonPinningStyles } from '@/utils/data-table'
import { FlexRender } from '@tanstack/vue-table'
import { computed, toRefs } from 'vue'
import { dataTableVariants } from '.'

defineOptions({
  name: 'DataTable',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<DataTableProps<TData>>(), {
  class: '',
  flexHeight: false,
  size: 'default',
})

const emits = defineEmits<{
  scroll: [e: Event]
}>()

const { renderExpanded, flexHeight } = toRefs(props)

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

/** */
interface ScrollSyncState {
  headerContainer: HTMLElement | null
  bodyContainer: HTMLElement | null
  handleScroll: () => void
  updateScrollbarGutter: () => void
  resizeObserver: ResizeObserver
  handleResize: () => void
}
const stateMap = new WeakMap<HTMLElement, ScrollSyncState>()

const vScrollSync: Directive<HTMLDivElement> = {
  mounted(el, binding) {
    // 設置選擇器，默認選擇第一個和第二個直接子元素
    const headerSelector = ':scope > div:first-child'
    const bodySelector = ':scope > div:last-child'

    // 獲取容器元素
    const headerContainer = el.querySelector(headerSelector) as HTMLElement
    const bodyContainer = el.querySelector(bodySelector) as HTMLElement

    if (!headerContainer || !bodyContainer) {
      console.warn('v-sync-horizontal-scroll: Could not find header or body container')
      return
    }

    const updateScrollbarGutter = () => {
      const hasScrollbar = bodyContainer.scrollHeight > bodyContainer.clientHeight
      headerContainer.style.scrollbarGutter = hasScrollbar ? 'stable' : ''
    }

    // 立即執行一次更新
    updateScrollbarGutter()

    // 使用 ResizeObserver 監聽表體容器大小變化
    const resizeObserver = new ResizeObserver(() => {
      updateScrollbarGutter()
    })

    // 獲取表體容器並開始觀察
    const bodyTable = el.querySelectorAll('table')[1]
    if (bodyTable && bodyTable.parentElement) {
      resizeObserver.observe(bodyTable.parentElement)
    }

    // 同時監聽窗口大小變化
    const handleResize = () => updateScrollbarGutter()
    window.addEventListener('resize', handleResize)

    // 滾動處理函數
    const handleScroll = () => {
      if (headerContainer && bodyContainer) {
        // 將表體的水平滾動位置同步到表頭
        headerContainer.scrollLeft = bodyContainer.scrollLeft
      }
    }

    // 添加滾動事件監聽
    bodyContainer.addEventListener('scroll', handleScroll)

    // 存儲狀態到 WeakMap
    stateMap.set(el, {
      headerContainer,
      bodyContainer,
      updateScrollbarGutter,
      resizeObserver,
      handleResize,
      handleScroll,
    })
  },
  updated(el) {
    // 觸發更新
    const state = stateMap.get(el)
    if (state) {
      state.updateScrollbarGutter()
    }
  },
  beforeUnmount(el) {
    // 清理工作
    const state = stateMap.get(el)
    if (state) {
      state.resizeObserver.disconnect()
      state.bodyContainer?.removeEventListener('scroll', state.handleScroll)
      window.removeEventListener('resize', state.handleResize)
      stateMap.delete(el)
    }
  },
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
  style?: CSSProperties
  /** */
  renderExpanded?: (row: Row<TData>, rowIndex: number) => VNodeChild
  flexHeight?: boolean
  size?: DataTableVariants['size']
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
              <TableRow :data-state="row.getIsSelected() && 'selected'">
                <TableCell
                  v-for="cell of row.getVisibleCells()"
                  :key="cell.id"
                  :style="{
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
    </div>
  </template>
  <template v-else>
    <div
      v-scroll-sync
      class="overflow-hidden rounded-md border"
    >
      <div class="relative w-full overflow-x-hidden">
        <table :class="cn('w-full caption-bottom text-sm table-fixed')">
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
                :class="cn(dataTableVariants({ size: props.size }))"
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
        </table>
      </div>
      <Table
        :class="cn('table-fixed')"
        :style="{
          ...props.style,
        }"
        @scroll="(e: Event) => emits('scroll', e)"
      >
        <component :is="renderColGroup" />
        <TableBody>
          <template v-if="table.getRowModel().rows?.length">
            <template v-for="(row, idx) of table.getRowModel().rows" :key="row.id">
              <TableRow :data-state="row.getIsSelected() && 'selected'">
                <TableCell
                  v-for="cell of row.getVisibleCells()"
                  v-bind="{
                    ...(cell.column.columnDef.meta?.cellProps?.(row, idx) ?? {}),
                  }"
                  :key="cell.id"
                  :class="cn(dataTableVariants({ size: props.size }))"
                  :style="{
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
                <TableCell :colspan="row.getAllCells().length" :class="cn(dataTableVariants({ size: props.size }))">
                  <component :is="renderExpanded(row, idx)" />
                </TableCell>
              </TableRow>
            </template>
          </template>
        </TableBody>
      </Table>
    </div>
  </template>
</template>

<style scoped></style>
