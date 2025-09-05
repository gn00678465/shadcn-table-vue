import '@tanstack/vue-table' // or vue, svelte, solid, qwik, etc.

declare module '@tanstack/vue-table' {
  interface ColumnMeta<TData extends RowData, TValue> {
    cellProps?: (rowData: import('@tanstack/vue-table').Row<RowData>, rowIndex: number) => object
  }
}
