<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '../lib/utils'

defineOptions({
  name: 'DataTableLoading',
})

const props = withDefaults(defineProps<{
  class?: HTMLAttributes['class']
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
  <tr
    :class="cn('hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors', 'border-b-0 hover:bg-transparent', props.class)"
    data-slot="table-loading"
  >
    <td
      :colspan="props.colspan"
      data-slot="table-cell"
      :class="
        cn(
          'p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]',
          'p-0 h-[2px]',
        )
      "
    >
      <div class="loader-wrapper">
        <div
          class="loader"
          :class="{ carousel: _loading }"
        />
      </div>
    </td>
  </tr>
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
