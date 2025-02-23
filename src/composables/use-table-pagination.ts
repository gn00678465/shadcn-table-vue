import type { OnChangeFn, PaginationState, TableOptions } from '@tanstack/vue-table'
import type { ComputedRef, Ref } from 'vue'
import { computed, ref, watch } from 'vue'

export interface TablePaginationOptions {
  /**
   * 初始分頁狀態
   */
  initialPagination?: {
    pageIndex: number
    pageSize: number
  }
  /**
   * 是否為遠程數據模式
   */
  remote?: boolean
  /**
   * 遠程數據總數
   */
  totalRows?: number
  /**
   * 分頁變更回調
   */
  onPageChange?: (page: number) => void | Promise<void>
  /**
   * 每頁條數變更回調
   */
  onPageSizeChange?: (pageSize: number) => void | Promise<void>
}

export interface PaginationInfo {
  pageIndex: number
  pageSize: number
  pageCount: number
  totalRows: number
}

export interface UseTablePaginationReturn<TData> {
  pagination: Ref<PaginationState>
  paginationInfo: ComputedRef<PaginationInfo>
  paginationConfig: Pick<TableOptions<TData>, 'manualPagination' | 'pageCount'>
  onPaginationChange: OnChangeFn<PaginationState>
}

export function useTablePagination<TData>(options: TablePaginationOptions = {}): UseTablePaginationReturn<TData> {
  // 分頁狀態
  const pagination = ref<PaginationState>({
    pageIndex: options.initialPagination?.pageIndex ?? 0,
    pageSize: options.initialPagination?.pageSize ?? 10,
  })

  // 監聽分頁變更
  if (options.remote) {
    // 監聽頁碼變更
    watch(
      () => pagination.value.pageIndex,
      (newPage) => {
        options.onPageChange?.(newPage)
      },
    )

    // 監聽每頁條數變更
    watch(
      () => pagination.value.pageSize,
      (newPageSize) => {
        options.onPageSizeChange?.(newPageSize)
      },
    )
  }

  // 計算總頁數
  const totalRows = computed(() => options.totalRows ?? 0)
  const pageCount = computed(() => {
    return Math.ceil(totalRows.value / pagination.value.pageSize)
  })

  return {
    // 分頁狀態
    pagination,
    // 分頁信息
    paginationInfo: computed(() => ({
      pageIndex: pagination.value.pageIndex,
      pageSize: pagination.value.pageSize,
      pageCount: pageCount.value,
      totalRows: totalRows.value,
    })) as ComputedRef<PaginationInfo>,
    // 表格配置
    paginationConfig: {
      manualPagination: options.remote,
      pageCount: pageCount.value,
    },
    onPaginationChange: (updater) => {
      if (typeof updater === 'function') {
        pagination.value = updater(pagination.value)
      }
      else {
        pagination.value = updater
      }
    },
  }
}
