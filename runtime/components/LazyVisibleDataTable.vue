<script setup lang="ts" generic="TData">
import type { DataTableProps } from './DataTable.vue'

const props = defineProps<DataTableProps<TData>>()
const attrs = useAttrs()

const LazyDataTable = defineLazyHydrationComponent(
  'visible',
  () => import('./DataTable.vue'),
)

const bindData = computed(() => ({ ...props, ...attrs }))
</script>

<template>
  <LazyDataTable v-bind="bindData">
    <template
      v-for="(_, name) in $slots"
      #[name]="slotData"
    >
      <slot
        :name="name"
        v-bind="slotData"
      />
    </template>
  </LazyDataTable>
</template>

<style scoped>

</style>
