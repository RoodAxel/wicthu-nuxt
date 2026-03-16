<script setup lang="ts">
import type { SortDetail } from '~/types/sort'

const route = useRoute()
const id = route.params.id as string

const { data: sort, status, error } = await useFetch<SortDetail>(`/api/sort/${id}`)

useHead(() => ({
  title: sort.value ? `${sort.value.name} — Sorts` : 'Sort'
}))

const searchVariantes = ref('')

const filteredChildren = computed(() => {
  if (!sort.value) return []
  const q = normalizeStr(searchVariantes.value.trim())
  if (!q) return sort.value.children
  return sort.value.children.filter(c => normalizeStr(c.name).includes(q))
})
</script>

<template>
  <main class="page-wrapper">

    <div v-if="status === 'pending'" class="state-message">
      <span class="state-sigil">۞</span>
      <p>Déchiffrage du grimoire…</p>
    </div>

    <div v-else-if="error || !sort" class="state-message state-error">
      <p>Sort introuvable ou erreur de chargement.</p>
      <NuxtLink to="/ressources/sort" class="back-link">← Retour aux sorts</NuxtLink>
    </div>

    <template v-else>
      <div class="breadcrumb">
        <NuxtLink to="/ressources/sort" class="breadcrumb-link">Sorts</NuxtLink>
        <span class="breadcrumb-sep">›</span>
        <template v-if="sort.parent">
          <NuxtLink :to="`/ressources/sort/${sort.parent.id}`" class="breadcrumb-link">{{ sort.parent.name }}</NuxtLink>
          <span class="breadcrumb-sep">›</span>
        </template>
        <span class="breadcrumb-current">{{ sort.name }}</span>
      </div>

      <div class="page-header">
        <div class="header-top">
          <h1 class="page-title">{{ sort.name }}</h1>
          <span v-if="sort.parent" class="tag-variant">Variante de {{ sort.parent.name }}</span>
        </div>
        <div v-if="sort.autre_name && sort.autre_name.length > 0" class="aliases">
          <span class="aliases-label">Autres noms :</span>
          <span class="aliases-list">{{ sort.autre_name.join(', ') }}</span>
        </div>
      </div>

      <!-- Stats bar -->
      <div class="stats-bar">
        <div v-if="sort.cout" class="stat-pill stat-pill--cost">
          <span class="pill-label">Coût</span>
          <span class="pill-value">{{ sort.cout }}</span>
        </div>
        <div v-if="sort.temps_incantation" class="stat-pill stat-pill--time">
          <span class="pill-label">Incantation</span>
          <span class="pill-value">{{ sort.temps_incantation }}</span>
        </div>
        <div v-if="sort.children.length > 0" class="stat-pill stat-pill--variants">
          <span class="pill-label">Variantes</span>
          <span class="pill-value">{{ sort.children.length }}</span>
        </div>
      </div>

      <!-- Description -->
      <section v-if="sort.description" class="detail-section">
        <h2 class="section-title">Description</h2>
        <p class="section-text">{{ sort.description }}</p>
      </section>

      <!-- Version approfondie -->
      <section v-if="sort.version_approfondie" class="detail-section">
        <h2 class="section-title">Version approfondie</h2>
        <p class="section-text">{{ sort.version_approfondie }}</p>
      </section>

      <!-- Children list -->
      <section v-if="sort.children.length > 0" class="detail-section">
        <h2 class="section-title">Variantes</h2>

        <div class="variants-toolbar">
          <div class="search-bar">
            <span class="search-icon">🔍</span>
            <input v-model="searchVariantes" type="text" class="search-input" placeholder="Rechercher une variante…">
          </div>
          <span class="variants-count">{{ filteredChildren.length }} / {{ sort.children.length }}</span>
        </div>

        <div class="children-list">
          <div v-for="child in filteredChildren" :key="child.id" class="child-card" @click="$router.push(`/ressources/sort/${child.id}`)">
            <div class="child-header">
              <span class="child-name">{{ child.name }}</span>
              <div class="child-meta">
                <span v-if="child.cout" class="child-cost">{{ child.cout }}</span>
                <span v-if="child.temps_incantation" class="child-time">{{ child.temps_incantation }}</span>
              </div>
            </div>
            <p v-if="child.description" class="child-desc">{{ child.description }}</p>
          </div>
        </div>
      </section>

    </template>
  </main>
</template>

<style scoped>
.page-wrapper {
  padding: var(--space-xl);
  max-width: 900px;
  margin: 0 auto;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  margin-bottom: var(--space-xl);
  font-family: var(--font-heading);
  font-size: var(--fs-xs);
  letter-spacing: 0.1em;
  text-transform: uppercase;
}
.breadcrumb-link {
  color: var(--color-arcane);
  text-decoration: none;
  transition: opacity var(--transition-fast);
}
.breadcrumb-link:hover { opacity: 0.7; }
.breadcrumb-sep { color: var(--color-text-muted); }
.breadcrumb-current { color: var(--color-text-muted); }

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

