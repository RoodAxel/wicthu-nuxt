<script setup lang="ts">
import type { SortItem } from '~/types/sort'

const { data: sorts, status, error } = useFetch<SortItem[]>('/api/sort')

const search = ref('')
const avecVariantes = ref(false)
const sortName = ref<'asc' | 'desc'>('asc')

function cycleSortName() {
  sortName.value = sortName.value === 'asc' ? 'desc' : 'asc'
}

const sortNameIcon = computed(() => sortName.value === 'asc' ? '↑' : '↓')

const totalVariantes = computed(() =>
  sorts.value?.reduce((acc, s) => acc + s._count.children, 0) ?? 0
)

const filtered = computed(() => {
  if (!sorts.value) return []
  const q = normalizeStr(search.value.trim())
  let result = sorts.value.filter((s) => {
    if (avecVariantes.value && s._count.children === 0) return false
    if (q) {
      const matchName = normalizeStr(s.name).includes(q)
      const matchCout = s.cout ? normalizeStr(s.cout).includes(q) : false
      const matchIncan = s.temps_incantation ? normalizeStr(s.temps_incantation).includes(q) : false
      if (!matchName && !matchCout && !matchIncan) return false
    }
    return true
  })
  result = [...result].sort((a, b) => {
    const cmp = a.name.localeCompare(b.name, 'fr')
    return sortName.value === 'asc' ? cmp : -cmp
  })
  return result
})
</script>

<template>
  <main class="page-wrapper">

    <div class="page-header">
      <h1 class="page-title">Sorts</h1>
      <p class="page-subtitle">Rituels et formules ésotériques de l'Appel de Cthulhu</p>
    </div>

    <blockquote class="flavor-quote">
      <p>Chaque sort est un pacte. Chaque incantation, une porte entrouverte vers l'indicible.</p>
      <cite>— Fragments de Celaeno, docteur Laban Shrewsbury</cite>
    </blockquote>

    <div class="stats-panel">
      <div class="stat-card">
        <span class="stat-number">{{ sorts?.length ?? 0 }}</span>
        <span class="stat-label">Sorts</span>
      </div>
      <div class="stat-card">
        <span class="stat-number">{{ totalVariantes }}</span>
        <span class="stat-label">Variantes</span>
      </div>
      <div class="stat-card">
        <span class="stat-number">{{ filtered.length }}</span>
        <span class="stat-label">Résultats</span>
      </div>
    </div>

    <div class="toolbar">
      <div class="search-bar">
        <span class="search-icon">🔍</span>
        <input v-model="search" type="text" class="search-input" placeholder="Nom, coût, incantation…">
      </div>
      <label class="filter-toggle">
        <input v-model="avecVariantes" type="checkbox" class="filter-checkbox">
        <span class="filter-label">Avec variantes uniquement</span>
      </label>
    </div>

    <div v-if="status === 'pending'" class="state-message">
      <span class="state-sigil">۞</span>
      <p>Consultation des grimoires…</p>
    </div>

    <div v-else-if="error" class="state-message state-error">
      <p>Les grimoires refusent de s'ouvrir : {{ error.message }}</p>
    </div>

    <div v-else-if="filtered.length === 0" class="state-message">
      <p>Aucun sort ne correspond à votre requête.</p>
    </div>

    <div v-else class="list-container">
      <div class="list-header-row">
        <button class="col-name col-sortable sort-active" @click="cycleSortName">
          Sort <span class="sort-icon">{{ sortNameIcon }}</span>
        </button>
        <span class="col-cout">Coût</span>
        <span class="col-incantation">Incantation</span>
        <span class="col-variante">Variante</span>
      </div>
      <div class="list-body">
        <NuxtLink
          v-for="(s, index) in filtered"
          :key="s.id"
          :to="`/ressources/sort/${s.id}`"
          class="list-row"
          :class="index % 2 === 0 ? 'row-even' : 'row-odd'"
        >
          <span class="col-name row-name">{{ s.name }}</span>
          <span class="col-cout row-secondary">{{ s.cout ?? '—' }}</span>
          <span class="col-incantation row-secondary">{{ s.temps_incantation ?? '—' }}</span>
          <span class="col-variante">
            <span v-if="s._count.children > 0" class="badge-variante">{{ s._count.children }}</span>
            <span v-else class="row-dash">—</span>
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
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-md);
  margin-bottom: var(--space-xl);
  max-width: 480px;
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

