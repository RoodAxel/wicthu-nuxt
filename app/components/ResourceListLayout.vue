<script setup lang="ts">
interface StatItem {
  number: string | number
  label: string
  /** Met la carte en avant (bordure accent + chiffre en couleur primaire) */
  highlight?: boolean
}

const props = withDefaults(defineProps<{
  /** Titre H1 de la page */
  title: string
  /** Sous-titre sous le H1 */
  subtitle?: string
  /** Citation thématique (sans la source) */
  quote?: string
  /** Source de la citation */
  cite?: string
  /** Couleur d'accent — pilote --accent/--accent-text/--accent-rgb */
  accent?: 'gold' | 'crimson' | 'arcane'
  /** Statut de useFetch ('idle' | 'pending' | 'success' | 'error') */
  status: string
  /** Erreur de useFetch, le cas échéant */
  error?: unknown
  /** Nombre de résultats après filtrage (pour l'état "vide") */
  resultCount: number
  /** Cartes de statistiques affichées sous la citation */
  stats?: StatItem[]
  /** Message affiché pendant le chargement */
  loadingText?: string
  /** Message affiché quand aucun résultat */
  emptyText?: string
  /** Largeur max du contenu */
  maxWidth?: string
  /** Nombre de colonnes du panneau de stats */
  statsCols?: number
  /** Nombre de colonnes du panneau de stats en mobile (défaut : statsCols) */
  statsColsMobile?: number
  /** Largeur max du panneau de stats */
  statsMaxWidth?: string
}>(), {
  accent: 'gold',
  loadingText: 'Consultation des archives…',
  emptyText: 'Aucun résultat ne correspond à votre requête.',
  maxWidth: '1100px',
  statsCols: 2,
  statsMaxWidth: '360px'
})

const errorMessage = computed(() => (props.error as { message?: string } | null)?.message ?? '')
</script>

<template>
  <main
    class="resource-page"
    :class="`accent-${accent}`"
    :style="{ '--rl-max': maxWidth, '--stats-cols': statsCols, '--stats-cols-mobile': statsColsMobile ?? statsCols, '--stats-max': statsMaxWidth }"
  >
    <div class="page-header">
      <h1 class="page-title">{{ title }}</h1>
      <p v-if="subtitle" class="page-subtitle">{{ subtitle }}</p>
    </div>

    <blockquote v-if="quote" class="flavor-quote">
      <p>{{ quote }}</p>
      <cite v-if="cite">{{ cite }}</cite>
    </blockquote>

    <div v-if="stats?.length" class="stats-panel">
      <div v-for="(stat, i) in stats" :key="i" class="stat-card" :class="{ 'stat-card-results': stat.highlight }">
        <span class="stat-number" :class="{ 'stat-number-results': stat.highlight }">{{ stat.number }}</span>
        <span class="stat-label">{{ stat.label }}</span>
      </div>
    </div>

    <div v-if="$slots.toolbar" class="toolbar">
      <slot name="toolbar" />
    </div>

    <slot name="subtoolbar" />

    <div v-if="status === 'pending'" class="state-message">
      <span class="state-sigil">۞</span>
      <p>{{ loadingText }}</p>
    </div>

    <div v-else-if="error" class="state-message state-error">
      <p>Les archives refusent de répondre : {{ errorMessage }}</p>
    </div>

    <div v-else-if="resultCount === 0" class="state-message">
      <p>{{ emptyText }}</p>
    </div>

    <slot v-else />

    <slot name="footer" />
  </main>
</template>
