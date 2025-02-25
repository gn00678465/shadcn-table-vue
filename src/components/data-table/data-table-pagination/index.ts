import type { VariantProps } from 'class-variance-authority'
import { cva } from 'class-variance-authority'

export const dataTablePaginationVariants = cva('', {
  variants: {
    size: {
      default: 'h-10 w-10',
      sm: 'h-8 w-8 text-sm',
      xs: 'h-6 w-6 text-sm',
    },
  },
  defaultVariants: {
    size: 'default',
  },
})

export type DataTablePaginationVariants = VariantProps<typeof dataTablePaginationVariants>

export { default as DataTablePagination } from './data-table-pagination.vue'
export type * from './data-table-pagination.vue'
