<script setup lang="ts">
import type { ouvrage_occulte } from '@prisma/client'

const { data: ouvrages, status, error } = useFetch<ouvrage_occulte[]>('/api/ouvrage-occulte')

const search   = ref('')
const expanded = ref<number | null>(null)

// ── TRIS ──────────────────────────────────────────────────────────────────────
const sortTitle  = ref<'asc' | 'desc'>('asc')
const sortAuthor = ref<'asc' | 'desc' | null>(null)
const sortGain   = ref<'desc' | 'asc' | null>(null)
const sortSanity = ref<'desc' | 'asc' | null>(null)
const sortDate   = ref<'asc' | 'desc' | null>(null)

const titleIsActive = computed(() =>
  sortAuthor.value === null && sortGain.value === null && sortSanity.value === null && sortDate.value === null
)

const sortTitleIcon  = computed(() => sortTitle.value === 'asc' ? '↑' : '↓')
const sortAuthorIcon = computed(() => sortAuthor.value === 'asc' ? '↑' : sortAuthor.value === 'desc' ? '↓' : '↕')
const sortGainIcon   = computed(() => sortGain.value === 'desc' ? '↓' : sortGain.value === 'asc' ? '↑' : '↕')
const sortSanityIcon = computed(() => sortSanity.value === 'desc' ? '↓' : sortSanity.value === 'asc' ? '↑' : '↕')
const sortDateIcon   = computed(() => sortDate.value === 'asc' ? '↑' : sortDate.value === 'desc' ? '↓' : '↕')

function cycleSortTitle() {
  sortAuthor.value = null; sortGain.value = null; sortSanity.value = null; sortDate.value = null
  sortTitle.value = sortTitle.value === 'asc' ? 'desc' : 'asc'
}
function cycleSortAuthor() {
  sortGain.value = null; sortSanity.value = null; sortDate.value = null
  sortAuthor.value = sortAuthor.value === null ? 'asc' : sortAuthor.value === 'asc' ? 'desc' : null
}
function cycleSortGain() {
  sortAuthor.value = null; sortSanity.value = null; sortDate.value = null
  sortGain.value = sortGain.value === null ? 'desc' : sortGain.value === 'desc' ? 'asc' : null
}
function cycleSortSanity() {
  sortAuthor.value = null; sortGain.value = null; sortDate.value = null
  sortSanity.value = sortSanity.value === null ? 'desc' : sortSanity.value === 'desc' ? 'asc' : null
}
function cycleSortDate() {
  sortAuthor.value = null; sortGain.value = null; sortSanity.value = null
  sortDate.value = sortDate.value === null ? 'asc' : sortDate.value === 'asc' ? 'desc' : null
}

// ── PARSEURS ──────────────────────────────────────────────────────────────────
const ROMAN: Record<string, number> = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 }

function fromRoman(s: string): number {
  let total = 0
  for (let i = 0; i < s.length; i++) {
    const cur  = ROMAN[s[i]]  ?? 0
    const next = ROMAN[s[i + 1]] ?? 0
    total += cur < next ? -cur : cur
  }
  return total
}

function parseDateValue(date: string | null): number | null {
  if (!date) return null
  const d = date.trim()
  // Après J.-C. : "300 ap. J.-C. environ"
  const apMatch = d.match(/^(\d+)\s+ap\.\s+J\.-C\./)
  if (apMatch) return parseInt(apMatch[1])
  // Avant J.-C. : "2000 av. J.-C. environ"
  const avMatch = d.match(/^(\d+)\s+av\.\s+J\.-C\./)
  if (avMatch) return -parseInt(avMatch[1])
  // Siècle : "XIVe siècle" → milieu du siècle (siècle×100 - 50)
  const siecleMatch = d.match(/^([IVXLCDM]+)[a-zèéê]*\s+si[eè]cle/i)
  if (siecleMatch) return fromRoman(siecleMatch[1].toUpperCase()) * 100 - 50
  // Intervalle : "1555-1557" → moyenne
  const rangeMatch = d.match(/^(\d{3,4})-(\d{3,4})/)
  if (rangeMatch) return Math.round((parseInt(rangeMatch[1]) + parseInt(rangeMatch[2])) / 2)
  // Année simple : "1921"
  if (/^\d+/.test(d)) return parseInt(d)
  return null
}

function parseSanityValue(sanity: string | null): number | null {
  if (!sanity) return null
  let s = sanity.trim()
  // Ignorer la perte minimale "X/" avant la formule principale
  const slashIdx = s.indexOf('/')
  if (slashIdx !== -1) s = s.slice(slashIdx + 1)
  // Parser NdM ou NdM+K
  const m = s.match(/^(\d+)[dD](\d+)(?:\+(\d+))?/)
  if (!m) return null
  return parseInt(m[1]) * parseInt(m[2]) + (m[3] ? parseInt(m[3]) : 0)
}

