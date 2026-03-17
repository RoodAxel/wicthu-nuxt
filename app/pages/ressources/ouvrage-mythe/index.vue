<script setup lang="ts">
import type { OuvrageMytheItem } from '~/types/ouvrage-mythe'

const { data: ouvrages, status, error } = useFetch<OuvrageMytheItem[]>('/api/ouvrage-mythe')

const search = ref('')
const sortTitre = ref<'asc' | 'desc'>('asc')
const sortAuteur = ref<'asc' | 'desc' | null>(null)
const sortMythe = ref<'desc' | 'asc' | null>(null)
const sortSanity = ref<'desc' | 'asc' | null>(null)
const sortSortCount = ref<'asc' | 'desc' | null>(null)

const titreIsActive = computed(() =>
  sortAuteur.value === null && sortMythe.value === null && sortSanity.value === null && sortSortCount.value === null
)

const sortTitreIcon = computed(() => sortTitre.value === 'asc' ? '↑' : '↓')
const sortAuteurIcon = computed(() => sortAuteur.value === 'asc' ? '↑' : sortAuteur.value === 'desc' ? '↓' : '↕')
const sortMytheIcon = computed(() => sortMythe.value === 'desc' ? '↓' : sortMythe.value === 'asc' ? '↑' : '↕')
const sortSanityIcon = computed(() => sortSanity.value === 'desc' ? '↓' : sortSanity.value === 'asc' ? '↑' : '↕')
const sortSortCountIcon = computed(() => sortSortCount.value === 'desc' ? '↓' : sortSortCount.value === 'asc' ? '↑' : '↕')

function cycleSortTitre() {
  sortAuteur.value = null
  sortMythe.value = null
  sortSanity.value = null
  sortSortCount.value = null
  sortTitre.value = sortTitre.value === 'asc' ? 'desc' : 'asc'
}
function cycleSortAuteur() {
  sortMythe.value = null
  sortSanity.value = null
  sortSortCount.value = null
  sortAuteur.value = sortAuteur.value === null ? 'asc' : sortAuteur.value === 'asc' ? 'desc' : null
}
function cycleSortMythe() {
  sortAuteur.value = null
  sortSanity.value = null
  sortSortCount.value = null
  sortMythe.value = sortMythe.value === null ? 'desc' : sortMythe.value === 'desc' ? 'asc' : null
}
function cycleSortSanity() {
  sortAuteur.value = null
  sortMythe.value = null
  sortSortCount.value = null
  sortSanity.value = sortSanity.value === null ? 'desc' : sortSanity.value === 'desc' ? 'asc' : null
}
function cycleSortSortCount() {
  sortAuteur.value = null
  sortMythe.value = null
  sortSanity.value = null
  sortSortCount.value = sortSortCount.value === null ? 'desc' : sortSortCount.value === 'desc' ? 'asc' : null
}

function parseSanityMax(s: string | null): number | null {
  if (!s) return null
  const m = s.match(/(\d+)[dD](\d+)(?:\+(\d+))?$/)
  if (!m) return null
  return parseInt(m[1] ?? '0') * parseInt(m[2] ?? '0') + (m[3] ? parseInt(m[3]) : 0)
}

const filtered = computed(() => {
  if (!ouvrages.value) return []
  const q = normalizeStr(search.value.trim())
  let result = ouvrages.value.filter((o) => {
    if (!q) return true
    return normalizeStr(o.titre).includes(q)
      || (o.auteur ? normalizeStr(o.auteur).includes(q) : false)
      || (o.langue ? normalizeStr(o.langue).includes(q) : false)
  })

  if (sortMythe.value) {
    result = [...result].sort((a, b) => {
      const av = a.mythe_cthulhu, bv = b.mythe_cthulhu
      if (av === null && bv === null) return 0
      if (av === null) return 1
      if (bv === null) return -1
      return sortMythe.value === 'desc' ? bv - av : av - bv
    })
  } else if (sortSanity.value) {
    result = [...result].sort((a, b) => {
      const av = parseSanityMax(a.sante_mental), bv = parseSanityMax(b.sante_mental)
      if (av === null && bv === null) return 0
      if (av === null) return 1
      if (bv === null) return -1
      return sortSanity.value === 'desc' ? bv - av : av - bv
    })
  } else if (sortSortCount.value) {
    result = [...result].sort((a, b) => {
      const av = a._count.ouvrage_sort, bv = b._count.ouvrage_sort
      return sortSortCount.value === 'desc' ? bv - av : av - bv
    })
  } else if (sortAuteur.value) {
    result = [...result].sort((a, b) => {
      const cmp = (a.auteur ?? '').localeCompare(b.auteur ?? '', 'fr')
      return sortAuteur.value === 'asc' ? cmp : -cmp
    })
  } else {
    result = [...result].sort((a, b) => {
      const cmp = a.titre.localeCompare(b.titre, 'fr')
      return sortTitre.value === 'asc' ? cmp : -cmp
    })
  }

  return result
})
</script>

