import type { VariantProps } from 'class-variance-authority'
import { cva } from 'class-variance-authority'

export const dataTableVariants = cva('', {
  variants: {
    size: {
      default: ['p-4'],
      sm: ['px-4', 'py-3'],
    },
  },
  defaultVariants: {
    size: 'default',
  },
})
export type DataTableVariants = VariantProps<typeof dataTableVariants>

export * from './data-table-pagination'
export * from './data-table-skeleton'
export * from './data-table-view-options'

export { default as DataTable } from './data-table.vue'
export type * from './data-table.vue'