.toolbar {
  display: flex;
  align-items: center;
  gap: var(--space-lg);
  margin-bottom: var(--space-xl);
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
  font-size: var(--fs-lg);
  width: 280px;
  outline: none;
  transition: border-color var(--transition-fast);
}
.search-input::placeholder { color: var(--color-text-muted); font-style: italic; }
.search-input:focus { border-color: var(--color-arcane-dim); box-shadow: 0 0 0 2px rgba(127,179,138,0.15); }

.filter-toggle {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  cursor: pointer;
  user-select: none;
}
.filter-checkbox {
  appearance: none;
  -webkit-appearance: none;
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  border: 1px solid var(--color-border);
  border-radius: 3px;
  background: var(--color-surface);
  cursor: pointer;
  display: grid;
  place-content: center;
  transition: background var(--transition-fast), border-color var(--transition-fast);
}
.filter-checkbox::before {
  content: '';
  width: 8px;
  height: 8px;
  background: var(--color-arcane);
  border-radius: 1px;
  transform: scale(0);
  transition: transform var(--transition-fast);
}
.filter-checkbox:checked {
  background: rgba(127, 179, 138, 0.12);
  border-color: var(--color-arcane);
}
.filter-checkbox:checked::before { transform: scale(1); }
.filter-toggle:hover .filter-checkbox { border-color: var(--color-arcane-dim); }
.filter-label {
  font-family: var(--font-heading);
  font-size: var(--fs-section-title);
  font-weight: bold;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-text-muted);
  transition: color var(--transition-fast);
}
.filter-toggle:hover .filter-label { color: var(--color-arcane); }

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
  grid-template-columns: minmax(180px, 38%) 330px 180px 70px;
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
  scrollbar-gutter: stable;
  scrollbar-width: thin;
  scrollbar-color: var(--color-border) transparent;
}
.list-body::-webkit-scrollbar { width: 6px; }
.list-body::-webkit-scrollbar-track { background: transparent; }
.list-body::-webkit-scrollbar-thumb { background: var(--color-border); border-radius: 3px; }
.list-body::-webkit-scrollbar-thumb:hover { background: var(--color-arcane-dim); }

.list-row {
  text-decoration: none;
  transition: background var(--transition-fast);
  cursor: pointer;
}
.row-even { background: var(--color-surface); }
.row-odd  { background: var(--color-deep); }
.list-row:hover { background: var(--color-elevated); }

.row-name {
  font-family: var(--font-heading);
  font-size: var(--fs-row-name);
  font-weight: 600;
  letter-spacing: 0.03em;
  color: var(--color-arcane);
  transition: color var(--transition-fast);
}
.list-row:hover .row-name {
  color: var(--color-text-primary);
}

.row-secondary {
  font-family: var(--font-flavor);
  font-style: italic;
  font-size: var(--fs-row-desc);
  color: var(--color-text-muted);
}

.badge-variante {
  font-family: var(--font-heading);
  font-size: var(--fs-badge);
  letter-spacing: 0.1em;
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  background: rgba(127, 179, 138, 0.15);
  color: var(--color-arcane);
  border: 1px solid var(--color-arcane-dim);
}

.row-dash {
  color: var(--color-text-muted);
  font-size: var(--fs-body);
}

@media (max-width: 900px) {
  .list-header-row,
  .list-row { grid-template-columns: minmax(140px, 40%) 1fr 70px; }
  .col-incantation { display: none; }
}

@media (max-width: 640px) {
  .page-wrapper { padding: var(--space-md); }
  .toolbar { flex-direction: column; align-items: flex-start; }
  .search-input { width: 100%; box-sizing: border-box; }
  .list-header-row,
  .list-row { grid-template-columns: 1fr 70px; }
  .col-cout { display: none; }
  .list-body { max-height: 420px; }
}
</style>
