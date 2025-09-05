import type { Column, Table } from '@tanstack/vue-table'
import { FlexRender } from '@tanstack/vue-table'

/**
 * 渲染 column header
 * 處理 function header 的情況
 */
export function renderColumnHeader<TData>(column: Column<TData>, table: Table<TData>) {
  const { header } = column.columnDef
  if (header) {
    const context = {
      column,
      header: {
        column,
        id: column.id,
        getContext: () => context,
      },
      table,
    }

    return h(FlexRender, {
      render: header,
      props: context,
    })
  }

  return h(FlexRender, {
    render: () => column.id,
    props: {},
  })
}
