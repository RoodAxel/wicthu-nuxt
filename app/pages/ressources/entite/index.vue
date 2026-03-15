<script setup lang="ts">
type EntiteItem = {
  id: number
  name: string
  titre: string | null
  categorie: string
  description: string | null
  protection: string | null
  attaquesParRound: string | null
  perteSanteMentale: string | null
  _count: {
    statBlocks: number
    attaques: number
    competences: number
    pouvoirs: number
  }
}

const CATEGORIES = [
  { value: 'CREATURE_MYTHE',       label: 'Créatures du Mythe' },
  { value: 'DIVINITE_MYTHE',       label: 'Divinités du Mythe' },
  { value: 'HORREUR_TRADITIONNEL', label: 'Horreurs Traditionnelles' },
  { value: 'FAUNE',                label: 'Faune' },
]

const { data: entites, status, error } = useFetch<EntiteItem[]>('/api/entite')

const search           = ref('')
const categorieFilter  = ref<string | null>(null)

const filtered = computed(() => {
  if (!entites.value) return []
  const q = normalizeStr(search.value.trim())
  return entites.value.filter((e) => {
    if (categorieFilter.value && e.categorie !== categorieFilter.value) return false
    if (q && !normalizeStr(e.name).includes(q) && !normalizeStr(e.titre ?? '').includes(q)) return false
    return true
  })
})

const countByCategorie = computed(() => {
  if (!entites.value) return {}
  return Object.fromEntries(
    CATEGORIES.map(c => [c.value, entites.value!.filter(e => e.categorie === c.value).length])
  )
})
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

      <div class="filter-pills">
        <button
          class="filter-pill"
          :class="{ 'filter-pill--active': categorieFilter === null }"
          @click="categorieFilter = null"
        >
          Toutes
        </button>
        <button
          v-for="cat in CATEGORIES"
          :key="cat.value"
          class="filter-pill"
          :class="[`filter-pill--${cat.value.toLowerCase()}`, { 'filter-pill--active': categorieFilter === cat.value }]"
          @click="categorieFilter = cat.value"
        >
          {{ cat.label }}
          <span class="pill-count">{{ countByCategorie[cat.value] ?? 0 }}</span>
        </button>
      </div>
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

    <div v-else class="cards-grid">
      <EntiteCard
        v-for="e in filtered"
        :key="e.id"
        :id="e.id"
        :name="e.name"
        :titre="e.titre"
        :categorie="e.categorie"
        :description="e.description"
        :protection="e.protection"
        :attaques-par-round="e.attaquesParRound"
        :perte-sante-mentale="e.perteSanteMentale"
      />
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

.toolbar {
  display: flex;
  align-items: flex-start;
  gap: var(--space-lg);
  margin-bottom: var(--space-xl);
  flex-wrap: wrap;
  flex-direction: column;
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

.filter-pills {
  display: flex;
  gap: var(--space-xs);
  flex-wrap: wrap;
}

.filter-pill {
  font-family: var(--font-heading);
  font-size: var(--fs-2xs);
  font-weight: bold;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-text-muted);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: var(--space-xs) var(--space-sm);
  background: transparent;
  cursor: pointer;
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  gap: var(--space-xs);
}
.filter-pill:hover { border-color: var(--color-arcane-dim); color: var(--color-arcane); }
.filter-pill--active {
  background: var(--color-surface);
  color: var(--color-arcane);
  border-color: var(--color-arcane-dim);
}

.filter-pill--creature_mythe:hover,
.filter-pill--creature_mythe.filter-pill--active  { color: var(--color-crimson); border-color: rgba(139, 58, 58, 0.4); }
.filter-pill--divinite_mythe:hover,
.filter-pill--divinite_mythe.filter-pill--active  { color: var(--color-gold); border-color: rgba(184, 146, 74, 0.4); }

.pill-count {
  font-size: var(--fs-2xs);
  opacity: 0.6;
}

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

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: var(--space-lg);
}

@media (max-width: 640px) {
  .page-wrapper { padding: var(--space-md); }
  .toolbar { flex-direction: column; align-items: flex-start; }
  .search-input { width: 100%; box-sizing: border-box; }
  .cards-grid { grid-template-columns: 1fr; }
}
</style>
