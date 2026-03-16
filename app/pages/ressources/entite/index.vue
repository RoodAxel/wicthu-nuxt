<script setup lang="ts">
import type { EntiteItem } from '~/types/entite'

const CATEGORIES = [
  { value: 'CREATURE_MYTHE', label: 'Créatures du Mythe', badge: 'Créature' },
  { value: 'DIVINITE_MYTHE', label: 'Divinités du Mythe', badge: 'Divinité' },
  { value: 'HORREUR_TRADITIONNEL', label: 'Horreurs Traditionnelles', badge: 'Horreur' },
  { value: 'FAUNE', label: 'Faune', badge: 'Faune' }
]

const { data: entites, status, error } = useFetch<EntiteItem[]>('/api/entite')

const search = ref('')
const selectedCategories = ref<Set<string>>(new Set())
const categoryDropdownOpen = ref(false)
const categoryDropdownRef = ref<HTMLElement | null>(null)

const sortName = ref<'asc' | 'desc'>('asc')
const sortCategorie = ref(false)

const sortNameIcon = computed(() => sortName.value === 'asc' ? '↑' : '↓')

function cycleSortName() {
  sortName.value = sortName.value === 'asc' ? 'desc' : 'asc'
}

function toggleCategory(val: string) {
  const next = new Set(selectedCategories.value)
  if (next.has(val)) next.delete(val)
  else next.add(val)
  selectedCategories.value = next
}

function removeCategory(val: string) {
  const next = new Set(selectedCategories.value)
  next.delete(val)
  selectedCategories.value = next
}

function handleClickOutside(e: MouseEvent) {
  if (categoryDropdownRef.value && !categoryDropdownRef.value.contains(e.target as Node))
    categoryDropdownOpen.value = false
}
onMounted(() => document.addEventListener('mousedown', handleClickOutside))
onUnmounted(() => document.removeEventListener('mousedown', handleClickOutside))

function nameColor(categorie: string) {
  if (categorie === 'CREATURE_MYTHE') return 'var(--color-crimson)'
  if (categorie === 'DIVINITE_MYTHE') return 'var(--color-gold)'
  return 'var(--color-arcane)'
}

function badgeLabel(categorie: string) {
  return CATEGORIES.find(c => c.value === categorie)?.badge ?? categorie
}

const filtered = computed(() => {
  if (!entites.value) return []
  const q = normalizeStr(search.value.trim())
  let result = entites.value.filter((e) => {
    if (selectedCategories.value.size > 0 && !selectedCategories.value.has(e.categorie)) return false
    if (q && !normalizeStr(e.name).includes(q) && !normalizeStr(e.titre ?? '').includes(q)) return false
    return true
  })
  result = [...result].sort((a, b) => {
    if (sortCategorie.value) {
      const ai = CATEGORIES.findIndex(c => c.value === a.categorie)
      const bi = CATEGORIES.findIndex(c => c.value === b.categorie)
      if (ai !== bi) return ai - bi
    }
    const cmp = a.name.localeCompare(b.name, 'fr')
    return sortName.value === 'asc' ? cmp : -cmp
  })
  return result
})

const countByCategorie = computed(() => {
  if (!entites.value) return {}
  return Object.fromEntries(
    CATEGORIES.map(c => [c.value, entites.value!.filter(e => e.categorie === c.value).length])
  )
})

const selectedCategoryNames = computed(() =>
  CATEGORIES.filter(c => selectedCategories.value.has(c.value))
)
</script>

