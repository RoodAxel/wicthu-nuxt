<script setup lang="ts">
import type { Competence } from '@prisma/client'

type CompetenceWithCategory = Competence & {
  category: { id: number; name: string } | null
}

const { data: competences, status, error } = useFetch<CompetenceWithCategory[]>('/api/competence')

const search = ref('')
const activeFilter = ref<'all' | 'rare' | 'modern'>('all')
const selectedCategories = ref<Set<number>>(new Set())
const categoryDropdownOpen = ref(false)
const categoryDropdownRef = ref<HTMLElement | null>(null)
const sortName = ref<'asc' | 'desc' | null>('asc')
const sortBase = ref<'asc' | 'desc' | null>(null)

const categories = computed(() =>
  competences.value?.filter(c => c.isCategory).map(c => ({ id: c.id, name: c.name })) ?? []
)

function toggleCategory(id: number) {
  const next = new Set(selectedCategories.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  selectedCategories.value = next
}

function removeCategory(id: number) {
  const next = new Set(selectedCategories.value)
  next.delete(id)
  selectedCategories.value = next
}

function cycleSortName() {
  sortBase.value = null
  sortName.value = sortName.value === 'asc' ? 'desc' : 'asc'
}

function cycleSortBase() {
  sortName.value = null
  if (sortBase.value === null) sortBase.value = 'desc'
  else if (sortBase.value === 'desc') sortBase.value = 'asc'
  else sortBase.value = null
}

function handleClickOutside(e: MouseEvent) {
  if (categoryDropdownRef.value && !categoryDropdownRef.value.contains(e.target as Node)) {
    categoryDropdownOpen.value = false
  }
}

onMounted(() => document.addEventListener('mousedown', handleClickOutside))
onUnmounted(() => document.removeEventListener('mousedown', handleClickOutside))

const filtered = computed(() => {
  if (!competences.value) return []

  const q = normalizeStr(search.value.trim())

  let result = competences.value.filter((c) => {
    if (q) {
      const matchName = normalizeStr(c.name).includes(q)
      const matchBase = !c.isCategory && String(c.baseValue ?? 0).includes(q)
      if (!matchName && !matchBase) return false
    }

    if (activeFilter.value === 'rare' && !c.rare) return false
    if (activeFilter.value === 'modern' && !c.modern) return false

    if (selectedCategories.value.size > 0) {
      if (!c.category || !selectedCategories.value.has(c.category.id)) return false
    }

    return true
  })

  if (sortName.value) {
    result = [...result].sort((a, b) => {
      const cmp = a.name.localeCompare(b.name, 'fr')
      return sortName.value === 'asc' ? cmp : -cmp
    })
  } else if (sortBase.value) {
    result = [...result].sort((a, b) => {
      const av = a.isCategory ? -1 : (a.baseValue ?? 0)
      const bv = b.isCategory ? -1 : (b.baseValue ?? 0)
      return sortBase.value === 'desc' ? bv - av : av - bv
    })
  }

  return result
})

const stats = computed(() => ({
  total: competences.value?.length ?? 0,
  categories: competences.value?.filter(c => c.isCategory).length ?? 0,
  rare: competences.value?.filter(c => c.rare).length ?? 0,
  modern: competences.value?.filter(c => c.modern).length ?? 0
}))

const sortNameIcon = computed(() => {
  if (sortName.value === 'asc') return '↑'
  if (sortName.value === 'desc') return '↓'
  return '↕'
})

const sortBaseIcon = computed(() => {
  if (sortBase.value === 'desc') return '↓'
  if (sortBase.value === 'asc') return '↑'
  return '↕'
})

const selectedCategoryNames = computed(() =>
  categories.value.filter(c => selectedCategories.value.has(c.id))
)
</script>

<template>
  <main class="page-wrapper">

    <div class="page-header">
      <h1 class="page-title">Compétences</h1>
      <p class="page-subtitle">Savoir-faire et aptitudes des investigateurs de Providence</p>
    </div>

    <blockquote class="flavor-quote">
      <p>L'homme cultivé n'est jamais sans ressource — c'est dans la connaissance que réside la mince barrière entre la raison et l'abîme.</p>
      <cite>— Manuel de l'Investigateur, Arkham 1923</cite>
    </blockquote>

    <div class="stats-panel">
      <div class="stat-card">
        <span class="stat-number">{{ stats.total }}</span>
        <span class="stat-label">Compétences</span>
      </div>
      <div class="stat-card">
        <span class="stat-number">{{ stats.categories }}</span>
        <span class="stat-label">Catégories</span>
      </div>
      <div class="stat-card">
        <span class="stat-number">{{ stats.rare }}</span>
        <span class="stat-label">Rares</span>
      </div>
      <div class="stat-card">
        <span class="stat-number">{{ stats.modern }}</span>
        <span class="stat-label">Modernes</span>
      </div>
      <div class="stat-card stat-card-results">
        <span class="stat-number stat-number-results">{{ filtered.length }}</span>
        <span class="stat-label">Résultats</span>
      </div>
    </div>

    <div class="toolbar">
      <div class="filters">
        <button class="tag" :class="{ active: activeFilter === 'all' }" @click="activeFilter = 'all'">Toutes</button>

        <!-- Dropdown catégories -->
        <div ref="categoryDropdownRef" class="dropdown-wrapper">
          <button
            class="tag"
            :class="{ active: selectedCategories.size > 0 }"
            @click="categoryDropdownOpen = !categoryDropdownOpen"
          >
            Catégories
            <span class="dropdown-caret">{{ categoryDropdownOpen ? '▲' : '▼' }}</span>
          </button>
          <div v-if="categoryDropdownOpen" class="dropdown-menu">
            <button
              v-for="cat in categories"
              :key="cat.id"
              class="dropdown-item"
              :class="{ selected: selectedCategories.has(cat.id) }"
              @click="toggleCategory(cat.id)"
            >
              <span class="dropdown-check">{{ selectedCategories.has(cat.id) ? '✓' : '' }}</span>
              {{ cat.name }}
            </button>
          </div>
        </div>

        <button class="tag rare-tag" :class="{ active: activeFilter === 'rare' }" @click="activeFilter = 'rare'">Rare</button>
        <button class="tag" :class="{ active: activeFilter === 'modern' }" @click="activeFilter = 'modern'">Moderne</button>
      </div>
      <div class="search-bar">
        <span class="search-icon">🔍</span>
        <input v-model="search" type="text" class="search-input" placeholder="Nom ou valeur de base…">
      </div>
    </div>

    <!-- Catégories actives -->
    <div v-if="selectedCategoryNames.length > 0" class="active-filters">
      <span
        v-for="cat in selectedCategoryNames"
        :key="cat.id"
        class="active-category-filter"
      >
        <span class="active-category-label">{{ cat.name }}</span>
        <button class="active-category-clear" :aria-label="`Retirer ${cat.name}`" @click="removeCategory(cat.id)">✕</button>
      </span>
    </div>

    <div v-if="status === 'pending'" class="state-message">
      <span class="state-sigil">۞</span>
      <p>Consultation des archives…</p>
    </div>

    <div v-else-if="error" class="state-message state-error">
      <p>Les archives refusent de répondre : {{ error.message }}</p>
    </div>

    <div v-else-if="filtered.length === 0" class="state-message">
      <p>Aucune compétence ne correspond à votre requête.</p>
    </div>

    <div v-else class="list-container">
      <div class="list-header-row">
        <button class="col-name col-sortable" :class="{ 'sort-active': sortName !== null }" @click="cycleSortName">
          Compétence <span class="sort-icon">{{ sortNameIcon }}</span>
        </button>
        <span class="col-category">Catégorie</span>
        <span class="col-badge">Type</span>
        <button class="col-base col-sortable" :class="{ 'sort-active': sortBase !== null }" @click="cycleSortBase">
          Base <span class="sort-icon">{{ sortBaseIcon }}</span>
        </button>
      </div>
      <div class="list-body">
        <div
          v-for="(competence, index) in filtered"
          :key="competence.id"
          class="list-row"
          :class="{
            'row-even': index % 2 === 0,
            'row-odd': index % 2 !== 0,
            'is-category': competence.isCategory
          }"
        >
          <span class="col-name row-name">{{ competence.name }}</span>
          <span class="col-category row-category">{{ competence.category?.name ?? '—' }}</span>
          <span class="col-badge">
            <span v-if="competence.isCategory" class="card-badge badge-category">Catégorie</span>
            <span v-else-if="competence.rare" class="card-badge badge-rare">Rare</span>
            <span v-else-if="competence.modern" class="card-badge badge-modern">Moderne</span>
          </span>
          <span class="col-base row-base">
            <template v-if="!competence.isCategory">
              <span class="base-value-number">{{ competence.baseValue ?? 0 }}</span>
              <span class="base-value-pct">%</span>
            </template>
            <span v-else class="row-dash">—</span>
          </span>
        </div>
      </div>
    </div>

    <!-- Légende des badges -->
    <div class="legend">
      <span class="legend-title">Légende</span>
      <div class="legend-item">
        <span class="card-badge badge-rare">Rare</span>
        <span class="legend-desc">Absente de la fiche investigateur de base — à inscrire manuellement dans un champ vide en fin de fiche</span>
      </div>
      <div class="legend-item">
        <span class="card-badge badge-modern">Moderne</span>
        <span class="legend-desc">Disponible uniquement à l'époque moderne</span>
      </div>
    </div>

  </main>
