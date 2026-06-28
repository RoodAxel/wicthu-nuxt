<script setup lang="ts">
import type { OccupationSkillType } from '@prisma/client'

// ── TYPES ────────────────────────────────────────────────────────────────────

type OccupationListItem = {
  id: number
  name: string
  credit_min: number | null
  credit_max: number | null
  point_competence: string | null
  is_lovecraftian: boolean
  is_modern: boolean
}

type SkillOption = {
  competence: { id: number, name: string }
}

type OccupationSkill = {
  id: number
  type: OccupationSkillType
  competence: { id: number, name: string, isCategory: boolean | null } | null
  specName: string | null
  choiceCount: number | null
  note: string | null
  sortOrder: number
  options: SkillOption[]
}

type OccupationDetail = OccupationListItem & { skills: OccupationSkill[] }

// ── ÉTAT ─────────────────────────────────────────────────────────────────────

const { data: occupations, status, error } = useFetch<OccupationListItem[]>('/api/occupation')

const searchName = ref('')
const searchFormula = ref('')
const searchCredit = ref('')
const activeFilter = ref<'all' | 'lovecraftian' | 'modern'>('all')
const expandedId = ref<number | null>(null)
const detailCache = ref<Record<number, OccupationDetail>>({})
const loadingId = ref<number | null>(null)
const sortName = ref<'asc' | 'desc'>('asc')
const sortCredit = ref<'desc' | 'asc' | null>(null)

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

const sortNameIcon = computed(() => sortName.value === 'asc' ? '↑' : '↓')
const sortCreditIcon = computed(() => sortCredit.value === 'desc' ? '↓' : sortCredit.value === 'asc' ? '↑' : '↕')

function cycleSortName() {
  sortCredit.value = null
  sortName.value = sortName.value === 'asc' ? 'desc' : 'asc'
}

function cycleSortCredit() {
  sortName.value = 'asc'
  sortCredit.value = sortCredit.value === null ? 'desc' : sortCredit.value === 'desc' ? 'asc' : null
}

const stats = computed(() => [
  { number: occupations.value?.length ?? 0, label: 'Occupations' },
  { number: occupations.value?.filter(o => o.is_lovecraftian).length ?? 0, label: 'Lovecraftiennes' },
  { number: occupations.value?.filter(o => o.is_modern).length ?? 0, label: 'Modernes' },
  { number: filtered.value.length, label: 'Résultats', highlight: true }
])

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

useSeoMeta({
  title: 'Occupations',
  description: 'Occupations d\'investigateur pour L\'Appel de Cthulhu : compétences associées et formules de points de crédit.'
})
</script>

<template>
  <ResourceListLayout
    title="Occupations"
    subtitle="Métiers et parcours des investigateurs de Providence"
    quote="Ce que vous étiez avant de croiser l'indicible définit comment vous survivrez — ou pérerez — face à lui."
    cite="— Manuel de l'Investigateur, Arkham 1923"
    accent="gold"
    max-width="1200px"
    :stats-cols="4"
    :stats-cols-mobile="2"
    stats-max-width="640px"
    :status="status"
    :error="error"
    :result-count="filtered.length"
    :stats="stats"
    loading-text="Consultation des archives…"
    empty-text="Aucune occupation ne correspond à votre requête."
  >
    <template #toolbar>
      <div class="filters">
        <button class="tag" :class="{ active: activeFilter === 'all' }" @click="activeFilter = 'all'">Toutes</button>
        <button class="tag" :class="{ active: activeFilter === 'lovecraftian' }" @click="activeFilter = 'lovecraftian'">Lovecraftiennes</button>
        <button class="tag" :class="{ active: activeFilter === 'modern' }" @click="activeFilter = 'modern'">Modernes</button>
      </div>
    </template>

    <template #subtoolbar>
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
    </template>

    <div class="list-container">
      <div class="list-body">
        <div class="list-header-row">
          <button class="col-sortable sort-active" @click="cycleSortName">
            Occupation <span class="sort-icon">{{ sortNameIcon }}</span>
          </button>
          <span class="col-formula">Formule de points</span>
          <button class="col-sortable" :class="{ 'sort-active': sortCredit !== null }" @click="cycleSortCredit">
            Crédit <span class="sort-icon">{{ sortCreditIcon }}</span>
          </button>
          <span class="col-type">Type</span>
          <span />
        </div>
        <template v-for="(occ, index) in filtered" :key="occ.id">
          <div
            class="list-row"
            :class="[index % 2 === 0 ? 'row-even' : 'row-odd', { 'row-expanded': expandedId === occ.id }]"
            @click="toggleRow(occ.id)"
          >
            <span class="row-name">{{ occ.name }}</span>
            <span class="row-formula">{{ occ.point_competence ?? '—' }}</span>
            <span class="row-credit">{{ occ.credit_min ?? 0 }}–{{ occ.credit_max ?? 0 }}</span>
            <span class="row-badges col-type">
              <span v-if="occ.is_lovecraftian" class="badge badge-lore">Lovecraft</span>
              <span v-if="occ.is_modern" class="badge badge-modern">Moderne</span>
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
                <div v-if="detailCache[occ.id]!.point_competence" class="detail-formula">
                  <span class="detail-formula-label">Formule de points</span>
                  <span class="detail-formula-value">{{ detailCache[occ.id]!.point_competence }}</span>
                </div>
                <div v-if="detailCache[occ.id]!.is_lovecraftian || detailCache[occ.id]!.is_modern" class="detail-type">
                  <span v-if="detailCache[occ.id]!.is_lovecraftian" class="badge badge-lore">Lovecraft</span>
                  <span v-if="detailCache[occ.id]!.is_modern" class="badge badge-modern">Moderne</span>
                </div>
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

    <template #footer>
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
    </template>
  </ResourceListLayout>
