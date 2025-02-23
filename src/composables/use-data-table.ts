import type { ColumnDef, Table } from '@tanstack/vue-table'
import { getCoreRowModel, getPaginationRowModel, useVueTable } from '@tanstack/vue-table'
import type { ComputedRef, Ref } from 'vue'
import { useTablePagination, type TablePaginationOptions, type PaginationInfo } from './use-table-pagination'

export { type PaginationInfo }

export interface DataTableOptions<TData> extends TablePaginationOptions {
  /**
   * 表格列定義
   */
  columns: ColumnDef<TData>[]
  /**
   * 數據源
   * @type Ref<TData[]> Vue 的響應式數據
   */
  data: Ref<TData[]>
}

export interface DataTableReturn<TData> {
  table: Table<TData>
  pagination: ComputedRef<PaginationInfo>
}

export function useDataTable<TData>(options: DataTableOptions<TData>): DataTableReturn<TData> {
  // 分頁邏輯
  const { paginationConfig, paginationInfo } = useTablePagination({
    remote: options.remote,
    totalRows: options.totalRows,
    initialPagination: options.initialPagination,
    onPageChange: options.onPageChange,
    onPageSizeChange: options.onPageSizeChange,
  })

  // 創建表格實例
  const table = useVueTable({
    get data() {
      return options.data.value
    },
    columns: options.columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: options.remote ? undefined : getPaginationRowModel(),
    ...paginationConfig,
  })

  return {
    table,
    pagination: paginationInfo,
  }
}
