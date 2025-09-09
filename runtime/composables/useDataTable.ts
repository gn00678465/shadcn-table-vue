import type { ColumnDef, Row, Table } from '@tanstack/vue-table'
import type { Ref } from 'vue'
import type { ColumnPinningOptions } from './useColumnPinning'
import type { ColumnVisibilityOptions } from './useColumnVisibility'
import type { Options as ExpandingOptions } from './useExpanding'
import type { PaginationInfo, Options as PaginationOptions } from './usePagination'
import type { Options as RowSelectionOptions } from './useRowSelection'
import type { Options as SortingOptions } from './useSotring'
import { getCoreRowModel, useVueTable } from '@tanstack/vue-table'
import { useColumnPinning, useColumnPinningWithPersist } from './useColumnPinning'
import { useColumnVisibility, useColumnVisibilityWithPersist } from './useColumnVisibility'
import { useExpanding } from './useExpanding'
import { usePagination } from './usePagination'
import { useRowSelection } from './useRowSelection'
import { useSorting } from './useSotring'

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
  PaginationOptions,
  RowSelectionOptions<TData>,
  ExpandingOptions<TData>,
  ColumnVisibilityOptions,
  ColumnPinningOptions,
  SortingOptions<TData> {
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
  // debug
  debug?: boolean | Partial<Record<'table' | 'headers' | 'columns', boolean>>
}

export interface DataTableReturn<TData> {
  table: Table<TData>
  pagination: PaginationInfo
}

export function useDataTable<TData>(options: DataTableOptions<TData>): DataTableReturn<TData> {
  const { paginationOptions, rowSelectionOptions, expandedOptions, sortingOptions } = options

  // 提取持久化配置
  const persistOptions = options.persistOptions || {}
  const persistKey = persistOptions.persistKey || '' // 向下兼容
  const ssr = persistOptions.ssr || false
  const storageType = persistOptions.storageType || 'local'

  // 分頁邏輯
  const { pagination, paginationConfig, paginationInfo, onPaginationChange } = usePagination<TData>({
    pagination: options.pagination,
    paginationOptions,
    onPageChange: options?.onPageChange,
    onPageSizeChange: options?.onPageSizeChange,
  })

  // row selection
  const { rowSelection, onRowSelectionChange, rowSelectionConfig } = useRowSelection<TData>({
    rowSelection: options.rowSelection,
    rowSelectionOptions: rowSelectionOptions,
    onUpdateCheckedRowKeys: options?.onUpdateCheckedRowKeys,
  })

  // expanding
  const { onExpandedChange, expanded, expandedConfig } = useExpanding({
    expanded: options.expanded,
    expandedOptions: expandedOptions,
    onUpdateExpandedKeys: options?.onUpdateExpandedKeys,
  })

  // 列可見性邏輯
  const { columnVisibility, onColumnVisibilityChange } = !options.persistOptions
    ? useColumnVisibility({
        columnVisibility: options.columnVisibility,
        onVisibilityChange: options?.onVisibilityChange,
      })
    : useColumnVisibilityWithPersist({
        columnVisibility: options.columnVisibility,
        onVisibilityChange: options?.onVisibilityChange,
        persistKey,
        ssr,
        storageType,
      })

  // column pinning
  const { columnPinning, onColumnPinningChange, columnPinningConfig } = !options.persistOptions
    ? useColumnPinning({
        columnPinning: options.columnPinning,
        onPinningChange: options?.onPinningChange,
      })
    : useColumnPinningWithPersist({
        columnPinning: options.columnPinning,
        onPinningChange: options?.onPinningChange,
        persistKey,
        ssr,
        storageType,
      })

  // sorting
  const { sortingState, sortingConfig, onSortingChange } = useSorting<TData>({
    sorting: options.sorting,
    sortingOptions: sortingOptions,
    onSortingChange: options?.onSortingChange,
  })

  // 創建表格實例
  const table = useVueTable<TData>({
    get data() {
      return options.data.value
    },
    getRowId: options.rowKey,
    initialState: {
      columnVisibility: options.columnVisibility,
      sorting: options.sorting,
    },
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
      get sorting() {
        return sortingState.value
      },
    },
    columns: options.columns,
    getCoreRowModel: getCoreRowModel(),
    debugTable: getDebugFlag('table'),
    debugHeaders: getDebugFlag('headers'),
    debugColumns: getDebugFlag('columns'),
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
    // sorting
    ...sortingConfig,
    onSortingChange,
  })

  function getDebugFlag(flag: 'table' | 'headers' | 'columns'): boolean {
    if (typeof options.debug === 'boolean') {
      return options.debug
    }
    if (typeof options.debug === 'object' && options.debug !== null) {
      return options.debug[flag] || false
    }
    return false
  }

  return {
    table,
    pagination: paginationInfo,
  }
}