// ── FILTERED + SORTED ─────────────────────────────────────────────────────────
const filtered = computed(() => {
  if (!ouvrages.value) return []

  const q = normalizeStr(search.value.trim())
  let result = ouvrages.value.filter((o) => {
    if (q) {
      const matchTitle  = normalizeStr(o.title).includes(q)
      const matchAuthor = o.author   ? normalizeStr(o.author).includes(q)   : false
      const matchLang   = o.language ? normalizeStr(o.language).includes(q) : false
      if (!matchTitle && !matchAuthor && !matchLang) return false
    }
    return true
  })

  if (sortDate.value) {
    result = [...result].sort((a, b) => {
      const av = parseDateValue(a.date), bv = parseDateValue(b.date)
      if (av === null && bv === null) return 0
      if (av === null) return 1
      if (bv === null) return -1
      return sortDate.value === 'asc' ? av - bv : bv - av
    })
  } else if (sortGain.value) {
    result = [...result].sort((a, b) => {
      const av = a.occult_gain, bv = b.occult_gain
      if (av === null && bv === null) return 0
      if (av === null) return 1
      if (bv === null) return -1
      return sortGain.value === 'desc' ? bv - av : av - bv
    })
  } else if (sortSanity.value) {
    result = [...result].sort((a, b) => {
      const av = parseSanityValue(a.sanity), bv = parseSanityValue(b.sanity)
      if (av === null && bv === null) return 0
      if (av === null) return 1
      if (bv === null) return -1
      return sortSanity.value === 'desc' ? bv - av : av - bv
    })
  } else if (sortAuthor.value) {
    result = [...result].sort((a, b) => {
      const cmp = (a.author ?? '').localeCompare(b.author ?? '', 'fr')
      return sortAuthor.value === 'asc' ? cmp : -cmp
    })
  } else {
    result = [...result].sort((a, b) => {
      const cmp = a.title.localeCompare(b.title, 'fr')
      return sortTitle.value === 'asc' ? cmp : -cmp
    })
  }

  return result
})

function toggle(id: number) {
  expanded.value = expanded.value === id ? null : id
}
</script>

<template>
  <main class="page-wrapper">

    <div class="page-header">
      <h1 class="page-title">Ouvrages Occultes</h1>
      <p class="page-subtitle">Volumes maudits et traités interdits des archives de Miskatonic</p>
    </div>

    <blockquote class="flavor-quote">
      <p>Certains livres ne devraient jamais être ouverts. Chaque page tournée est un pas de plus vers l'abîme.</p>
      <cite>— Avertissement apocryphe, Necronomicon, édition latine</cite>
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
      <div class="list-header-row">
        <button class="col-sortable" :class="{ 'sort-active': titleIsActive }" @click="cycleSortTitle">
          Titre <span class="sort-icon">{{ sortTitleIcon }}</span>
        </button>
        <button class="col-sortable" :class="{ 'sort-active': sortAuthor !== null }" @click="cycleSortAuthor">
          Auteur <span class="sort-icon">{{ sortAuthorIcon }}</span>
        </button>
        <span class="col-lang">Langue</span>
        <button class="col-sortable" :class="{ 'sort-active': sortDate !== null }" @click="cycleSortDate">
          Date <span class="sort-icon">{{ sortDateIcon }}</span>
        </button>
        <button class="col-sortable" :class="{ 'sort-active': sortSanity !== null }" @click="cycleSortSanity">
          Santé ment. <span class="sort-icon">{{ sortSanityIcon }}</span>
        </button>
        <button class="col-sortable" :class="{ 'sort-active': sortGain !== null }" @click="cycleSortGain">
          Gain Occ. <span class="sort-icon">{{ sortGainIcon }}</span>
        </button>
      </div>
      <div class="list-body">
        <template v-for="ouvrage in filtered" :key="ouvrage.id">
          <div
            class="list-row"
            :class="{ 'row-expanded': expanded === ouvrage.id }"
            @click="toggle(ouvrage.id)"
          >
            <span class="col-title row-title">{{ ouvrage.title }}</span>
            <span class="col-author row-muted">{{ ouvrage.author ?? '—' }}</span>
            <span class="col-lang row-muted">{{ ouvrage.language ?? '—' }}</span>
            <span class="col-date row-muted">{{ ouvrage.date ?? '—' }}</span>
            <span class="col-sanity row-sanity">{{ ouvrage.sanity ?? '—' }}</span>
            <span class="col-gain row-gain">{{ ouvrage.occult_gain != null ? `+${ouvrage.occult_gain}` : '—' }}</span>
          </div>
          <Transition name="expand">
            <div v-if="expanded === ouvrage.id" class="row-detail">
              <div v-if="ouvrage.info" class="detail-block">
                <span class="detail-label">Informations</span>
                <p class="detail-text">{{ ouvrage.info }}</p>
              </div>
              <div v-if="ouvrage.description" class="detail-block">
                <span class="detail-label">Description</span>
                <p class="detail-text">{{ ouvrage.description }}</p>
              </div>
              <p v-if="!ouvrage.info && !ouvrage.description" class="detail-text detail-empty">Aucun détail disponible.</p>
            </div>
          </Transition>
        </template>
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