</template>

<style scoped>
.page-wrapper {
  padding: var(--space-xl);
  max-width: 1200px;
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
  background: var(--color-arcane);
}
.page-title {
  font-family: var(--font-heading);
  font-size: var(--fs-page-title);
  font-weight: 600;
  letter-spacing: 0.06em;
  color: var(--color-text-primary);
  margin-bottom: var(--space-xs);
}
.page-subtitle {
  font-family: var(--font-flavor);
  font-style: italic;
  color: var(--color-text-secondary);
  font-size: var(--fs-page-subtitle);
}

/* ── FLAVOR QUOTE ────────────────────────────────────────── */
.flavor-quote {
  background: var(--color-void);
  border-left: 2px solid var(--color-arcane-dim);
  padding: var(--space-lg);
  margin-bottom: var(--space-xl);
  border-radius: 0 var(--radius-md) var(--radius-md) 0;
}
.flavor-quote p {
  font-family: var(--font-flavor);
  font-style: italic;
  font-size: var(--fs-flavor-quote);
  color: var(--color-text-secondary);
  line-height: 1.8;
}
.flavor-quote cite {
  display: block;
  margin-top: var(--space-sm);
  font-family: var(--font-heading);
  font-size: var(--fs-section-title);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-text-muted);
}

/* ── STATS PANEL ─────────────────────────────────────────── */
.stats-panel {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: var(--space-md);
  margin-bottom: var(--space-xl);
}

