<script setup lang="ts">
import type { arme, Competence } from '@prisma/client'

type WeaponWithSkill = arme & {
  competence: Pick<Competence, 'id' | 'name'>
}

const { data: weapons, status, error } = await useFetch<WeaponWithSkill[]>('/api/arme')

const search = ref('')
const eraFilter = ref<'all' | 'classique' | 'moderne'>('all')

const categories = computed(() => {
  if (!weapons.value) return []
  return [...new Set(weapons.value.map(w => w.category))].sort()
})

const categoryFilter = ref<string | null>(null)

const filtered = computed(() => {
  if (!weapons.value) return []
  return weapons.value.filter((w) => {
    const matchSearch = w.name.toLowerCase().includes(search.value.toLowerCase())
    if (!matchSearch) return false
    if (categoryFilter.value && w.category !== categoryFilter.value) return false
    if (eraFilter.value !== 'all' && !w.epoque.includes(eraFilter.value)) return false
    return true
  })
})

const stats = computed(() => ({
  total: weapons.value?.length ?? 0,
  categories: categories.value.length,
  classic: weapons.value?.filter(w => w.epoque.includes('classique')).length ?? 0,
  modern: weapons.value?.filter(w => w.epoque.includes('moderne')).length ?? 0,
}))
</script>

<template>
  <main class="page-wrapper">

    <div class="page-header">
      <h1 class="page-title">Armurerie</h1>
      <p class="page-subtitle">Arsenal des investigateurs et équipements de combat</p>
    </div>

    <blockquote class="flavor-quote">
      <p>Dans les ruelles sombres d'Arkham comme dans les jungles d'Afrique, l'acier reste la dernière réponse aux horreurs que la raison refuse d'admettre.</p>
      <cite>— Registre du Commissariat d'Arkham, 1923</cite>
    </blockquote>

    <div class="stats-panel">
      <div class="stat-card">
        <span class="stat-number">{{ stats.total }}</span>
        <span class="stat-label">Armes</span>
      </div>
      <div class="stat-card">
        <span class="stat-number">{{ stats.categories }}</span>
        <span class="stat-label">Catégories</span>
      </div>
      <div class="stat-card">
        <span class="stat-number">{{ stats.classic }}</span>
        <span class="stat-label">Classiques</span>
      </div>
      <div class="stat-card">
        <span class="stat-number">{{ stats.modern }}</span>
        <span class="stat-label">Modernes</span>
      </div>
    </div>

    <div class="toolbar">
      <div class="filters">
        <button class="tag" :class="{ active: eraFilter === 'all' }" @click="eraFilter = 'all'">Toutes</button>
        <button class="tag" :class="{ active: eraFilter === 'classique' }" @click="eraFilter = 'classique'">Classique</button>
        <button class="tag modern-tag" :class="{ active: eraFilter === 'moderne' }" @click="eraFilter = 'moderne'">Moderne</button>
      </div>

      <div class="category-select-wrapper">
        <select v-model="categoryFilter" class="category-select">
          <option :value="null">Toutes les catégories</option>
          <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
        </select>
      </div>

      <div class="search-bar">
        <span class="search-icon">🔍</span>
        <input v-model="search" type="text" class="search-input" placeholder="Rechercher une arme…">
      </div>
    </div>

    <div v-if="status === 'pending'" class="state-message">
      <span class="state-sigil">⬡</span>
      <p>Consultation des registres…</p>
    </div>

    <div v-else-if="error" class="state-message state-error">
      <p>Les archives refusent de répondre : {{ error.message }}</p>
    </div>

    <div v-else-if="filtered.length === 0" class="state-message">
      <p>Aucune arme ne correspond à votre requête.</p>
    </div>

    <div v-else class="table-outer">
      <div class="table-scroll">
        <div class="list-header-row">
          <span class="col-name">Arme</span>
          <span class="col-category">Catégorie</span>
          <span class="col-skill">Compétence</span>
          <span class="col-damage">Dégâts</span>
          <span class="col-range">Portée</span>
          <span class="col-cadence">Cadence</span>
          <span class="col-capacity">Cap.</span>
          <span class="col-failure">Panne</span>
          <span class="col-price">Prix</span>
          <span class="col-era">Époque</span>
        </div>

        <div class="list-body">
          <div
            v-for="(weapon, index) in filtered"
            :key="weapon.id"
            class="list-row"
            :class="index % 2 === 0 ? 'row-even' : 'row-odd'"
          >
            <span class="col-name row-name">{{ weapon.name }}</span>
            <span class="col-category row-muted">{{ weapon.category.toLowerCase() }}</span>
            <span class="col-skill row-skill">{{ weapon.competence.name }}</span>
            <span class="col-damage row-value">{{ weapon.damage ?? '—' }}</span>
            <span class="col-range row-muted">{{ weapon.range ?? '—' }}</span>
            <span class="col-cadence row-muted">{{ weapon.cadence ?? '—' }}</span>
            <span class="col-capacity row-muted">{{ weapon.capacity ?? '—' }}</span>
            <span class="col-failure row-failure">{{ weapon.failure ?? '—' }}</span>
            <span class="col-price">
              <span v-if="weapon.classic_price" class="price-classic">{{ weapon.classic_price }}$</span>
              <span v-if="weapon.classic_price && weapon.modern_price" class="price-sep">/</span>
              <span v-if="weapon.modern_price" class="price-modern">{{ weapon.modern_price }}$</span>
              <span v-if="!weapon.classic_price && !weapon.modern_price" class="row-muted">—</span>
            </span>
            <span class="col-era">
              <span v-for="era in weapon.epoque" :key="era" class="era-badge" :class="`era-${era}`">
                {{ era === 'classique' ? 'C' : era === 'moderne' ? 'M' : era }}
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>

  </main>