</template>

<style scoped>
/* ── RECHERCHE MULTI-CHAMPS ───────────────────────────────── */
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
.search-input { width: 240px; font-size: var(--fs-field-input); }
.search-input--credit { width: 120px; }
.search-input::-webkit-inner-spin-button,
.search-input::-webkit-outer-spin-button { -webkit-appearance: none; }

/* ── TABLE ───────────────────────────────────────────────── */
.list-container { --list-cols: 1fr 260px 80px 120px 28px; }
.list-container .list-body { max-height: 640px; }
.list-container .list-header-row {
  position: sticky;
  top: 0;
  z-index: 1;
}
.list-container .list-header-row,
.list-container .list-row { align-items: center; gap: var(--space-md); }
.list-row { cursor: pointer; user-select: none; }
.list-row.row-expanded { border-bottom: 1px solid var(--color-border); }

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

.row-name {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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
.badge-lore { background: rgba(184, 146, 74, 0.15); color: var(--color-gold); border: 1px solid var(--color-gold-dim); }
.badge-modern { background: rgba(127, 179, 138, 0.15); color: var(--color-arcane); border: 1px solid var(--color-arcane-dim); }

/* ── PANNEAU DE DÉTAIL ───────────────────────────────────── */
.detail-panel {
  border-top: 1px solid var(--color-gold-dim);
  padding: var(--space-lg) var(--space-xl);
}
.detail-loading { text-align: center; padding: var(--space-lg); }
.detail-sigil {
  font-size: var(--fs-sigil);
  color: var(--color-gold);
  animation: pulse-sigil 1.5s ease-in-out infinite;
}

.skills-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-xl); }
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
.skills-list { list-style: none; display: flex; flex-direction: column; gap: var(--space-xs); }

.skill-fixed { display: flex; align-items: center; gap: var(--space-sm); }
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
.skill-choice-header { display: flex; align-items: center; gap: var(--space-sm); flex-wrap: wrap; }
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

.detail-formula {
  display: none;
  align-items: center;
  gap: var(--space-sm);
  margin-bottom: var(--space-md);
  padding-bottom: var(--space-sm);
  border-bottom: 1px solid var(--color-border);
}
.detail-formula-label {
  font-family: var(--font-heading);
  font-size: var(--fs-table-header);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-text-muted);
  flex-shrink: 0;
}
.detail-formula-value {
  font-family: var(--font-heading);
  font-size: var(--fs-row-value);
  color: var(--color-text-secondary);
  letter-spacing: 0.02em;
}
.detail-type {
  display: flex;
  gap: var(--space-xs);
  margin-bottom: var(--space-md);
  padding-bottom: var(--space-sm);
  border-bottom: 1px solid var(--color-border);
}
@media (min-width: 769px) {
  .detail-type { display: none; }
}

/* ── TRANSITION ──────────────────────────────────────────── */
.expand-enter-active,
.expand-leave-active {
  transition: opacity 0.2s ease, max-height 0.25s ease;
  max-height: 400px;
  overflow: hidden;
}
.expand-enter-from,
.expand-leave-to { opacity: 0; max-height: 0; }

/* ── RESPONSIVE ──────────────────────────────────────────── */
@media (max-width: 900px) {
  .list-container { --list-cols: 1fr 80px 100px 28px; }
  .col-formula, .row-formula { display: none; }
  .detail-formula { display: flex; }
}
@media (max-width: 768px) {
  .search-row { flex-direction: column; }
  .search-field { width: 100%; }
  .search-bar { width: 100%; }
  .search-input,
  .search-input--credit { width: 100%; box-sizing: border-box; }
  .skills-grid { grid-template-columns: 1fr; }
  .list-container { --list-cols: 1fr 80px 28px; }
  .col-type { display: none; }
}
@media (max-width: 640px) {
  .list-container { --list-cols: 1fr 70px 28px; }
  .list-container .list-body { max-height: none; }
}
</style>
