<script setup lang="ts">
const { online } = useNetworkStatus()
const { supported, lastSync, syncing, done, total, failed, sync } = useOfflineCache()

const lastSyncLabel = computed(() => {
  if (!lastSync.value) return null
  const d = new Date(lastSync.value)
  return `${d.toLocaleDateString('fr-FR')} à ${d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`
})
</script>

<template>
  <div v-if="supported" class="offline-sync">
    <button
      type="button"
      class="offline-sync-btn"
      :disabled="syncing || !online"
      @click="sync"
    >
      {{ lastSync ? 'Mettre à jour le contenu hors ligne' : 'Rendre disponible hors ligne' }}
    </button>

    <span v-if="syncing" class="offline-sync-status">
      Téléchargement… {{ done }} / {{ total }}
    </span>
    <span v-else-if="failed" class="offline-sync-status error">
      {{ failed }} élément(s) non téléchargé(s) — réessayez.
    </span>
    <span v-else-if="lastSyncLabel" class="offline-sync-status">
      Ressources disponibles hors ligne (mis à jour le {{ lastSyncLabel }})
    </span>
  </div>
</template>

<style scoped>
.offline-sync {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  font-family: var(--font-body);
  font-size: 0.75rem;
}

.offline-sync-btn {
  padding: var(--space-xs) var(--space-sm);
  border: 1px solid var(--color-arcane-dim);
  border-radius: 4px;
  background: transparent;
  color: var(--color-arcane);
  font: inherit;
  cursor: pointer;
  transition: background var(--transition-fast);
}

.offline-sync-btn:hover:not(:disabled) {
  background: var(--color-arcane-glow);
}

.offline-sync-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.offline-sync-status {
  color: var(--color-text-secondary);
}

.offline-sync-status.error {
  color: var(--color-crimson-light);
}
</style>
