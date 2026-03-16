<script setup lang="ts">
import type { equipement_moderne } from '@prisma/client'

const { data: items, status, error } = useFetch<equipement_moderne[]>('/api/equipement-moderne')

// ── FILTRES ───────────────────────────────────────────────────────────────────
const searchName = ref('')
const searchPrice = ref('')

const selectedCategories = ref<Set<string>>(new Set())
const categoryDropdownOpen = ref(false)
const categoryDropdownRef = ref<HTMLElement | null>(null)

// ── TRIS ──────────────────────────────────────────────────────────────────────
const sortCategory = ref<'asc' | 'desc'>('asc')
const sortName = ref<'asc' | 'desc'>('asc')
const sortPrice = ref<'asc' | 'desc' | null>(null)

const sortCategoryIcon = computed(() => sortCategory.value === 'asc' ? '↑' : '↓')
const sortNameIcon = computed(() => sortName.value === 'asc' ? '↑' : '↓')
const sortPriceIcon = computed(() => sortPrice.value === 'asc' ? '↑' : sortPrice.value === 'desc' ? '↓' : '↕')

function cycleSortCategory() {
  sortPrice.value = null
  sortCategory.value = sortCategory.value === 'asc' ? 'desc' : 'asc'
}

function cycleSortName() {
  sortPrice.value = null
  sortName.value = sortName.value === 'asc' ? 'desc' : 'asc'
}

function cycleSortPrice() {
  sortPrice.value = sortPrice.value === null ? 'asc' : sortPrice.value === 'asc' ? 'desc' : null
}

// ── DONNÉES ───────────────────────────────────────────────────────────────────
const categories = computed(() => {
  if (!items.value) return []
  return [...new Set(items.value.map(e => e.category).filter(Boolean))].sort() as string[]
})

const selectedCategoryNames = computed(() =>
  categories.value.filter(c => selectedCategories.value.has(c))
)

function toggleCategory(cat: string) {
  const next = new Set(selectedCategories.value)
  if (next.has(cat)) next.delete(cat)
  else next.add(cat)
  selectedCategories.value = next
}

function removeCategory(cat: string) {
  const next = new Set(selectedCategories.value)
  next.delete(cat)
  selectedCategories.value = next
}

// ── FILTERED + SORTED ─────────────────────────────────────────────────────────
const filtered = computed(() => {
  if (!items.value) return []

  let result = items.value.filter((e) => {
    if (searchName.value.trim() && !normalizeStr(e.name).includes(normalizeStr(searchName.value.trim()))) return false
    if (searchPrice.value.trim()) {
      const q = searchPrice.value.trim()
      const matchBase = String(e.base_price).includes(q)
      const matchMax = e.max_price !== null && String(e.max_price).includes(q)
      if (!matchBase && !matchMax) return false
    }
    if (selectedCategories.value.size > 0 && !selectedCategories.value.has(e.category ?? '')) return false
    return true
  })

  if (sortPrice.value) {
    result = [...result].sort((a, b) =>
      sortPrice.value === 'asc' ? a.base_price - b.base_price : b.base_price - a.base_price
    )
  } else {
    result = [...result].sort((a, b) => {
      const catA = a.category ?? ''
      const catB = b.category ?? ''
      const catCmp = catA.localeCompare(catB, 'fr')
      if (catCmp !== 0) return sortCategory.value === 'asc' ? catCmp : -catCmp
      const nameCmp = a.name.localeCompare(b.name, 'fr')
      return sortName.value === 'asc' ? nameCmp : -nameCmp
    })
  }

  return result
})

const stats = computed(() => ({
  total: items.value?.length ?? 0,
  categories: categories.value.length,
  superior: items.value?.filter(e => e.superior).length ?? 0
}))

function formatPrice(base: number, max: number | null, unit: string | null, superior: boolean) {
  const price = max ? `${base} - ${max}$` : `${base}$`
  const withUnit = unit ? `${price}/${unit.toLowerCase()}` : price
  return superior ? `${withUnit}+` : withUnit
}