<template>
  <main class="page-wrapper">

    <div class="page-header">
      <h1 class="page-title">Bestiaire</h1>
      <p class="page-subtitle">Créatures, divinités et horreurs de l'Appel de Cthulhu</p>
    </div>

    <blockquote class="flavor-quote">
      <p>Ce que l'on ne peut nommer appartient à des sphères au-delà du compréhensible. Ce que l'on ose nommer nous détruit.</p>
      <cite>— Journal de Ward Phillips, Arkham, 1922</cite>
    </blockquote>

    <div class="stats-panel">
      <div class="stat-card">
        <span class="stat-number">{{ entites?.length ?? 0 }}</span>
        <span class="stat-label">Entités</span>
      </div>
      <div class="stat-card">
        <span class="stat-number">{{ filtered.length }}</span>
        <span class="stat-label">Résultats</span>
      </div>
    </div>

    <div class="toolbar">
      <div class="search-bar">
        <span class="search-icon">🔍</span>
        <input v-model="search" type="text" class="search-input" placeholder="Rechercher une entité…">
      </div>

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
            v-for="cat in CATEGORIES"
            :key="cat.value"
            class="dropdown-item"
            :class="{ selected: selectedCategories.has(cat.value) }"
            @click="toggleCategory(cat.value)"
          >
            <span class="dropdown-check">{{ selectedCategories.has(cat.value) ? '✓' : '' }}</span>
            {{ cat.label }}
            <span class="dropdown-count">{{ countByCategorie[cat.value] ?? 0 }}</span>
          </button>
        </div>
      </div>
    </div>

    <div v-if="selectedCategoryNames.length > 0" class="active-filters">
      <span
        v-for="cat in selectedCategoryNames"
        :key="cat.value"
        class="active-filter-tag"
      >
        <span class="active-filter-label">{{ cat.label }}</span>
        <button class="active-filter-clear" :aria-label="`Retirer ${cat.label}`" @click="removeCategory(cat.value)">✕</button>
      </span>
    </div>

    <div v-if="status === 'pending'" class="state-message">
      <span class="state-sigil">۞</span>
      <p>Consultation du bestiaire…</p>
    </div>

    <div v-else-if="error" class="state-message state-error">
      <p>Le bestiaire refuse de s'ouvrir : {{ error.message }}</p>
    </div>

    <div v-else-if="filtered.length === 0" class="state-message">
      <p>Aucune entité ne correspond à votre requête.</p>
    </div>

    <div v-else class="list-container">
      <div class="list-body">
        <div class="list-header-row">
          <button class="col-sortable sort-active" @click="cycleSortName">
            Entité <span class="sort-icon">{{ sortNameIcon }}</span>
          </button>
          <span class="col-titre">Titre</span>
          <label class="col-categorie categorie-sort-toggle">
            <input v-model="sortCategorie" type="checkbox" class="sort-checkbox">
            <span class="sort-checkbox-label">Catégorie</span>
          </label>
        </div>
        <NuxtLink
          v-for="(e, index) in filtered"
          :key="e.id"
          :to="`/ressources/entite/${e.id}`"
          class="list-row"
          :class="index % 2 === 0 ? 'row-even' : 'row-odd'"
        >
          <span class="row-name" :style="{ color: nameColor(e.categorie) }">{{ e.name }}</span>
          <span class="col-titre row-secondary">{{ e.titre ?? '—' }}</span>
          <span class="col-categorie">
            <span class="badge-categorie" :class="`badge-${e.categorie.toLowerCase()}`">
              {{ badgeLabel(e.categorie) }}
            </span>
          </span>
        </NuxtLink>
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

.stats-panel {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-md);
  margin-bottom: var(--space-xl);
  max-width: 360px;
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
  gap: var(--space-lg);
  margin-bottom: var(--space-md);
  flex-wrap: wrap;
}
.search-bar { position: relative; }
.search-icon {
  position: absolute;
  left: var(--space-sm);
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-text-muted);
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
  width: 260px;
  outline: none;
  transition: border-color var(--transition-fast);
}
.search-input::placeholder { color: var(--color-text-muted); font-style: italic; }
.search-input:focus { border-color: var(--color-arcane-dim); box-shadow: var(--shadow-glow); }

/* ── DROPDOWN ────────────────────────────────────────────── */
.dropdown-wrapper { position: relative; }

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
.tag.active { background: var(--color-arcane-dim); border-color: var(--color-arcane); color: var(--color-arcane); }

.dropdown-caret { font-size: 0.5rem; opacity: 0.6; }

