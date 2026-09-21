<script setup lang="ts">
/**
 * En-tête de navigation des pages de détail (`ressources/<type>/[id].vue`) :
 * fil d'Ariane à gauche, bouton de retour vers la liste à droite.
 *
 * Le bouton est volontairement plus présent que le fil d'Ariane : c'est la
 * sortie principale de la page. L'accent suit celui du titre de la page.
 */
export type Crumb = { label: string, to?: string }

withDefaults(defineProps<{
  /** Fil d'Ariane, du plus général au plus précis. Le dernier est la page courante. */
  items: Crumb[]
  /** URL de la liste de la ressource. */
  backTo: string
  /** Libellé du bouton, ex. « Toutes les occupations ». */
  backLabel: string
  /** Couleur d'accent, à aligner sur le titre de la page. */
  accent?: 'gold' | 'arcane' | 'crimson'
}>(), { accent: 'gold' })
</script>

<template>
  <div class="nav-row" :class="`nav-row--${accent}`">
    <div class="breadcrumb">
      <template v-for="(item, i) in items" :key="i">
        <NuxtLink v-if="item.to" :to="item.to" class="breadcrumb-link">{{ item.label }}</NuxtLink>
        <span v-else class="breadcrumb-current">{{ item.label }}</span>
        <span v-if="i < items.length - 1" class="breadcrumb-sep">›</span>
      </template>
    </div>
    <NuxtLink :to="backTo" class="back-btn">
      <span class="back-btn-arrow">←</span> {{ backLabel }}
    </NuxtLink>
  </div>
</template>

<style scoped>
.nav-row {
  /* accent par défaut : or ; surchargé par les modificateurs ci-dessous */
  --nav-accent: var(--color-gold);
  --nav-accent-dim: var(--color-gold-dim);
  --nav-accent-rgb: 184, 146, 74;

  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-md);
  flex-wrap: wrap;
  margin-bottom: var(--space-lg);
}
.nav-row--arcane {
  --nav-accent: var(--color-arcane);
  --nav-accent-dim: var(--color-arcane-dim);
  --nav-accent-rgb: 127, 179, 138;
}
.nav-row--crimson {
  --nav-accent: var(--color-crimson);
  --nav-accent-dim: var(--color-crimson);
  --nav-accent-rgb: 139, 58, 58;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  flex-wrap: wrap;
  min-width: 0;
  font-family: var(--font-heading);
  font-size: var(--fs-secondary);
}
.breadcrumb-link {
  color: var(--color-text-muted);
  text-decoration: none;
  transition: color var(--transition-fast);
}
.breadcrumb-link:hover { color: var(--nav-accent); }
.breadcrumb-sep { color: var(--color-border); }
.breadcrumb-current { color: var(--color-text-secondary); }

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  flex-shrink: 0;
  padding: var(--space-xs) var(--space-md);
  background: rgba(var(--nav-accent-rgb), 0.08);
  border: 1px solid var(--nav-accent-dim);
  border-radius: var(--radius-sm);
  color: var(--nav-accent);
  font-family: var(--font-heading);
  font-size: var(--fs-btn);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  text-decoration: none;
  white-space: nowrap;
  transition: all var(--transition-fast);
}
.back-btn:hover {
  background: rgba(var(--nav-accent-rgb), 0.2);
  border-color: var(--nav-accent);
  box-shadow: var(--shadow-glow);
}
.back-btn-arrow { transition: transform var(--transition-fast); }
.back-btn:hover .back-btn-arrow { transform: translateX(-3px); }

@media (max-width: 768px) {
  /* le bouton passe sous le fil d'Ariane et prend toute la largeur */
  .nav-row { flex-direction: column; align-items: stretch; }
  .back-btn { justify-content: center; }
}
</style>
