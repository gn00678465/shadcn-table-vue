import type { SortingState, TableOptions, OnChangeFn } from '@tanstack/vue-table'
import { getSortedRowModel } from '@tanstack/vue-table'

type SortingOptions<TData> = Pick<TableOptions<TData>,
  | 'sortingFns'
  | 'manualSorting'
  | 'enableSorting'
  | 'enableSortingRemoval'
  | 'enableMultiRemove'
  | 'enableMultiSort'
  | 'sortDescFirst'
  | 'maxMultiSortColCount'
  | 'isMultiSortEvent'
>

export interface Options<TData> {
  sorting?: SortingState
  sortingOptions?: SortingOptions<TData>
  onSortingChange?: (state: SortingState) => void
}

export interface UseSortingReturn<TData> {
  sortingState: Ref<SortingState>
  sortingConfig: SortingOptions<TData> & Pick<TableOptions<TData>, 'getSortedRowModel'>
  onSortingChange: OnChangeFn<SortingState>
}

export function useSorting<TData>(options: Options<TData> = {}): UseSortingReturn<TData> {
  const _sorting = ref<SortingState>(options.sorting ?? [])

  return {
    sortingState: _sorting,
    sortingConfig: {
      ...options.sortingOptions,
      getSortedRowModel: getSortedRowModel(),
    },
    onSortingChange: (updateOrValue) => {
      const newState = typeof updateOrValue === 'function'
        ? updateOrValue(_sorting.value)
        : updateOrValue

      _sorting.value = newState

      // 觸發回調
      options.onSortingChange?.(newState)
    },
  }
}
