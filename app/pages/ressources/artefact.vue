<script setup lang="ts">
import type { artefact } from '@prisma/client'

const { data: artefacts, status, error } = useFetch<artefact[]>('/api/artefact')

const search = ref('')
const expandedId = ref<number | null>(null)

function toggleExpand(id: number) {
  expandedId.value = expandedId.value === id ? null : id
}

const filtered = computed(() => {
  if (!artefacts.value) return []
  const q = search.value.toLowerCase()
  return artefacts.value.filter(a =>
    a.name.toLowerCase().includes(q) ||
    (a.description ?? '').toLowerCase().includes(q) ||
    (a.use_by ?? '').toLowerCase().includes(q)
  )
})
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
      <div class="search-bar">
        <span class="search-icon">🔍</span>
        <input v-model="search" type="text" class="search-input" placeholder="Rechercher un artefact…">
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
      <p>Aucun artefact ne correspond à votre requête.</p>
    </div>

    <div v-else class="list-container">
      <div class="list-header-row">
        <span class="col-name">Artefact</span>
        <span class="col-use">Utilisé par</span>
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
  font-family: var(--font-heading);
  font-size: var(--fs-table-header);
  font-weight: bold;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--color-text-muted);
}
.list-header-row > span {
  padding: var(--space-sm) var(--space-sm);
}
.list-header-row > span:first-child { padding-left: var(--space-lg); }
.list-header-row > span:last-child  { padding-right: var(--space-lg); }

.list-body {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: subgrid;
  max-height: 600px;
  overflow-y: auto;
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