</template>

<style scoped>
.page-wrapper {
  padding: var(--space-xl);
  max-width: 1400px;
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
  bottom: -1px;
  left: 0;
  width: 80px;
  height: 1px;
  background: var(--color-crimson);
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
  border-left: 2px solid var(--color-crimson-dim);
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

/* ── STATS PANEL ─────────────────────────────────────────── */
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
  color: var(--color-crimson);
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
.filters {
  display: flex;
  gap: var(--space-sm);
  flex-wrap: wrap;
}

/* ── TAGS ────────────────────────────────────────────────── */
.tag {
  font-family: var(--font-heading);
  font-size: 0.85rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  padding: var(--space-xs) var(--space-md);
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
  background: transparent;
}
.tag:hover { border-color: var(--color-crimson-dim); color: #c47070; }
.tag.active {
  background: var(--color-crimson-dim);
  border-color: var(--color-crimson);
  color: #c47070;
}
.tag.modern-tag { border-color: var(--color-arcane-dim); color: var(--color-arcane); }
.tag.modern-tag:hover { border-color: var(--color-arcane); }
.tag.modern-tag.active { background: var(--color-arcane-dim); border-color: var(--color-arcane); color: var(--color-arcane); }

/* ── CATEGORY SELECT ─────────────────────────────────────── */
.category-select {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-xs) var(--space-md);
  color: var(--color-text-secondary);
  font-family: var(--font-heading);
  font-size: 0.85rem;
  letter-spacing: 0.05em;
  cursor: pointer;
  outline: none;
  transition: border-color var(--transition-fast);
}
.category-select:focus { border-color: var(--color-crimson-dim); }

/* ── SEARCH ──────────────────────────────────────────────── */
.search-bar {
  position: relative;
  margin-left: auto;
}
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
  width: 240px;
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
  outline: none;
}
.search-input::placeholder { color: var(--color-text-muted); font-style: italic; }
.search-input:focus {
  border-color: var(--color-crimson-dim);
  box-shadow: 0 0 0 2px rgba(139, 58, 58, 0.15);
}