function handleClickOutside(e: MouseEvent) {
  if (categoryDropdownRef.value && !categoryDropdownRef.value.contains(e.target as Node)) {
    categoryDropdownOpen.value = false
  }
}

onMounted(() => document.addEventListener('mousedown', handleClickOutside))
onUnmounted(() => document.removeEventListener('mousedown', handleClickOutside))
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
      <!-- Dropdown catégories -->
      <div ref="categoryDropdownRef" class="dropdown-wrapper">
        <button
          class="tag"
          :class="{ active: selectedCategories.size > 0 }"
          @click="categoryDropdownOpen = !categoryDropdownOpen"
        >
          Catégories <span class="dropdown-caret">{{ categoryDropdownOpen ? '▲' : '▼' }}</span>
        </button>
        <div v-if="categoryDropdownOpen" class="dropdown-menu">
          <button
            v-for="cat in categories"
            :key="cat"
            class="dropdown-item"
            :class="{ selected: selectedCategories.has(cat) }"
            @click="toggleCategory(cat)"
          >
            <span class="dropdown-check">{{ selectedCategories.has(cat) ? '✓' : '' }}</span>
            {{ cat }}
          </button>
        </div>
      </div>

      <!-- Recherches -->
      <div class="search-bar">
        <span class="search-icon">🔍</span>
        <input v-model="searchName" type="text" class="search-input" placeholder="Rechercher un article…">
      </div>
      <div class="search-bar">
        <span class="search-icon">🔍</span>
        <input v-model="searchPrice" type="text" class="search-input search-input--sm" placeholder="Prix…">
      </div>
    </div>

    <!-- Catégories actives -->
    <div v-if="selectedCategoryNames.length > 0" class="active-filters">
      <span v-for="cat in selectedCategoryNames" :key="cat" class="active-category-filter">
        <span class="active-category-label">{{ cat }}</span>
        <button class="active-category-clear" :aria-label="`Retirer ${cat}`" @click="removeCategory(cat)">✕</button>
      </span>
    </div>

    <div v-if="status === 'pending'" class="state-message">
      <span class="state-sigil">۞</span>
      <p>Consultation du catalogue…</p>
    </div>
    <div v-else-if="error" class="state-message state-error">
      <p>Les archives refusent de répondre : {{ error.message }}</p>
    </div>
    <div v-else-if="filtered.length === 0" class="state-message">
      <p>Aucun article ne correspond à votre requête.</p>
    </div>

    <div v-else class="list-container">
      <div class="list-body">
        <div class="list-header-row">
          <button class="col-sortable sort-active" @click="cycleSortName">
            Article <span class="sort-icon">{{ sortNameIcon }}</span>
          </button>
          <button class="col-sortable sort-active" @click="cycleSortCategory">
            Catégorie <span class="sort-icon">{{ sortCategoryIcon }}</span>
          </button>
          <button class="col-sortable" :class="{ 'sort-active': sortPrice !== null }" @click="cycleSortPrice">
            Prix <span class="sort-icon">{{ sortPriceIcon }}</span>
          </button>
        </div>
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

    <!-- Légende -->
    <div class="legend">
      <span class="legend-title">Légende</span>
      <div class="legend-item">
        <span class="legend-token">x$ – x$</span>
        <span class="legend-desc">Fourchette de prix — varie selon la qualité de l'article</span>
      </div>
      <div class="legend-item">
        <span class="legend-token">x$<span style="font-size: 1.1rem; font-weight: bold">+</span></span>
        <span class="legend-desc">Prix de départ — peut grimper bien plus haut selon le modèle ou la marque</span>
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
  border-left: 2px solid var(--color-arcane-dim);
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
  color: var(--color-arcane);
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
  gap: var(--space-md);
  margin-bottom: var(--space-md);
  flex-wrap: wrap;
}

