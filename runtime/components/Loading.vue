<script setup lang="ts">
import { TableCell, TableRow } from '@/components/ui/table'

defineOptions({
  name: 'DataTableLoading',
})

const props = withDefaults(defineProps<{
  loadingColor?: string
  colspan?: number
  loading?: boolean
}>(), {
  colspan: 1,
  loading: false,
  loadingColor: 'hsla(var(--tw-success-DEFAULT)/1)',
})

const _loading = ref(false)

const foregroundColor = computed(() => props.loadingColor)

watch(() => props.loading, (val) => {
  if (val) {
    _loading.value = true
  }
  else {
    setTimeout(() => {
      _loading.value = false
    }, 1500)
  }
}, {
  flush: 'pre',
  immediate: true,
})
</script>

<template>
  <TableRow class="border-b-0 hover:bg-transparent">
    <TableCell
      class="p-0 h-[2px]"
      :colspan="props.colspan"
    >
      <div class="loader-wrapper">
        <div
          class="loader"
          :class="{ carousel: _loading }"
        />
      </div>
    </TableCell>
  </TableRow>
</template>

<style scoped>
:where(.loader-wrapper) {
  --height: 2px;
  --border-radius: 2px;
  --foreground-color: v-bind(foregroundColor);
  --background-color: rgba(0,0,0,0.2);
}

.loader-wrapper {
  width: 100%;
}

.loader {
  display: block;
  height: var(--height);
  border-radius: var(--border-radius);
  background-color: var(--background-color, rgba(0,0,0,0.2));
  position: relative;
  width: 100%;

  &::before {
    content: "";
    position: absolute;
    background: var(--foreground-color, grey);
    top: 0;
    left: 0;
    width: 0%;
    height: 100%;
    border-radius: 30px;
  }
}

.loader.carousel::before {
  animation: carousel 2s ease-in-out infinite;
}

@keyframes carousel {
  50% {
    width: 100%;
  }

  100% {
    width: 0;
    right: 0;
    left: unset;
  }
}
</style>
