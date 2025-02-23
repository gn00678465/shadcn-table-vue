import type { ColumnDef, Row, Table } from '@tanstack/vue-table'
import type { ComputedRef, Ref } from 'vue'
import type { PaginationInfo, TablePaginationOptions } from './use-table-pagination'
import type { TableRowSelectionOptions } from './use-table-row-selection'
import { getCoreRowModel, getPaginationRowModel, useVueTable } from '@tanstack/vue-table'
import { useTablePagination } from './use-table-pagination'
import { useTableRowSelection } from './use-table-row-selection'

export { type PaginationInfo }

export interface DataTableOptions<TData> extends
  TablePaginationOptions,
  TableRowSelectionOptions<TData> {
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
}

export interface DataTableReturn<TData> {
  table: Table<TData>
  pagination: ComputedRef<PaginationInfo>
}

export function useDataTable<TData>(options: DataTableOptions<TData>): DataTableReturn<TData> {
  // 分頁邏輯
  const { pagination, paginationConfig, paginationInfo, onPaginationChange } = useTablePagination<TData>({
    remote: options.remote,
    totalRows: options.totalRows,
    initialPagination: options.initialPagination,
    onPageChange: options.onPageChange,
    onPageSizeChange: options.onPageSizeChange,
  })

  // row selection
  const { rowSelection, onRowSelectionChange, rowSelectionConfig } = useTableRowSelection<TData>({
    multi: options.multi,
    initialRowSelection: options.initialRowSelection,
    onSelectionUpdate: options.onSelectionUpdate,
    enableRowSelection: true,
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
    },
    columns: options.columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: options.remote ? undefined : getPaginationRowModel(),
    // pagination
    ...paginationConfig,
    onPaginationChange,
    // row selection
    ...rowSelectionConfig,
    onRowSelectionChange,
  })

  return {
    table,
    pagination: paginationInfo,
  }
}
