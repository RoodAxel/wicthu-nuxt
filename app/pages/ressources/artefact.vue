<script setup lang="ts">
import type { artefact } from '@prisma/client'

const { data: artefacts, status, error } = useFetch<artefact[]>('/api/artefact')

const search   = ref('')
const expandedId = ref<number | null>(null)

const selectedUseBy        = ref<Set<string>>(new Set())
const useByDropdownOpen    = ref(false)
const useByDropdownRef     = ref<HTMLElement | null>(null)

// ── TRIS ──────────────────────────────────────────────────────────────────────
const sortName  = ref<'asc' | 'desc'>('asc')
const sortUseBy = ref<'asc' | 'desc' | null>(null)

const nameIsActive  = computed(() => sortUseBy.value === null)
const sortNameIcon  = computed(() => sortName.value === 'asc' ? '↑' : '↓')
const sortUseByIcon = computed(() => sortUseBy.value === 'asc' ? '↑' : sortUseBy.value === 'desc' ? '↓' : '↕')

function cycleSortName() {
  sortUseBy.value = null
  sortName.value = sortName.value === 'asc' ? 'desc' : 'asc'
}
function cycleSortUseBy() {
  sortUseBy.value = sortUseBy.value === null ? 'asc' : sortUseBy.value === 'asc' ? 'desc' : null
}

// ── HELPERS ───────────────────────────────────────────────────────────────────
// Retire "le " / "les " en début de chaîne (pour affichage et tri)
function stripArticle(s: string): string {
  return s.replace(/^les?\s+/i, '').trim()
}

// ── DONNÉES ───────────────────────────────────────────────────────────────────
const useByOptions = computed(() => {
  if (!artefacts.value) return []
  const raw = [...new Set(artefacts.value.map(a => a.use_by).filter(Boolean))] as string[]
  return raw.sort((a, b) => stripArticle(a).localeCompare(stripArticle(b), 'fr'))
})

const selectedUseByNames = computed(() =>
  useByOptions.value.filter(v => selectedUseBy.value.has(v))
)

function toggleUseBy(val: string) {
  const next = new Set(selectedUseBy.value)
  if (next.has(val)) next.delete(val)
  else next.add(val)
  selectedUseBy.value = next
}

function removeUseBy(val: string) {
  const next = new Set(selectedUseBy.value)
  next.delete(val)
  selectedUseBy.value = next
}

