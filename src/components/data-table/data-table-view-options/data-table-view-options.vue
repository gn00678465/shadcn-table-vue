<script setup lang="ts" generic="TData">
import type { ButtonVariants } from '@/components/ui/button'
import type { Column, Table } from '@tanstack/vue-table'
import type { HTMLAttributes, VNodeChild } from 'vue'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { ChevronsUpDown, Settings2 } from 'lucide-vue-next'
import { computed, useTemplateRef } from 'vue'

defineOptions({
  name: 'DataTableViewOptions',
})

const props = withDefaults(defineProps<DataTableViewOptionsProps<TData>>(), {
  renderTrigger: undefined,
  renderLabel: undefined,
  triggerProps: () => ({
    size: 'sm',
    variant: 'outline',
    class: '',
  }),
})

const slots = defineSlots<{
  trigger: () => VNodeChild
}>()

const triggerRef = useTemplateRef('triggerRef')

const checkStatus = computed(() => {
  return props.table.getIsAllColumnsVisible() ? true : props.table.getIsSomeColumnsVisible() ? 'indeterminate' : false
})
</script>

<script lang="ts">
export interface DataTableViewOptionsProps<TData> {
  table: Table<TData>
  renderLabel?: (col: Column<TData>) => VNodeChild
  renderCheckbox?: (value: boolean | 'indeterminate') => VNodeChild
  triggerProps?: ButtonVariants & { class?: HTMLAttributes['class'] }
}
</script>

<template>
  <Popover modal>
    <PopoverTrigger as-child>
      <Button
        ref="triggerRef"
        aria-label="Toggle columns"
        variant="outline"
        role="combobox"
        size="sm"
        class="hidden gap-2 focus:outline-none focus:ring-1 focus:ring-ring focus-visible:ring-0 lg:inline-flex"
        v-bind="props.triggerProps"
      >
        <template v-if="!slots.trigger">
          <Settings2 class="size-4" />
          View
          <ChevronsUpDown class="ml-auto size-4 shrink-0 opacity-50" />
        </template>
        <template v-else>
          <component :is="slots.trigger" />
        </template>
      </Button>
    </PopoverTrigger>
    <PopoverContent
      align="end"
      class="w-44 p-0"
      @close-auto-focus="() => triggerRef?.$el.focus()"
    >
      <Command>
        <CommandList>
          <CommandGroup>
            <CommandItem value="all" @select.stop="table.toggleAllColumnsVisible()">
              <template v-if="!props.renderCheckbox">
                <Checkbox :model-value="checkStatus" />
              </template>
              <template v-else>
                <component :is="props.renderCheckbox(checkStatus)" />
              </template>
              <span class="truncate">Select All</span>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup>
            <CommandItem
              v-for="col of table.getAllLeafColumns().filter((column) => typeof column.accessorFn !== 'undefined' && column.getCanHide())"
              :key="col.id"
              :value="col.id"
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
              <label v-else class="truncate">
                {{ col.id }}
              </label>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </PopoverContent>
  </Popover>
</template>

<style scoped>

</style>
