<script setup lang="ts">
import type { OccupationSkillType } from '@prisma/client'

// ── TYPES ────────────────────────────────────────────────────────────────────

type OccupationListItem = {
  id:               number
  name:             string
  credit_min:       number | null
  credit_max:       number | null
  point_competence: string | null
  is_lovecraftian:  boolean
  is_modern:        boolean
}

type SkillOption = {
  competence: { id: number; name: string }
}

type OccupationSkill = {
  id:           number
  type:         OccupationSkillType
  competence:   { id: number; name: string; isCategory: boolean | null } | null
  specName:     string | null
  choiceCount:  number | null
  note:         string | null
  sortOrder:    number
  options:      SkillOption[]
}

type OccupationDetail = OccupationListItem & { skills: OccupationSkill[] }

// ── ÉTAT ─────────────────────────────────────────────────────────────────────

const { data: occupations, status, error } = useFetch<OccupationListItem[]>('/api/occupation')

const searchName    = ref('')
const searchFormula = ref('')
const searchCredit  = ref('')
const activeFilter  = ref<'all' | 'lovecraftian' | 'modern'>('all')
const expandedId    = ref<number | null>(null)
const detailCache   = ref<Record<number, OccupationDetail>>({})
const loadingId     = ref<number | null>(null)
const sortName      = ref<'asc' | 'desc'>('asc')
const sortCredit    = ref<'desc' | 'asc' | null>(null)

// ── COMPUTED ─────────────────────────────────────────────────────────────────

const filtered = computed(() => {
  if (!occupations.value) return []

  let result = occupations.value.filter((o) => {
    if (searchName.value.trim()) {
      if (!normalizeStr(o.name).includes(normalizeStr(searchName.value.trim()))) return false
    }

    if (searchFormula.value.trim()) {
      if (!normalizeStr(o.point_competence ?? '').includes(normalizeStr(searchFormula.value.trim()))) return false
    }

    if (searchCredit.value.trim()) {
      const num = Number(searchCredit.value.trim())
      if (!isNaN(num) && Number.isInteger(num)) {
        if (o.credit_min === null || o.credit_max === null) return false
        if (num < o.credit_min || num > o.credit_max) return false
      }
    }

    if (activeFilter.value === 'lovecraftian' && !o.is_lovecraftian) return false
    if (activeFilter.value === 'modern' && !o.is_modern) return false

    return true
  })

  if (sortCredit.value) {
    result = [...result].sort((a, b) => {
      const av = sortCredit.value === 'asc' ? (a.credit_min ?? 0) : (a.credit_max ?? 0)
      const bv = sortCredit.value === 'asc' ? (b.credit_min ?? 0) : (b.credit_max ?? 0)
      return sortCredit.value === 'desc' ? bv - av : av - bv
    })
  } else {
    result = [...result].sort((a, b) => {
      const cmp = a.name.localeCompare(b.name, 'fr')
      return sortName.value === 'asc' ? cmp : -cmp
    })
  }

  return result
})

const sortNameIcon   = computed(() => sortName.value === 'asc' ? '↑' : '↓')
const sortCreditIcon = computed(() => sortCredit.value === 'desc' ? '↓' : sortCredit.value === 'asc' ? '↑' : '↕')

function cycleSortName() {
  sortCredit.value = null
  sortName.value = sortName.value === 'asc' ? 'desc' : 'asc'
}

function cycleSortCredit() {
  sortName.value = 'asc'
  sortCredit.value = sortCredit.value === null ? 'desc' : sortCredit.value === 'desc' ? 'asc' : null
}

const stats = computed(() => ({
  total:        occupations.value?.length ?? 0,
  lovecraftian: occupations.value?.filter(o => o.is_lovecraftian).length ?? 0,
  modern:       occupations.value?.filter(o => o.is_modern).length ?? 0,
}))

// ── ACTIONS ──────────────────────────────────────────────────────────────────

async function toggleRow(id: number) {
  if (expandedId.value === id) {
    expandedId.value = null
    return
  }
  expandedId.value = id
  if (detailCache.value[id]) return

  loadingId.value = id
  const detail = await $fetch<OccupationDetail>(`/api/occupation/${id}`)
  detailCache.value[id] = detail
  loadingId.value = null
}