.stat-card-results {
  border-color: var(--color-arcane-dim);
}
.stat-number-results {
  color: var(--color-text-primary);
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
  font-size: var(--fs-stat-number);
  color: var(--color-arcane);
  display: block;
  line-height: 1;
  margin-bottom: var(--space-xs);
}
.stat-label {
  font-family: var(--font-heading);
  font-size: var(--fs-stat-label);
  font-weight: bold;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--color-text-muted);
}

/* ── LEGEND ──────────────────────────────────────────────── */
.legend {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  margin-top: var(--space-md);
  padding: var(--space-sm) var(--space-md);
  background: var(--color-void);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}

.legend-title {
  font-family: var(--font-heading);
  font-size: var(--fs-badge);
  font-weight: bold;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-text-muted);
  flex-shrink: 0;
}

.legend-item {
  display: inline-flex;
  align-items: center;
  gap: var(--space-sm);
}

.legend-desc {
  font-family: var(--font-flavor);
  font-style: italic;
  font-size: var(--fs-secondary);
  color: var(--color-text-muted);
}

/* ── TOOLBAR ─────────────────────────────────────────────── */
.toolbar {
  display: flex;
  align-items: center;
  gap: var(--space-lg);
  margin-bottom: var(--space-md);
  flex-wrap: wrap;
}
.filters {
  display: flex;
  gap: var(--space-sm);
  flex-wrap: wrap;
  align-items: center;
}

