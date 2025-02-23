import type { OnChangeFn, Row, RowSelectionState, TableOptions } from '@tanstack/vue-table'
import type { Ref } from 'vue'
import { ref, watch } from 'vue'

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
   * 選擇項變更後的回調函數
   */
  onSelectionUpdate?: (arg: RowSelectionState) => void | Promise<void>
}

export interface UseTableRowSelectionReturn<TData> {
  rowSelection: Ref<RowSelectionState>
  onRowSelectionChange: OnChangeFn<RowSelectionState>
  rowSelectionConfig: Pick<TableOptions<TData>, 'enableMultiRowSelection' | 'paginateExpandedRows' | 'enableRowSelection'>
}

export function useTableRowSelection<TData>(options: TableRowSelectionOptions<TData>): UseTableRowSelectionReturn<TData> {
  const rowSelection = ref(initialRowSelection())

  function initialRowSelection(): RowSelectionState {
    return options.initialRowSelection?.value
      ? options.initialRowSelection.value.reduce((acc, cur) => {
          acc[cur] = true
          return acc
        }, {} as RowSelectionState)
      : {}
  }

  const onRowSelectionChange: OnChangeFn<RowSelectionState> = (updateOrValue) => {
    rowSelection.value
      = typeof updateOrValue === 'function'
        ? updateOrValue(rowSelection.value)
        : updateOrValue
  }

  watch(rowSelection, (_) => {
    options.onSelectionUpdate?.(_)
  })

  return {
    rowSelection,
    onRowSelectionChange,
    rowSelectionConfig: {
      enableMultiRowSelection: options.multi,
      paginateExpandedRows: false,
      enableRowSelection: options.enableRowSelection,
    },
  }
}
