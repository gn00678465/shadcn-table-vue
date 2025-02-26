import type { ExpandedState, OnChangeFn, Row, TableOptions } from '@tanstack/vue-table'
import type { Ref } from 'vue'
import { valueUpdater } from '@/lib/utils'
import { getExpandedRowModel } from '@tanstack/vue-table'
import { ref } from 'vue'

export interface TableExpandingOptions<TData> {
  /**
   * 初始展開狀態
   */
  initialExpanded?: Ref<string[]>
  /**
   *
   * @param row
   * @returns
   */
  enableExpanding?: boolean | ((row?: Row<TData>) => boolean)
}

export interface UseTableExpandingReturn<TData> {
  expanded: Ref<ExpandedState>
  onExpandedChange: OnChangeFn<ExpandedState>
  expandedConfig: Pick<TableOptions<TData>, 'getExpandedRowModel' | 'getRowCanExpand'>
}

export function useTableExpanding<TData>(options: TableExpandingOptions<TData> = {}): UseTableExpandingReturn<TData> {
  const expanded = ref(initialExpanded())

  function initialExpanded(): ExpandedState {
    return options.initialExpanded?.value
      ? options.initialExpanded.value.reduce((acc, cur) => {
          acc[cur] = true
          return acc
        }, {} as Record<string, boolean>)
      : {}
  }

  const onExpandedChange: OnChangeFn<ExpandedState> = (updateOrValue) => {
    valueUpdater(updateOrValue, expanded)
  }

  return {
    expanded,
    onExpandedChange,
    expandedConfig: {
      getRowCanExpand: typeof options.enableExpanding === 'boolean' && options.enableExpanding === true
        ? () => true
        : typeof options.enableExpanding === 'function'
          ? options.enableExpanding
          : undefined,
      getExpandedRowModel: getExpandedRowModel(),
    },
  }
}