/* ── TAGS ────────────────────────────────────────────────── */
.tag {
  font-family: var(--font-heading);
  font-size: var(--fs-badge);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  padding: var(--space-xs) var(--space-md);
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
  background: transparent;
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
}
.tag:hover { border-color: var(--color-arcane-dim); color: var(--color-arcane); }
.tag.active {
  background: var(--color-arcane-dim);
  border-color: var(--color-arcane);
  color: var(--color-arcane);
}
.tag.rare-tag { border-color: var(--color-gold-dim); color: var(--color-gold); }
.tag.rare-tag:hover { border-color: var(--color-gold); }
.tag.rare-tag.active { background: var(--color-gold-dim); border-color: var(--color-gold); color: var(--color-gold); }

.dropdown-caret {
  font-size: 0.5rem;
  opacity: 0.6;
}

/* ── DROPDOWN ────────────────────────────────────────────── */
.dropdown-wrapper {
  position: relative;
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  z-index: 50;
  background: var(--color-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  min-width: 200px;
  max-height: 280px;
  overflow-y: auto;
  box-shadow: var(--shadow-deep);
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  width: 100%;
  padding: var(--space-sm) var(--space-md);
  background: transparent;
  border: none;
  color: var(--color-text-secondary);
  font-family: var(--font-heading);
  font-size: var(--fs-badge);
  letter-spacing: 0.08em;
  text-align: left;
  cursor: pointer;
  transition: background var(--transition-fast), color var(--transition-fast);
}
.dropdown-item:hover {
  background: var(--color-surface);
  color: var(--color-text-primary);
}
.dropdown-item.selected {
  color: var(--color-arcane);
}

.dropdown-check {
  width: 14px;
  font-size: 0.7rem;
  color: var(--color-arcane);
  flex-shrink: 0;
}

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
  font-size: var(--fs-secondary);
  pointer-events: none;
}
.search-input {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-sm) var(--space-lg) var(--space-sm) 2.5rem;
  color: var(--color-text-primary);
  font-family: var(--font-body);
  font-size: var(--fs-field-input);
  width: 240px;
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
  outline: none;
}
.search-input::placeholder { color: var(--color-text-muted); font-style: italic; }
.search-input:focus {
  border-color: var(--color-arcane-dim);
  box-shadow: var(--shadow-glow);
}

/* ── ACTIVE CATEGORY FILTERS ─────────────────────────────── */
.active-filters {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
  margin-bottom: var(--space-md);
}

.active-category-filter {
  display: inline-flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-xs) var(--space-sm) var(--space-xs) var(--space-md);
  background: rgba(184, 146, 74, 0.1);
  border: 1px solid var(--color-gold-dim);
  border-radius: var(--radius-sm);
}

.active-category-label {
  font-family: var(--font-heading);
  font-size: var(--fs-secondary);
  font-weight: bold;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-gold);
}

.active-category-clear {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  font-size: var(--fs-micro);
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-gold-dim);
  color: var(--color-gold);
  background: transparent;
  cursor: pointer;
  transition: all var(--transition-fast);
  line-height: 1;
}
.active-category-clear:hover {
  background: var(--color-gold-dim);
}

/* ── STATE MESSAGES ──────────────────────────────────────── */
.state-message {
  text-align: center;
  padding: var(--space-2xl);
  color: var(--color-text-muted);
  font-family: var(--font-flavor);
}
.state-sigil {
  display: block;
  font-size: var(--fs-sigil);
  margin-bottom: var(--space-md);
  color: var(--color-arcane);
  animation: pulse-sigil 2s ease-in-out infinite;
}
@keyframes pulse-sigil {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 1; }
}
.state-error { color: var(--color-crimson); }

