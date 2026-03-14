<script setup lang="ts">
type SortChild = {
  id: number
  name: string
  cout: string | null
  temps_incantation: string | null
  description: string | null
  version_approfondie: string | null
  autre_name: string[] | null
}

type SortDetail = {
  id: number
  name: string
  cout: string | null
  temps_incantation: string | null
  description: string | null
  version_approfondie: string | null
  autre_name: string[] | null
  parentId: number | null
  parent: { id: number; name: string } | null
  children: SortChild[]
}

const route = useRoute()
const id = route.params.id as string

const { data: sort, status, error } = await useFetch<SortDetail>(`/api/sort/${id}`)

useHead(() => ({
  title: sort.value ? `${sort.value.name} — Sorts` : 'Sort',
}))
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
        <div class="children-list">
          <div v-for="child in sort.children" :key="child.id" class="child-card" @click="$router.push(`/ressources/sort/${child.id}`)">
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
  align-items: center;
  gap: var(--space-md);
  margin-bottom: var(--space-xs);
  flex-wrap: wrap;
}
.child-name {
  font-family: var(--font-heading);
  font-size: var(--fs-md);
  font-weight: 600;
  letter-spacing: 0.04em;
  color: var(--color-arcane);
  flex: 1;
}
.child-meta {
  display: flex;
  gap: var(--space-md);
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
