<script setup lang="ts">
import type { OccupationDetail, OccupationSkill } from '~/types/investigateur'

const route = useRoute()
const id = route.params.id as string

const { data: occ, status, error } = await useFetch<OccupationDetail>(`/api/occupation/${id}`)

// Sans ça la page rendrait son message « introuvable » avec un statut 200
// (soft-404), que les moteurs indexeraient comme une page valide.
if (import.meta.server && (error.value || !occ.value)) {
  const event = useRequestEvent()
  if (event) setResponseStatus(event, 404)
}

const href = (o: { id: number, slug: string | null }) => `/ressources/occupation/${o.slug ?? o.id}`

const { isFavorite, toggle: toggleFavorite } = useOccupationFavorites()

/** Ouvre le formulaire de creation avec cette occupation deja selectionnee. */
const creerHref = computed(() =>
  occ.value
    ? `/investigateur/creer?occupation=${encodeURIComponent(occ.value.slug ?? occ.value.name)}`
    : '/investigateur/creer')

const isFixed = (s: OccupationSkill) =>
  s.type === 'FIXED' || s.type === 'FIXED_SPEC' || s.type === 'FREE_SPEC'

const fixedSkills = computed(() => occ.value?.skills.filter(isFixed) ?? [])
const choiceSkills = computed(() => occ.value?.skills.filter(s => !isFixed(s)) ?? [])

/** Libellé d'une compétence imposée. */
function skillLabel(s: OccupationSkill): string {
  const name = s.competence?.name ?? '—'
  if (s.type === 'FIXED') return name
  if (s.type === 'FIXED_SPEC') return `${name} (${s.specName})`
  return `${name} (${s.note ?? 'au choix'})` // FREE_SPEC
}

/** Intitulé d'un choix : « 2 compétences au choix ». */
function choiceLabel(s: OccupationSkill): string {
  const n = s.choiceCount ?? 1
  return n === 1 ? '1 compétence au choix' : `${n} compétences au choix`
}

/** Une option peut porter sa propre spécialité : « Combat rapproché (Corps à corps) ». */
function optionLabel(o: OccupationSkill['options'][number]): string {
  return o.specName ? `${o.competence.name} (${o.specName})` : o.competence.name
}

const eraLabel = { CLASSIQUE: 'Classique', MODERNE: 'Moderne' } as const

useSeoMeta({
  title: () => occ.value ? `${occ.value.name} · Occupations` : 'Occupation',
  description: () => occ.value
    ? `${occ.value.name} : compétences d'occupation, formule de points, crédit recommandé et idées de contacts pour L'Appel de Cthulhu.`
    : 'Détail d\'une occupation de L\'Appel de Cthulhu.'
})
</script>

