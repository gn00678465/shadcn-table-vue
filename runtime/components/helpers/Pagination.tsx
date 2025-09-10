import type { PaginationFirstProps, PaginationLastProps } from 'reka-ui'
import type { HTMLAttributes, SlotsType } from 'vue'
import type { ButtonVariants } from '@/components/ui/button'
import { reactiveOmit } from '@vueuse/core'
import { ChevronsLeftIcon, ChevronsRightIcon } from 'lucide-vue-next'
import { PaginationFirst, PaginationLast, useForwardProps } from 'reka-ui'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'

export const First = defineComponent(
  function (props: PaginationFirstProps & {
    size?: ButtonVariants['size']
    class?: HTMLAttributes['class']
  } = { size: 'default' }, ctx) {
    const delegatedProps = reactiveOmit(props, 'class', 'size')
    const forwarded = useForwardProps(delegatedProps)

    return () => (
      <PaginationFirst
        data-slot="pagination-first"
        class={cn(buttonVariants({ variant: 'ghost', size: props.size }), 'gap-1 px-2.5', props.class)}
        {...forwarded.value}
      >
        {ctx?.slots?.default?.() || <ChevronsLeftIcon />}
      </PaginationFirst>
    )
  },
  {
    props: ['as', 'asChild', 'size', 'class'],
    slots: {} as SlotsType<{ default: () => any }>,
  },
)

export const Last = defineComponent(
  function (props: PaginationLastProps & {
    size?: ButtonVariants['size']
    class?: HTMLAttributes['class']
  } = { size: 'default' }, ctx) {
    const delegatedProps = reactiveOmit(props, 'class', 'size')
    const forwarded = useForwardProps(delegatedProps)

    return () => (
      <PaginationLast
        data-slot="pagination-last"
        class={cn(buttonVariants({ variant: 'ghost', size: props.size }), 'gap-1 px-2.5', props.class)}
        {...forwarded.value}
      >
        {ctx?.slots?.default?.() || <ChevronsRightIcon />}
      </PaginationLast>
    )
  },
  {
    props: ['as', 'asChild', 'size', 'class'],
    slots: {} as SlotsType<{ default: () => any }>,
  },
)
