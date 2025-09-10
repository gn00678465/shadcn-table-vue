<script lang="ts">
import type { Column, Table } from '@tanstack/vue-table'
import type { HTMLAttributes, VNodeChild } from 'vue'
import type { ButtonVariants } from '@/components/ui/button'
import { ChevronsUpDown, Settings2 } from 'lucide-vue-next'
import { computed, useTemplateRef } from 'vue'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ScrollArea } from '@/components/ui/scroll-area'

export interface DataTableViewOptionsProps<TData> {
  table: Table<TData>
  renderLabel?: (col: Column<TData>) => VNodeChild
  renderCheckbox?: (value: boolean | 'indeterminate') => VNodeChild
  triggerButtonProps?: ButtonVariants & { class?: HTMLAttributes['class'] }
  resetButtonProps?: ButtonVariants & { class?: HTMLAttributes['class'] }
}
</script>

<script setup lang="ts" generic="TData">
defineOptions({
  name: 'DataTableViewOptions',
})

const props = withDefaults(defineProps<DataTableViewOptionsProps<TData>>(), {
  renderTrigger: undefined,
  renderLabel: undefined,
  triggerButtonProps: () => ({
    size: 'sm',
    variant: 'outline',
    class: 'h-7',
  }),
  resetButtonProps: () => ({
    size: 'sm',
    variant: 'outline',
    class: 'h-7',
  }),
})

const slots = defineSlots<{
  trigger: () => VNodeChild
}>()

const triggerRef = useTemplateRef('triggerRef')
const { t } = useI18n()

const checkStatus = computed(() => {
  return props.table.getIsAllColumnsVisible() ? true : props.table.getIsSomeColumnsVisible() ? 'indeterminate' : false
})

function onReset() {
  props.table.resetColumnVisibility()
}
</script>

<template>
  <DropdownMenu modal>
    <DropdownMenuTrigger as-child>
      <Button
        v-if="!slots.trigger"
        ref="triggerRef"
        aria-label="Toggle columns"
        role="combobox"
        class="cursor-pointer hidden gap-2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring lg:inline-flex"
        v-bind="props.triggerButtonProps"
      >
        <Settings2 class="size-4" />
        {{ t('data_table.view') }}
        <ChevronsUpDown class="ml-auto size-4 shrink-0 opacity-50" />
      </Button>
      <slot
        v-else
        ref="triggerRef"
        name="trigger"
        role="combobox"
        aria-label="Toggle columns"
      />
    </DropdownMenuTrigger>
    <DropdownMenuContent
      align="end"
      class="w-44 p-0"
      @close-auto-focus="() => triggerRef?.$el.focus()"
    >
      <DropdownMenuCheckboxItem
        class="pl-2 [&>:first-child]:hidden"
        @select.stop="table.toggleAllColumnsVisible()"
      >
        <div
          class="flex items-center gap-2 cursor-default"
        >
          <template v-if="!props.renderCheckbox">
            <Checkbox :model-value="checkStatus" />
          </template>
          <template v-else>
            <component :is="props.renderCheckbox(checkStatus)" />
          </template>
          <span class="truncate">{{ t('data_table.select_all') }}</span>
        </div>
      </DropdownMenuCheckboxItem>
      <DropdownMenuSeparator />
      <ScrollArea class="h-[192px]">
        <DropdownMenuCheckboxItem
          v-for="col of table.getAllLeafColumns().filter((column) => typeof column.accessorFn !== 'undefined' && column.getCanHide())"
          :key="col.id"
          class="pl-2 [&>:first-child]:hidden"
          @select.stop="() => { col.toggleVisibility(!col.getIsVisible()) }"
        >
          <template v-if="!props.renderCheckbox">
            <Checkbox :model-value="col.getIsVisible()" />
          </template>
          <template v-else>
            <component :is="props.renderCheckbox(col.getIsVisible())" />
          </template>
          <template v-if="!!props.renderLabel">
            <component :is="props.renderLabel(col)" />
          </template>
          <label
            v-else
            class="truncate"
          >
            {{ col.id }}
          </label>
        </DropdownMenuCheckboxItem>
      </ScrollArea>
      <DropdownMenuSeparator />
      <DropdownMenuItem
        class="focus:bg-transparent"
      >
        <Button
          class="w-full cursor-pointer"
          v-bind="props.resetButtonProps"
          @click="onReset"
        >
          {{ t('data_table.reset') }}
        </Button>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>

<style scoped>

</style>
