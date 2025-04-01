import type { OnChangeFn, PaginationState, TableOptions } from '@tanstack/vue-table'
import type { MaybeRefOrGetter, Ref } from 'vue'
import { getPaginationRowModel } from '@tanstack/vue-table'
import { useClamp } from '@vueuse/math'
import { computed, reactive, ref, toValue, watch } from 'vue'
import { valueUpdater } from '../lib/utils'

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
  itemCount?: MaybeRefOrGetter<number>
  /**
   * 分頁變更回調
   */
  onPageChange?: (page: number) => void | Promise<void>
  /**
   * 每頁條數變更回調
   */
  onPageSizeChange?: (pageSize: number) => void | Promise<void>
}

/**
 * page: 當前頁碼 由 1 開始
 */
export interface PaginationInfo {
  currentPage: number
  currentPageSize: number
  pageCount: number
  itemCount: number
  isFirstPage: boolean
  isLastPage: boolean
}

export interface UseTablePaginationReturn<TData> {
  pagination: Ref<PaginationState>
  paginationInfo: PaginationInfo
  paginationConfig: Pick<TableOptions<TData>, 'manualPagination' |
  'pageCount' |
  'rowCount' |
  'getPaginationRowModel' |
  'autoResetPageIndex'>
  onPaginationChange: OnChangeFn<PaginationState>
}

export function useTablePagination<TData>(options: TablePaginationOptions = {}): UseTablePaginationReturn<TData> {
  // 分頁狀態
  const pagination = ref<PaginationState>({
    pageIndex: options.initialPagination?.pageIndex ?? 0,
    pageSize: options.initialPagination?.pageSize ?? 10,
  })

  // 計算總頁數
  const itemCount = computed(() => toValue(options.itemCount) ?? 0)
  const pageCount = computed(() => Math.max(
    1,
    Math.ceil((toValue(itemCount)) / toValue(pagination).pageSize),
  ))

  const isFirstPage = computed(() => pagination.value.pageIndex === 0)
  const isLastPage = computed(() => pagination.value.pageIndex + 1 === pageCount.value)

  const paginationInfo: PaginationInfo = reactive({
    currentPage: useClamp(computed(() => pagination.value.pageIndex + 1), 1, pageCount),
    currentPageSize: useClamp(computed(() => pagination.value.pageSize), 1, Number.POSITIVE_INFINITY),
    pageCount,
    itemCount,
    isFirstPage,
    isLastPage,
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

    watch(() => paginationInfo.currentPage, (newPage) => {
      pagination.value.pageIndex = newPage - 1
    })

    // 監聽每頁條數變更
    watch(
      () => pagination.value.pageSize,
      (newPageSize) => {
        options.onPageSizeChange?.(newPageSize)
      },
    )
  }

  return {
    // 分頁狀態
    pagination,
    // 分頁信息
    paginationInfo,
    // 表格配置
    paginationConfig: {
      manualPagination: options.remote,
      rowCount: itemCount.value,
      getPaginationRowModel: options.remote ? undefined : getPaginationRowModel(),
      autoResetPageIndex: false,
    },
    onPaginationChange: (updater) => {
      valueUpdater(updater, pagination)
    },
  }
}
