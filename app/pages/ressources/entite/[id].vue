<script setup lang="ts">
import type { EntiteDetail, StatBlock } from '~/types/entite'

const CATEGORIE_LABELS: Record<string, string> = {
  CREATURE_MYTHE: 'Créature du Mythe',
  DIVINITE_MYTHE: 'Divinité du Mythe',
  HORREUR_TRADITIONNEL: 'Horreur Traditionnelle',
  FAUNE: 'Faune'
}

const STAT_ROWS: { label: string, val: keyof StatBlock, jet: keyof StatBlock }[] = [
  { label: 'FOR', val: 'forVal', jet: 'forJet' },
  { label: 'CON', val: 'conVal', jet: 'conJet' },
  { label: 'TAI', val: 'taiVal', jet: 'taiJet' },
  { label: 'DEX', val: 'dexVal', jet: 'dexJet' },
  { label: 'INT', val: 'intVal', jet: 'intJet' },
  { label: 'POU', val: 'pouVal', jet: 'pouJet' },
  { label: 'APP', val: 'appVal', jet: 'appJet' },
  { label: 'EDU', val: 'eduVal', jet: 'eduJet' }
]

const route = useRoute()
const id = route.params.id as string

const { data: entite, status, error } = await useFetch<EntiteDetail>(`/api/entite/${id}`)

useHead(() => ({
  title: entite.value ? `${entite.value.name} — Entité` : 'Entité'
}))
</script>