/* ── STATE MESSAGES ──────────────────────────────────────── */
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
  color: var(--color-crimson);
  animation: pulse-sigil 2s ease-in-out infinite;
}
@keyframes pulse-sigil {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 1; }
}
.state-error { color: var(--color-crimson); }

/* ── TABLE ───────────────────────────────────────────────── */
.table-outer {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.table-scroll {
  overflow-x: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--color-border) transparent;
}
.table-scroll::-webkit-scrollbar { height: 6px; }
.table-scroll::-webkit-scrollbar-track { background: transparent; }
.table-scroll::-webkit-scrollbar-thumb {
  background: var(--color-border);
  border-radius: 3px;
}

.list-header-row,
.list-row {
  display: grid;
  grid-template-columns: 200px 140px 140px 80px 70px 90px 80px 60px 60px 100px 70px;
  align-items: center;
  padding: var(--space-sm) var(--space-lg);
  gap: var(--space-md);
  min-width: 1200px;
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
  position: sticky;
  top: 0;
  z-index: 1;
}

.list-body {
  max-height: 560px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--color-border) transparent;
}
.list-body::-webkit-scrollbar { width: 6px; }
.list-body::-webkit-scrollbar-track { background: transparent; }
.list-body::-webkit-scrollbar-thumb {
  background: var(--color-border);
  border-radius: 3px;
}
.list-body::-webkit-scrollbar-thumb:hover { background: var(--color-crimson-dim); }

.list-row {
  transition: background var(--transition-fast);
}
.row-even { background: var(--color-surface); }
.row-odd  { background: var(--color-deep); }
.list-row:hover { background: var(--color-elevated); }

/* ── CELL STYLES ─────────────────────────────────────────── */
.row-name {
  font-family: var(--font-heading);
  font-size: 0.9rem;
  font-weight: 600;
  letter-spacing: 0.03em;
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.row-muted {
  font-family: var(--font-flavor);
  font-style: italic;
  font-size: 0.9rem;
  color: var(--color-text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.row-skill {
  font-family: var(--font-heading);
  font-size: 0.75rem;
  letter-spacing: 0.05em;
  color: var(--color-arcane);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.row-value {
  font-family: var(--font-heading);
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-crimson);
}

.row-failure {
  font-family: var(--font-heading);
  font-size: 0.85rem;
  color: var(--color-gold);
}

/* ── PRICE ───────────────────────────────────────────────── */
.col-price {
  display: flex;
  align-items: center;
  gap: 3px;
  font-family: var(--font-heading);
  font-size: 0.75rem;
}
.price-classic { color: var(--color-gold); }
.price-sep { color: var(--color-text-muted); }
.price-modern { color: var(--color-arcane); }

/* ── ERA BADGES ──────────────────────────────────────────── */
.col-era {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}
.era-badge {
  font-family: var(--font-heading);
  font-size: 0.5rem;
  font-weight: bold;
  letter-spacing: 0.1em;
  padding: 2px 5px;
  border-radius: var(--radius-sm);
}
.era-classique {
  background: rgba(184, 146, 74, 0.12);
  color: var(--color-gold);
  border: 1px solid var(--color-gold-dim);
}
.era-moderne {
  background: rgba(127, 179, 138, 0.12);
  color: var(--color-arcane);
  border: 1px solid var(--color-arcane-dim);
}

/* ── RESPONSIVE ──────────────────────────────────────────── */
@media (max-width: 640px) {
  .page-wrapper { padding: var(--space-md); }
  .flavor-quote p { font-size: 1rem; }
  .stats-panel { grid-template-columns: repeat(2, 1fr); }
  .toolbar { flex-direction: column; align-items: stretch; gap: var(--space-sm); }
  .filters { flex-wrap: wrap; }
  .category-select-wrapper { width: 100%; }
  .category-select { width: 100%; box-sizing: border-box; }
  .search-bar { margin-left: 0; width: 100%; }
  .search-input { width: 100%; box-sizing: border-box; }
  .list-body { max-height: 380px; }
}
</style>
