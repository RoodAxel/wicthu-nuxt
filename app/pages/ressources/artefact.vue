<script setup lang="ts">
import type { artefact as Artefact } from '@prisma/client'

const { data: artefacts, status, error } = useFetch<Artefact[]>('/api/artefact')

const search = ref('')
const { expandedId, toggleExpand } = useExpandableRows()
const {
  selected: selectedUseBy,
  open: useByDropdownOpen,
  triggerRef: useByDropdownRef,
  toggle: toggleUseBy,
  remove: removeUseBy
} = useMultiSelectFilter<string>()

// ── TRIS ──────────────────────────────────────────────────────────────────────
const sortName = ref<'asc' | 'desc'>('asc')
const sortUseBy = ref<'asc' | 'desc' | null>(null)

const nameIsActive = computed(() => sortUseBy.value === null)
const sortNameIcon = computed(() => sortName.value === 'asc' ? '↑' : '↓')
const sortUseByIcon = computed(() => sortUseBy.value === 'asc' ? '↑' : sortUseBy.value === 'desc' ? '↓' : '↕')

function cycleSortName() {
  sortUseBy.value = null
  sortName.value = sortName.value === 'asc' ? 'desc' : 'asc'
}
function cycleSortUseBy() {
  sortUseBy.value = sortUseBy.value === null ? 'asc' : sortUseBy.value === 'asc' ? 'desc' : null
}

// Retire "le " / "les " en début de chaîne (pour affichage et tri)
function stripArticle(s: string): string {
  return s.replace(/^les?\s+/i, '').trim()
}

const useByOptions = computed(() => {
  if (!artefacts.value) return []
  const raw = [...new Set(artefacts.value.map(a => a.use_by).filter(Boolean))] as string[]
  return raw.sort((a, b) => stripArticle(a).localeCompare(stripArticle(b), 'fr'))
})

const selectedUseByNames = computed(() =>
  useByOptions.value.filter(v => selectedUseBy.value.has(v))
)

const filtered = computed(() => {
  if (!artefacts.value) return []

  const q = normalizeStr(search.value.trim())
  let result = artefacts.value.filter((a) => {
    if (q) {
      const matchName = normalizeStr(a.name).includes(q)
      const matchUse = a.use_by ? normalizeStr(a.use_by).includes(q) : false
      if (!matchName && !matchUse) return false
    }
    if (selectedUseBy.value.size > 0 && !selectedUseBy.value.has(a.use_by ?? '')) return false
    return true
  })

  if (sortUseBy.value) {
    result = [...result].sort((a, b) => {
      const cmp = stripArticle(a.use_by ?? '').localeCompare(stripArticle(b.use_by ?? ''), 'fr')
      return sortUseBy.value === 'asc' ? cmp : -cmp
    })
  } else {
    result = [...result].sort((a, b) => {
      const cmp = stripArticle(a.name).localeCompare(stripArticle(b.name), 'fr')
      return sortName.value === 'asc' ? cmp : -cmp
    })
  }

  return result
})

const stats = computed(() => [
  { number: artefacts.value?.length ?? 0, label: 'Artefacts' },
  { number: filtered.value.length, label: 'Résultats' }
])

useSeoMeta({
  title: 'Artefacts',
  description: 'Artefacts et objets surnaturels du Mythe de Cthulhu : descriptions et propriétés pour L\'Appel de Cthulhu.'
})
</script>

<template>
  <ResourceListLayout
    title="Artefacts"
    subtitle="Objets anciens et reliques aux pouvoirs insondables"
    quote="Certains objets ne devraient jamais être touchés — leur simple existence suffit à corrompre l'âme de celui qui les contemple."
    cite="— Catalogue des saisies de la police d'Arkham, 1919"
    accent="gold"
    max-width="1200px"
    :status="status"
    :error="error"
    :result-count="filtered.length"
    :stats="stats"
    loading-text="Consultation des archives interdites…"
    empty-text="Aucun artefact ne correspond à votre requête."
  >
    <template #toolbar>
      <div ref="useByDropdownRef" class="dropdown-wrapper">
        <button
          class="tag"
          :class="{ active: selectedUseBy.size > 0 }"
          @click="useByDropdownOpen = !useByDropdownOpen"
        >
          Utilisé par <span class="dropdown-caret">{{ useByDropdownOpen ? '▲' : '▼' }}</span>
        </button>
        <div v-if="useByDropdownOpen" class="dropdown-menu">
          <button
            v-for="val in useByOptions"
            :key="val"
            class="dropdown-item"
            :class="{ selected: selectedUseBy.has(val) }"
            @click="toggleUseBy(val)"
          >
            <span class="dropdown-check">{{ selectedUseBy.has(val) ? '✓' : '' }}</span>
            {{ stripArticle(val) }}
          </button>
        </div>
      </div>

      <div class="search-bar">
        <span class="search-icon">🔍</span>
        <input v-model="search" type="text" class="search-input" placeholder="Artefact, utilisé par…">
      </div>
    </template>

    <template #subtoolbar>
      <div v-if="selectedUseByNames.length > 0" class="active-filters">
        <span v-for="val in selectedUseByNames" :key="val" class="active-filter">
          <span class="active-filter-label">{{ stripArticle(val) }}</span>
          <button class="active-filter-clear" :aria-label="`Retirer ${val}`" @click="removeUseBy(val)">✕</button>
        </span>
      </div>
    </template>

    <div class="list-container stack-mobile" style="--list-cols: 1fr 200px 28px">
      <div class="list-header-row">
        <button class="col-sortable" :class="{ 'sort-active': nameIsActive }" @click="cycleSortName">
          Artefact <span class="sort-icon">{{ sortNameIcon }}</span>
        </button>
        <button class="col-sortable" :class="{ 'sort-active': sortUseBy !== null }" @click="cycleSortUseBy">
          Utilisé par <span class="sort-icon">{{ sortUseByIcon }}</span>
        </button>
        <span class="col-chevron" />
      </div>
      <div class="list-body">
        <div
          v-for="(artefact, index) in filtered"
          :key="artefact.id"
          class="list-item"
          :class="{ 'is-expanded': expandedId === artefact.id }"
        >
          <div
            class="list-row"
            :class="index % 2 === 0 ? 'row-even' : 'row-odd'"
            @click="toggleExpand(artefact.id)"
          >
            <span class="col-name row-name">{{ artefact.name }}</span>
            <span class="col-use row-use">{{ artefact.use_by ?? '—' }}</span>
            <span class="col-chevron row-chevron" :class="{ 'is-open': expandedId === artefact.id }">›</span>
          </div>
          <Transition name="expand">
            <div v-if="expandedId === artefact.id" class="row-description">
              <span class="detail-label">Description</span>
              <p>{{ artefact.description ?? 'Aucune description disponible.' }}</p>
            </div>
          </Transition>
        </div>
      </div>
    </div>
  </ResourceListLayout>
</template>

<style scoped>
/* Spécifique artefact : ligne cliquable + colonne "utilisé par" */
.list-row { cursor: pointer; }
.row-use {
  font-family: var(--font-heading);
  font-size: var(--fs-row-value);
  letter-spacing: 0.05em;
  color: var(--color-text-muted);
}
</style>