.header-top {
  display: flex;
  align-items: flex-start;
  gap: var(--space-md);
  flex-wrap: wrap;
  margin-bottom: var(--space-sm);
}
.page-title {
  font-family: var(--font-heading);
  font-size: var(--fs-3xl);
  font-weight: 600;
  letter-spacing: 0.06em;
  color: var(--color-arcane);
  flex: 1;
}
.tag-variant {
  font-family: var(--font-heading);
  font-size: var(--fs-xs);
  font-weight: bold;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-text-muted);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: var(--space-xs) var(--space-sm);
  white-space: nowrap;
  align-self: center;
}

.aliases {
  font-family: var(--font-flavor);
  font-style: italic;
  color: var(--color-text-muted);
  font-size: var(--fs-base);
}
.aliases-label {
  font-style: normal;
  font-family: var(--font-heading);
  font-size: var(--fs-xs);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-text-muted);
  margin-right: var(--space-xs);
}

.stats-bar {
  display: flex;
  gap: var(--space-md);
  flex-wrap: wrap;
  margin-bottom: var(--space-2xl);
}
.stat-pill {
  display: flex;
  flex-direction: column;
  gap: 2px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-sm) var(--space-lg);
  min-width: 100px;
}
.stat-pill--cost { border-color: rgba(139, 58, 58, 0.3); }
.stat-pill--time { border-color: var(--color-border); }
.stat-pill--variants { border-color: rgba(127, 179, 138, 0.3); }

.pill-label {
  font-family: var(--font-heading);
  font-size: var(--fs-2xs);
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--color-text-muted);
}
.pill-value {
  font-family: var(--font-body);
  font-size: var(--fs-lg);
  font-weight: 600;
  color: var(--color-text-primary);
}
.stat-pill--cost .pill-value { color: var(--color-crimson); }
.stat-pill--variants .pill-value { color: var(--color-arcane); }

.detail-section {
  margin-bottom: var(--space-2xl);
}
.section-title {
  font-family: var(--font-heading);
  font-size: var(--fs-xs);
  font-weight: bold;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--color-text-muted);
  margin-bottom: var(--space-md);
  padding-bottom: var(--space-xs);
  border-bottom: 1px solid var(--color-border);
}
.section-text {
  font-family: var(--font-flavor);
  font-style: italic;
  font-size: var(--fs-lg);
  color: var(--color-text-secondary);
  line-height: 1.8;
}

.variants-toolbar {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  margin-bottom: var(--space-md);
}
.search-bar { position: relative; }
.search-icon {
  position: absolute;
  left: var(--space-sm);
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-text-muted);
  pointer-events: none;
  font-size: var(--fs-secondary);
}
.search-input {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-xs) var(--space-lg) var(--space-xs) 2.2rem;
  color: var(--color-text-primary);
  font-family: var(--font-body);
  font-size: var(--fs-secondary);
  width: 260px;
  outline: none;
  transition: border-color var(--transition-fast);
}
.search-input::placeholder { color: var(--color-text-muted); font-style: italic; }
.search-input:focus { border-color: var(--color-arcane-dim); box-shadow: 0 0 0 2px rgba(127,179,138,0.12); }
.variants-count {
  font-family: var(--font-heading);
  font-size: var(--fs-table-header);
  letter-spacing: 0.1em;
  color: var(--color-text-muted);
}

.children-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}
.child-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-md) var(--space-lg);
  cursor: pointer;
  transition: all var(--transition-fast);
}
.child-card:hover {
  border-color: var(--color-arcane-dim);
  background: var(--color-elevated);
}
.child-header {
  display: flex;
  align-items: baseline;
  gap: var(--space-xs) var(--space-lg);
  margin-bottom: var(--space-xs);
  flex-wrap: wrap;
}
.child-name {
  font-family: var(--font-heading);
  font-size: var(--fs-md);
  font-weight: 600;
  letter-spacing: 0.04em;
  color: var(--color-arcane);
  flex: 999 1 0;
  min-width: min(100%, 220px);
}
.child-meta {
  display: flex;
  gap: var(--space-md);
  flex-shrink: 0;
}
.child-cost {
  font-family: var(--font-heading);
  font-size: var(--fs-sm);
  color: var(--color-crimson);
  font-weight: 600;
}
.child-time {
  font-family: var(--font-heading);
  font-size: var(--fs-sm);
  color: var(--color-text-muted);
}
.child-desc {
  font-family: var(--font-flavor);
  font-style: italic;
  font-size: var(--fs-base);
  color: var(--color-text-muted);
  line-height: 1.6;
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
.back-link {
  display: inline-block;
  margin-top: var(--space-md);
  color: var(--color-arcane);
  text-decoration: none;
  font-family: var(--font-heading);
  font-size: var(--fs-sm);
  letter-spacing: 0.1em;
}

@media (max-width: 640px) {
  .page-wrapper { padding: var(--space-md); }
  .page-title { font-size: var(--fs-2xl); }
}
</style>
