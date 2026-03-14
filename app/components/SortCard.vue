<script setup lang="ts">
defineProps<{
  id: number
  name: string
  cout: string | null
  temps_incantation: string | null
  description: string | null
  childrenCount: number
  parentName: string | null
}>()

function openDetail(id: number) {
  window.open(`/ressources/sort/${id}`, '_blank')
}
</script>

<template>
  <div class="sort-card" @click="openDetail(id)">
    <div class="card-header">
      <h3 class="card-name">{{ name }}</h3>
      <span v-if="childrenCount > 0" class="badge-variants">{{ childrenCount }} variante{{ childrenCount > 1 ? 's' : '' }}</span>
      <span v-if="parentName" class="badge-parent">Variante</span>
    </div>

    <div class="card-meta">
      <span v-if="cout" class="meta-item">
        <span class="meta-label">Coût</span>
        <span class="meta-value meta-cost">{{ cout }}</span>
      </span>
      <span v-if="temps_incantation" class="meta-item">
        <span class="meta-label">Incantation</span>
        <span class="meta-value">{{ temps_incantation }}</span>
      </span>
    </div>

    <p v-if="description" class="card-description">{{ description }}</p>
    <p v-else class="card-description card-description--empty">Aucune description disponible.</p>

    <div class="card-footer">
      <span class="card-cta">Voir les détails →</span>
    </div>
  </div>
</template>

<style scoped>
.sort-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  cursor: pointer;
  transition: all var(--transition-fast);
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}
.sort-card:hover {
  border-color: var(--color-arcane-dim);
  background: var(--color-elevated);
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(127, 179, 138, 0.08);
}

.card-header {
  display: flex;
  align-items: flex-start;
  gap: var(--space-sm);
  flex-wrap: wrap;
}

.card-name {
  font-family: var(--font-heading);
  font-size: var(--fs-lg);
  font-weight: 600;
  letter-spacing: 0.04em;
  color: var(--color-arcane);
  flex: 1;
  min-width: 0;
}

.badge-variants {
  font-family: var(--font-heading);
  font-size: var(--fs-2xs);
  font-weight: bold;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-gold);
  border: 1px solid var(--color-gold-dim);
  border-radius: var(--radius-sm);
  padding: 2px var(--space-xs);
  white-space: nowrap;
  flex-shrink: 0;
}

.badge-parent {
  font-family: var(--font-heading);
  font-size: var(--fs-2xs);
  font-weight: bold;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-text-muted);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: 2px var(--space-xs);
  white-space: nowrap;
  flex-shrink: 0;
}

.card-meta {
  display: flex;
  gap: var(--space-lg);
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.meta-label {
  font-family: var(--font-heading);
  font-size: var(--fs-2xs);
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--color-text-muted);
}

.meta-value {
  font-family: var(--font-body);
  font-size: var(--fs-base);
  color: var(--color-text-secondary);
}

.meta-cost {
  color: var(--color-crimson);
  font-weight: 600;
}

.card-description {
  font-family: var(--font-flavor);
  font-style: italic;
  font-size: var(--fs-base);
  color: var(--color-text-secondary);
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex: 1;
}

.card-description--empty {
  color: var(--color-text-muted);
}

.card-footer {
  margin-top: auto;
  padding-top: var(--space-xs);
  border-top: 1px solid var(--color-border);
}

.card-cta {
  font-family: var(--font-heading);
  font-size: var(--fs-xs);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-text-muted);
  transition: color var(--transition-fast);
}

.sort-card:hover .card-cta {
  color: var(--color-arcane);
}
</style>