// ── HELPERS AFFICHAGE ─────────────────────────────────────────────────────────

function skillLabel(skill: OccupationSkill): string {
  if (skill.type === 'FIXED') {
    return skill.competence?.name ?? '—'
  }
  if (skill.type === 'FIXED_SPEC') {
    return `${skill.competence?.name ?? '—'} (${skill.specName})`
  }
  if (skill.type === 'FREE_SPEC') {
    const spec = skill.note ? skill.note : 'au choix'
    return `${skill.competence?.name ?? '—'} (${spec})`
  }
  return ''
}

function choiceLabel(skill: OccupationSkill): string {
  const n = skill.choiceCount ?? 1
  return n === 1 ? '1 compétence au choix' : `${n} compétences au choix`
}

function isFixedSkill(skill: OccupationSkill) {
  return skill.type === 'FIXED' || skill.type === 'FIXED_SPEC' || skill.type === 'FREE_SPEC'
}
</script>

<template>
  <main class="page-wrapper">

    <div class="page-header">
      <h1 class="page-title">Occupations</h1>
      <p class="page-subtitle">Métiers et parcours des investigateurs de Providence</p>
    </div>

    <blockquote class="flavor-quote">
      <p>Ce que vous étiez avant de croiser l'indicible définit comment vous survivrez — ou pérerez — face à lui.</p>
      <cite>— Manuel de l'Investigateur, Arkham 1923</cite>
    </blockquote>

    <div class="stats-panel">
      <div class="stat-card">
        <span class="stat-number">{{ stats.total }}</span>
        <span class="stat-label">Occupations</span>
      </div>
      <div class="stat-card">
        <span class="stat-number">{{ stats.lovecraftian }}</span>
        <span class="stat-label">Lovecraftiennes</span>
      </div>
      <div class="stat-card">
        <span class="stat-number">{{ stats.modern }}</span>
        <span class="stat-label">Modernes</span>
      </div>
      <div class="stat-card stat-card-results">
        <span class="stat-number stat-number-results">{{ filtered.length }}</span>
        <span class="stat-label">Résultats</span>
      </div>
    </div>

    <div class="toolbar">
      <div class="filters">
        <button class="tag" :class="{ active: activeFilter === 'all' }"          @click="activeFilter = 'all'">Toutes</button>
        <button class="tag" :class="{ active: activeFilter === 'lovecraftian' }" @click="activeFilter = 'lovecraftian'">Lovecraftiennes</button>
        <button class="tag" :class="{ active: activeFilter === 'modern' }"       @click="activeFilter = 'modern'">Modernes</button>
      </div>
    </div>

    <div class="search-row">
      <div class="search-field">
        <label class="search-label">Occupation</label>
        <div class="search-bar">
          <span class="search-icon">🔍</span>
          <input v-model="searchName" type="text" class="search-input" placeholder="Nom…">
        </div>
      </div>
      <div class="search-field">
        <label class="search-label">Formule de points</label>
        <div class="search-bar">
          <span class="search-icon">🔍</span>
          <input v-model="searchFormula" type="text" class="search-input" placeholder="ex : DEX, INT…">
        </div>
      </div>
      <div class="search-field">
        <label class="search-label">Crédit</label>
        <div class="search-bar">
          <span class="search-icon">🔍</span>
          <input v-model="searchCredit" type="text" inputmode="numeric" pattern="[0-9]*" class="search-input search-input--credit" placeholder="ex : 30">
        </div>
      </div>
    </div>

    <div v-if="status === 'pending'" class="state-message">
      <span class="state-sigil">۞</span>
      <p>Consultation des archives…</p>
    </div>

    <div v-else-if="error" class="state-message state-error">
      <p>Les archives refusent de répondre : {{ error.message }}</p>
    </div>

    <div v-else-if="filtered.length === 0" class="state-message">
      <p>Aucune occupation ne correspond à votre requête.</p>
    </div>

    <div v-else class="list-container">
      <div class="list-header-row">
        <button class="col-sortable sort-active" @click="cycleSortName">
          Occupation <span class="sort-icon">{{ sortNameIcon }}</span>
        </button>
        <span>Formule de points</span>
        <button class="col-sortable" :class="{ 'sort-active': sortCredit !== null }" @click="cycleSortCredit">
          Crédit <span class="sort-icon">{{ sortCreditIcon }}</span>
        </button>
        <span>Type</span>
        <span />
      </div>

      <div class="list-body">
        <template v-for="(occ, index) in filtered" :key="occ.id">
          <div
            class="list-row"
            :class="[index % 2 === 0 ? 'row-even' : 'row-odd', { 'row-expanded': expandedId === occ.id }]"
            @click="toggleRow(occ.id)"
          >
            <span class="row-name">{{ occ.name }}</span>
            <span class="row-formula">{{ occ.point_competence ?? '—' }}</span>
            <span class="row-credit">{{ occ.credit_min ?? 0 }}–{{ occ.credit_max ?? 0 }}</span>
            <span class="row-badges">
              <span v-if="occ.is_lovecraftian" class="badge badge-lore">Lovecraft</span>
              <span v-if="occ.is_modern"       class="badge badge-modern">Moderne</span>
            </span>
            <span class="chevron" :class="{ open: expandedId === occ.id }">›</span>
          </div>

          <Transition name="expand">
            <div
              v-if="expandedId === occ.id"
              class="detail-panel"
              :class="index % 2 === 0 ? 'row-even' : 'row-odd'"
            >
              <div v-if="loadingId === occ.id" class="detail-loading">
                <span class="detail-sigil">۞</span>
              </div>

              <div v-else-if="detailCache[occ.id]" class="detail-content">
                <div class="skills-grid">

                  <!-- Compétences fixes -->
                  <div class="skills-section">
                    <p class="skills-section-title">Compétences fixes</p>
                    <ul class="skills-list">
                      <li
                        v-for="skill in detailCache[occ.id]!.skills.filter(isFixedSkill)"
                        :key="skill.id"
                        class="skill-fixed"
                      >
                        <span class="skill-dot" />
                        <span class="skill-name">{{ skillLabel(skill) }}</span>
                        <span v-if="skill.type === 'FREE_SPEC'" class="skill-tag tag-free">au choix</span>
                      </li>
                    </ul>
                  </div>

                  <!-- Choix -->
                  <div class="skills-section">
                    <p class="skills-section-title">Compétences à choisir</p>
                    <ul class="skills-list">
                      <li
                        v-for="skill in detailCache[occ.id]!.skills.filter(s => !isFixedSkill(s))"
                        :key="skill.id"
                        class="skill-choice"
                      >
                        <span class="skill-choice-header">
                          <span class="skill-count">{{ choiceLabel(skill) }}</span>
                          <span v-if="skill.note" class="skill-note">{{ skill.note }}</span>
                        </span>
                        <span v-if="skill.type === 'CHOICE_FROM_LIST'" class="skill-options">
                          <span
                            v-for="opt in skill.options"
                            :key="opt.competence.id"
                            class="skill-pill"
                          >{{ opt.competence.name }}</span>
                        </span>
                      </li>
                    </ul>
                  </div>

                </div>
              </div>
            </div>
          </Transition>
        </template>
      </div>
    </div>

    <!-- Légende des badges -->
    <div class="legend">
      <span class="legend-title">Légende</span>
      <div class="legend-item">
        <span class="badge badge-lore">Lovecraft</span>
        <span class="legend-desc">occupation importante dans les récits du maître de Providence.</span>
      </div>
      <div class="legend-item">
        <span class="badge badge-modern">Moderne</span>
        <span class="legend-desc">Disponible uniquement à l'époque moderne</span>
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
  bottom: -1px; left: 0;
  width: 80px; height: 1px;
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

