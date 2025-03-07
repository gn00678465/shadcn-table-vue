import type { OnChangeFn, Row, RowSelectionState, TableOptions } from '@tanstack/vue-table'
import type { Ref } from 'vue'
import { valueUpdater } from '@/lib/utils'
import { ref, watch } from 'vue'

export interface UseTableRowSelectionReturn<TData> {
  rowSelection: Ref<RowSelectionState>
  onRowSelectionChange: OnChangeFn<RowSelectionState>
  resetRowSelection: () => void
  rowSelectionConfig: Pick<TableOptions<TData>, 'enableMultiRowSelection' | 'paginateExpandedRows' | 'enableRowSelection'>
}

// 首先定義 Meta 類型
export interface RowSelectionMeta<TData> {
  row: TData | undefined
  action: 'check' | 'uncheck' | 'checkAll' | 'uncheckAll'
}

export interface TableRowSelectionOptions<TData> {
  /**
   * 初始選擇狀態
   */
  initialRowSelection?: Ref<string[]>
  /**
   * 是否啟用選擇
   */
  enableRowSelection?: boolean | ((row: Row<TData>) => boolean)
  /**
   * 是否為為多選
   */
  multi?: boolean
  /**
   * 選擇項變更後的回調函數，現在包含 meta 參數
   */
  onUpdateCheckedRowKeys?: (
    keys: Array<string>,
    rows: Array<TData>,
    meta: RowSelectionMeta<TData>
  ) => void | Promise<void>

  dataRef?: Ref<TData[]>
  rowKey?: (originalRow: TData, index: number, parent?: Row<TData>) => string
}

export interface UseTableRowSelectionReturn<TData> {
  rowSelection: Ref<RowSelectionState>
  onRowSelectionChange: OnChangeFn<RowSelectionState>
  resetRowSelection: () => void
  rowSelectionConfig: Pick<TableOptions<TData>, 'enableMultiRowSelection' | 'paginateExpandedRows' | 'enableRowSelection'>
}

