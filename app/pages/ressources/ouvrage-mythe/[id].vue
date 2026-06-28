<script setup lang="ts">
import type { OuvrageMytheDetail } from '~/types/ouvrage-mythe'

const route = useRoute()
const id = route.params.id as string

const { data: ouvrage, status, error } = await useFetch<OuvrageMytheDetail>(`/api/ouvrage-mythe/${id}`)

useSeoMeta({
  title: () => ouvrage.value ? `${ouvrage.value.titre} — Ouvrages du Mythe` : 'Ouvrage du Mythe',
  description: () => ouvrage.value
    ? `${ouvrage.value.titre} : sorts enseignés, gain en Mythe de Cthulhu et perte de Santé mentale de cet ouvrage.`
    : 'Détail d\'un ouvrage du Mythe de Cthulhu.'
})

const searchSorts = ref('')

const filteredSorts = computed(() => {
  if (!ouvrage.value) return []
  const entries = ouvrage.value.ouvrage_sort
  const q = normalizeStr(searchSorts.value.trim())
  if (!q) return entries
  return entries.filter((e) => {
    const nameMatch = e.sort ? normalizeStr(e.sort.name).includes(q) : false
    const aliasMatch = e.nom_dans_ouvrage ? normalizeStr(e.nom_dans_ouvrage).includes(q) : false
    return nameMatch || aliasMatch
  })
})
</script>