/* ── STATS ───────────────────────────────────────────────── */
.stats-panel {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-md);
  margin-bottom: var(--space-xl);
  max-width: 640px;
}

.stat-card-results {
  border-color: var(--color-arcane-dim);
}
.stat-number-results {
  color: var(--color-text-primary);
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
  margin-bottom: var(--space-md);
  flex-wrap: wrap;
}
.filters { display: flex; gap: var(--space-sm); flex-wrap: wrap; }
.tag {
  font-family: var(--font-heading);
  font-size: var(--fs-badge);
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
.tag:hover { border-color: var(--color-gold-dim); color: var(--color-gold); }
.tag.active { background: var(--color-gold-dim); border-color: var(--color-gold); color: var(--color-gold); }

/* ── SEARCH ROW ──────────────────────────────────────────── */
.search-row {
  display: flex;
  gap: var(--space-md);
  margin-bottom: var(--space-xl);
  flex-wrap: wrap;
}
.search-field {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}
.search-label {
  font-family: var(--font-heading);
  font-size: var(--fs-table-header);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-text-muted);
}
.search-bar { position: relative; }
.search-icon {
  position: absolute;
  left: var(--space-sm); top: 50%;
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
  width: 240px;
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
  outline: none;
}
.search-input--credit { width: 120px; }
.search-input::-webkit-inner-spin-button,
.search-input::-webkit-outer-spin-button { -webkit-appearance: none; }
.search-input[type=number] { -moz-appearance: textfield; }
.search-input::placeholder { color: var(--color-text-muted); font-style: italic; }
.search-input:focus { border-color: var(--color-gold-dim); box-shadow: 0 0 0 2px rgba(184,146,74,0.15); }

