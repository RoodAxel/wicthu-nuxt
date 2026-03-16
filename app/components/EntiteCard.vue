<script setup lang="ts">
defineProps<{
  id: number
  name: string
  titre: string | null
  categorie: string
  description: string | null
  protection: string | null
  attaquesParRound: string | null
  perteSanteMentale: string | null
}>()

const CATEGORIE_LABELS: Record<string, string> = {
  CREATURE_MYTHE: 'Créature du Mythe',
  DIVINITE_MYTHE: 'Divinité du Mythe',
  HORREUR_TRADITIONNEL: 'Horreur Traditionnelle',
  FAUNE: 'Faune'
}

function openDetail(id: number) {
  window.open(`/ressources/entite/${id}`, '_blank')
}
</script>

<template>
  <div class="entite-card" :class="`entite-card--${categorie.toLowerCase()}`" @click="openDetail(id)">
    <div class="card-header">
      <div class="card-name-block">
        <h3 class="card-name">{{ name }}</h3>
        <span v-if="titre" class="card-titre">{{ titre }}</span>
      </div>
      <span class="badge-categorie">{{ CATEGORIE_LABELS[categorie] ?? categorie }}</span>
    </div>

    <div class="card-meta">
      <span v-if="protection" class="meta-item">
        <span class="meta-label">Protection</span>
        <span class="meta-value">{{ protection }}</span>
      </span>
      <span v-if="attaquesParRound" class="meta-item">
        <span class="meta-label">Attaques/round</span>
        <span class="meta-value">{{ attaquesParRound }}</span>
      </span>
      <span v-if="perteSanteMentale" class="meta-item">
        <span class="meta-label">Santé mentale</span>
        <span class="meta-value meta-sanite">{{ perteSanteMentale }}</span>
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
.entite-card {
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
.entite-card:hover {
  border-color: var(--color-arcane-dim);
  background: var(--color-elevated);
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(127, 179, 138, 0.08);
}
.entite-card--creature_mythe:hover  { border-color: rgba(139, 58, 58, 0.4); box-shadow: 0 4px 16px rgba(139, 58, 58, 0.08); }
.entite-card--divinite_mythe:hover  { border-color: rgba(184, 146, 74, 0.4); box-shadow: 0 4px 16px rgba(184, 146, 74, 0.08); }
.entite-card--horreur_traditionnel:hover { border-color: rgba(127, 179, 138, 0.4); }
.entite-card--faune:hover           { border-color: rgba(127, 179, 138, 0.4); }

.card-header {
  display: flex;
  align-items: flex-start;
  gap: var(--space-sm);
  flex-wrap: wrap;
}

.card-name-block {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.card-name {
  font-family: var(--font-heading);
  font-size: var(--fs-lg);
  font-weight: 600;
  letter-spacing: 0.04em;
  color: var(--color-arcane);
}

.entite-card--creature_mythe  .card-name { color: var(--color-crimson); }
.entite-card--divinite_mythe  .card-name { color: var(--color-gold); }

.card-titre {
  font-family: var(--font-flavor);
  font-style: italic;
  font-size: var(--fs-sm);
  color: var(--color-text-muted);
}

.badge-categorie {
  font-family: var(--font-heading);
  font-size: var(--fs-2xs);
  font-weight: bold;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: 2px var(--space-xs);
  white-space: nowrap;
  flex-shrink: 0;
  color: var(--color-text-muted);
}

.entite-card--creature_mythe  .badge-categorie { color: var(--color-crimson); border-color: rgba(139, 58, 58, 0.3); }
.entite-card--divinite_mythe  .badge-categorie { color: var(--color-gold);    border-color: rgba(184, 146, 74, 0.3); }
.entite-card--horreur_traditionnel .badge-categorie { color: var(--color-arcane); border-color: rgba(127, 179, 138, 0.3); }
.entite-card--faune           .badge-categorie { color: var(--color-arcane);  border-color: rgba(127, 179, 138, 0.3); }

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

.meta-sanite { color: var(--color-crimson); font-weight: 600; }

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

.card-description--empty { color: var(--color-text-muted); }

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

.entite-card:hover .card-cta { color: var(--color-arcane); }
.entite-card--creature_mythe:hover .card-cta  { color: var(--color-crimson); }
.entite-card--divinite_mythe:hover .card-cta  { color: var(--color-gold); }
</style>
