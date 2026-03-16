<script setup lang="ts">
import type { phobie } from '@prisma/client'

const { data: phobies, status, error } = useFetch<phobie[]>('/api/phobie')

const search = ref('')
const random = ref<phobie | null>(null)
const sortName = ref<'asc' | 'desc'>('asc')

const sortNameIcon = computed(() => sortName.value === 'asc' ? '↑' : '↓')

function cycleSortName() {
  sortName.value = sortName.value === 'asc' ? 'desc' : 'asc'
}

const filtered = computed(() => {
  if (!phobies.value) return []
  const q = normalizeStr(search.value.trim())
  const result = phobies.value.filter(p =>
    !q || normalizeStr(p.name).includes(q) || normalizeStr(p.description).includes(q)
  )
  return [...result].sort((a, b) => {
    const cmp = a.name.localeCompare(b.name, 'fr')
    return sortName.value === 'asc' ? cmp : -cmp
  })
})

function pickRandom() {
  if (!phobies.value?.length) return
  const pool = phobies.value
  random.value = pool[Math.floor(Math.random() * pool.length)]!
}
</script>

<template>
  <main class="page-wrapper">

    <div class="page-header">
      <h1 class="page-title">Phobies</h1>
      <p class="page-subtitle">Terreurs irrationnelles ancrées dans la psyché des survivants</p>
    </div>

    <blockquote class="flavor-quote">
      <p>La peur est la plus ancienne et la plus puissante des émotions humaines — et la peur la plus ancienne est celle de l'inconnu.</p>
      <cite>— H.P. Lovecraft, L'Horreur Surnaturelle en Littérature</cite>
    </blockquote>

    <div class="stats-panel">
      <div class="stat-card">
        <span class="stat-number">{{ phobies?.length ?? 0 }}</span>
        <span class="stat-label">Phobies</span>
      </div>
      <div class="stat-card">
        <span class="stat-number">{{ filtered.length }}</span>
        <span class="stat-label">Résultats</span>
      </div>
    </div>

    <div class="toolbar">
      <div class="search-bar">
        <span class="search-icon">🔍</span>
        <input v-model="search" type="text" class="search-input" placeholder="Rechercher une phobie…">
      </div>
      <button class="btn-random" :disabled="!phobies?.length" @click="pickRandom">
        <span class="btn-random-icon">⚄</span>
        Phobie aléatoire
      </button>
    </div>

    <Transition name="random-reveal">
      <div v-if="random" class="random-result">
        <div class="random-header">
          <span class="random-label">Tirage</span>
          <button class="random-close" aria-label="Fermer" @click="random = null">✕</button>
        </div>
        <p class="random-name">{{ random.name }}</p>
        <p class="random-number">Numéro {{ random.id }}</p>
        <p class="random-desc">{{ random.description }}</p>
      </div>
    </Transition>

    <div v-if="status === 'pending'" class="state-message">
      <span class="state-sigil">۞</span>
      <p>Consultation des dossiers psychiatriques…</p>
    </div>

    <div v-else-if="error" class="state-message state-error">
      <p>Les archives refusent de répondre : {{ error.message }}</p>
    </div>

    <div v-else-if="filtered.length === 0" class="state-message">
      <p>Aucune phobie ne correspond à votre requête.</p>
    </div>

    <div v-else class="list-container">
      <div class="list-header-row">
        <span class="col-id">N°</span>
        <button class="col-sortable sort-active" @click="cycleSortName">
          Phobie <span class="sort-icon">{{ sortNameIcon }}</span>
        </button>
        <span class="col-desc">Description</span>
      </div>
      <div class="list-body">
        <div
          v-for="(phobie, index) in filtered"
          :key="phobie.id"
          class="list-row"
          :class="index % 2 === 0 ? 'row-even' : 'row-odd'"
        >
          <span class="col-id row-id">{{ phobie.id }}</span>
          <span class="col-name row-name">{{ phobie.name }}</span>
          <span class="col-desc row-desc">{{ phobie.description }}</span>
        </div>
      </div>
    </div>

  </main>
</template>