<template>
  <main class="page-wrapper">

    <div v-if="status === 'pending'" class="state-message">
      <span class="state-sigil">۞</span>
      <p>Consultation des archives…</p>
    </div>

    <div v-else-if="error || !occ" class="state-message state-error">
      <p>Occupation introuvable ou erreur de chargement.</p>
      <NuxtLink to="/ressources/occupation" class="back-link">← Retour aux occupations</NuxtLink>
    </div>

    <template v-else>
      <ResourceDetailNav
        :items="[
          { label: 'Occupations', to: '/ressources/occupation' },
          ...(occ.parent ? [{ label: occ.parent.name, to: href(occ.parent) }] : []),
          { label: occ.name }
        ]"
        back-to="/ressources/occupation"
        back-label="Toutes les occupations"
        accent="gold"
      />

      <div class="page-header">
        <div class="header-top">
          <h1 class="page-title">{{ occ.name }}</h1>
          <button
            class="fav-btn"
            :class="{ 'fav-btn--on': isFavorite(occ.slug) }"
            :aria-pressed="isFavorite(occ.slug)"
            :title="isFavorite(occ.slug) ? 'Retirer des favoris' : 'Ajouter aux favoris'"
            @click="toggleFavorite(occ.slug)"
          >{{ isFavorite(occ.slug) ? '★' : '☆' }}</button>
          <span v-if="occ.is_lovecraftian" class="badge badge-lore">Lovecraft</span>
          <span v-if="occ.era" class="badge" :class="occ.era === 'MODERNE' ? 'badge-modern' : 'badge-classic'">
            {{ eraLabel[occ.era] }}
          </span>
        </div>
        <div v-if="occ.autre_name.length" class="aliases">
          <span class="aliases-label">Aussi appelée :</span>
          <span class="aliases-list">{{ occ.autre_name.join(', ') }}</span>
        </div>
        <p v-if="occ.parent" class="parent-note">
          Variante de <NuxtLink :to="href(occ.parent)" class="inline-link">{{ occ.parent.name }}</NuxtLink>
        </p>
      </div>

      <!-- Chiffres clés -->
      <div class="stats-bar">
        <div v-if="occ.point_competence" class="stat-pill stat-pill--formula">
          <span class="pill-label">Points de compétences</span>
          <span class="pill-value">{{ occ.point_competence }}</span>
        </div>
        <div v-if="occ.credit_min !== null" class="stat-pill stat-pill--credit">
          <span class="pill-label">Crédit recommandé</span>
          <span class="pill-value">{{ occ.credit_min }}–{{ occ.credit_max }}</span>
        </div>
        <div v-if="occ.children.length" class="stat-pill stat-pill--variants">
          <span class="pill-label">Variantes</span>
          <span class="pill-value">{{ occ.children.length }}</span>
        </div>
      </div>

      <section v-if="occ.description" class="detail-section">
        <h2 class="section-title">Description</h2>
        <p class="section-text">{{ occ.description }}</p>
      </section>

      <section class="detail-section">
        <h2 class="section-title">Compétences d'occupation</h2>

        <div class="skills-grid">
          <div v-if="fixedSkills.length" class="skills-col">
            <p class="skills-col-title">Imposées</p>
            <ul class="skills-list">
              <li v-for="s in fixedSkills" :key="s.id" class="skill-fixed">
                <span class="skill-dot" />
                <span class="skill-name">{{ skillLabel(s) }}</span>
                <span v-if="s.type === 'FREE_SPEC'" class="skill-tag tag-free">
                  {{ (s.choiceCount ?? 1) > 1 ? `${s.choiceCount} au choix` : 'au choix' }}
                </span>
              </li>
            </ul>
          </div>

          <div v-if="choiceSkills.length" class="skills-col">
            <p class="skills-col-title">À choisir</p>
            <ul class="skills-list">
              <li v-for="s in choiceSkills" :key="s.id" class="skill-choice">
                <span class="skill-choice-header">
                  <span class="skill-count">{{ choiceLabel(s) }}</span>
                  <span v-if="s.note" class="skill-note">{{ s.note }}</span>
                </span>
                <span v-if="s.type === 'CHOICE_FROM_LIST'" class="skill-options">
                  <span v-for="o in s.options" :key="o.competence.id" class="skill-pill">{{ optionLabel(o) }}</span>
                </span>
              </li>
            </ul>
          </div>
        </div>

        <p v-if="occ.note" class="skills-footnote">{{ occ.note }}</p>
      </section>

      <section v-if="occ.contacts" class="detail-section">
        <h2 class="section-title">Idées de contacts</h2>
        <p class="section-text">{{ occ.contacts }}</p>
      </section>

      <section v-if="occ.children.length" class="detail-section">
        <h2 class="section-title">Variantes</h2>
        <div class="children-list">
          <NuxtLink v-for="c in occ.children" :key="c.id" :to="href(c)" class="child-card">
            <div class="child-header">
              <span class="child-name">{{ c.name }}</span>
              <div class="child-meta">
                <span v-if="c.credit_min !== null" class="child-credit">Crédit {{ c.credit_min }}–{{ c.credit_max }}</span>
                <span v-if="c.point_competence" class="child-formula">{{ c.point_competence }}</span>
              </div>
            </div>
            <p v-if="c.contacts" class="child-desc">{{ c.contacts }}</p>
          </NuxtLink>
        </div>
      </section>

      <section v-if="occ.voir_aussi.length" class="detail-section">
        <h2 class="section-title">Voir aussi</h2>
        <p class="section-text">{{ occ.voir_aussi.join(', ') }}</p>
      </section>

      <div class="page-actions">
        <NuxtLink :to="creerHref" class="cta-link">Créer un investigateur {{ occ.name }} →</NuxtLink>
      </div>

    </template>
  </main>
