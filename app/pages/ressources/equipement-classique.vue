<script setup lang="ts">
import type { equipement_classique } from '@prisma/client'

const { data: items, status, error } = useFetch<equipement_classique[]>('/api/equipement-classique')

const searchName = ref('')
const searchPrice = ref('')
const {
  selected: selectedCategories,
  open: categoryDropdownOpen,
  triggerRef: categoryDropdownRef,
  toggle: toggleCategory,
  remove: removeCategory
} = useMultiSelectFilter<string>()

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

const stats = computed(() => [
  { number: items.value?.length ?? 0, label: 'Articles' },
  { number: categories.value.length, label: 'Catégories' },
  { number: items.value?.filter(e => e.superior).length ?? 0, label: 'Supérieurs' },
  { number: filtered.value.length, label: 'Résultats' }
])

function formatPrice(base: number, max: number | null, unit: string | null, superior: boolean) {
  const price = max ? `${base} - ${max}$` : `${base}$`
  const withUnit = unit ? `${price}/${unit.toLowerCase()}` : price
  return superior ? `${withUnit}+` : withUnit
}
</script>

<template>
  <ResourceListLayout
    title="Équipement Classique"
    subtitle="Matériel et fournitures de l'ère classique (années 1920)"
    quote="Dans les ruelles sombres d'Arkham, un bon imperméable et une lampe de poche fiable valent parfois mieux qu'un revolver."
    cite="— Guide du voyageur de la Nouvelle-Angleterre, 1923"
    accent="gold"
    max-width="1000px"
    :stats-cols="4"
    :stats-cols-mobile="2"
    stats-max-width="none"
    :status="status"
    :error="error"
    :result-count="filtered.length"
    :stats="stats"
    loading-text="Consultation du catalogue…"
    empty-text="Aucun article ne correspond à votre requête."
  >
    <template #toolbar>
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

      <div class="search-bar">
        <span class="search-icon">🔍</span>
        <input v-model="searchName" type="text" class="search-input" placeholder="Rechercher un article…">
      </div>
      <div class="search-bar">
        <span class="search-icon">🔍</span>
        <input v-model="searchPrice" type="text" class="search-input search-input--sm" placeholder="Prix…">
      </div>
    </template>

    <template #subtoolbar>
      <div v-if="selectedCategoryNames.length > 0" class="active-filters">
        <span v-for="cat in selectedCategoryNames" :key="cat" class="active-filter">
          <span class="active-filter-label">{{ cat }}</span>
          <button class="active-filter-clear" :aria-label="`Retirer ${cat}`" @click="removeCategory(cat)">✕</button>
        </span>
      </div>
    </template>

    <div class="list-container">
      <div class="list-body">
        <div class="list-header-row">
          <button class="col-sortable sort-active" @click="cycleSortName">
            Article <span class="sort-icon">{{ sortNameIcon }}</span>
          </button>
          <button class="col-sortable col-category sort-active" @click="cycleSortCategory">
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

    <template #footer>
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
    </template>
  </ResourceListLayout>
</template>

<style scoped>
/* Spécifique équipement : 2 recherches, table 3 colonnes (header collant),
   nom non accentué, prix doré, jeton de légende. */
.search-input { width: 240px; }
.search-input--sm { width: 130px; }

.list-container {
  --list-cols: 1fr 180px 160px;
  --row-name-color: var(--color-text-primary);
}
.list-container .list-body { max-height: 580px; }
.list-container .list-header-row {
  position: sticky;
  top: 0;
  z-index: 1;
}
.list-container .list-header-row,
.list-container .list-row { align-items: center; gap: var(--space-md); }

.row-category {
  font-family: var(--font-flavor);
  font-style: italic;
  font-size: var(--fs-base);
  color: var(--color-text-muted);
}
.row-price {
  font-family: var(--font-body);
  font-size: var(--fs-base);
  color: var(--color-gold);
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
  background: rgba(184, 146, 74, 0.1);
  color: var(--color-gold);
  border: 1px solid var(--color-gold-dim);
}

@media (max-width: 640px) {
  .search-input,
  .search-input--sm { width: 100%; box-sizing: border-box; }
  .list-container { --list-cols: 1fr 120px; }
  .col-category { display: none; }
  .list-container .list-body { max-height: 380px; }
}
</style>
