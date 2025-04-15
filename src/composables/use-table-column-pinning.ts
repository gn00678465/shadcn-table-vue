import type { ColumnPinningState, OnChangeFn, TableOptions } from '@tanstack/vue-table'
import type { Ref } from 'vue'
import { ref } from 'vue'
import { useStorage } from './use-storage'

export interface TableColumnPinningOptions {
  /**
   * 初始狀態
   */
  initialPinning?: ColumnPinningState
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

export interface UseTableColumnPinningReturn<TData> {
  columnPinning: Ref<ColumnPinningState>
  onColumnPinningChange: OnChangeFn<ColumnPinningState>
  columnPinningConfig: Pick<TableOptions<TData>, 'enableColumnPinning'>
}

export function useTableColumnPinning<TData>(
  options: TableColumnPinningOptions = {},
): UseTableColumnPinningReturn<TData> {
  const {
    initialPinning = {},
    persistKey,
    ssr = false,
    storageType = 'local',
  } = options

  let columnPinning: Ref<ColumnPinningState>
  let savePinning: () => void = () => {}

  // 如果提供了持久化 key，使用 useStorage
  if (persistKey) {
    const storage = useStorage<ColumnPinningState>(
      persistKey,
      initialPinning,
      {
        type: storageType,
        ssr,
        prefix: 'table-',
        suffix: '-pinning',
        onError: (error) => {
          console.warn('Failed to persist column pinning:', error)
        },
        useDebounce: true,
        debounceDelay: 500,
      },
    )

    columnPinning = storage.data
    savePinning = storage.debouncedSave
  }
  else {
    // 沒有持久化，使用普通 ref
    columnPinning = ref<ColumnPinningState>(initialPinning)
  }

  return {
    columnPinning,
    onColumnPinningChange: (updateOrValue) => {
      const newState = typeof updateOrValue === 'function'
        ? updateOrValue(columnPinning.value)
        : updateOrValue

      columnPinning.value = newState

      // 保存到儲存
      savePinning()
    },
    columnPinningConfig: {
      enableColumnPinning: true,
    },
  }
}