/* ── TOOLBAR ─────────────────────────────────────────────── */
.toolbar { margin-bottom: var(--space-xl); }
.search-bar { position: relative; display: inline-block; }
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
  width: 320px;
  outline: none;
  transition: border-color var(--transition-fast);
}
.search-input::placeholder { color: var(--color-text-muted); font-style: italic; }
.search-input:focus { border-color: var(--color-gold-dim); box-shadow: 0 0 0 2px rgba(184,146,74,0.15); }

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
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
}
.list-header-row,
.list-row {
  display: grid;
  grid-template-columns: 1fr 160px 100px 80px 100px 80px;
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
.col-sortable:hover { color: var(--color-gold); }
.col-sortable.sort-active { color: var(--color-gold); }
.sort-icon { font-size: 0.7rem; opacity: 0.7; }

.list-body {
  max-height: 580px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--color-border) transparent;
}
.list-body::-webkit-scrollbar { width: 6px; }
.list-body::-webkit-scrollbar-thumb { background: var(--color-border); border-radius: 3px; }

.list-row {
  cursor: pointer;
  transition: background var(--transition-fast);
  border-bottom: 1px solid transparent;
}
.list-row:nth-child(odd)  { background: var(--color-surface); }
.list-row:nth-child(even) { background: var(--color-deep); }
.list-row:hover { background: var(--color-elevated); }
.list-row.row-expanded {
  background: var(--color-elevated) !important;
  border-bottom-color: var(--color-gold-dim);
}

/* ── CELLS ───────────────────────────────────────────────── */
.row-title {
  font-family: var(--font-heading);
  font-size: var(--fs-md);
  font-weight: 600;
  letter-spacing: 0.03em;
  color: var(--color-gold);
}
.row-muted {
  font-family: var(--font-flavor);
  font-style: italic;
  font-size: var(--fs-base);
  color: var(--color-text-muted);
}
.row-sanity {
  font-family: var(--font-heading);
  font-size: var(--fs-md);
  color: var(--color-crimson);
}
.row-gain {
  font-family: var(--font-heading);
  font-size: var(--fs-md);
  font-weight: 600;
  color: var(--color-arcane);
}

/* ── EXPANDED ROW ────────────────────────────────────────── */
.row-detail {
  padding: var(--space-md) var(--space-xl) var(--space-lg);
  background: var(--color-void);
  border-bottom: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}
.detail-block { display: flex; flex-direction: column; gap: var(--space-xs); }
.detail-label {
  font-family: var(--font-heading);
  font-size: var(--fs-2xs);
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--color-gold);
}
.detail-text {
  font-family: var(--font-flavor);
  font-style: italic;
  font-size: var(--fs-base);
  color: var(--color-text-secondary);
  line-height: 1.7;
}
.detail-empty { color: var(--color-text-muted); }

/* ── TRANSITION ──────────────────────────────────────────── */
.expand-enter-active, .expand-leave-active { transition: all 0.2s ease; overflow: hidden; }
.expand-enter-from, .expand-leave-to { opacity: 0; max-height: 0; padding-top: 0; padding-bottom: 0; }
.expand-enter-to, .expand-leave-from { max-height: 300px; }

/* ── RESPONSIVE ──────────────────────────────────────────── */
@media (max-width: 1024px) {
  .list-header-row, .list-row { grid-template-columns: 1fr 120px 80px 60px 90px 70px; }
}

@media (max-width: 640px) {
  .page-wrapper { padding: var(--space-md); }
  .flavor-quote p { font-size: var(--fs-lg); }
  .toolbar { width: 100%; }
  .search-bar { display: block; width: 100%; }
  .search-input { width: 100%; box-sizing: border-box; }
  .list-container { overflow-x: auto; }
  .list-header-row, .list-row { grid-template-columns: 1fr 70px; }
  .col-author, .col-lang, .col-date, .col-sanity { display: none; }
  .list-body { max-height: 420px; }
}
</style>
