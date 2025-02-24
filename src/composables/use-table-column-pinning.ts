import type { ColumnPinningState, OnChangeFn, TableOptions } from '@tanstack/vue-table'
import type { Ref } from 'vue'
import { ref } from 'vue'

export interface TableColumnPinningOptions {
  /**
   * 初始狀態
   */
  initialPinning?: ColumnPinningState
  /**
   * 持久化 key
   */
  persistKey?: string
}

export interface UseTableRowSelectionReturn<TData> {
  columnPinning: Ref<ColumnPinningState>
  onColumnPinningChange: OnChangeFn<ColumnPinningState>
  columnPinningConfig: Pick<TableOptions<TData>, 'enableColumnPinning'>
}

export function useTableColumnPinning<TData>(options: TableColumnPinningOptions = {}): UseTableRowSelectionReturn<TData> {
  // 從本地存儲加載狀態
  const loadPersistedState = (): ColumnPinningState => {
    if (!options.persistKey)
      return {}
    try {
      const stored = localStorage.getItem(`table-pinning-${options.persistKey}`)
      return stored ? JSON.parse(stored) : {}
    }
    catch {
      return {}
    }
  }

  // 保存狀態到本地存儲
  const persistState = (state: ColumnPinningState): void => {
    if (!options.persistKey)
      return
    try {
      localStorage.setItem(
        `table-pinning-${options.persistKey}`,
        JSON.stringify(state),
      )
    }
    catch {
      // 忽略存儲錯誤
    }
  }

  const columnPinning = ref<ColumnPinningState>(options.initialPinning ?? loadPersistedState())

  return {
    columnPinning,
    onColumnPinningChange: (updateOrValue) => {
      const newState = typeof updateOrValue === 'function' ? updateOrValue(columnPinning.value) : updateOrValue
      columnPinning.value = newState

      // 持久化
      persistState(newState)
    },
    columnPinningConfig: {
      enableColumnPinning: true,
    },
  }
}