<template>
  <main class="page-wrapper">

    <div v-if="status === 'pending'" class="state-message">
      <span class="state-sigil">۞</span>
      <p>Consultation du entité…</p>
    </div>

    <div v-else-if="error || !entite" class="state-message state-error">
      <p>Entité introuvable ou erreur de chargement.</p>
      <NuxtLink to="/ressources/entite" class="back-link">← Retour au entité</NuxtLink>
    </div>

    <template v-else>
      <!-- Breadcrumb -->
      <div class="breadcrumb">
        <NuxtLink to="/ressources/entite" class="breadcrumb-link">Entité</NuxtLink>
        <span class="breadcrumb-sep">›</span>
        <span class="breadcrumb-current">{{ entite.name }}</span>
      </div>

      <!-- Header -->
      <div class="page-header" :class="`page-header--${entite.categorie.toLowerCase()}`">
        <div class="header-top">
          <div class="header-name-block">
            <h1 class="page-title">{{ entite.name }}</h1>
            <p v-if="entite.titre" class="page-titre">{{ entite.titre }}</p>
          </div>
          <span class="tag-categorie">{{ CATEGORIE_LABELS[entite.categorie] ?? entite.categorie }}</span>
        </div>
      </div>

      <!-- Citation -->
      <blockquote v-if="entite.citationTexte" class="citation-block">
        <p>{{ entite.citationTexte }}</p>
        <cite v-if="entite.citationSource">— {{ entite.citationSource }}</cite>
      </blockquote>

      <!-- Stat pills -->
      <div class="stats-bar">
        <div v-if="entite.protection" class="stat-pill stat-pill--protection">
          <span class="pill-label">Protection</span>
          <span class="pill-value">{{ entite.protection }}</span>
        </div>
        <div v-if="entite.attaquesParRound" class="stat-pill">
          <span class="pill-label">Attaques / round</span>
          <span class="pill-value">{{ entite.attaquesParRound }}</span>
        </div>
        <div v-if="entite.perteSanteMentale" class="stat-pill stat-pill--sante">
          <span class="pill-label">Perte de Santé Mentale</span>
          <span class="pill-value">{{ entite.perteSanteMentale }}</span>
        </div>
      </div>

      <!-- Description -->
      <section v-if="entite.description" class="detail-section">
        <h2 class="section-title">Description</h2>
        <p class="section-text">{{ entite.description }}</p>
      </section>

      <!-- Combat -->
      <section v-if="entite.optionsCombatDesc" class="detail-section">
        <h2 class="section-title">Options de combat</h2>
        <p class="section-text">{{ entite.optionsCombatDesc }}</p>
      </section>

      <!-- Stat Blocks -->
      <section v-if="entite.statBlocks.length > 0" class="detail-section">
        <h2 class="section-title">Statistiques</h2>
        <div v-for="block in entite.statBlocks" :key="block.id" class="stat-block">
          <div v-if="block.formeName || block.formeNote" class="stat-block-header">
            <span v-if="block.formeName" class="stat-block-name">{{ block.formeName }}</span>
            <span v-if="block.formeNote" class="stat-block-note">{{ block.formeNote }}</span>
          </div>

          <div class="stats-grid">
            <div v-for="stat in STAT_ROWS" :key="stat.label" class="stat-cell">
              <span class="stat-abbr">{{ stat.label }}</span>
              <span class="stat-val">{{ block[stat.val] ?? '—' }}</span>
              <span class="stat-roll">{{ block[stat.jet] ?? '' }}</span>
            </div>
          </div>

          <div class="derived-stats">
            <div v-if="block.pvMoyen" class="derived-item">
              <span class="derived-label">PV moy.</span>
              <span class="derived-value">{{ block.pvMoyen }}</span>
            </div>
            <div v-if="block.impactMoy" class="derived-item">
              <span class="derived-label">Impact</span>
              <span class="derived-value">{{ block.impactMoy }}</span>
            </div>
            <div v-if="block.carrureMoy" class="derived-item">
              <span class="derived-label">Carrure</span>
              <span class="derived-value">{{ block.carrureMoy }}</span>
            </div>
            <div v-if="block.pmMoyen" class="derived-item">
              <span class="derived-label">PM moy.</span>
              <span class="derived-value">{{ block.pmMoyen }}</span>
            </div>
            <div v-if="block.mouvement" class="derived-item">
              <span class="derived-label">Mouvement</span>
              <span class="derived-value">{{ block.mouvement }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Attaques -->
      <section v-if="entite.attaques.length > 0" class="detail-section">
        <h2 class="section-title">Attaques</h2>
        <div class="attaques-list">
          <div v-for="attaque in entite.attaques" :key="attaque.id" class="attaque-item">
            <div class="attaque-header">
              <span class="attaque-name">{{ attaque.name }}</span>
              <span v-if="attaque.isManoeuvre" class="badge-manoeuvre">Manœuvre</span>
              <div class="attaque-meta">
                <span v-if="attaque.valeur" class="attaque-valeur">{{ attaque.valeur }}</span>
                <span v-if="attaque.degats" class="attaque-degats">{{ attaque.degats }}</span>
              </div>
            </div>
            <p v-if="attaque.description" class="attaque-desc">{{ attaque.description }}</p>
          </div>
        </div>
      </section>

      <!-- Compétences -->
      <section v-if="entite.competences.length > 0" class="detail-section">
        <h2 class="section-title">Compétences</h2>
        <div class="competences-grid">
          <div v-for="comp in entite.competences" :key="comp.id" class="competence-item">
            <span class="comp-name">{{ comp.name }}</span>
            <span v-if="comp.valeur" class="comp-valeur">{{ comp.valeur }}</span>
          </div>
        </div>
      </section>

      <!-- Pouvoirs distinctif -->
      <section v-if="entite.pouvoirs.length > 0" class="detail-section">
        <h2 class="section-title">Pouvoirs distinctif</h2>
        <div class="pouvoirs-list">
          <div v-for="pouvoir in entite.pouvoirs" :key="pouvoir.id" class="pouvoir-item">
            <h3 class="pouvoir-name">{{ pouvoir.name }}</h3>
            <p v-if="pouvoir.description" class="pouvoir-desc">{{ pouvoir.description }}</p>
          </div>
        </div>
      </section>

      <!-- Culte / Adoration -->
      <section v-if="entite.culteAdoration" class="detail-section">
        <h2 class="section-title">Culte et adorateurs</h2>
        <p class="section-text">{{ entite.culteAdoration }}</p>
      </section>

      <!-- Autres particularités -->
      <section v-if="entite.autresParticularites" class="detail-section">
        <h2 class="section-title">Autres particularités</h2>
        <p class="section-text">{{ entite.autresParticularites }}</p>
      </section>

    </template>
  </main>
</template>

<style scoped>
.page-wrapper {
  padding: var(--space-xl);
  max-width: 960px;
  margin: 0 auto;
}

/* Breadcrumb */
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
.breadcrumb-link { color: var(--color-arcane); text-decoration: none; transition: opacity var(--transition-fast); }
.breadcrumb-link:hover { opacity: 0.7; }
.breadcrumb-sep { color: var(--color-text-muted); }
.breadcrumb-current { color: var(--color-text-muted); }

/* Header */
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
.page-header--creature_mythe::after  { background: var(--color-crimson); }
.page-header--divinite_mythe::after  { background: var(--color-gold); }

.header-top {
  display: flex;
  align-items: flex-start;
  gap: var(--space-md);
  flex-wrap: wrap;
}
.header-name-block {
  flex: 1;
  min-width: 0;
}
.page-title {
  font-family: var(--font-heading);
  font-size: var(--fs-3xl);
  font-weight: 600;
  letter-spacing: 0.06em;
  color: var(--color-arcane);
}
.page-header--creature_mythe .page-title  { color: var(--color-crimson); }
.page-header--divinite_mythe .page-title  { color: var(--color-gold); }

.page-titre {
  font-family: var(--font-flavor);
  font-style: italic;
  font-size: var(--fs-lg);
  color: var(--color-text-muted);
  margin-top: var(--space-xs);
}

.tag-categorie {
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
  flex-shrink: 0;
}
.page-header--creature_mythe  .tag-categorie { color: var(--color-crimson); border-color: rgba(139, 58, 58, 0.3); }
.page-header--divinite_mythe  .tag-categorie { color: var(--color-gold); border-color: rgba(184, 146, 74, 0.3); }
.page-header--horreur_traditionnel .tag-categorie { color: var(--color-arcane); border-color: rgba(127, 179, 138, 0.3); }
.page-header--faune               .tag-categorie { color: var(--color-arcane); border-color: rgba(127, 179, 138, 0.3); }

/* Citation */
.citation-block {
  background: var(--color-void);
  border-left: 2px solid var(--color-gold-dim);
  padding: var(--space-lg);
  margin-bottom: var(--space-xl);
  border-radius: 0 var(--radius-md) var(--radius-md) 0;
}
.citation-block p {
  font-family: var(--font-flavor);
  font-style: italic;
  font-size: var(--fs-xl);
  color: var(--color-text-secondary);
  line-height: 1.8;
}
.citation-block cite {
  display: block;
  margin-top: var(--space-sm);
  font-family: var(--font-heading);
  font-size: var(--fs-sm);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-gold);
}