</template>

<style scoped>
.page-wrapper {
  max-width: 900px;
  margin: 0 auto;
  padding-block: var(--space-2xl);
  padding-inline: var(--space-lg);
}

/* ── ÉTATS ───────────────────────────────────────────────── */
.state-message {
  text-align: center;
  padding: var(--space-2xl) var(--space-lg);
  font-family: var(--font-flavor);
  font-style: italic;
  color: var(--color-text-muted);
}
.state-sigil {
  display: block;
  font-size: var(--fs-sigil);
  color: var(--color-gold);
  animation: pulse-sigil 1.5s ease-in-out infinite;
  margin-bottom: var(--space-sm);
}
.state-error { color: var(--color-crimson); }

/* ── EN-TÊTE ─────────────────────────────────────────────── */
.page-header { margin-bottom: var(--space-xl); }
.header-top {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  flex-wrap: wrap;
}
.page-title {
  font-family: var(--font-display);
  font-size: var(--fs-page-title);
  color: var(--color-gold);
  letter-spacing: 0.04em;
}
.aliases, .parent-note {
  margin-top: var(--space-xs);
  font-family: var(--font-flavor);
  font-style: italic;
  font-size: var(--fs-secondary);
  color: var(--color-text-muted);
}
.aliases-label { text-transform: uppercase; letter-spacing: 0.1em; font-style: normal; font-family: var(--font-heading); font-size: var(--fs-micro); }
.inline-link { color: var(--color-arcane); text-decoration: none; }
.inline-link:hover { text-decoration: underline; }

.badge {
  font-family: var(--font-heading);
  font-size: var(--fs-micro);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  padding: 3px 8px;
  border-radius: var(--radius-sm);
  white-space: nowrap;
}
.badge-lore { background: rgba(184, 146, 74, 0.15); color: var(--color-gold); border: 1px solid var(--color-gold-dim); }
.badge-modern { background: rgba(127, 179, 138, 0.15); color: var(--color-arcane); border: 1px solid var(--color-arcane-dim); }
.badge-classic { background: rgba(139, 58, 58, 0.15); color: var(--color-crimson); border: 1px solid var(--color-crimson); }

.fav-btn {
  width: 34px;
  height: 34px;
  padding: 0;
  background: none;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: 1.2rem;
  line-height: 1;
  color: var(--color-text-muted);
  cursor: pointer;
  transition: all var(--transition-fast);
}
.fav-btn:hover { color: var(--color-gold); border-color: var(--color-gold-dim); background: rgba(184, 146, 74, 0.12); }
.fav-btn--on { color: var(--color-gold); border-color: var(--color-gold-dim); }

/* ── CHIFFRES CLÉS ───────────────────────────────────────── */
.stats-bar {
  display: flex;
  gap: var(--space-md);
  flex-wrap: wrap;
  margin-bottom: var(--space-xl);
}
.stat-pill {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: var(--space-sm) var(--space-md);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-left: 2px solid var(--color-gold);
  border-radius: 0 var(--radius-md) var(--radius-md) 0;
}
.pill-label {
  font-family: var(--font-heading);
  font-size: var(--fs-micro);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-text-muted);
}
.pill-value {
  font-family: var(--font-heading);
  font-size: var(--fs-row-value);
  color: var(--color-text-primary);
}
.stat-pill--credit { border-left-color: var(--color-arcane); }
.stat-pill--credit .pill-value { color: var(--color-arcane); }
.stat-pill--variants { border-left-color: var(--color-fog); }

/* ── SECTIONS ────────────────────────────────────────────── */
.detail-section { margin-bottom: var(--space-2xl); }
.section-title {
  font-family: var(--font-heading);
  font-size: var(--fs-section-title);
  font-weight: bold;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--color-text-muted);
  margin-bottom: var(--space-md);
  padding-bottom: var(--space-xs);
  border-bottom: 1px solid var(--color-border);
}
.section-text {
  font-family: var(--font-body);
  font-size: var(--fs-body);
  line-height: 1.7;
  color: var(--color-text-secondary);
  white-space: pre-line;
}