/* ── COMPETENCE LIST ─────────────────────────────────────── */
.list-container {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.list-header-row,
.list-row {
  display: grid;
  grid-template-columns: 2fr 1.5fr 120px 80px;
  align-items: center;
  padding: var(--space-sm) var(--space-lg);
  gap: var(--space-md);
}

.list-header-row {
  background: var(--color-elevated);
  border-bottom: 1px solid var(--color-border);
  font-family: var(--font-heading);
  font-size: var(--fs-table-header);
  font-weight: bold;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--color-text-muted);
}

.col-sortable {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  background: transparent;
  border: none;
  font-family: var(--font-heading);
  font-size: var(--fs-table-header);
  font-weight: bold;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--color-text-muted);
  cursor: pointer;
  padding: 0;
  transition: color var(--transition-fast);
}
.col-sortable:hover { color: var(--color-arcane); }
.col-sortable.sort-active { color: var(--color-arcane); }

.sort-icon {
  font-size: 0.7rem;
  opacity: 0.7;
}

.list-body {
  height: 520px;
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
.list-body::-webkit-scrollbar-thumb:hover { background: var(--color-arcane-dim); }

.list-row {
  transition: background var(--transition-fast);
  cursor: default;
}
.row-even { background: var(--color-surface); }
.row-odd  { background: var(--color-deep); }
.list-row:hover { background: var(--color-elevated); }

.list-row.is-category .row-name { color: var(--color-gold); }

.row-name {
  font-family: var(--font-heading);
  font-size: var(--fs-row-name);
  font-weight: 600;
  letter-spacing: 0.03em;
  color: var(--color-text-primary);
}

.row-category {
  font-family: var(--font-flavor);
  font-style: italic;
  font-size: var(--fs-row-desc);
  color: var(--color-text-muted);
}

.card-badge {
  font-family: var(--font-heading);
  font-size: var(--fs-secondary);
  letter-spacing: 0.15em;
  text-transform: uppercase;
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  white-space: nowrap;
}
.badge-category { background: rgba(184, 146, 74, 0.15); color: var(--color-gold);   border: 1px solid var(--color-gold-dim); }
.badge-rare     { background: rgba(139, 58, 58, 0.15);  color: #c47070;             border: 1px solid var(--color-crimson-dim); }
.badge-modern   { background: rgba(127, 179, 138, 0.15);color: var(--color-arcane); border: 1px solid var(--color-arcane-dim); }

.row-base {
  display: flex;
  align-items: baseline;
  gap: 2px;
}
.base-value-number {
  font-family: var(--font-heading);
  font-size: var(--fs-row-value);
  font-weight: 700;
  color: var(--color-arcane);
}
.base-value-pct {
  font-size: var(--fs-row-value);
  color: var(--color-text-muted);
}
.row-dash {
  color: var(--color-text-muted);
  font-size: var(--fs-body);
}

/* ── RESPONSIVE ──────────────────────────────────────────── */
@media (max-width: 1024px) {
  .list-header-row,
  .list-row { grid-template-columns: 2fr 1fr 100px 70px; }
}

@media (max-width: 640px) {
  .page-wrapper { padding: var(--space-md); }
  .flavor-quote p { font-size: var(--fs-page-subtitle); }
  .stats-panel { grid-template-columns: repeat(3, 1fr); }
  .toolbar { flex-direction: column; align-items: stretch; gap: var(--space-sm); }
  .filters { flex-wrap: wrap; }
  .search-bar { margin-left: 0; width: 100%; }
  .search-input { width: 100%; box-sizing: border-box; }
  .list-header-row,
  .list-row { grid-template-columns: 1fr 70px; }
  .col-category, .col-badge { display: none; }
  .list-body { max-height: 380px; }
}
</style>
