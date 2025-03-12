import type { Ref } from 'vue'
import { onMounted, ref } from 'vue'

export type StorageType = 'local' | 'session' | 'cookie'

export interface StorageOptions {
  /**
   * 儲存類型
   * @default 'local'
   */
  type?: StorageType
  /**
   * 儲存前綴
   * @default 'shadcn-table-'
   */
  prefix?: string
  /**
   * 是否在 SSR 環境
   * @default false
   */
  ssr?: boolean
  /**
   * 錯誤處理
   */
  onError?: (error: Error) => void
}

type GetStorageReturn = Storage | {
  getItem: (key: string) => string | null
  setItem: (key: string, value: string) => void
  removeItem: (key: string) => void
} | null

export interface UseStorageReturn<T> {
  data: Ref<T>
  isHydrated: Ref<boolean>
  save: () => void
  clear: () => void
  update: (newValue: T) => void
}

/**
 * SSR 兼容的儲存 Composable
 */
export function useStorage<T>(
  key: string,
  initialValue: T,
  options: StorageOptions = {},
): UseStorageReturn<T> {
  const {
    type = 'local',
    prefix = '',
    ssr = false,
    onError = console.error,
  } = options

  const fullKey = `${prefix}${key}`
  const data = ref(initialValue) as Ref<T>
  const isClient = typeof window !== 'undefined'
  const isHydrated = ref(false)

  // 獲取儲存實例
  const getStorage = (): GetStorageReturn => {
    if (!isClient)
      return null

    switch (type) {
      case 'local':
        return localStorage
      case 'session':
        return sessionStorage
      case 'cookie':
        // cookie 僅提供簡單實現，實際使用可能需要更完整的 cookie 庫
        return {
          getItem: (key: string) => {
            const matches = document.cookie.match(new RegExp(
              `(?:^|; )${key.replace(/([.$?*|{}()[\]\\/+^])/g, '\\$1')}=([^;]*)`,
            ))
            return matches ? decodeURIComponent(matches[1]) : null
          },
          setItem: (key: string, value: string) => {
            document.cookie = `${key}=${encodeURIComponent(value)}; path=/; max-age=31536000`
          },
          removeItem: (key: string) => {
            document.cookie = `${key}=; path=/; max-age=-1`
          },
        }
      default:
        return localStorage
    }
  }

  // 從儲存中讀取數據
  const loadData = (): void => {
    if (!isClient)
      return

    try {
      const storage = getStorage()
      if (!storage)
        return

      const value = storage.getItem(fullKey)
      if (value === null)
        return

      data.value = JSON.parse(value)
      isHydrated.value = true
    }
    catch (error) {
      onError(error as Error)
    }
  }

  // 保存數據到儲存
  const saveData = (): void => {
    if (!isClient)
      return

    try {
      const storage = getStorage()
      if (!storage)
        return

      storage.setItem(fullKey, JSON.stringify(data.value))
    }
    catch (error) {
      onError(error as Error)
    }
  }

  // 清除數據
  const clearData = (): void => {
    if (!isClient)
      return

    try {
      const storage = getStorage()
      if (!storage)
        return

      storage.removeItem(fullKey)
      data.value = initialValue
    }
    catch (error) {
      onError(error as Error)
    }
  }

  // 僅在客戶端環境下初始化
  if (isClient && !ssr) {
    loadData()
  }
  else if (ssr) {
    // 在 SSR 環境中，僅在客戶端水合後初始化
    onMounted(() => {
      loadData()
    })
  }

  return {
    data,
    isHydrated,
    save: saveData,
    clear: clearData,
    // 用於直接設置數據並保存
    update: (newValue: T) => {
      data.value = newValue
      saveData()
    },
  }
}
