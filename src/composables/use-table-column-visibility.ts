import type { VisibilityState } from '@tanstack/vue-table'
import type { Ref } from 'vue'
import { ref } from 'vue'
import { useStorage } from './use-storage'

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
  /**
   * 是否在 SSR 環境
   */
  ssr?: boolean
  /**
   * 儲存類型
   */
  storageType?: 'local' | 'session' | 'cookie'
}

export interface UseTableColumnVisibilityReturn {
  columnVisibility: Ref<VisibilityState>
  onColumnVisibilityChange: (updater: VisibilityState | ((old: VisibilityState) => VisibilityState)) => void
}

export function useTableColumnVisibility(
  options: TableColumnVisibilityOptions = {},
): UseTableColumnVisibilityReturn {
  const {
    initialVisibility = {},
    onVisibilityChange,
    persistKey,
    ssr = false,
    storageType = 'local',
  } = options

  let columnVisibility: Ref<VisibilityState>
  let saveVisibility: () => void = () => {}

  // 如果提供了持久化 key，使用 useStorage
  if (persistKey) {
    const storage = useStorage<VisibilityState>(
      `visibility-${persistKey}`,
      initialVisibility,
      {
        type: storageType,
        ssr,
        onError: (error) => {
          console.warn('Failed to persist column visibility:', error)
        },
      },
    )

    columnVisibility = storage.data
    saveVisibility = storage.save
  }
  else {
    // 沒有持久化，使用普通 ref
    columnVisibility = ref<VisibilityState>(initialVisibility)
  }

  // 列可見性變更處理
  const onColumnVisibilityChange = (updater: VisibilityState | ((old: VisibilityState) => VisibilityState)): void => {
    const newState = typeof updater === 'function'
      ? updater(columnVisibility.value)
      : updater

    columnVisibility.value = newState

    // 保存到儲存
    saveVisibility()

    // 觸發回調
    onVisibilityChange?.(newState)
  }

  return {
    columnVisibility,
    onColumnVisibilityChange,
  }
}