/* Stats bar */
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
  min-width: 120px;
}
.stat-pill--protection { border-color: rgba(127, 179, 138, 0.3); }
.stat-pill--sante      { border-color: rgba(139, 58, 58, 0.3); }
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
.stat-pill--protection .pill-value { color: var(--color-arcane); }
.stat-pill--sante .pill-value      { color: var(--color-crimson); }

/* Sections */
.detail-section { margin-bottom: var(--space-2xl); }
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

/* Stat Block */
.stat-block {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  margin-bottom: var(--space-md);
}
.stat-block-header {
  display: flex;
  align-items: baseline;
  gap: var(--space-sm);
  margin-bottom: var(--space-md);
}
.stat-block-name {
  font-family: var(--font-heading);
  font-size: var(--fs-md);
  font-weight: 600;
  letter-spacing: 0.06em;
  color: var(--color-text-primary);
}
.stat-block-note {
  font-family: var(--font-flavor);
  font-style: italic;
  font-size: var(--fs-sm);
  color: var(--color-text-muted);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-sm);
  margin-bottom: var(--space-md);
}
@media (max-width: 640px) {
  .stats-grid { grid-template-columns: repeat(4, 1fr); }
}

.stat-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  background: var(--color-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-xs) var(--space-sm);
  text-align: center;
}
.stat-abbr {
  font-family: var(--font-heading);
  font-size: var(--fs-2xs);
  font-weight: bold;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--color-text-muted);
}
.stat-val {
  font-family: var(--font-display);
  font-size: var(--fs-xl);
  color: var(--color-arcane);
  line-height: 1;
}
.stat-roll {
  font-family: var(--font-body);
  font-size: var(--fs-2xs);
  color: var(--color-text-muted);
}

