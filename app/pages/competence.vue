<script setup lang="ts">
import type { Competence } from '@prisma/client'

type CompetenceWithCategory = Competence & {
  category: { id: number; name: string } | null
}

const { data: competences, status, error } = await useFetch<CompetenceWithCategory[]>('/api/competence')

const search = ref('')
const activeFilter = ref<'all' | 'category' | 'rare' | 'modern'>('all')

const filtered = computed(() => {
  if (!competences.value) return []
  return competences.value.filter((c) => {
    const matchSearch = c.name.toLowerCase().includes(search.value.toLowerCase())
    if (!matchSearch) return false
    if (activeFilter.value === 'category') return c.isCategory
    if (activeFilter.value === 'rare') return c.rare
    if (activeFilter.value === 'modern') return c.modern
    return true
  })
})

const stats = computed(() => ({
  total: competences.value?.length ?? 0,
  categories: competences.value?.filter(c => c.isCategory).length ?? 0,
  rare: competences.value?.filter(c => c.rare).length ?? 0,
  modern: competences.value?.filter(c => c.modern).length ?? 0
}))
</script>

<template>
  <main class="page-wrapper">

    <div class="page-header">
      <h1 class="page-title">Compétences</h1>
      <p class="page-subtitle">Savoir-faire et aptitudes des investigateurs de Providence</p>
    </div>

    <blockquote class="flavor-quote">
      <p>L'homme cultivé n'est jamais sans ressource — c'est dans la connaissance que réside la mince barrière entre la raison et l'abîme.</p>
      <cite>— Manuel de l'Investigateur, Arkham 1923</cite>
    </blockquote>

    <div class="stats-panel">
      <div class="stat-card">
        <span class="stat-number">{{ stats.total }}</span>
        <span class="stat-label">Compétences</span>
      </div>
      <div class="stat-card">
        <span class="stat-number">{{ stats.categories }}</span>
        <span class="stat-label">Catégories</span>
      </div>
      <div class="stat-card">
        <span class="stat-number">{{ stats.rare }}</span>
        <span class="stat-label">Rares</span>
      </div>
      <div class="stat-card">
        <span class="stat-number">{{ stats.modern }}</span>
        <span class="stat-label">Modernes</span>
      </div>
    </div>

    <div class="toolbar">
      <div class="filters">
        <button class="tag" :class="{ active: activeFilter === 'all' }" @click="activeFilter = 'all'">Toutes</button>
        <button class="tag" :class="{ active: activeFilter === 'category' }" @click="activeFilter = 'category'">Catégories</button>
        <button class="tag rare-tag" :class="{ active: activeFilter === 'rare' }" @click="activeFilter = 'rare'">Rare</button>
        <button class="tag" :class="{ active: activeFilter === 'modern' }" @click="activeFilter = 'modern'">Moderne</button>
      </div>
      <div class="search-bar">
        <span class="search-icon">🔍</span>
        <input v-model="search" type="text" class="search-input" placeholder="Rechercher une compétence…">
      </div>
    </div>

    <div v-if="status === 'pending'" class="state-message">
      <span class="state-sigil">⬡</span>
      <p>Consultation des archives…</p>
    </div>

    <div v-else-if="error" class="state-message state-error">
      <p>Les archives refusent de répondre : {{ error.message }}</p>
    </div>

    <div v-else-if="filtered.length === 0" class="state-message">
      <p>Aucune compétence ne correspond à votre requête.</p>
    </div>

    <div v-else class="cards-grid">
      <div
        v-for="competence in filtered"
        :key="competence.id"
        class="card"
        :class="{ 'is-category': competence.isCategory }"
      >
        <div class="card-header">
          <span class="card-name">{{ competence.name }}</span>
          <span v-if="competence.isCategory" class="card-badge badge-category">Catégorie</span>
          <span v-else-if="competence.rare" class="card-badge badge-rare">Rare</span>
          <span v-else-if="competence.modern" class="card-badge badge-modern">Moderne</span>
        </div>

        <p v-if="competence.category" class="card-category-label">
          Catégorie : <span>{{ competence.category.name }}</span>
        </p>

        <div class="card-footer">
          <div v-if="!competence.isCategory" class="base-value">
            <span class="base-value-label">Base</span>
            <span class="base-value-number">{{ competence.baseValue ?? 0 }}</span>
            <span class="base-value-pct">%</span>
          </div>
          <span v-else class="stat-label">—</span>
        </div>
      </div>
    </div>

    <div class="ornament">
      ✦ ✦ ✦
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
  background: var(--color-arcane);
}
.page-title {
  font-family: var(--font-heading);
  font-size: 1.6rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  color: var(--color-text-primary);
  margin-bottom: var(--space-xs);
}
.page-subtitle {
  font-family: var(--font-flavor);
  font-style: italic;
  color: var(--color-text-secondary);
  font-size: 0.95rem;
}

/* ── FLAVOR QUOTE ────────────────────────────────────────── */
.flavor-quote {
  background: var(--color-abyssal);
  border-left: 2px solid var(--color-arcane-dim);
  padding: var(--space-lg);
  margin-bottom: var(--space-xl);
  border-radius: 0 var(--radius-md) var(--radius-md) 0;
}
.flavor-quote p {
  font-family: var(--font-flavor);
  font-style: italic;
  font-size: 0.95rem;
  color: var(--color-text-secondary);
  line-height: 1.8;
}
.flavor-quote cite {
  display: block;
  margin-top: var(--space-sm);
  font-family: var(--font-heading);
  font-size: 0.65rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-text-muted);
}

