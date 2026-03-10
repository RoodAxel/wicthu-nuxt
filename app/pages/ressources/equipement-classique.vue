<script setup lang="ts">
import type { equipement_classique } from '@prisma/client'

const { data: items, status, error } = await useFetch<equipement_classique[]>('/api/equipement-classique')

const search = ref('')
const categoryFilter = ref<string | null>(null)

const categories = computed(() => {
  if (!items.value) return []
  return [...new Set(items.value.map(e => e.category).filter(Boolean))].sort() as string[]
})

const filtered = computed(() => {
  if (!items.value) return []
  return items.value.filter((e) => {
    if (categoryFilter.value && e.category !== categoryFilter.value) return false
    if (search.value && !e.name.toLowerCase().includes(search.value.toLowerCase())) return false
    return true
  })
})

const stats = computed(() => ({
  total: items.value?.length ?? 0,
  categories: categories.value.length,
  superior: items.value?.filter(e => e.superior).length ?? 0,
}))

function formatPrice(base: number, max: number | null, unit: string | null, superior: boolean) {
  const price = max ? `${base} - ${max}$` : `${base}$`
  const withUnit = unit ? `${price}/${unit.toLowerCase()}` : price
  return superior ? `${withUnit}+` : withUnit
}
</script>

<template>
  <main class="page-wrapper">

    <div class="page-header">
      <h1 class="page-title">Équipement Classique</h1>
      <p class="page-subtitle">Matériel et fournitures de l'ère classique (années 1920)</p>
    </div>

    <blockquote class="flavor-quote">
      <p>Dans les ruelles sombres d'Arkham, un bon imperméable et une lampe de poche fiable valent parfois mieux qu'un revolver.</p>
      <cite>— Guide du voyageur de la Nouvelle-Angleterre, 1923</cite>
    </blockquote>

    <div class="stats-panel">
      <div class="stat-card">
        <span class="stat-number">{{ stats.total }}</span>
        <span class="stat-label">Articles</span>
      </div>
      <div class="stat-card">
        <span class="stat-number">{{ stats.categories }}</span>
        <span class="stat-label">Catégories</span>
      </div>
      <div class="stat-card">
        <span class="stat-number">{{ stats.superior }}</span>
        <span class="stat-label">Supérieurs</span>
      </div>
      <div class="stat-card">
        <span class="stat-number">{{ filtered.length }}</span>
        <span class="stat-label">Résultats</span>
      </div>
    </div>

    <div class="toolbar">
      <select v-model="categoryFilter" class="category-select">
        <option :value="null">Toutes les catégories</option>
        <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
      </select>
      <div class="search-bar">
        <span class="search-icon">🔍</span>
        <input v-model="search" type="text" class="search-input" placeholder="Rechercher un article…">
      </div>
    </div>

    <div v-if="status === 'pending'" class="state-message">
      <span class="state-sigil">⬡</span>
      <p>Consultation du catalogue…</p>
    </div>
    <div v-else-if="error" class="state-message state-error">
      <p>Les archives refusent de répondre : {{ error.message }}</p>
    </div>
    <div v-else-if="filtered.length === 0" class="state-message">
      <p>Aucun article ne correspond à votre requête.</p>
    </div>

    <div v-else class="list-container">
      <div class="list-header-row">
        <span class="col-name">Article</span>
        <span class="col-category">Catégorie</span>
        <span class="col-price">Prix</span>
      </div>
      <div class="list-body">
        <div
          v-for="(item, index) in filtered"
          :key="item.id"
          class="list-row"
          :class="index % 2 === 0 ? 'row-even' : 'row-odd'"
        >
          <span class="col-name row-name">{{ item.name }}</span>
          <span class="col-category row-category">{{ item.category ?? '—' }}</span>
          <span class="col-price row-price">{{ formatPrice(item.base_price, item.max_price, item.unit, item.superior) }}</span>
        </div>
      </div>
    </div>

  </main>
</template>

<style scoped>
.page-wrapper {
  padding: var(--space-xl);
  max-width: 1000px;
  margin: 0 auto;
}

/* ── PAGE HEADER ─────────────────────────────────────────── */
.page-header {
  margin-bottom: var(--space-xl);
  padding-bottom: var(--space-lg);
  border-bottom: 1px solid var(--color-border);
  position: relative;
}
.page-header::after {
  content: '';
  position: absolute;
  bottom: -1px; left: 0;
  width: 80px; height: 1px;
  background: var(--color-gold);
}
.page-title {
  font-family: var(--font-heading);
  font-size: var(--fs-2xl);
  font-weight: 600;
  letter-spacing: 0.06em;
  color: var(--color-text-primary);
  margin-bottom: var(--space-xs);
}
.page-subtitle {
  font-family: var(--font-flavor);
  font-style: italic;
  color: var(--color-text-secondary);
  font-size: var(--fs-lg);
}