<style scoped>
.page-wrapper {
  padding: var(--space-xl);
  max-width: 1100px;
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
.toolbar {
  display: flex;
  align-items: center;
  gap: var(--space-lg);
  margin-bottom: var(--space-xl);
  flex-wrap: wrap;
}
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
  grid-template-columns: 44px 220px 1fr;
  align-items: baseline;
  padding: var(--space-sm) var(--space-lg);
  gap: var(--space-lg);
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
  align-items: center;
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

.list-row { transition: background var(--transition-fast); }
.row-even { background: var(--color-surface); }
.row-odd  { background: var(--color-deep); }
.list-row:hover { background: var(--color-elevated); }

.row-id {
  font-family: var(--font-heading);
  font-size: var(--fs-sm);
  color: var(--color-text-muted);
}
.row-name {
  font-family: var(--font-heading);
  font-size: var(--fs-md);
  font-weight: 600;
  letter-spacing: 0.03em;
  color: var(--color-gold);
}

.row-desc {
  font-family: var(--font-flavor);
  font-style: italic;
  font-size: var(--fs-lg);
  color: var(--color-text-secondary);
  line-height: 1.5;
  padding: var(--space-xs) 0;
}

/* ── RANDOM BUTTON ───────────────────────────────────────── */
.btn-random {
  display: inline-flex;
  align-items: center;
  gap: var(--space-sm);
  font-family: var(--font-heading);
  font-size: var(--fs-md);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  padding: var(--space-sm) var(--space-xl);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-gold);
  color: var(--color-gold);
  background: var(--color-gold-dim);
  cursor: pointer;
  transition: all var(--transition-fast);
}
.btn-random:hover:not(:disabled) {
  background: var(--color-gold);
  color: var(--color-void);
}
.btn-random:disabled { opacity: 0.4; cursor: default; }
.btn-random-icon { font-size: var(--fs-xl); }

/* ── RANDOM RESULT ───────────────────────────────────────── */
.random-result {
  background: var(--color-surface);
  border: 1px solid var(--color-gold);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  margin-bottom: var(--space-xl);
  box-shadow: 0 0 20px rgba(184, 146, 74, 0.2);
}
.random-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-sm);
}
.random-label {
  font-family: var(--font-heading);
  font-size: var(--fs-2xs);
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--color-gold);
}
.random-close {
  position: absolute;
  top: var(--space-md);
  right: var(--space-md);
  font-size: var(--fs-2xs);
  color: var(--color-text-muted);
  background: transparent;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  width: 20px;
  height: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
}
.random-close:hover { border-color: var(--color-gold-dim); color: var(--color-gold); }
.random-name {
  font-family: var(--font-heading);
  font-size: var(--fs-xl);
  font-weight: 600;
  letter-spacing: 0.04em;
  color: var(--color-gold);
  margin-bottom: 2px;
}
.random-number {
  font-family: var(--font-heading);
  font-size: var(--fs-xs);
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--color-text-muted);
  margin-bottom: var(--space-sm);
}
.random-desc {
  font-family: var(--font-flavor);
  font-style: italic;
  font-size: var(--fs-lg);
  color: var(--color-text-secondary);
  line-height: 1.7;
}

/* ── TRANSITION ──────────────────────────────────────────── */
.random-reveal-enter-active { transition: all 0.25s ease; }
.random-reveal-leave-active { transition: all 0.2s ease; }
.random-reveal-enter-from { opacity: 0; transform: translateY(-8px); }
.random-reveal-leave-to   { opacity: 0; transform: translateY(-4px); }

/* ── RESPONSIVE ──────────────────────────────────────────── */
@media (max-width: 640px) {
  .page-wrapper { padding: var(--space-md); }
  .flavor-quote p { font-size: var(--fs-lg); }
  .toolbar { flex-direction: column; align-items: stretch; gap: var(--space-sm); }
  .search-bar { display: block; width: 100%; }
  .search-input { width: 100%; box-sizing: border-box; }
  .btn-random { width: 100%; justify-content: center; }
  .list-body { max-height: 420px; }
  .list-header-row { display: none; }
  .list-row {
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
    padding: var(--space-md) var(--space-lg);
  }
  .col-id { font-size: var(--fs-2xs); color: var(--color-text-muted); }
  .col-desc { font-size: var(--fs-md); }
}
</style>
