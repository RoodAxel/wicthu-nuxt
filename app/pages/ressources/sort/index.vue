<script setup lang="ts">
type SortItem = {
  id: number
  name: string
  cout: string | null
  temps_incantation: string | null
  description: string | null
  version_approfondie: string | null
  autre_name: string[] | null
  _count: { children: number }
}

const { data: sorts, status, error } = useFetch<SortItem[]>('/api/sort')

const search        = ref('')
const avecVariantes = ref(false)

const filtered = computed(() => {
  if (!sorts.value) return []
  const q = normalizeStr(search.value.trim())
  return sorts.value.filter((s) => {
    if (avecVariantes.value && s._count.children === 0) return false
    if (q && !normalizeStr(s.name).includes(q)) return false
    return true
  })
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
        <span class="stat-number">{{ filtered.length }}</span>
        <span class="stat-label">Résultats</span>
      </div>
    </div>

    <div class="toolbar">
      <div class="search-bar">
        <span class="search-icon">🔍</span>
        <input v-model="search" type="text" class="search-input" placeholder="Rechercher un sort…">
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

    <div v-else class="cards-grid">
      <SortCard
        v-for="s in filtered"
        :key="s.id"
        :id="s.id"
        :name="s.name"
        :cout="s.cout"
        :temps_incantation="s.temps_incantation"
        :description="s.description"
        :children-count="s._count.children"
        :parent-name="null"
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
}
.filter-checkbox { accent-color: var(--color-arcane); width: 16px; height: 16px; cursor: pointer; }
.filter-label {
  font-family: var(--font-heading);
  font-size: var(--fs-xs);
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

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--space-lg);
}

@media (max-width: 640px) {
  .page-wrapper { padding: var(--space-md); }
  .toolbar { flex-direction: column; align-items: flex-start; }
  .search-input { width: 100%; box-sizing: border-box; }
  .cards-grid { grid-template-columns: 1fr; }
}
</style>