/* ── FLAVOR QUOTE ────────────────────────────────────────── */
.flavor-quote {
  background: var(--color-void);
  border-left: 2px solid var(--color-gold-dim);
  padding: var(--space-lg);
  margin-bottom: var(--space-xl);
  border-radius: 0 var(--radius-md) var(--radius-md) 0;
}
.flavor-quote p {
  font-family: var(--font-flavor);
  font-style: italic;
  font-size: var(--fs-xl);
  color: var(--color-text-secondary);
  line-height: 1.8;
}
.flavor-quote cite {
  display: block;
  margin-top: var(--space-sm);
  font-family: var(--font-heading);
  font-size: var(--fs-sm);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-text-muted);
}

/* ── STATS ───────────────────────────────────────────────── */
.stats-panel {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-md);
  margin-bottom: var(--space-xl);
}
.stat-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-md);
  text-align: center;
}
.stat-number {
  font-family: var(--font-display);
  font-size: var(--fs-2xl);
  color: var(--color-gold);
  display: block;
  line-height: 1;
  margin-bottom: var(--space-xs);
}
.stat-label {
  font-family: var(--font-heading);
  font-size: var(--fs-2xs);
  font-weight: bold;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--color-text-muted);
}

/* ── TOOLBAR ─────────────────────────────────────────────── */
.toolbar {
  display: flex;
  align-items: center;
  gap: var(--space-lg);
  margin-bottom: var(--space-xl);
  flex-wrap: wrap;
}
.category-select {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-xs) var(--space-md);
  color: var(--color-text-secondary);
  font-family: var(--font-heading);
  font-size: var(--fs-md);
  cursor: pointer;
  outline: none;
  transition: border-color var(--transition-fast);
}
.category-select:focus { border-color: var(--color-gold-dim); }
.search-bar { position: relative; margin-left: auto; }
.search-icon {
  position: absolute;
  left: var(--space-sm);
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-text-muted);
  font-size: var(--fs-md);
  pointer-events: none;
}
.search-input {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-sm) var(--space-lg) var(--space-sm) 2.5rem;
  color: var(--color-text-primary);
  font-family: var(--font-body);
  font-size: var(--fs-lg);
  width: 260px;
  outline: none;
  transition: border-color var(--transition-fast);
}
.search-input::placeholder { color: var(--color-text-muted); font-style: italic; }
.search-input:focus { border-color: var(--color-gold-dim); box-shadow: 0 0 0 2px rgba(184,146,74,0.15); }

/* ── STATE ───────────────────────────────────────────────── */
.state-message {
  text-align: center;
  padding: var(--space-2xl);
  color: var(--color-text-muted);
  font-family: var(--font-flavor);
  font-style: italic;
}
.state-sigil {
  display: block;
  font-size: var(--fs-4xl);
  margin-bottom: var(--space-md);
  color: var(--color-gold);
  animation: pulse-sigil 2s ease-in-out infinite;
}
@keyframes pulse-sigil { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; } }
.state-error { color: var(--color-crimson); }

/* ── LIST ────────────────────────────────────────────────── */
.list-container {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
}
.list-header-row,
.list-row {
  display: grid;
  grid-template-columns: 1fr 180px 160px;
  align-items: center;
  padding: var(--space-sm) var(--space-lg);
  gap: var(--space-md);
}
.list-header-row {
  background: var(--color-elevated);
  border-bottom: 1px solid var(--color-border);
  font-family: var(--font-heading);
  font-size: var(--fs-xs);
  font-weight: bold;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--color-text-muted);
}
.list-body {
  max-height: 580px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--color-border) transparent;
}
.list-body::-webkit-scrollbar { width: 6px; }
.list-body::-webkit-scrollbar-thumb { background: var(--color-border); border-radius: 3px; }
.list-body::-webkit-scrollbar-thumb:hover { background: var(--color-gold-dim); }

.list-row { transition: background var(--transition-fast); }
.row-even { background: var(--color-surface); }
.row-odd  { background: var(--color-deep); }
.list-row:hover { background: var(--color-elevated); }

.row-id { font-family: var(--font-heading); font-size: var(--fs-sm); color: var(--color-text-muted); }
.row-name { font-family: var(--font-heading); font-size: var(--fs-md); font-weight: 600; letter-spacing: 0.03em; color: var(--color-text-primary); }
.row-category { font-family: var(--font-flavor); font-style: italic; font-size: var(--fs-base); color: var(--color-text-muted); }
.row-price { font-family: var(--font-body); font-size: var(--fs-base); color: var(--color-gold); }
.row-dash { color: var(--color-text-muted); font-size: var(--fs-md); }
.superior-badge { font-size: var(--fs-sm); color: var(--color-gold); }

/* ── RESPONSIVE ──────────────────────────────────────────── */
@media (max-width: 640px) {
  .page-wrapper { padding: var(--space-md); }
  .flavor-quote p { font-size: var(--fs-lg); }
  .stats-panel { grid-template-columns: repeat(2, 1fr); }
  .toolbar { flex-direction: column; align-items: stretch; gap: var(--space-sm); }
  .category-select { width: 100%; box-sizing: border-box; }
  .search-bar { margin-left: 0; width: 100%; }
  .search-input { width: 100%; box-sizing: border-box; }
  .list-header-row, .list-row { grid-template-columns: 1fr 120px; }
  .col-category { display: none; }
  .list-body { max-height: 380px; }
}
</style>