.dropdown-menu {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  z-index: 50;
  background: var(--color-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  min-width: 220px;
  box-shadow: var(--shadow-deep);
  overflow: hidden;
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
.dropdown-item:hover { background: var(--color-surface); color: var(--color-text-primary); }
.dropdown-item.selected { color: var(--color-arcane); }

.dropdown-check { width: 14px; font-size: 0.7rem; color: var(--color-arcane); flex-shrink: 0; }
.dropdown-count { margin-left: auto; font-size: var(--fs-micro); opacity: 0.5; }

/* ── ACTIVE FILTERS ──────────────────────────────────────── */
.active-filters {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
  margin-bottom: var(--space-md);
}
.active-filter-tag {
  display: inline-flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-xs) var(--space-sm) var(--space-xs) var(--space-md);
  background: rgba(127, 179, 138, 0.1);
  border: 1px solid var(--color-arcane-dim);
  border-radius: var(--radius-sm);
}
.active-filter-label {
  font-family: var(--font-heading);
  font-size: var(--fs-secondary);
  font-weight: bold;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-arcane);
}
.active-filter-clear {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  font-size: var(--fs-micro);
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-arcane-dim);
  color: var(--color-arcane);
  background: transparent;
  cursor: pointer;
  transition: all var(--transition-fast);
  line-height: 1;
}
.active-filter-clear:hover { background: var(--color-arcane-dim); }

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
@keyframes pulse-sigil {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 1; }
}
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
  grid-template-columns: minmax(180px, 35%) 1fr 120px;
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
.sort-icon { font-size: 0.7rem; opacity: 0.7; }

.categorie-sort-toggle {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  cursor: pointer;
  user-select: none;
}
.sort-checkbox {
  appearance: none;
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  border: 1px solid var(--color-border);
  border-radius: 3px;
  background: var(--color-surface);
  cursor: pointer;
  display: grid;
  place-content: center;
  transition: background var(--transition-fast), border-color var(--transition-fast);
}
.sort-checkbox::before {
  content: '';
  width: 7px;
  height: 7px;
  background: var(--color-arcane);
  border-radius: 1px;
  transform: scale(0);
  transition: transform var(--transition-fast);
}
.sort-checkbox:checked { background: rgba(127,179,138,0.12); border-color: var(--color-arcane); }
.sort-checkbox:checked::before { transform: scale(1); }
.categorie-sort-toggle:hover .sort-checkbox { border-color: var(--color-arcane-dim); }
.sort-checkbox-label {
  font-family: var(--font-heading);
  font-size: var(--fs-table-header);
  font-weight: bold;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--color-text-muted);
  transition: color var(--transition-fast);
}
.categorie-sort-toggle:hover .sort-checkbox-label,
.sort-checkbox:checked ~ .sort-checkbox-label { color: var(--color-arcane); }

.list-body {
  max-height: 600px;
  overflow-y: scroll;
  scrollbar-gutter: stable;
  scrollbar-width: thin;
  scrollbar-color: var(--color-border) transparent;
}
.list-body::-webkit-scrollbar { width: 6px; }
.list-body::-webkit-scrollbar-thumb { background: var(--color-border); border-radius: 3px; }
.list-body::-webkit-scrollbar-thumb:hover { background: var(--color-arcane-dim); }

.list-row {
  text-decoration: none;
  transition: background var(--transition-fast);
}
.row-even { background: var(--color-surface); }
.row-odd  { background: var(--color-deep); }
.list-row:hover { background: var(--color-elevated); }

.row-name {
  font-family: var(--font-heading);
  font-size: var(--fs-row-name);
  font-weight: 600;
  letter-spacing: 0.03em;
  transition: color var(--transition-fast);
}
.list-row:hover .row-name { color: var(--color-text-primary) !important; }

.row-secondary {
  font-family: var(--font-flavor);
  font-style: italic;
  font-size: var(--fs-row-desc);
  color: var(--color-text-muted);
}

.badge-categorie {
  font-family: var(--font-heading);
  font-size: var(--fs-secondary);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  border: 1px solid;
  white-space: nowrap;
}
.badge-creature_mythe       { color: var(--color-crimson); border-color: rgba(139,58,58,0.4);   background: rgba(139,58,58,0.08); }
.badge-divinite_mythe       { color: var(--color-gold);    border-color: rgba(184,146,74,0.4);  background: rgba(184,146,74,0.08); }
.badge-horreur_traditionnel { color: var(--color-arcane);  border-color: var(--color-arcane-dim); background: rgba(127,179,138,0.08); }
.badge-faune                { color: var(--color-arcane);  border-color: var(--color-arcane-dim); background: rgba(127,179,138,0.08); }

@media (max-width: 768px) {
  .list-header-row,
  .list-row { grid-template-columns: minmax(140px, 45%) 120px; }
  .col-titre { display: none; }
}

@media (max-width: 640px) {
  .page-wrapper { padding: var(--space-md); }
  .toolbar { flex-direction: column; align-items: flex-start; }
  .search-input { width: 100%; box-sizing: border-box; }
  .list-header-row,
  .list-row { grid-template-columns: 1fr 120px; }
  .list-body { max-height: 420px; }
}
</style>