<template>
  <main class="page-wrapper">

    <div class="page-header">
      <h1 class="page-title">Ouvrages du Mythe</h1>
      <p class="page-subtitle">Tomes sacrés et maudits des archives de Miskatonic</p>
    </div>

    <blockquote class="flavor-quote">
      <p>Lire ces ouvrages, c'est laisser le Mythe vous lire en retour.</p>
      <cite>— Inscription anonyme, bibliothèque universitaire de Miskatonic</cite>
    </blockquote>

    <div class="stats-panel">
      <div class="stat-card">
        <span class="stat-number">{{ ouvrages?.length ?? 0 }}</span>
        <span class="stat-label">Ouvrages</span>
      </div>
      <div class="stat-card">
        <span class="stat-number">{{ filtered.length }}</span>
        <span class="stat-label">Résultats</span>
      </div>
    </div>

    <div class="toolbar">
      <div class="search-bar">
        <span class="search-icon">🔍</span>
        <input v-model="search" type="text" class="search-input" placeholder="Titre, auteur, langue…">
      </div>
    </div>

    <div v-if="status === 'pending'" class="state-message">
      <span class="state-sigil">۞</span>
      <p>Consultation des archives interdites…</p>
    </div>

    <div v-else-if="error" class="state-message state-error">
      <p>Les archives refusent de répondre : {{ error.message }}</p>
    </div>

    <div v-else-if="filtered.length === 0" class="state-message">
      <p>Aucun ouvrage ne correspond à votre requête.</p>
    </div>

    <div v-else class="list-container">
      <div class="list-body">
        <div class="list-header-row">
          <button class="col-sortable" :class="{ 'sort-active': titreIsActive }" @click="cycleSortTitre">
            Titre <span class="sort-icon">{{ sortTitreIcon }}</span>
          </button>
          <button class="col-sortable col-auteur" :class="{ 'sort-active': sortAuteur !== null }" @click="cycleSortAuteur">
            Auteur <span class="sort-icon">{{ sortAuteurIcon }}</span>
          </button>
          <span class="col-lang">Langue</span>
          <span class="col-date">Date</span>
          <button class="col-sortable col-sm" :class="{ 'sort-active': sortSanity !== null }" @click="cycleSortSanity">
            S.M. <span class="sort-icon">{{ sortSanityIcon }}</span>
          </button>
          <span class="col-gain">Gain</span>
          <button class="col-sortable col-mythe" :class="{ 'sort-active': sortMythe !== null }" @click="cycleSortMythe">
            Mythe% <span class="sort-icon">{{ sortMytheIcon }}</span>
          </button>
          <button class="col-sortable" :class="{ 'sort-active': sortSortCount !== null }" @click="cycleSortSortCount">
            Sorts <span class="sort-icon">{{ sortSortCountIcon }}</span>
          </button>
        </div>
        <OuvrageMytheCard
          v-for="o in filtered"
          :id="o.id"
          :key="o.id"
          :titre="o.titre"
          :auteur="o.auteur"
          :langue="o.langue"
          :date="o.date"
          :sante_mental="o.sante_mental"
          :gain_mythe_initial="o.gain_mythe_initial"
          :gain_mythe_complet="o.gain_mythe_complet"
          :mythe_cthulhu="o.mythe_cthulhu"
          :semaine="o.semaine"
          :sort-count="o._count.ouvrage_sort"
        />
      </div>
    </div>

    <div class="legend">
      <span class="legend-title">Légende</span>
      <div class="legend-item">
        <span class="legend-token token-crimson">S.M.</span>
        <span class="legend-desc">Perte de Santé Mentale liée à la lecture du livre.</span>
      </div>
      <div class="legend-item">
        <span class="legend-token token-arcane">Gain</span>
        <span class="legend-desc">Gain de Mythe de Cthulhu — le premier chiffre correspond aux points gagnés lors d'une lecture initiale <span class="legend-abbr">(GMI)</span>, le second lors d'une étude complète <span class="legend-abbr">(GMC)</span>.</span>
      </div>
      <div class="legend-item">
        <span class="legend-token token-gold">Mythe%</span>
        <span class="legend-desc">Valeur seuil de la compétence Mythe de Cthulhu — le lecteur ne peut gagner le GMC que si sa compétence est <em>inférieure</em> à cette valeur.</span>
      </div>
    </div>

  </main>
