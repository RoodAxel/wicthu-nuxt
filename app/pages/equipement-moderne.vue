<script setup lang="ts">
import type { equipement_moderne } from '@prisma/client'

const { data: items, status, error } = await useFetch<equipement_moderne[]>('/api/equipement-moderne')

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

function formatPrice(base: number, max: number | null, unit: string | null) {
  const suffix = unit ? ` ${unit}` : '$'
  return max ? `${base} – ${max}${suffix}` : `${base}${suffix}`
}
</script>

<template>
  <main class="page-wrapper">

    <div class="page-header">
      <h1 class="page-title">Équipement Moderne</h1>
      <p class="page-subtitle">Matériel et fournitures de l'ère moderne (années 1990)</p>
    </div>

    <blockquote class="flavor-quote">
      <p>La technologie moderne offre plus de lumière dans les ténèbres — mais les ténèbres, elles, ne reculent pas.</p>
      <cite>— Manuel de terrain, Delta Green, 1994</cite>
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
        <span class="col-superior">Sup.</span>
      </div>
      <div class="list-body">
        <div
          v-for="(item, index) in filtered"
          :key="item.id"
          class="list-row"
          :class="index % 2 === 0 ? 'row-even' : 'row-odd'"
        >
          <span class="col-name row-name">{{ item.name }}</span>
          <span class="col-category row-category">{{ item.categorie ?? '—' }}</span>
          <span class="col-price row-price">{{ formatPrice(item.prix_base, item.prix_max, item.unite) }}</span>
          <span class="col-superior">
            <span v-if="item.superieur" class="superior-badge">✦</span>
            <span v-else class="row-dash">—</span>
          </span>
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
  background: var(--color-arcane);
}
.page-title {
  font-family: var(--font-heading);
  font-size: 1.6rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  color: var(--color-text-primary);
  margin-bottom: var(--space-xs);
}
.page-subtitle {
  font-family: var(--font-flavor);
  font-style: italic;
  color: var(--color-text-secondary);
  font-size: 0.95rem;
}

/* ── FLAVOR QUOTE ────────────────────────────────────────── */
.flavor-quote {
  background: var(--color-abyssal);
  border-left: 2px solid var(--color-arcane-dim);
  padding: var(--space-lg);
  margin-bottom: var(--space-xl);
  border-radius: 0 var(--radius-md) var(--radius-md) 0;
}
.flavor-quote p {
  font-family: var(--font-flavor);
  font-style: italic;
  font-size: 1.2rem;
  color: var(--color-text-secondary);
  line-height: 1.8;
}
.flavor-quote cite {
  display: block;
  margin-top: var(--space-sm);
  font-family: var(--font-heading);
  font-size: 0.75rem;
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
  font-size: 1.6rem;
  color: var(--color-arcane);
  display: block;
  line-height: 1;
  margin-bottom: var(--space-xs);
}
.stat-label {
  font-family: var(--font-heading);
  font-size: 0.6rem;
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
  font-size: 0.85rem;
  cursor: pointer;
  outline: none;
  transition: border-color var(--transition-fast);
}
.category-select:focus { border-color: var(--color-arcane-dim); }
.search-bar { position: relative; margin-left: auto; }
.search-icon {
  position: absolute;
  left: var(--space-sm);
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-text-muted);
  font-size: 0.85rem;
  pointer-events: none;
}
.search-input {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-sm) var(--space-lg) var(--space-sm) 2.5rem;
  color: var(--color-text-primary);
  font-family: var(--font-body);
  font-size: 1.1rem;
  width: 260px;
  outline: none;
  transition: border-color var(--transition-fast);
}
.search-input::placeholder { color: var(--color-text-muted); font-style: italic; }
.search-input:focus { border-color: var(--color-arcane-dim); box-shadow: 0 0 0 2px rgba(127,179,138,0.15); }

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
  font-size: 2.5rem;
  margin-bottom: var(--space-md);
  color: var(--color-arcane);
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
  grid-template-columns: 1fr 180px 140px 48px;
  align-items: center;
  padding: var(--space-sm) var(--space-lg);
  gap: var(--space-md);
}
.list-header-row {
  background: var(--color-elevated);
  border-bottom: 1px solid var(--color-border);
  font-family: var(--font-heading);
  font-size: 0.65rem;
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
.list-body::-webkit-scrollbar-thumb:hover { background: var(--color-arcane-dim); }

.list-row { transition: background var(--transition-fast); }
.row-even { background: var(--color-surface); }
.row-odd  { background: var(--color-deep); }
.list-row:hover { background: var(--color-elevated); }

.row-id { font-family: var(--font-heading); font-size: 0.75rem; color: var(--color-text-muted); }
.row-name { font-family: var(--font-heading); font-size: 0.9rem; font-weight: 600; letter-spacing: 0.03em; color: var(--color-text-primary); }
.row-category { font-family: var(--font-flavor); font-style: italic; font-size: 0.9rem; color: var(--color-text-muted); }
.row-price { font-family: var(--font-heading); font-size: 0.85rem; color: var(--color-arcane); }
.row-dash { color: var(--color-text-muted); font-size: 0.85rem; }
.superior-badge { font-size: 0.75rem; color: var(--color-arcane); }

/* ── RESPONSIVE ──────────────────────────────────────────── */
@media (max-width: 640px) {
  .page-wrapper { padding: var(--space-md); }
  .flavor-quote p { font-size: 1rem; }
  .stats-panel { grid-template-columns: repeat(2, 1fr); }
  .toolbar { flex-direction: column; align-items: stretch; gap: var(--space-sm); }
  .category-select { width: 100%; box-sizing: border-box; }
  .search-bar { margin-left: 0; width: 100%; }
  .search-input { width: 100%; box-sizing: border-box; }
  .list-header-row, .list-row { grid-template-columns: 1fr 100px 40px; }
  .col-category { display: none; }
  .list-body { max-height: 380px; }
}
</style>