<template>
  <main class="page-wrapper">

    <div v-if="status === 'pending'" class="state-message">
      <span class="state-sigil">۞</span>
      <p>Consultation des archives interdites…</p>
    </div>

    <div v-else-if="error || !ouvrage" class="state-message state-error">
      <p>Ouvrage introuvable ou erreur de chargement.</p>
      <NuxtLink to="/ressources/ouvrage-mythe" class="back-link">← Retour aux ouvrages</NuxtLink>
    </div>

    <template v-else>
      <div class="breadcrumb">
        <NuxtLink to="/ressources/ouvrage-mythe" class="breadcrumb-link">Ouvrages du Mythe</NuxtLink>
        <span class="breadcrumb-sep">›</span>
        <span class="breadcrumb-current">{{ ouvrage.titre }}</span>
      </div>

      <div class="page-header">
        <h1 class="page-title">{{ ouvrage.titre }}</h1>
        <div class="page-meta">
          <span v-if="ouvrage.auteur" class="meta-author">{{ ouvrage.auteur }}</span>
          <span v-if="ouvrage.date" class="meta-date">{{ ouvrage.date }}</span>
          <span v-if="ouvrage.langue" class="meta-lang">{{ ouvrage.langue }}</span>
        </div>
      </div>

      <!-- Stats bar -->
      <div class="stats-bar">
        <div v-if="ouvrage.sante_mental" class="stat-pill stat-pill--sanity">
          <span class="pill-label">Santé mentale</span>
          <span class="pill-value">{{ ouvrage.sante_mental }}</span>
        </div>
        <div v-if="ouvrage.gain_mythe_initial != null" class="stat-pill stat-pill--gain">
          <span class="pill-label">Gain Mythe</span>
          <span class="pill-value">{{ ouvrage.gain_mythe_initial }} / {{ ouvrage.gain_mythe_complet }}</span>
        </div>
        <div v-if="ouvrage.mythe_cthulhu != null" class="stat-pill stat-pill--mythe">
          <span class="pill-label">Mythe Cthulhu</span>
          <span class="pill-value">{{ ouvrage.mythe_cthulhu }}%</span>
        </div>
        <div v-if="ouvrage.semaine != null" class="stat-pill">
          <span class="pill-label">Semaines</span>
          <span class="pill-value">{{ ouvrage.semaine }}</span>
        </div>
        <div v-if="ouvrage.ouvrage_sort.length > 0" class="stat-pill stat-pill--sorts">
          <span class="pill-label">Sorts</span>
          <span class="pill-value">{{ ouvrage.ouvrage_sort.length }}</span>
        </div>
      </div>

      <!-- Description -->
      <section v-if="ouvrage.description" class="detail-section">
        <h2 class="section-title">Description</h2>
        <p class="section-text">{{ ouvrage.description }}</p>
      </section>

      <!-- Sorts list -->
      <section v-if="ouvrage.ouvrage_sort.length > 0" class="detail-section">
        <h2 class="section-title">Sorts contenus</h2>

        <div class="sorts-toolbar">
          <div class="search-bar">
            <span class="search-icon">🔍</span>
            <input v-model="searchSorts" type="text" class="search-input" placeholder="Rechercher un sort…">
          </div>
          <span class="sorts-count">{{ filteredSorts.length }} / {{ ouvrage.ouvrage_sort.length }}</span>
        </div>

        <div class="sorts-list">
          <template v-for="entry in filteredSorts" :key="entry.id">
            <a
              v-if="entry.sort !== null"
              :href="`/ressources/sort/${entry.sort.id}`"
              target="_blank"
              rel="noopener noreferrer"
              class="sort-entry"
            >
              {{ entry.nom_dans_ouvrage || entry.sort.name }}
              <span v-if="entry.nom_dans_ouvrage && entry.nom_dans_ouvrage !== entry.sort.name" class="sort-alias">
                ({{ entry.sort.name }})
              </span>
            </a>
            <span
              v-else
              class="sort-entry sort-entry--orphan"
              title="Sort non référencé dans la base de données"
            >
              {{ entry.nom_dans_ouvrage || '(sort inconnu)' }}
            </span>
          </template>
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
  color: var(--color-gold);
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
  background: var(--color-gold);
}
.page-title {
  font-family: var(--font-heading);
  font-size: var(--fs-3xl);
  font-weight: 600;
  letter-spacing: 0.06em;
  color: var(--color-gold);
  margin-bottom: var(--space-sm);
}
.page-meta {
  display: flex;
  gap: var(--space-lg);
  flex-wrap: wrap;
}
.meta-author {
  font-family: var(--font-flavor);
  font-style: italic;
  color: var(--color-text-secondary);
  font-size: var(--fs-lg);
}
.meta-date, .meta-lang {
  font-family: var(--font-heading);
  font-size: var(--fs-sm);
  letter-spacing: 0.08em;
  color: var(--color-text-muted);
  align-self: center;
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
.stat-pill--sanity { border-color: rgba(139, 58, 58, 0.3); }
.stat-pill--gain   { border-color: rgba(127, 179, 138, 0.3); }
.stat-pill--mythe  { border-color: rgba(184, 146, 74, 0.3); }
.stat-pill--sorts  { border-color: rgba(127, 179, 138, 0.3); }

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
.stat-pill--sanity .pill-value { color: var(--color-crimson); }
.stat-pill--gain   .pill-value { color: var(--color-arcane); }
.stat-pill--mythe  .pill-value { color: var(--color-gold); }
.stat-pill--sorts  .pill-value { color: var(--color-arcane); }

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

.sorts-toolbar {
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
.search-input:focus { border-color: var(--color-gold-dim); box-shadow: 0 0 0 2px rgba(184,146,74,0.12); }
.sorts-count {
  font-family: var(--font-heading);
  font-size: var(--fs-table-header);
  letter-spacing: 0.1em;
  color: var(--color-text-muted);
}

.sorts-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}
.sort-entry {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-sm) var(--space-lg);
  text-decoration: none;
  font-family: var(--font-heading);
  font-size: var(--fs-row-name);
  font-weight: 600;
  letter-spacing: 0.04em;
  color: var(--color-arcane);
  transition: all var(--transition-fast);
  display: block;
}
.sort-entry:hover {
  border-color: var(--color-arcane-dim);
  background: var(--color-elevated);
  color: var(--color-text-primary);
}
.sort-entry--orphan {
  cursor: default;
  opacity: 0.45;
  color: var(--color-text-muted);
  font-style: italic;
}
.sort-entry--orphan:hover {
  border-color: var(--color-border);
  background: var(--color-surface);
  color: var(--color-text-muted);
}
.sort-alias {
  font-weight: 400;
  font-size: var(--fs-sm);
  color: var(--color-text-muted);
  margin-left: var(--space-xs);
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
  color: var(--color-gold);
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
  color: var(--color-gold);
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