/* ── SORT ────────────────────────────────────────────────── */
.col-sortable {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  background: transparent;
  border: none;
  font-family: var(--font-heading);
  font-size: var(--fs-table-header);
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

/* ── STATE ───────────────────────────────────────────────── */
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
@keyframes pulse-sigil { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; } }
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
  grid-template-columns: 1fr 260px 80px 120px 28px;
  align-items: center;
  padding: var(--space-sm) var(--space-lg);
  gap: var(--space-md);
}

.list-header-row {
  background: var(--color-elevated);
  border-bottom: 1px solid var(--color-border);
  font-family: var(--font-heading);
  font-size: var(--fs-table-header);
  font-weight: bold;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--color-text-muted);
  position: sticky;
  top: 0;
  z-index: 1;
}

.list-body {
  max-height: 640px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--color-border) transparent;
}
.list-body::-webkit-scrollbar { width: 6px; }
.list-body::-webkit-scrollbar-track { background: transparent; }
.list-body::-webkit-scrollbar-thumb { background: var(--color-border); border-radius: 3px; }
.list-body::-webkit-scrollbar-thumb:hover { background: var(--color-gold-dim); }

.list-row {
  transition: background var(--transition-fast);
  cursor: pointer;
  user-select: none;
}
.row-even { background: var(--color-surface); }
.row-odd  { background: var(--color-deep); }
.list-row:hover { background: var(--color-elevated); }
.list-row.row-expanded { border-bottom: 1px solid var(--color-border); }

/* ── CHEVRON ─────────────────────────────────────────────── */
.chevron {
  font-size: var(--fs-row-value);
  color: var(--color-text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform var(--transition-fast);
  transform: rotate(0deg);
  line-height: 1;
}
.chevron.open { transform: rotate(90deg); color: var(--color-gold); }

/* ── CELL STYLES ─────────────────────────────────────────── */
.row-name {
  font-family: var(--font-heading);
  font-size: var(--fs-row-name);
  font-weight: 600;
  letter-spacing: 0.03em;
  color: var(--color-gold);
}
.row-formula {
  font-family: var(--font-heading);
  font-size: var(--fs-row-value);
  color: var(--color-text-secondary);
  letter-spacing: 0.02em;
}
.row-credit {
  font-family: var(--font-heading);
  font-size: var(--fs-row-value);
  font-weight: 600;
  color: var(--color-arcane);
}
.row-badges { display: flex; gap: var(--space-xs); flex-wrap: wrap; }
.badge {
  font-family: var(--font-heading);
  font-size: var(--fs-micro);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  white-space: nowrap;
}
.badge-lore   { background: rgba(184,146,74,0.15); color: var(--color-gold);   border: 1px solid var(--color-gold-dim); }
.badge-modern { background: rgba(127,179,138,0.15); color: var(--color-arcane); border: 1px solid var(--color-arcane-dim); }

/* ── DETAIL PANEL ────────────────────────────────────────── */
.detail-panel {
  border-top: 1px solid var(--color-gold-dim);
  padding: var(--space-lg) var(--space-xl);
}

.detail-loading {
  text-align: center;
  padding: var(--space-lg);
}
.detail-sigil {
  font-size: var(--fs-sigil);
  color: var(--color-gold);
  animation: pulse-sigil 1.5s ease-in-out infinite;
}

.skills-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-xl);
}

