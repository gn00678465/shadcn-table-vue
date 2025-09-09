import type { VisibilityState } from '@tanstack/vue-table'
import type { Ref } from 'vue'
import { ref } from 'vue'
import { useStorage } from './useStorage'

export interface ColumnVisibilityOptions {
  /**
   * 初始列可見性狀態
   */
  columnVisibility?: VisibilityState
  /**
   * 列可見性變更回調
   */
  onVisibilityChange?: (state: VisibilityState) => void
}

export interface UseColumnVisibilityReturn {
  columnVisibility: Ref<VisibilityState>
  onColumnVisibilityChange: (updater: VisibilityState | ((old: VisibilityState) => VisibilityState)) => void
}

export function useColumnVisibility(
  options: ColumnVisibilityOptions = {},
): UseColumnVisibilityReturn {
  const {
    columnVisibility = {},
    onVisibilityChange,
  } = options

  const _columnVisibility: Ref<VisibilityState> = ref<VisibilityState>(columnVisibility)

  // 列可見性變更處理
  const onColumnVisibilityChange = (updater: VisibilityState | ((old: VisibilityState) => VisibilityState)): void => {
    const newState = typeof updater === 'function'
      ? updater(_columnVisibility.value)
      : updater

    _columnVisibility.value = newState

    // 觸發回調
    onVisibilityChange?.(newState)
  }

  return {
    columnVisibility: _columnVisibility,
    onColumnVisibilityChange,
  }
}

export interface ColumnVisibilityWithPersistenceOptions extends ColumnVisibilityOptions {
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

export function useColumnVisibilityWithPersist(
  options: ColumnVisibilityWithPersistenceOptions = {},
): UseColumnVisibilityReturn {
  const {
    columnVisibility = {},
    onVisibilityChange,
    persistKey,
    ssr = false,
    storageType = 'local',
  } = options

  let _columnVisibility: Ref<VisibilityState>
  let saveVisibility: () => void = () => {}

  // 如果提供了持久化 key，使用 useStorage
  if (persistKey) {
    const storage = useStorage<VisibilityState>(
      persistKey,
      columnVisibility,
      {
        type: storageType,
        ssr,
        prefix: 'table-',
        suffix: '-visibility',
        onError: (error) => {
          console.warn('Failed to persist column visibility:', error)
        },
        useDebounce: true,
        debounceDelay: 500,
      },
    )
    _columnVisibility = storage.data
    saveVisibility = storage.debouncedSave
  }
  else {
    // 沒有持久化，使用普通 ref
    _columnVisibility = ref<VisibilityState>(columnVisibility)
  }

  // 列可見性變更處理
  const onColumnVisibilityChange = (updater: VisibilityState | ((old: VisibilityState) => VisibilityState)): void => {
    const newState = typeof updater === 'function'
      ? updater(_columnVisibility.value)
      : updater

    _columnVisibility.value = newState

    // 保存到儲存
    saveVisibility()

    // 觸發回調
    onVisibilityChange?.(newState)
  }

  return {
    columnVisibility: _columnVisibility,
    onColumnVisibilityChange,
  }
}
