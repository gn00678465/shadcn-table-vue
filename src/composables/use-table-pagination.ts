import type { PaginationState } from '@tanstack/vue-table'
import { computed, ref, watch, type ComputedRef } from 'vue'

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

export function useTablePagination(options: TablePaginationOptions = {}) {
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
      }
    )

    // 監聽每頁條數變更
    watch(
      () => pagination.value.pageSize,
      (newPageSize) => {
        options.onPageSizeChange?.(newPageSize)
      }
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
      state: {
        get pagination() {
          return pagination.value
        },
      },
      onPaginationChange: (updater: any) => {
        if (typeof updater === 'function') {
          pagination.value = updater(pagination.value)
        } else {
          pagination.value = updater
        }
      },
      manualPagination: options.remote,
      pageCount: pageCount.value,
    },
  }
}