</template>

<style scoped>
.page-wrapper {
  padding: var(--space-xl);
  max-width: 1300px;
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
  background: var(--color-gold);
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
  border-left: 2px solid var(--color-gold-dim);
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
  color: var(--color-gold);
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

.toolbar { margin-bottom: var(--space-xl); }
.search-bar { position: relative; display: inline-block; }
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
  width: 320px;
  outline: none;
  transition: border-color var(--transition-fast);
}
.search-input::placeholder { color: var(--color-text-muted); font-style: italic; }
.search-input:focus { border-color: var(--color-gold-dim); box-shadow: 0 0 0 2px rgba(184,146,74,0.15); }

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
  color: var(--color-gold);
  animation: pulse-sigil 2s ease-in-out infinite;
}
@keyframes pulse-sigil {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 1; }
}
.state-error { color: var(--color-crimson); }

.list-container {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
}
.list-header-row {
  display: grid;
  grid-template-columns: 1fr 160px 90px 100px 80px 80px 75px 70px;
  align-items: center;
  padding: var(--space-sm) var(--space-lg);
  gap: var(--space-md);
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
.col-lang, .col-date, .col-gain { color: var(--color-text-muted); }
.list-header-row .col-sortable:first-child { min-width: 0; }

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
.col-sortable:hover { color: var(--color-gold); }
.col-sortable.sort-active { color: var(--color-gold); }
.sort-icon { font-size: 0.7rem; opacity: 0.7; }

.list-body {
  max-height: 600px;
  overflow-y: scroll;
  scrollbar-gutter: stable;
  scrollbar-width: thin;
  scrollbar-color: var(--color-border) transparent;
}
.list-body::-webkit-scrollbar { width: 6px; }
.list-body::-webkit-scrollbar-thumb { background: var(--color-border); border-radius: 3px; }

/* OuvrageMytheCard grid must match header */
:deep(.ouvrage-row) {
  grid-template-columns: 1fr 160px 90px 100px 80px 80px 75px 70px;
}

@media (max-width: 1024px) {
  .list-header-row,
  :deep(.ouvrage-row) { grid-template-columns: 1fr 150px 80px 80px 75px 70px; }
  .col-lang,  .col-date  { display: none; }
  :deep(.col-langue), :deep(.col-date) { display: none; }
}

@media (max-width: 768px) {
  .list-header-row,
  :deep(.ouvrage-row) { grid-template-columns: 1fr 80px 80px 70px; }
  .col-auteur, .col-mythe { display: none; }
  :deep(.col-auteur), :deep(.col-mythe) { display: none; }
}

@media (max-width: 640px) {
  .page-wrapper { padding: var(--space-md); }
  .toolbar { width: 100%; }
  .search-bar { display: block; width: 100%; }
  .search-input { width: 100%; box-sizing: border-box; }
  .list-header-row,
  :deep(.ouvrage-row) { grid-template-columns: 1fr 80px 70px; }
  .col-sm { display: none; }
  :deep(.col-sm) { display: none; }
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
}
.legend-item {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  flex-wrap: wrap;
}
.legend-token {
  font-family: var(--font-heading);
  font-size: var(--fs-badge);
  font-weight: bold;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  white-space: nowrap;
  flex-shrink: 0;
}
.token-crimson { background: rgba(139,58,58,0.15);  color: var(--color-crimson); border: 1px solid var(--color-crimson-dim); }
.token-arcane  { background: rgba(127,179,138,0.15); color: var(--color-arcane);  border: 1px solid var(--color-arcane-dim); }
.token-gold    { background: rgba(184,146,74,0.12);  color: var(--color-gold);    border: 1px solid var(--color-gold-dim); }
.legend-desc {
  font-family: var(--font-flavor);
  font-size: var(--fs-section-hint);
  color: var(--color-text-muted);
  line-height: 1.5;
}
.legend-abbr {
  font-family: var(--font-heading);
  font-style: normal;
  font-size: var(--fs-badge);
  letter-spacing: 0.08em;
  color: var(--color-text-secondary);
}
</style>