/* ── TAG ─────────────────────────────────────────────────── */
.tag {
  font-family: var(--font-heading);
  font-size: var(--fs-md);
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
.tag.active { background: var(--color-arcane-dim); border-color: var(--color-arcane); color: var(--color-arcane); }

/* ── DROPDOWN ────────────────────────────────────────────── */
.dropdown-caret { font-size: 0.5rem; opacity: 0.6; }
.dropdown-wrapper { position: relative; }
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
  font-size: var(--fs-md);
  letter-spacing: 0.08em;
  text-align: left;
  cursor: pointer;
  transition: background var(--transition-fast), color var(--transition-fast);
}
.dropdown-item:hover { background: var(--color-surface); color: var(--color-text-primary); }
.dropdown-item.selected { color: var(--color-arcane); }
.dropdown-check { width: 14px; font-size: 0.7rem; color: var(--color-arcane); flex-shrink: 0; }

/* ── ACTIVE FILTERS ──────────────────────────────────────── */
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
  background: rgba(127, 179, 138, 0.1);
  border: 1px solid var(--color-arcane-dim);
  border-radius: var(--radius-sm);
}
.active-category-label {
  font-family: var(--font-heading);
  font-size: var(--fs-md);
  font-weight: bold;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-arcane);
}
.active-category-clear {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px; height: 18px;
  font-size: var(--fs-2xs);
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-arcane-dim);
  color: var(--color-arcane);
  background: transparent;
  cursor: pointer;
  transition: all var(--transition-fast);
  line-height: 1;
}
.active-category-clear:hover { background: var(--color-arcane-dim); }

/* ── SEARCH ──────────────────────────────────────────────── */
.search-bar { position: relative; }
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
  width: 240px;
  outline: none;
  transition: border-color var(--transition-fast);
}
.search-input--sm { width: 130px; }
.search-input::placeholder { color: var(--color-text-muted); font-style: italic; }
.search-input:focus { border-color: var(--color-arcane-dim); box-shadow: 0 0 0 2px rgba(127,179,138,0.15); }

/* ── STATE ───────────────────────────────────────────────── */
.state-message {
  text-align: center;
  padding: var(--space-2xl);
  color: var(--color-text-muted);
  font-family: var(--font-flavor);
}
.state-sigil {
  display: block;
  font-size: var(--fs-4xl);
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
  position: sticky;
  top: 0;
  z-index: 1;
}

.col-sortable {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  background: transparent;
  border: none;
  font-family: var(--font-heading);
  font-size: var(--fs-xs);
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
.sort-icon { font-size: 0.7rem; opacity: 0.7; }

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

.row-name { font-family: var(--font-heading); font-size: var(--fs-md); font-weight: 600; letter-spacing: 0.03em; color: var(--color-text-primary); }
.row-category { font-family: var(--font-flavor); font-style: italic; font-size: var(--fs-base); color: var(--color-text-muted); }
.row-price { font-family: var(--font-body); font-size: var(--fs-base); color: var(--color-arcane); }

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
  font-size: var(--fs-xs);
  font-weight: bold;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-text-muted);
}
.legend-item {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}
.legend-token {
  font-family: var(--font-heading);
  font-size: var(--fs-2xs);
  font-weight: bold;
  letter-spacing: 0.05em;
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  white-space: nowrap;
  flex-shrink: 0;
  background: rgba(127,179,138,0.1);
  color: var(--color-arcane);
  border: 1px solid var(--color-arcane-dim);
}
.legend-desc {
  font-family: var(--font-flavor);
  font-size: var(--fs-section-hint);
  color: var(--color-text-muted);
}

/* ── RESPONSIVE ──────────────────────────────────────────── */
@media (max-width: 640px) {
  .page-wrapper { padding: var(--space-md); }
  .flavor-quote p { font-size: var(--fs-lg); }
  .stats-panel { grid-template-columns: repeat(2, 1fr); }
  .toolbar { flex-direction: column; align-items: stretch; gap: var(--space-sm); }
  .search-bar { width: 100%; }
  .search-input, .search-input--sm { width: 100%; box-sizing: border-box; }
  .list-header-row, .list-row { grid-template-columns: 1fr 120px; }
  .col-category { display: none; }
  .list-body { max-height: 380px; }
}
</style>
