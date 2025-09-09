import type { ExpandedState, OnChangeFn, Row, TableOptions } from '@tanstack/vue-table'
import type { Ref } from 'vue'
import { getExpandedRowModel } from '@tanstack/vue-table'
import { ref, watch } from 'vue'
import { valueUpdater } from '../lib/utils'

export interface Options<TData> {
  /**
   * 初始展開狀態
   */
  expanded?: Ref<string[]>
  expandedOptions?: {
    /**
   *
   * @param row
   * @returns
   */
    enableExpanding?: boolean | ((row?: Row<TData>) => boolean)
  }
  /**
   * 展開項變更後的回調函數
   */
  onUpdateExpandedKeys?: (arg: Array<string>) => void | Promise<void>
}

export interface UseExpandingReturn<TData> {
  expanded: Ref<ExpandedState>
  onExpandedChange: OnChangeFn<ExpandedState>
  expandedConfig: Pick<TableOptions<TData>, 'getExpandedRowModel' | 'getRowCanExpand'>
}

export function useExpanding<TData>(options: Options<TData> = {}): UseExpandingReturn<TData> {
  const expanded = ref(initialExpanded())

  function initialExpanded(): ExpandedState {
    return options.expanded?.value
      ? options.expanded.value.reduce((acc, cur) => {
          acc[cur] = true
          return acc
        }, {} as Record<string, boolean>)
      : {}
  }

  watch(expanded, (_) => {
    options.onUpdateExpandedKeys?.(Object.keys(_))
  })

  const onExpandedChange: OnChangeFn<ExpandedState> = (updateOrValue) => {
    valueUpdater(updateOrValue, expanded)
  }

  return {
    expanded,
    onExpandedChange,
    expandedConfig: {
      getRowCanExpand: typeof options.expandedOptions?.enableExpanding === 'boolean' && options.expandedOptions?.enableExpanding === true
        ? () => true
        : typeof options.expandedOptions?.enableExpanding === 'function'
          ? options.expandedOptions?.enableExpanding
          : undefined,
      getExpandedRowModel: getExpandedRowModel(),
    },
  }
}