.skills-section-title {
  font-family: var(--font-heading);
  font-size: var(--fs-section-title);
  font-weight: bold;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--color-text-muted);
  margin-bottom: var(--space-sm);
  padding-bottom: var(--space-xs);
  border-bottom: 1px solid var(--color-border);
}

.skills-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

/* Compétence fixe */
.skill-fixed {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}
.skill-dot {
  width: 4px; height: 4px;
  border-radius: 50%;
  background: var(--color-gold-dim);
  flex-shrink: 0;
}
.skill-name {
  font-family: var(--font-heading);
  font-size: var(--fs-row-name);
  color: var(--color-text-primary);
}
.skill-tag {
  font-family: var(--font-heading);
  font-size: var(--fs-micro);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: 1px 5px;
  border-radius: var(--radius-sm);
}
.tag-free { background: rgba(74,85,104,0.3); color: var(--color-fog); border: 1px solid var(--color-fog); }

/* Compétence à choisir */
.skill-choice {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  padding: var(--space-sm);
  background: rgba(184,146,74,0.04);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}
.skill-choice-header {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  flex-wrap: wrap;
}
.skill-count {
  font-family: var(--font-heading);
  font-size: var(--fs-row-value);
  font-weight: 600;
  color: var(--color-gold);
}
.skill-note {
  font-family: var(--font-flavor);
  font-style: italic;
  font-size: var(--fs-secondary);
  color: var(--color-text-muted);
}
.skill-options {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-xs);
}
.skill-pill {
  font-family: var(--font-heading);
  font-size: var(--fs-micro);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  background: rgba(184,146,74,0.1);
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border);
}

/* ── LEGEND ──────────────────────────────────────────────── */
.legend {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  margin-top: var(--space-md);
  padding: var(--space-sm) var(--space-md);
  background: var(--color-void);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}
.legend-title {
  font-family: var(--font-heading);
  font-size: var(--fs-badge);
  font-weight: bold;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-text-muted);
}
.legend-item {
  display: inline-flex;
  align-items: center;
  gap: var(--space-sm);
}
.legend-desc {
  font-family: var(--font-flavor);
  font-style: italic;
  font-size: var(--fs-secondary);
  color: var(--color-text-muted);
}

/* ── TRANSITION ──────────────────────────────────────────── */
.expand-enter-active,
.expand-leave-active {
  transition: opacity 0.2s ease, max-height 0.25s ease;
  max-height: 400px;
  overflow: hidden;
}
.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  max-height: 0;
}

/* ── RESPONSIVE ──────────────────────────────────────────── */
@media (max-width: 900px) {
  .list-header-row,
  .list-row { grid-template-columns: 1fr 80px 100px 28px; }
  .col-formula { display: none; }
}

@media (max-width: 640px) {
  .page-wrapper { padding: var(--space-md); }
  .stats-panel { max-width: 100%; }
  .toolbar { flex-direction: column; align-items: stretch; gap: var(--space-sm); }
  .search-row { flex-direction: column; }
  .search-field { width: 100%; }
  .search-bar { width: 100%; }
  .search-input, .search-input--credit { width: 100%; box-sizing: border-box; }
  .list-header-row { display: none; }
  .list-row { grid-template-columns: 1fr auto 28px; }
  .row-formula, .row-credit { display: none; }
  .skills-grid { grid-template-columns: 1fr; }
  .list-body { max-height: none; }
}
</style>
