import type { ColumnPinningState, OnChangeFn, TableOptions } from '@tanstack/vue-table'
import type { Ref } from 'vue'
import { ref } from 'vue'
import { useStorage } from './useStorage'

export interface ColumnPinningOptions {
  /**
   * 初始狀態
   */
  columnPinning?: ColumnPinningState
  /**
   * 狀態變更回調
   */
  onPinningChange?: OnChangeFn<ColumnPinningState>
}

export interface UseColumnPinningReturn<TData> {
  columnPinning: Ref<ColumnPinningState>
  onColumnPinningChange: OnChangeFn<ColumnPinningState>
  columnPinningConfig: Pick<TableOptions<TData>, 'enableColumnPinning'>
}

export function useColumnPinning<TData>(
  options: ColumnPinningOptions = {},
): UseColumnPinningReturn<TData> {
  const {
    columnPinning = {},
  } = options

  const _columnPinning: Ref<ColumnPinningState> = ref<ColumnPinningState>(columnPinning)

  return {
    columnPinning: _columnPinning,
    onColumnPinningChange: (updateOrValue) => {
      const newState = typeof updateOrValue === 'function'
        ? updateOrValue(_columnPinning.value)
        : updateOrValue

      _columnPinning.value = newState
      // 觸發回調
      options.onPinningChange?.(newState)
    },
    columnPinningConfig: {
      enableColumnPinning: true,
    },
  }
}

export interface TableColumnPinningWithPersistOptions extends ColumnPinningOptions {
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

export function useColumnPinningWithPersist<TData>(
  options: TableColumnPinningWithPersistOptions = {},
): UseColumnPinningReturn<TData> {
  const {
    columnPinning = {},
    persistKey,
    ssr = false,
    storageType = 'local',
  } = options

  let _columnPinning: Ref<ColumnPinningState>
  let savePinning: () => void = () => {}

  // 如果提供了持久化 key，使用 useStorage
  if (persistKey) {
    const storage = useStorage<ColumnPinningState>(
      persistKey,
      columnPinning,
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

    _columnPinning = storage.data
    savePinning = storage.debouncedSave
  }
  else {
    // 沒有持久化，使用普通 ref
    _columnPinning = ref<ColumnPinningState>(columnPinning)
  }

  return {
    columnPinning: _columnPinning,
    onColumnPinningChange: (updateOrValue) => {
      const newState = typeof updateOrValue === 'function'
        ? updateOrValue(_columnPinning.value)
        : updateOrValue

      _columnPinning.value = newState

      // 保存到儲存
      savePinning()

      // 觸發回調
      options.onPinningChange?.(newState)
    },
    columnPinningConfig: {
      enableColumnPinning: true,
    },
  }
}