.derived-stats {
  display: flex;
  gap: var(--space-lg);
  flex-wrap: wrap;
  padding-top: var(--space-sm);
  border-top: 1px solid var(--color-border);
}
.derived-item {
  display: flex;
  flex-direction: column;
  gap: 1px;
}
.derived-label {
  font-family: var(--font-heading);
  font-size: var(--fs-2xs);
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--color-text-muted);
}
.derived-value {
  font-family: var(--font-body);
  font-size: var(--fs-base);
  font-weight: 600;
  color: var(--color-text-primary);
}

/* Attaques */
.attaques-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}
.attaque-item {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-md) var(--space-lg);
}
.attaque-header {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  flex-wrap: wrap;
  margin-bottom: var(--space-xs);
}
.attaque-name {
  font-family: var(--font-heading);
  font-size: var(--fs-md);
  font-weight: 600;
  letter-spacing: 0.04em;
  color: var(--color-text-primary);
  flex: 1;
}
.badge-manoeuvre {
  font-family: var(--font-heading);
  font-size: var(--fs-2xs);
  font-weight: bold;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-gold);
  border: 1px solid var(--color-gold-dim);
  border-radius: var(--radius-sm);
  padding: 2px var(--space-xs);
  white-space: nowrap;
  flex-shrink: 0;
}
.attaque-meta {
  display: flex;
  gap: var(--space-md);
  align-items: center;
}
.attaque-valeur {
  font-family: var(--font-heading);
  font-size: var(--fs-sm);
  color: var(--color-arcane);
  font-weight: 600;
}
.attaque-degats {
  font-family: var(--font-heading);
  font-size: var(--fs-sm);
  color: var(--color-crimson);
  font-weight: 600;
}
.attaque-desc {
  font-family: var(--font-flavor);
  font-style: italic;
  font-size: var(--fs-base);
  color: var(--color-text-muted);
  line-height: 1.6;
}

/* Compétences */
.competences-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: var(--space-xs);
}
.competence-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-xs) var(--space-md);
}
.comp-name {
  font-family: var(--font-heading);
  font-size: var(--fs-sm);
  letter-spacing: 0.04em;
  color: var(--color-text-secondary);
}
.comp-valeur {
  font-family: var(--font-body);
  font-size: var(--fs-sm);
  font-weight: 600;
  color: var(--color-arcane);
}

/* Pouvoirs */
.pouvoirs-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}
.pouvoir-item {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-left: 3px solid var(--color-arcane-dim);
  border-radius: var(--radius-md);
  padding: var(--space-md) var(--space-lg);
}
.pouvoir-name {
  font-family: var(--font-heading);
  font-size: var(--fs-md);
  font-weight: 600;
  letter-spacing: 0.04em;
  color: var(--color-arcane);
  margin-bottom: var(--space-xs);
}
.pouvoir-desc {
  font-family: var(--font-flavor);
  font-style: italic;
  font-size: var(--fs-base);
  color: var(--color-text-secondary);
  line-height: 1.7;
}

/* States */
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
  .stats-grid { grid-template-columns: repeat(4, 1fr); }
}
</style>
