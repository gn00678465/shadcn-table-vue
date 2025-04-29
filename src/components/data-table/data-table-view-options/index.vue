<script lang="ts">
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
import { ScrollArea } from '@/components/ui/scroll-area'
import { ChevronsUpDown, Settings2 } from 'lucide-vue-next'
import { computed, useTemplateRef } from 'vue'

export interface DataTableViewOptionsProps<TData> {
  table: Table<TData>
  renderLabel?: (col: Column<TData>) => VNodeChild
  renderCheckbox?: (value: boolean | 'indeterminate') => VNodeChild
  triggerProps?: ButtonVariants & { class?: HTMLAttributes['class'] }
}
</script>

<script setup lang="ts" generic="TData">
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

function onReset() {
  props.table.resetColumnVisibility()
}
</script>

<template>
  <Popover modal>
    <PopoverTrigger as-child>
      <Button
        v-if="!slots.trigger"
        ref="triggerRef"
        aria-label="Toggle columns"
        variant="outline"
        role="combobox"
        size="sm"
        class="hidden gap-2 focus:outline-none focus:ring-1 focus:ring-ring focus-visible:ring-0 lg:inline-flex"
      >
        <Settings2 class="size-4" />
        View
        <ChevronsUpDown class="ml-auto size-4 shrink-0 opacity-50" />
      </Button>
      <slot
        v-else
        ref="triggerRef"
        name="trigger"
        role="combobox"
        aria-label="Toggle columns"
      />
    </PopoverTrigger>
    <PopoverContent
      align="end"
      class="w-44 p-0"
      @close-auto-focus="() => triggerRef?.$el.focus()"
    >
      <Command>
        <CommandList class="overflow-visible max-h-none">
          <!-- Select All 選項固定在頂部 -->
          <CommandGroup>
            <CommandItem
              value="all"
              class="cursor-pointer hover:bg-accent/40 transition-colors duration-200"
              @select.stop="table.toggleAllColumnsVisible()"
            >
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

          <!-- 使用 ScrollArea 包裹列選項部分 -->
          <CommandGroup as-child>
            <ScrollArea class="h-[280px]">
              <CommandItem
                v-for="col of table.getAllLeafColumns().filter((column) => typeof column.accessorFn !== 'undefined' && column.getCanHide())"
                :key="col.id"
                :value="col.id"
                class="cursor-pointer hover:bg-accent/40 transition-colors duration-200"
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
            </ScrollArea>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup>
            <CommandItem value="reset">
              <Button size="sm" class="w-full" @click="onReset">
                Reset
              </Button>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </PopoverContent>
  </Popover>
</template>

<style scoped>

</style>
