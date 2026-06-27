<script setup lang="ts">
import type { Competence } from '@prisma/client'

type CompetenceWithCategory = Competence & {
  category: { id: number, name: string } | null
}

const { data: competences, status, error } = useFetch<CompetenceWithCategory[]>('/api/competence')

const search = ref('')
const activeFilter = ref<'all' | 'rare' | 'modern'>('all')
const {
  selected: selectedCategories,
  open: categoryDropdownOpen,
  triggerRef: categoryDropdownRef,
  toggle: toggleCategory,
  remove: removeCategory
} = useMultiSelectFilter<number>()
const sortName = ref<'asc' | 'desc' | null>('asc')
const sortBase = ref<'asc' | 'desc' | null>(null)

const categories = computed(() =>
  competences.value?.filter(c => c.isCategory).map(c => ({ id: c.id, name: c.name })) ?? []
)

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

const stats = computed(() => [
  { number: competences.value?.length ?? 0, label: 'Compétences' },
  { number: competences.value?.filter(c => c.isCategory).length ?? 0, label: 'Catégories' },
  { number: competences.value?.filter(c => c.rare).length ?? 0, label: 'Rares' },
  { number: competences.value?.filter(c => c.modern).length ?? 0, label: 'Modernes' },
  { number: filtered.value.length, label: 'Résultats', highlight: true }
])

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
  <ResourceListLayout
    title="Compétences"
    subtitle="Savoir-faire et aptitudes des investigateurs de Providence"
    quote="L'homme cultivé n'est jamais sans ressource — c'est dans la connaissance que réside la mince barrière entre la raison et l'abîme."
    cite="— Manuel de l'Investigateur, Arkham 1923"
    accent="arcane"
    max-width="1200px"
    :stats-cols="5"
    :stats-cols-mobile="3"
    stats-max-width="none"
    :status="status"
    :error="error"
    :result-count="filtered.length"
    :stats="stats"
    loading-text="Consultation des archives…"
    empty-text="Aucune compétence ne correspond à votre requête."
  >
    <template #toolbar>
      <div class="filters">
        <button class="tag" :class="{ active: activeFilter === 'all' }" @click="activeFilter = 'all'">Toutes</button>

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
    </template>

    <template #subtoolbar>
      <div v-if="selectedCategoryNames.length > 0" class="active-filters">
        <span v-for="cat in selectedCategoryNames" :key="cat.id" class="active-filter">
          <span class="active-filter-label">{{ cat.name }}</span>
          <button class="active-filter-clear" :aria-label="`Retirer ${cat.name}`" @click="removeCategory(cat.id)">✕</button>
        </span>
      </div>
    </template>

    <div class="list-container">
      <div class="list-body">
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

    <template #footer>
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
    </template>
  </ResourceListLayout>
</template>

<style scoped>
/* Spécifique compétences : recherche à droite, table à 4 colonnes,
   header collant, nom non accentué (sauf catégories en doré). */
.search-bar { margin-left: auto; }
.search-input { width: 240px; }

.list-container {
  --list-cols: 2fr 1.5fr 120px 80px;
  --row-name-color: var(--color-text-primary);
}
.list-container .list-body { height: 520px; max-height: none; }
.list-container .list-header-row {
  position: sticky;
  top: 0;
  z-index: 1;
}
.list-container .list-header-row,
.list-container .list-row { align-items: center; gap: var(--space-md); }
.list-row.is-category .row-name { color: var(--color-gold); }

.row-category {
  font-family: var(--font-flavor);
  font-style: italic;
  font-size: var(--fs-row-desc);
  color: var(--color-text-muted);
}
.row-base { display: flex; align-items: baseline; gap: 2px; }
.base-value-number {
  font-family: var(--font-heading);
  font-size: var(--fs-row-value);
  font-weight: 700;
  color: var(--color-arcane);
}
.base-value-pct { font-size: var(--fs-row-value); color: var(--color-text-muted); }
.row-dash { color: var(--color-text-muted); font-size: var(--fs-body); }

@media (max-width: 1024px) {
  .list-container { --list-cols: 2fr 1fr 100px 70px; }
}
@media (max-width: 640px) {
  .list-container { --list-cols: 1fr 70px; }
  .col-category, .col-badge { display: none; }
  .list-container .list-body { max-height: 380px; }
}
</style>