export function useTableRowSelection<TData>(options: TableRowSelectionOptions<TData>): UseTableRowSelectionReturn<TData> {
  const rowSelection = ref(initialRowSelection())

  // 選中行數據緩存
  const selectedRowsCache = ref(new Map()) as Ref<Map<string, TData>>

  // 跟踪上次變更的操作類型，用於分頁切換後的檢測
  const lastChangeType = ref<'none' | 'single' | 'multiple'>('none')

  // meta 信息
  const currentActionMeta = ref({
    row: undefined,
    action: 'check',
  }) as Ref<RowSelectionMeta<TData>>

  // 獲取行的唯一鍵
  const getRowKey = (row: TData, index: number): string => {
    if (options.rowKey) {
      return options.rowKey(row, index)
    }
    return String(index)
  }

  function initialRowSelection(): RowSelectionState {
    return options.initialRowSelection?.value
      ? options.initialRowSelection.value.reduce((acc, cur) => {
          acc[cur] = true
          return acc
        }, {} as RowSelectionState)
      : {}
  }

  // 初始化時填充緩存
  function initializeCache(): void {
    if (!options.initialRowSelection?.value || !options.dataRef?.value)
      return

    // 清空緩存
    selectedRowsCache.value.clear()

    // 為初始選擇的每一行創建緩存
    options.initialRowSelection.value.forEach((key) => {
      // 查找與 key 匹配的數據
      const index = Number(key)
      let foundItem: TData | undefined

      if (Number.isInteger(index) && index >= 0 && index < options.dataRef!.value.length && !options.rowKey) {
        foundItem = options.dataRef!.value[index]
      }
      else {
        foundItem = options.dataRef!.value.find((row, idx) =>
          getRowKey(row, idx) === key,
        )
      }

      if (foundItem) {
        selectedRowsCache.value.set(key, foundItem)
      }
    })
  }

  // 初始化緩存
  initializeCache()

  // 分析更新器以檢測全選/取消全選意圖
  function analyzeUpdater(updateOrValue: RowSelectionState | ((old: RowSelectionState) => RowSelectionState)): 'none' | 'single' | 'multiple' {
    // 如果直接提供了新狀態對象
    if (typeof updateOrValue !== 'function') {
      const keyCount = Object.keys(updateOrValue).length
      // 檢查是設置了多個值還是單個值
      return keyCount > 1 ? 'multiple' : keyCount === 1 ? 'single' : 'none'
    }

    // 如果提供了更新函數，我們需要模擬執行它來檢測行為
    const mockState = { ...rowSelection.value }
    const newState = updateOrValue(mockState)

    // 檢查新舊狀態差異
    const oldKeys = Object.keys(mockState)
    const newKeys = Object.keys(newState)

    // 如果鍵數量變化大於1，很可能是全選/取消全選操作
    if (Math.abs(newKeys.length - oldKeys.length) > 1) {
      return 'multiple'
    }

    // 如果只有一個鍵變化，這是單行操作
    if (newKeys.length !== oldKeys.length) {
      return 'single'
    }

    // 檢查實際的值變化
    const changedCount = newKeys.filter(key => newState[key] !== mockState[key]).length
    return changedCount > 1 ? 'multiple' : changedCount === 1 ? 'single' : 'none'
  }

  const onRowSelectionChange: OnChangeFn<RowSelectionState> = (updateOrValue) => {
    // 分析更新類型
    const updateType = analyzeUpdater(updateOrValue)

    // 保存舊的選擇狀態用於比較
    const oldSelection = { ...rowSelection.value }
    const oldKeys = Object.keys(oldSelection)

    // 應用更新
    valueUpdater(updateOrValue, rowSelection)

    // 獲取新的選擇狀態
    const newSelection = rowSelection.value
    const newKeys = Object.keys(newSelection)

    // 計算添加和移除的鍵
    const addedKeys = newKeys.filter(key => !oldSelection[key])
    const removedKeys = oldKeys.filter(key => !newSelection[key])

    // 判斷操作類型
    if (updateType === 'multiple') {
      // 這是一個全選或取消全選操作
      if (newKeys.length > oldKeys.length) {
        // 標記為全選操作
        currentActionMeta.value = {
          row: undefined,
          action: 'checkAll',
        }
      }
      else {
        // 標記為取消全選操作
        currentActionMeta.value = {
          row: undefined,
          action: 'uncheckAll',
        }
      }
    }
    else if (updateType === 'single') {
      // 這是單行選擇或取消選擇
      const changedKey = addedKeys.length ? addedKeys[0] : removedKeys[0]
      const isChecked = addedKeys.length > 0

      // 獲取對應的行數據
      let rowData: TData | undefined

      if (isChecked && options.dataRef?.value) {
        // 嘗試查找新選中的行
        const index = Number(changedKey)
        if (Number.isInteger(index) && index >= 0 && index < options.dataRef.value.length && !options.rowKey) {
          rowData = options.dataRef.value[index]
        }
        else {
          rowData = options.dataRef.value.find((row, idx) =>
            getRowKey(row, idx) === changedKey,
          )
        }
      }
      else if (!isChecked) {
        // 從緩存中獲取取消選中的行
        rowData = selectedRowsCache.value.get(changedKey)
      }

      // 標記為單行操作
      currentActionMeta.value = {
        row: rowData,
        action: isChecked ? 'check' : 'uncheck',
      }
    }

    // 記錄最後的更新類型
    lastChangeType.value = updateType

    // 更新選中行緩存
    if (options.dataRef?.value) {
      // 處理新增的鍵
      for (const key of addedKeys) {
        // 查找並緩存新選中的項
        const index = Number(key)
        let item: TData | undefined

        if (Number.isInteger(index) && index >= 0 && index < options.dataRef.value.length && !options.rowKey) {
          item = options.dataRef.value[index]
        }
        else {
          item = options.dataRef.value.find((row, idx) =>
            getRowKey(row, idx) === key,
          )
        }

        if (item) {
          selectedRowsCache.value.set(key, item)
        }
      }

      // 處理移除的鍵
      for (const key of removedKeys) {
        selectedRowsCache.value.delete(key)
      }
    }
  }

  watch(rowSelection, () => {
    if (!options.onUpdateCheckedRowKeys)
      return

    const keys = Object.keys(rowSelection.value)

    // 從緩存中獲取所有選中行數據
    const rows: TData[] = []
    keys.forEach((key) => {
      const row = selectedRowsCache.value.get(key)
      if (row)
        rows.push(row)
    })

    // 傳遞 meta 信息
    options.onUpdateCheckedRowKeys(keys, rows, currentActionMeta.value)
  })

  function resetRowSelection(): void {
    // 設置為取消全選
    currentActionMeta.value = {
      row: undefined,
      action: 'uncheckAll',
    }

    onRowSelectionChange({})
    selectedRowsCache.value.clear()
  }

  // 監聽數據源變化，更新緩存
  if (options.dataRef) {
    watch(options.dataRef, (newData) => {
      if (!newData)
        return

      // 數據源變化時更新緩存
      Object.keys(rowSelection.value).forEach((key) => {
        // 檢查緩存中是否已有此鍵
        const cachedRow = selectedRowsCache.value.get(key)
        if (cachedRow)
          return // 已有緩存，保留

        // 嘗試在新數據中查找
        const index = Number(key)
        let item: TData | undefined

        if (Number.isInteger(index) && index >= 0 && index < newData.length && !options.rowKey) {
          item = newData[index]
        }
        else {
          item = newData.find((row, idx) =>
            getRowKey(row, idx) === key,
          )
        }

        // 如果找到了，更新緩存
        if (item) {
          selectedRowsCache.value.set(key, item)
        }
      })
    }, { deep: true })
  }

  // 返回原始接口
  return {
    rowSelection,
    onRowSelectionChange,
    resetRowSelection,
    rowSelectionConfig: {
      enableMultiRowSelection: options.multi,
      paginateExpandedRows: false,
      enableRowSelection: options.enableRowSelection,
    },
  }
}
