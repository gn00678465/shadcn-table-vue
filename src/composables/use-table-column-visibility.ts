import type { VisibilityState } from '@tanstack/vue-table'
import type { Ref } from 'vue'
import { ref } from 'vue'

export interface TableColumnVisibilityOptions {
  /**
   * 初始列可見性狀態
   */
  initialVisibility?: VisibilityState
  /**
   * 列可見性變更回調
   */
  onVisibilityChange?: (state: VisibilityState) => void
  /**
   * 持久化 key
   */
  persistKey?: string
}

export interface UseTableColumnVisibilityReturn {
  columnVisibility: Ref<VisibilityState>
  toggleColumnVisibility: (columnId: string, visible?: boolean) => void
  resetColumnVisibility: () => void
  onColumnVisibilityChange: (updater: VisibilityState | ((old: VisibilityState) => VisibilityState)) => void
}

export function useTableColumnVisibility(
  options: TableColumnVisibilityOptions = {},
): UseTableColumnVisibilityReturn {
  // 從本地存儲加載狀態
  const loadPersistedState = (): VisibilityState => {
    if (!options.persistKey)
      return {}
    try {
      const stored = localStorage.getItem(`table-visibility-${options.persistKey}`)
      return stored ? JSON.parse(stored) : {}
    }
    catch {
      return {}
    }
  }

  // 保存狀態到本地存儲
  const persistState = (state: VisibilityState): void => {
    if (!options.persistKey)
      return
    try {
      localStorage.setItem(
        `table-visibility-${options.persistKey}`,
        JSON.stringify(state),
      )
    }
    catch {
      // 忽略存儲錯誤
    }
  }

  // 列可見性狀態
  const columnVisibility = ref<VisibilityState>(
    options.initialVisibility ?? loadPersistedState(),
  )

  // 切換列可見性
  function toggleColumnVisibility(columnId: string, visible?: boolean): void {
    columnVisibility.value = {
      ...columnVisibility.value,
      [columnId]: visible ?? !columnVisibility.value[columnId],
    }
  }

  // 重置可見性
  function resetColumnVisibility(): void {
    columnVisibility.value = {}
    persistState({})
  }

  return {
    columnVisibility,
    toggleColumnVisibility,
    resetColumnVisibility,
    onColumnVisibilityChange: (updater: VisibilityState | ((old: VisibilityState) => VisibilityState)) => {
      const newState = typeof updater === 'function' ? updater(columnVisibility.value) : updater
      columnVisibility.value = newState

      // 持久化
      persistState(newState)

      // 觸發回調
      options.onVisibilityChange?.(newState)
    },
  }
}
