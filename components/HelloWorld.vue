<script setup lang="ts">
import { Button } from "@/components/ui/button"
const { myLayer } = useAppConfig()
</script>

<template>
  <div>
    <h1>Hello World!</h1>
    <Button variant="default">Click Me</Button>
    <pre>{{ myLayer }}</pre>
  </div>
</template>
