<script setup lang="ts">
const { online } = useNetworkStatus()
const { lastSync } = useOfflineCache()

const syncLabel = computed(() =>
  lastSync.value
    ? `contenu du ${new Date(lastSync.value).toLocaleDateString('fr-FR')}`
    : 'seules les pages déjà consultées sont disponibles'
)
</script>

<template>
  <div v-if="!online" class="offline-banner" role="status">
    Hors ligne — consultation des ressources en cache ({{ syncLabel }}).
    Connexion, fiches d'investigateur et armes perso indisponibles.
  </div>
</template>

<style scoped>
.offline-banner {
  padding: var(--space-xs) var(--space-md);
  background: rgba(184, 146, 74, 0.12);
  border-bottom: 1px solid var(--color-gold-dim);
  color: var(--color-gold);
  font-family: var(--font-body);
  font-size: 0.85rem;
  text-align: center;
}
</style>
