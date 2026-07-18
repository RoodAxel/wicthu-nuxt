<script setup lang="ts">
defineProps<{ title?: string }>()
</script>

<template>
  <aside class="form-hint">
    <span class="form-hint-glyph" aria-hidden="true">✦</span>
    <div class="form-hint-body">
      <strong v-if="title" class="form-hint-title">{{ title }}</strong>
      <slot />
    </div>
  </aside>
</template>