/* ── COMPÉTENCES ─────────────────────────────────────────── */
.skills-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-xl); align-items: start; }
.skills-col-title {
  font-family: var(--font-heading);
  font-size: var(--fs-micro);
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--color-gold);
  margin-bottom: var(--space-sm);
}
.skills-list { list-style: none; display: flex; flex-direction: column; gap: var(--space-xs); }
.skill-fixed { display: flex; align-items: center; gap: var(--space-sm); flex-wrap: wrap; }
.skill-dot { width: 4px; height: 4px; border-radius: 50%; background: var(--color-gold-dim); flex-shrink: 0; }
.skill-name { font-family: var(--font-heading); font-size: var(--fs-row-name); color: var(--color-text-primary); }
.skill-tag {
  font-family: var(--font-heading);
  font-size: var(--fs-micro);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: 1px 5px;
  border-radius: var(--radius-sm);
}
.tag-free { background: rgba(74, 85, 104, 0.3); color: var(--color-fog); border: 1px solid var(--color-fog); }

.skill-choice {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  padding: var(--space-sm);
  background: rgba(184, 146, 74, 0.04);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}
.skill-choice-header { display: flex; align-items: baseline; gap: var(--space-sm); flex-wrap: wrap; }
.skill-count { font-family: var(--font-heading); font-size: var(--fs-row-value); font-weight: 600; color: var(--color-gold); }
.skill-note { font-family: var(--font-flavor); font-style: italic; font-size: var(--fs-secondary); color: var(--color-text-muted); }
.skill-options { display: flex; flex-wrap: wrap; gap: var(--space-xs); }
.skill-pill {
  font-family: var(--font-heading);
  font-size: var(--fs-micro);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  background: rgba(184, 146, 74, 0.1);
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border);
}
.skills-footnote {
  margin-top: var(--space-md);
  font-family: var(--font-flavor);
  font-style: italic;
  font-size: var(--fs-secondary);
  color: var(--color-text-muted);
  border-left: 2px solid var(--color-gold-dim);
  padding-left: var(--space-sm);
}

/* ── VARIANTES ───────────────────────────────────────────── */
.children-list { display: flex; flex-direction: column; gap: var(--space-sm); }
.child-card {
  display: block;
  padding: var(--space-md);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  text-decoration: none;
  color: inherit;
  transition: border-color var(--transition-fast), transform var(--transition-fast);
}
.child-card:hover { border-color: var(--color-gold-dim); transform: translateX(3px); }
.child-header { display: flex; align-items: baseline; justify-content: space-between; gap: var(--space-md); flex-wrap: wrap; }
.child-name { font-family: var(--font-heading); font-size: var(--fs-row-name); color: var(--color-text-primary); }
.child-meta { display: flex; gap: var(--space-md); flex-wrap: wrap; }
.child-credit { font-family: var(--font-heading); font-size: var(--fs-micro); color: var(--color-arcane); }
.child-formula { font-family: var(--font-heading); font-size: var(--fs-micro); color: var(--color-text-muted); }
.child-desc {
  margin-top: var(--space-xs);
  font-family: var(--font-body);
  font-size: var(--fs-secondary);
  color: var(--color-text-muted);
  line-height: 1.5;
}

/* ── ACTIONS ─────────────────────────────────────────────── */
/* Le retour est remonté en haut de page : il ne reste ici que l'appel à l'action. */
.page-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-md);
  flex-wrap: wrap;
  padding-top: var(--space-lg);
  border-top: 1px solid var(--color-border);
}
.back-link, .cta-link {
  font-family: var(--font-heading);
  font-size: var(--fs-btn);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  text-decoration: none;
  transition: color var(--transition-fast);
}
.back-link { color: var(--color-text-muted); }
.back-link:hover { color: var(--color-gold); }
.cta-link { color: var(--color-arcane); }
.cta-link:hover { color: var(--color-gold); }

@media (max-width: 768px) {
  .skills-grid { grid-template-columns: 1fr; gap: var(--space-lg); }
  .page-actions { flex-direction: column; }
  /* le bouton passe sous le fil d'Ariane et prend toute la largeur */
  .nav-row { flex-direction: column; align-items: stretch; }
  .back-btn { justify-content: center; }
}
</style>
