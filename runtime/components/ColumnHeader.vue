<script lang="ts">
import type { HTMLAttributes } from 'vue'
import type { Column } from '@tanstack/vue-table'
import {
  ChevronDown,
  ChevronsUpDown,
  ChevronUp,
  EyeOff,
  X,
  Pin,
} from 'lucide-vue-next'
import {
  DropdownMenu,
  DropdownMenuGroup,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuPortal,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { cn } from '../lib/utils'

export interface DataTableColumnHeaderProps<TData, TValue> {
  column: Column<TData, TValue>
  title: string
  class?: HTMLAttributes['class']
}
</script>

<script setup lang="ts" generic="TData, TValue = unknown">
const props = defineProps<DataTableColumnHeaderProps<TData, TValue>>()

const position = ref<'left' | 'right' | 'left_edge' | 'right_edge' | undefined>(undefined)

const { t } = useI18n()

watch(position, (newPosition) => {
  switch (newPosition) {
    case 'left':
      break
    case 'right':
      break
    case 'left_edge':
      props.column.pin('left')
      break
    case 'right_edge':
      props.column.pin('right')
      break
    default:
      props.column.pin(false)
  }
})

function onResetPinning() {
  position.value = undefined
  props.column.pin(false)
}
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger
      :class="cn(
        '-ml-1.5 flex h-8 items-center gap-1.5 rounded-md px-2 py-1.5 hover:bg-accent focus:outline-none focus:ring-1 focus:ring-ring data-[state=open]:bg-accent [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-muted-foreground',
        props.class,
      )"
    >
      {{ props.title }}
      <template v-if="props.column.getCanSort()">
        <ChevronDown v-if="props.column.getIsSorted() === 'desc'" />
        <ChevronUp v-else-if="props.column.getIsSorted() === 'asc'" />
        <ChevronsUpDown v-else />
      </template>
      <template v-if="props.column.getCanPin()">
        <Pin v-if="!!props.column.getIsPinned()" />
      </template>
    </DropdownMenuTrigger>
    <DropdownMenuContent
      align="start"
    >
      <template v-if="props.column.getCanSort()">
        <DropdownMenuGroup>
          <DropdownMenuCheckboxItem
            class="relative pr-8 pl-2 [&>span:first-child]:right-2 [&>span:first-child]:left-auto [&_svg]:text-muted-foreground"
            :checked="props.column.getIsSorted() === 'asc'"
            @click="props.column.toggleSorting(false)"
          >
            <ChevronUp />
            {{ t('data_table.asc') }}
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            class="relative pr-8 pl-2 [&>span:first-child]:right-2 [&>span:first-child]:left-auto [&_svg]:text-muted-foreground"
            :checked="props.column.getIsSorted() === 'desc'"
            @click="props.column.toggleSorting(true)"
          >
            <ChevronDown />
            {{ t('data_table.desc') }}
          </DropdownMenuCheckboxItem>
          <DropdownMenuItem
            v-if="props.column.getIsSorted()"
            class="pl-2 [&_svg]:text-muted-foreground"
            @click="props.column.clearSorting()"
          >
            <X />
            Reset Sorting
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
      </template>
      <template v-if="props.column.getCanPin()">
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Pin class="mr-2 h-4 w-4" />
            <span>{{ t('data_table.pin') }}</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              <DropdownMenuRadioGroup v-model="position">
                <!-- <DropdownMenuRadioItem
                  value="left"
                >
                  {{ t('data_table.pin_left') }}
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem
                  value="right"
                >
                  {{ t('data_table.pin_right') }}
                </DropdownMenuRadioItem> -->
                <DropdownMenuRadioItem value="left_edge">
                  {{ t('data_table.pin_left_edge') }}
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="right_edge">
                  {{ t('data_table.pin_right_edge') }}
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
              <DropdownMenuItem
                v-if="!!props.column.getIsPinned()"
                class="pl-2 [&_svg]:text-muted-foreground"
                @click="onResetPinning()"
              >
                <X />
                {{ t('data_table.unpin') }}
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
      </template>
      <DropdownMenuCheckboxItem
        v-if="props.column.getCanHide()"
        class="relative pr-8 pl-2 [&>span:first-child]:right-2 [&>span:first-child]:left-auto [&_svg]:text-muted-foreground"
        :checked="!props.column.getIsVisible()"
        @click="props.column.toggleVisibility(false)"
      >
        <EyeOff />
        {{ t('data_table.hide') }}
      </DropdownMenuCheckboxItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>

<style scoped>

</style>
