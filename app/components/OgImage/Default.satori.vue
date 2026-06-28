<script setup lang="ts">
// Template d'image Open Graph (1200×630), rendu via le moteur satori de nuxt-og-image.
// Le suffixe « .satori » sélectionne explicitement satori (évite le renderer takumi).
// `title` / `description` sont injectés automatiquement depuis le useSeoMeta de la page.
withDefaults(defineProps<{ title?: string, description?: string }>(), {
  title: 'Wicthu',
  description: ''
})
</script>

<template>
  <div
    style="width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: space-between; background: #0a0a0f; padding: 80px; font-family: 'Inter';"
  >
    <div style="display: flex; align-items: center; color: #b8924a; font-size: 30px; letter-spacing: 10px;">
      W I C T H U
    </div>

    <div style="display: flex; flex-direction: column;">
      <div style="display: flex; color: #e8e4dc; font-size: 66px; font-weight: 700; line-height: 1.1;">
        {{ title }}
      </div>
      <div
        v-if="description"
        style="display: flex; color: #9a9488; font-size: 30px; line-height: 1.4; margin-top: 28px;"
      >
        {{ description }}
      </div>
    </div>

    <div style="display: flex; align-items: center; color: #7fb38a; font-size: 26px; letter-spacing: 2px;">
      L'Appel de Cthulhu — Compagnon de jeu
    </div>
  </div>
</template>
