import type { ColumnDef, Row, Table } from '@tanstack/vue-table'
import type { ComputedRef, Ref } from 'vue'
import type { TableColumnPinningOptions } from './use-table-column-pinning'
import type { TableColumnVisibilityOptions } from './use-table-column-visibility'
import type { TableExpandingOptions } from './use-table-expanding'
import type { PaginationInfo, TablePaginationOptions } from './use-table-pagination'
import type { TableRowSelectionOptions } from './use-table-row-selection'
import { getCoreRowModel, useVueTable } from '@tanstack/vue-table'
import { useTableColumnPinning } from './use-table-column-pinning'
import { useTableColumnVisibility } from './use-table-column-visibility'
import { useTableExpanding } from './use-table-expanding'
import { useTablePagination } from './use-table-pagination'
import { useTableRowSelection } from './use-table-row-selection'

export { type PaginationInfo }

export interface PersistOptions {
  /**
   * 持久化 key
   */
  persistKey?: string
  /**
   * 是否在 SSR 環境
   */
  ssr?: boolean
  /**
   * 儲存類型
   */
  storageType?: 'local' | 'session' | 'cookie'
}

export interface DataTableOptions<TData> extends
  TablePaginationOptions,
  TableRowSelectionOptions<TData>,
  Omit<TableColumnVisibilityOptions, 'persistKey' | 'ssr' | 'storageType'>,
  Omit<TableColumnPinningOptions, 'persistKey' | 'ssr' | 'storageType'>,
  TableExpandingOptions<TData> {
  /**
   * 表格列定義
   */
  columns: ColumnDef<TData>[]
  /**
   * 數據源
   * @type {Ref<TData[]>} Vue 的響應式數據
   */
  data: Ref<TData[]>
  /**
   *
   * @type {(originalRow: TData, index: number, parent?: Row<TData> | undefined) => string}
   */
  rowKey?: (originalRow: TData, index: number, parent?: Row<TData> | undefined) => string
  /**
   * 持久化設定
   */
  persistOptions?: PersistOptions
}

export interface DataTableReturn<TData> {
  table: Table<TData>
  pagination: ComputedRef<PaginationInfo>
}

export function useDataTable<TData>(options: DataTableOptions<TData>): DataTableReturn<TData> {
  // 提取持久化配置
  const persistOptions = options.persistOptions || {}
  const persistKey = persistOptions.persistKey || '' // 向下兼容
  const ssr = persistOptions.ssr || false
  const storageType = persistOptions.storageType || 'local'

  // 分頁邏輯
  const { pagination, paginationConfig, paginationInfo, onPaginationChange } = useTablePagination<TData>({
    remote: options.remote,
    itemCount: options.itemCount,
    initialPagination: options.initialPagination,
    onPageChange: options.onPageChange,
    onPageSizeChange: options.onPageSizeChange,
  })

  // row selection
  const { rowSelection, onRowSelectionChange, rowSelectionConfig } = useTableRowSelection<TData>({
    multi: options.multi,
    initialRowSelection: options.initialRowSelection,
    onUpdateCheckedRowKeys: options.onUpdateCheckedRowKeys,
    enableRowSelection: true,
    dataRef: options.data,
    rowKey: options.rowKey,
  })

  // 列可見性邏輯
  const { columnVisibility, onColumnVisibilityChange } = useTableColumnVisibility({
    initialVisibility: options.initialVisibility,
    onVisibilityChange: options.onVisibilityChange,
    persistKey,
    ssr,
    storageType,
  })

  // column pinning
  const { columnPinning, onColumnPinningChange, columnPinningConfig } = useTableColumnPinning({
    initialPinning: options.initialPinning,
    persistKey,
    ssr,
    storageType,
  })

  // expanding
  const { onExpandedChange, expanded, expandedConfig } = useTableExpanding({
    initialExpanded: options.initialExpanded,
    enableExpanding: options.enableExpanding,
    onUpdateExpandedKeys: options.onUpdateExpandedKeys,
  })

  // 創建表格實例
  const table = useVueTable({
    get data() {
      return options.data.value
    },
    getRowId: options.rowKey,
    // state
    state: {
      get pagination() {
        return pagination.value
      },
      get rowSelection() {
        return rowSelection.value
      },
      get columnVisibility() {
        return columnVisibility.value
      },
      get columnPinning() {
        return columnPinning.value
      },
      get expanded() {
        return expanded.value
      },
    },
    columns: options.columns,
    getCoreRowModel: getCoreRowModel(),
    debugTable: import.meta.env.DEV,
    debugHeaders: import.meta.env.DEV,
    debugColumns: import.meta.env.DEV,
    // pagination
    ...paginationConfig,
    onPaginationChange,
    // row selection
    ...rowSelectionConfig,
    onRowSelectionChange,
    // column visibility
    onColumnVisibilityChange,
    // column pinning
    ...columnPinningConfig,
    onColumnPinningChange,
    // expanded
    ...expandedConfig,
    onExpandedChange,
  })

  return {
    table,
    pagination: paginationInfo,
  }
}