/* ── STATS PANEL ─────────────────────────────────────────── */
.stats-panel {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-md);
  margin-bottom: var(--space-xl);
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
  font-size: 1.6rem;
  color: var(--color-arcane);
  display: block;
  line-height: 1;
  margin-bottom: var(--space-xs);
}
.stat-label {
  font-family: var(--font-heading);
  font-size: 0.6rem;
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
.filters {
  display: flex;
  gap: var(--space-sm);
  flex-wrap: wrap;
}

/* ── TAGS ────────────────────────────────────────────────── */
.tag {
  font-family: var(--font-heading);
  font-size: 0.65rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  padding: var(--space-xs) var(--space-md);
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
  background: transparent;
}
.tag:hover { border-color: var(--color-arcane-dim); color: var(--color-arcane); }
.tag.active {
  background: var(--color-arcane-dim);
  border-color: var(--color-arcane);
  color: var(--color-arcane);
}
.tag.rare-tag { border-color: var(--color-gold-dim); color: var(--color-gold); }
.tag.rare-tag:hover { border-color: var(--color-gold); }
.tag.rare-tag.active { background: var(--color-gold-dim); border-color: var(--color-gold); color: var(--color-gold); }

/* ── SEARCH ──────────────────────────────────────────────── */
.search-bar {
  position: relative;
  margin-left: auto;
}
.search-icon {
  position: absolute;
  left: var(--space-sm);
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-text-muted);
  font-size: 0.85rem;
  pointer-events: none;
}
.search-input {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-sm) var(--space-lg) var(--space-sm) 2.5rem;
  color: var(--color-text-primary);
  font-family: var(--font-body);
  font-size: 0.9rem;
  width: 240px;
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
  outline: none;
}
.search-input::placeholder { color: var(--color-text-muted); font-style: italic; }
.search-input:focus {
  border-color: var(--color-arcane-dim);
  box-shadow: var(--shadow-glow);
}

/* ── STATE MESSAGES ──────────────────────────────────────── */
.state-message {
  text-align: center;
  padding: var(--space-2xl);
  color: var(--color-text-muted);
  font-family: var(--font-flavor);
  font-style: italic;
}
.state-sigil {
  display: block;
  font-size: 2.5rem;
  margin-bottom: var(--space-md);
  color: var(--color-arcane);
  animation: pulse-sigil 2s ease-in-out infinite;
}
@keyframes pulse-sigil {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 1; }
}
.state-error { color: var(--color-crimson); }

/* ── CARDS GRID ──────────────────────────────────────────── */
.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--space-lg);
}

.card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  transition: all var(--transition-normal);
  cursor: pointer;
  position: relative;
  overflow: hidden;
  animation: fadeInUp 0.4s ease both;
}
.card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at top left, rgba(127, 179, 138, 0.05), transparent 60%);
  opacity: 0;
  transition: opacity var(--transition-normal);
  pointer-events: none;
}
.card:hover {
  border-color: var(--color-border-glow);
  box-shadow: var(--shadow-card), var(--shadow-glow);
  transform: translateY(-2px);
}
.card:hover::before { opacity: 1; }

.card.is-category {
  border-color: var(--color-gold-dim);
  background: linear-gradient(135deg, var(--color-surface), rgba(184, 146, 74, 0.04));
}
.card.is-category:hover {
  border-color: var(--color-gold);
  box-shadow: var(--shadow-card), 0 0 20px rgba(184, 146, 74, 0.12);
}

.card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: var(--space-md);
}
.card-name {
  font-family: var(--font-heading);
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: var(--color-text-primary);
  line-height: 1.3;
}

.card-badge {
  font-family: var(--font-heading);
  font-size: 0.55rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  flex-shrink: 0;
  margin-left: var(--space-sm);
}
.badge-category { background: rgba(184, 146, 74, 0.15); color: var(--color-gold); border: 1px solid var(--color-gold-dim); }
.badge-rare     { background: rgba(139, 58, 58, 0.15);  color: #c47070;           border: 1px solid var(--color-crimson-dim); }
.badge-modern   { background: rgba(127, 179, 138, 0.15);color: var(--color-arcane);border: 1px solid var(--color-arcane-dim); }

.card-category-label {
  font-family: var(--font-flavor);
  font-style: italic;
  font-size: 0.8rem;
  color: var(--color-text-muted);
  margin-bottom: var(--space-sm);
}
.card-category-label span { color: var(--color-gold); }

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: var(--space-md);
  padding-top: var(--space-md);
  border-top: 1px solid var(--color-border);
}
.base-value {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}
.base-value-label {
  font-family: var(--font-heading);
  font-size: 0.6rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--color-text-muted);
}
.base-value-number {
  font-family: var(--font-heading);
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-arcane);
}
.base-value-pct {
  font-size: 0.75rem;
  color: var(--color-text-muted);
}

/* ── ORNAMENT ────────────────────────────────────────────── */
.ornament {
  text-align: center;
  margin: var(--space-xl) 0;
  color: var(--color-text-muted);
  font-size: 0.8rem;
  letter-spacing: 0.3em;
  display: flex;
  align-items: center;
  gap: var(--space-md);
}
.ornament::before,
.ornament::after {
  content: '';
  flex: 1;
  height: 1px;
  background: linear-gradient(to right, transparent, var(--color-border), transparent);
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ── RESPONSIVE ──────────────────────────────────────────── */
@media (max-width: 768px) {
  .stats-panel { grid-template-columns: repeat(2, 1fr); }
  .search-bar { margin-left: 0; width: 100%; }
  .search-input { width: 100%; }
  .toolbar { flex-direction: column; align-items: flex-start; }
}
</style>
