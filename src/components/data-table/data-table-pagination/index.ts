import type { VariantProps } from 'class-variance-authority'
import { cva } from 'class-variance-authority'

export const dataTablePaginationVariants = cva('', {
  variants: {
    size: {
      lg: 'h-10 w-10',
      default: 'h-8 w-8 text-sm',
      sm: 'h-6 w-6 text-sm',
    },
    disabled: {
      true: 'disabled:cursor-not-allowed',
      false: '',
    },
  },
  defaultVariants: {
    size: 'default',
    disabled: false,
  },
})

export type DataTablePaginationVariants = VariantProps<typeof dataTablePaginationVariants>

export { default as DataTablePagination } from './data-table-pagination.vue'
export type * from './data-table-pagination.vue'