// ── FILTERED + SORTED ─────────────────────────────────────────────────────────
const filtered = computed(() => {
  if (!artefacts.value) return []

  const q = normalizeStr(search.value.trim())
  let result = artefacts.value.filter((a) => {
    if (q) {
      const matchName = normalizeStr(a.name).includes(q)
      const matchUse  = a.use_by ? normalizeStr(a.use_by).includes(q) : false
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

function toggleExpand(id: number) {
  expandedId.value = expandedId.value === id ? null : id
}

function handleClickOutside(e: MouseEvent) {
  if (useByDropdownRef.value && !useByDropdownRef.value.contains(e.target as Node)) {
    useByDropdownOpen.value = false
  }
}

onMounted(() => document.addEventListener('mousedown', handleClickOutside))
onUnmounted(() => document.removeEventListener('mousedown', handleClickOutside))
</script>

<template>
  <main class="page-wrapper">

    <div class="page-header">
      <h1 class="page-title">Artefacts</h1>
      <p class="page-subtitle">Objets anciens et reliques aux pouvoirs insondables</p>
    </div>

    <blockquote class="flavor-quote">
      <p>Certains objets ne devraient jamais être touchés — leur simple existence suffit à corrompre l'âme de celui qui les contemple.</p>
      <cite>— Catalogue des saisies de la police d'Arkham, 1919</cite>
    </blockquote>

    <div class="stats-panel">
      <div class="stat-card">
        <span class="stat-number">{{ artefacts?.length ?? 0 }}</span>
        <span class="stat-label">Artefacts</span>
      </div>
      <div class="stat-card">
        <span class="stat-number">{{ filtered.length }}</span>
        <span class="stat-label">Résultats</span>
      </div>
    </div>

    <div class="toolbar">
      <!-- Dropdown "Utilisé par" -->
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

      <!-- Recherche -->
      <div class="search-bar">
        <span class="search-icon">🔍</span>
        <input v-model="search" type="text" class="search-input" placeholder="Artefact, utilisé par…">
      </div>
    </div>

    <!-- Filtres actifs -->
    <div v-if="selectedUseByNames.length > 0" class="active-filters">
      <span v-for="val in selectedUseByNames" :key="val" class="active-filter">
        <span class="active-filter-label">{{ stripArticle(val) }}</span>
        <button class="active-filter-clear" :aria-label="`Retirer ${val}`" @click="removeUseBy(val)">✕</button>
      </span>
    </div>

    <div v-if="status === 'pending'" class="state-message">
      <span class="state-sigil">۞</span>
      <p>Consultation des archives interdites…</p>
    </div>

    <div v-else-if="error" class="state-message state-error">
      <p>Les archives refusent de répondre : {{ error.message }}</p>
    </div>

    <div v-else-if="filtered.length === 0" class="state-message">
      <p>Aucun artefact ne correspond à votre requête.</p>
    </div>

    <div v-else class="list-container">
      <div class="list-header-row">
        <button class="col-sortable" :class="{ 'sort-active': nameIsActive }" @click="cycleSortName">
          Artefact <span class="sort-icon">{{ sortNameIcon }}</span>
        </button>
        <button class="col-sortable" :class="{ 'sort-active': sortUseBy !== null }" @click="cycleSortUseBy">
          Utilisé par <span class="sort-icon">{{ sortUseByIcon }}</span>
        </button>
        <span />
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
            <span />
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
  background: var(--color-gold);
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
  border-left: 2px solid var(--color-gold-dim);
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
  font-size: var(--fs-stat-number);
  color: var(--color-gold);
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
.tag:hover { border-color: var(--color-gold-dim); color: var(--color-gold); }
.tag.active { background: var(--color-gold-dim); border-color: var(--color-gold); color: var(--color-gold); }

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
.dropdown-item.selected { color: var(--color-gold); }
.dropdown-check { width: 14px; font-size: 0.7rem; color: var(--color-gold); flex-shrink: 0; }

/* ── ACTIVE FILTERS ──────────────────────────────────────── */
.active-filters {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
  margin-bottom: var(--space-md);
}
.active-filter {
  display: inline-flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-xs) var(--space-sm) var(--space-xs) var(--space-md);
  background: rgba(184, 146, 74, 0.1);
  border: 1px solid var(--color-gold-dim);
  border-radius: var(--radius-sm);
}
.active-filter-label {
  font-family: var(--font-heading);
  font-size: var(--fs-md);
  font-weight: bold;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-gold);
}
.active-filter-clear {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px; height: 18px;
  font-size: var(--fs-2xs);
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-gold-dim);
  color: var(--color-gold);
  background: transparent;
  cursor: pointer;
  transition: all var(--transition-fast);
  line-height: 1;
}
.active-filter-clear:hover { background: var(--color-gold-dim); }

/* ── SEARCH ──────────────────────────────────────────────── */
.search-bar {
  position: relative;
  display: inline-block;
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
  width: 320px;
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
  outline: none;
}
.search-input::placeholder { color: var(--color-text-muted); font-style: italic; }
.search-input:focus {
  border-color: var(--color-gold-dim);
  box-shadow: 0 0 0 2px rgba(184, 146, 74, 0.15);
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
  color: var(--color-gold);
  animation: pulse-sigil 2s ease-in-out infinite;
}
@keyframes pulse-sigil {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 1; }
}
.state-error { color: var(--color-crimson); }

/* ── LIST ────────────────────────────────────────────────── */
.list-container {
  display: grid;
  grid-template-columns: auto auto 1fr 68px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.list-header-row {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: subgrid;
  background: var(--color-elevated);
  border-bottom: 1px solid var(--color-border);
}
.list-header-row > * {
  padding: var(--space-sm);
}
.list-header-row > *:first-child { padding-left: var(--space-lg); }
.list-header-row > *:last-child  { padding-right: var(--space-lg); }

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
  padding: var(--space-sm);
  transition: color var(--transition-fast);
}
.col-sortable:hover { color: var(--color-gold); }
.col-sortable.sort-active { color: var(--color-gold); }
.sort-icon { font-size: 0.7rem; opacity: 0.7; }

.list-body {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: subgrid;
  max-height: 600px;
  overflow-y: auto;
  scrollbar-gutter: stable;
  scrollbar-width: thin;
  scrollbar-color: var(--color-border) transparent;
}
.list-body::-webkit-scrollbar { width: 6px; }
.list-body::-webkit-scrollbar-track { background: transparent; }
.list-body::-webkit-scrollbar-thumb { background: var(--color-border); border-radius: 3px; }
.list-body::-webkit-scrollbar-thumb:hover { background: var(--color-gold-dim); }

.list-item {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: subgrid;
}

.list-item.is-expanded .list-row { background: var(--color-elevated) !important; }

.list-row {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: subgrid;
  align-items: center;
  cursor: pointer;
  transition: background var(--transition-fast);
}
.list-row > * {
  padding: var(--space-sm) var(--space-sm);
}
.list-row > *:first-child { padding-left: var(--space-lg); }
.list-row > *:last-child  { padding-right: var(--space-lg); }

.row-even { background: var(--color-surface); }
.row-odd  { background: var(--color-deep); }
.list-row:hover { background: var(--color-elevated); }

.row-name {
  font-family: var(--font-heading);
  font-size: var(--fs-row-name);
  font-weight: 600;
  letter-spacing: 0.03em;
  color: var(--color-gold);
}
.row-use {
  font-family: var(--font-heading);
  font-size: var(--fs-row-value);
  letter-spacing: 0.05em;
  color: var(--color-text-muted);
}
.row-chevron {
  font-size: var(--fs-row-value);
  color: var(--color-text-muted);
  transition: transform var(--transition-fast);
  display: flex;
  align-items: center;
  justify-content: center;
  transform: rotate(0deg);
  line-height: 1;
  padding: 0 !important;
}
.row-chevron.is-open { transform: rotate(90deg); color: var(--color-gold); }

.row-description {
  grid-column: 1 / -1;
  padding: var(--space-md) var(--space-xl);
  background: rgba(184, 146, 74, 0.05);
  border-top: 1px solid var(--color-gold-dim);
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}
.detail-label {
  font-family: var(--font-heading);
  font-size: var(--fs-2xs);
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--color-gold);
}
.row-description p {
  font-family: var(--font-flavor);
  font-style: italic;
  font-size: var(--fs-row-desc);
  color: var(--color-text-secondary);
  line-height: 1.7;
}

.expand-enter-active,
.expand-leave-active {
  transition: opacity 0.2s ease, max-height 0.25s ease;
  max-height: 300px;
  overflow: hidden;
}
.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  max-height: 0;
}

/* ── RESPONSIVE ──────────────────────────────────────────── */
@media (max-width: 640px) {
  .page-wrapper { padding: var(--space-md); }
  .flavor-quote p { font-size: var(--fs-page-subtitle); }
  .toolbar { flex-direction: column; align-items: stretch; }
  .search-bar { display: block; width: 100%; }
  .search-input { width: 100%; box-sizing: border-box; }
  .list-body { max-height: 420px; }
  .list-header-row { display: none; }
  .list-row {
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
    padding: var(--space-md) var(--space-lg);
  }
}
</style>
