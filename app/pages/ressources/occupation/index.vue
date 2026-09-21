<script setup lang="ts">
import type { OccupationListItem } from '~/types/investigateur'

const { data: occupations, status, error } = useFetch<OccupationListItem[]>('/api/occupation')

const { favorites, isFavorite, toggle: toggleFavorite } = useOccupationFavorites()

// ── FILTRES ──────────────────────────────────────────────────────────────────
// Tous les critères se cumulent (ET entre dimensions, OU à l'intérieur d'une
// dimension) — contrairement à l'ancien filtre unique mutuellement exclusif.
const searchName = ref('')
const searchFormula = ref('')
const searchCredit = ref('')
const onlyFavorites = ref(false)
const onlyLovecraft = ref(false)
const onlyVariants = ref(false)
const onlyParents = ref(false)

const {
  selected: selectedEras, open: eraOpen, triggerRef: eraRef, toggle: toggleEra
} = useMultiSelectFilter<'CLASSIQUE' | 'MODERNE' | 'TOUTES'>()

const {
  selected: selectedSkills, open: skillOpen, triggerRef: skillRef,
  toggle: toggleSkill, remove: removeSkill
} = useMultiSelectFilter<string>()

/** « toutes » = l'occupation doit fournir chaque compétence cochée. */
const skillMode = ref<'all' | 'any'>('all')
/** Compter aussi les compétences seulement accessibles via un choix. */
const includeOptional = ref(true)
/** Recherche interne au menu déroulant des compétences (87 entrées). */
const skillQuery = ref('')

const ERA_LABELS = {
  CLASSIQUE: 'Classique (années 1920)',
  MODERNE: 'Moderne (contemporain)',
  TOUTES: 'Sans restriction d\'époque'
} as const

/** Toutes les compétences citées par au moins une occupation, triées. */
const allSkills = computed(() => {
  const set = new Set<string>()
  for (const o of occupations.value ?? []) {
    for (const n of o.skillsSure) set.add(n)
    for (const n of o.skillsMaybe) set.add(n)
  }
  return [...set].sort((a, b) => a.localeCompare(b, 'fr'))
})

const visibleSkills = computed(() => {
  const q = normalizeStr(skillQuery.value.trim())
  if (!q) return allSkills.value
  return allSkills.value.filter(s => normalizeStr(s).includes(q))
})

/** Compétences d'une occupation retenues pour le filtrage. */
function pool(o: OccupationListItem): string[] {
  return includeOptional.value ? [...o.skillsSure, ...o.skillsMaybe] : o.skillsSure
}

/** Compétences sélectionnées que cette occupation couvre effectivement. */
function matchedSkills(o: OccupationListItem): { name: string, sure: boolean }[] {
  if (!selectedSkills.value.size) return []
  const p = pool(o)
  return [...selectedSkills.value]
    .filter(s => p.includes(s))
    .map(s => ({ name: s, sure: o.skillsSure.includes(s) }))
    .sort((a, b) => a.name.localeCompare(b.name, 'fr'))
}

const activeFilterCount = computed(() =>
  (searchName.value.trim() ? 1 : 0)
  + (searchFormula.value.trim() ? 1 : 0)
  + (searchCredit.value.trim() ? 1 : 0)
  + (onlyFavorites.value ? 1 : 0)
  + (onlyLovecraft.value ? 1 : 0)
  + (onlyVariants.value ? 1 : 0)
  + (onlyParents.value ? 1 : 0)
  + selectedEras.value.size
  + selectedSkills.value.size
)

function resetFilters() {
  searchName.value = ''
  searchFormula.value = ''
  searchCredit.value = ''
  onlyFavorites.value = false
  onlyLovecraft.value = false
  onlyVariants.value = false
  onlyParents.value = false
  selectedEras.value = new Set()
  selectedSkills.value = new Set()
  skillQuery.value = ''
}

// ── TRIS ─────────────────────────────────────────────────────────────────────
const sortName = ref<'asc' | 'desc'>('asc')
const sortCredit = ref<'desc' | 'asc' | null>(null)

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

const occHref = (o: { id: number, slug: string | null }) => `/ressources/occupation/${o.slug ?? o.id}`

// ── RÉSULTAT ─────────────────────────────────────────────────────────────────
const filtered = computed(() => {
  if (!occupations.value) return []

  let result = occupations.value.filter((o) => {
    if (searchName.value.trim()) {
      const q = normalizeStr(searchName.value.trim())
      // on cherche aussi dans les noms alternatifs (« Voyou » → Trafiquant/Voyou)
      if (![o.name, ...o.autre_name].some(h => normalizeStr(h).includes(q))) return false
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

    if (onlyFavorites.value && !isFavorite(o.slug)) return false
    if (onlyLovecraft.value && !o.is_lovecraftian) return false
    if (onlyVariants.value && o.parentId === null) return false
    if (onlyParents.value && o._count.children === 0) return false

    if (selectedEras.value.size) {
      const key = o.era ?? 'TOUTES'
      if (!selectedEras.value.has(key)) return false
    }

    if (selectedSkills.value.size) {
      const p = pool(o)
      const wanted = [...selectedSkills.value]
      const ok = skillMode.value === 'all'
        ? wanted.every(s => p.includes(s))
        : wanted.some(s => p.includes(s))
      if (!ok) return false
    }

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

const stats = computed(() => [
  { number: occupations.value?.length ?? 0, label: 'Occupations' },
  { number: occupations.value?.filter(o => o.is_lovecraftian).length ?? 0, label: 'Lovecraftiennes' },
  { number: allSkills.value.length, label: 'Compétences' },
  { number: filtered.value.length, label: 'Résultats', highlight: true }
])

useSeoMeta({
  title: 'Occupations',
  description: 'Les occupations d\'investigateur de L\'Appel de Cthulhu : filtrez par compétence, époque, crédit et formule de points pour trouver le métier qui complète votre équipe.'
})
</script>

<template>
  <ResourceListLayout
    title="Occupations"
    subtitle="Métiers et parcours des investigateurs de Providence"
    quote="Ce que vous étiez avant de croiser l'indicible définit comment vous survivrez — ou périrez — face à lui."
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
    empty-text="Aucune occupation ne correspond à ces critères."
  >
    <template #toolbar>
      <!-- Compétences : le filtre central pour l'équilibrage d'équipe -->
      <div ref="skillRef" class="dropdown-wrapper">
        <button
          class="tag tag--primary"
          :class="{ active: selectedSkills.size > 0 }"
          @click="skillOpen = !skillOpen"
        >
          Compétences
          <span v-if="selectedSkills.size" class="tag-count">{{ selectedSkills.size }}</span>
          <span class="dropdown-caret">{{ skillOpen ? '▲' : '▼' }}</span>
        </button>
        <div v-if="skillOpen" class="dropdown-menu dropdown-menu--skills">
          <div class="dropdown-search">
            <input
              v-model="skillQuery"
              type="text"
              class="dropdown-search-input"
              placeholder="Filtrer les compétences…"
              @click.stop
            >
          </div>
          <div class="dropdown-modes" @click.stop>
            <button class="mode-btn" :class="{ active: skillMode === 'all' }" @click="skillMode = 'all'">
              Toutes
            </button>
            <button class="mode-btn" :class="{ active: skillMode === 'any' }" @click="skillMode = 'any'">
              Au moins une
            </button>
          </div>
          <label class="dropdown-toggle" @click.stop>
            <input v-model="includeOptional" type="checkbox">
            <span>Inclure les compétences au choix</span>
          </label>
          <div class="dropdown-scroll">
            <button
              v-for="s in visibleSkills"
              :key="s"
              class="dropdown-item"
              :class="{ selected: selectedSkills.has(s) }"
              @click="toggleSkill(s)"
            >
              <span class="dropdown-check">{{ selectedSkills.has(s) ? '✓' : '' }}</span>
              {{ s }}
            </button>
            <p v-if="!visibleSkills.length" class="dropdown-empty">Aucune compétence.</p>
          </div>
        </div>
      </div>

      <!-- Époque -->
      <div ref="eraRef" class="dropdown-wrapper">
        <button
          class="tag"
          :class="{ active: selectedEras.size > 0 }"
          @click="eraOpen = !eraOpen"
        >
          Époque
          <span v-if="selectedEras.size" class="tag-count">{{ selectedEras.size }}</span>
          <span class="dropdown-caret">{{ eraOpen ? '▲' : '▼' }}</span>
        </button>
        <div v-if="eraOpen" class="dropdown-menu">
          <button
            v-for="(label, key) in ERA_LABELS"
            :key="key"
            class="dropdown-item"
            :class="{ selected: selectedEras.has(key) }"
            @click="toggleEra(key)"
          >
            <span class="dropdown-check">{{ selectedEras.has(key) ? '✓' : '' }}</span>
            {{ label }}
          </button>
        </div>
      </div>

      <!-- Bascules indépendantes, cumulables -->
      <button class="tag tag--fav" :class="{ active: onlyFavorites }" @click="onlyFavorites = !onlyFavorites">
        ★ Favoris
        <span v-if="favorites.length" class="tag-count">{{ favorites.length }}</span>
      </button>
      <button class="tag" :class="{ active: onlyLovecraft }" @click="onlyLovecraft = !onlyLovecraft">
        Lovecraftiennes
      </button>
      <button class="tag" :class="{ active: onlyParents }" @click="onlyParents = !onlyParents">
        Avec variantes
      </button>
      <button class="tag" :class="{ active: onlyVariants }" @click="onlyVariants = !onlyVariants">
        Variantes seules
      </button>
    </template>

    <template #subtoolbar>
      <div class="search-row">
        <div class="search-field">
          <label class="search-label" for="q-nom">Occupation</label>
          <div class="search-bar">
            <span class="search-icon">🔍</span>
            <input id="q-nom" v-model="searchName" type="text" class="search-input" placeholder="Nom…">
          </div>
        </div>
        <div class="search-field">
          <label class="search-label" for="q-formule">Formule de points</label>
          <div class="search-bar">
            <span class="search-icon">🔍</span>
            <input id="q-formule" v-model="searchFormula" type="text" class="search-input" placeholder="ex : DEX, INT…">
          </div>
        </div>
        <div class="search-field">
          <label class="search-label" for="q-credit">Crédit</label>
          <div class="search-bar">
            <span class="search-icon">🔍</span>
            <input id="q-credit" v-model="searchCredit" type="text" inputmode="numeric" pattern="[0-9]*" class="search-input search-input--credit" placeholder="ex : 30">
          </div>
        </div>
      </div>

      <!-- Récapitulatif des filtres actifs -->
      <div v-if="activeFilterCount" class="active-filters">
        <span v-if="selectedSkills.size" class="filters-mode">
          {{ skillMode === 'all' ? 'Toutes ces compétences' : 'Au moins une de ces compétences' }}
          <template v-if="!includeOptional"> · acquises d'office</template>
        </span>
        <button v-for="s in [...selectedSkills]" :key="s" class="active-filter" @click="removeSkill(s)">
          {{ s }} <span class="active-filter-x">✕</span>
        </button>
        <button v-for="e in [...selectedEras]" :key="e" class="active-filter" @click="toggleEra(e)">
          {{ ERA_LABELS[e] }} <span class="active-filter-x">✕</span>
        </button>
        <button v-if="onlyFavorites" class="active-filter" @click="onlyFavorites = false">
          ★ Favoris <span class="active-filter-x">✕</span>
        </button>
        <button v-if="onlyLovecraft" class="active-filter" @click="onlyLovecraft = false">
          Lovecraftiennes <span class="active-filter-x">✕</span>
        </button>
        <button v-if="onlyParents" class="active-filter" @click="onlyParents = false">
          Avec variantes <span class="active-filter-x">✕</span>
        </button>
        <button v-if="onlyVariants" class="active-filter" @click="onlyVariants = false">
          Variantes seules <span class="active-filter-x">✕</span>
        </button>
        <button class="clear-all" @click="resetFilters">Tout effacer</button>
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
          <span class="col-fav" title="Favoris">★</span>
        </div>
        <NuxtLink
          v-for="(occ, index) in filtered"
          :key="occ.id"
          :to="occHref(occ)"
          class="list-row"
          :class="index % 2 === 0 ? 'row-even' : 'row-odd'"
        >
          <span class="row-name">
            <span class="row-title">{{ occ.name }}</span>
            <span v-if="occ.parent" class="row-parent">variante de {{ occ.parent.name }}</span>
            <!-- Quelles compétences recherchées cette occupation couvre-t-elle ? -->
            <span v-if="matchedSkills(occ).length" class="row-matches">
              <span
                v-for="m in matchedSkills(occ)"
                :key="m.name"
                class="match-pill"
                :class="{ 'match-pill--maybe': !m.sure }"
                :title="m.sure ? 'Acquise d\'office' : 'Accessible via un choix'"
              >{{ m.name }}<span v-if="!m.sure" class="match-mark">?</span></span>
            </span>
          </span>
          <span class="row-formula">{{ occ.point_competence ?? '—' }}</span>
          <span class="row-credit">
            <template v-if="occ.credit_min !== null">{{ occ.credit_min }}–{{ occ.credit_max }}</template>
            <template v-else>—</template>
          </span>
          <span class="row-badges col-type">
            <span v-if="occ.is_lovecraftian" class="badge badge-lore">Lovecraft</span>
            <span v-if="occ.era === 'MODERNE'" class="badge badge-modern">Moderne</span>
            <span v-if="occ.era === 'CLASSIQUE'" class="badge badge-classic">Classique</span>
            <span v-if="occ._count.children" class="badge badge-variants">
              {{ occ._count.children }} variante{{ occ._count.children > 1 ? 's' : '' }}
            </span>
          </span>
          <!-- bouton dans un lien : on stoppe la navigation au clic sur l'étoile -->
          <button
            class="fav-btn"
            :class="{ 'fav-btn--on': isFavorite(occ.slug) }"
            :aria-pressed="isFavorite(occ.slug)"
            :title="isFavorite(occ.slug) ? 'Retirer des favoris' : 'Ajouter aux favoris'"
            :aria-label="isFavorite(occ.slug) ? `Retirer ${occ.name} des favoris` : `Ajouter ${occ.name} aux favoris`"
            @click.prevent.stop="toggleFavorite(occ.slug)"
          >{{ isFavorite(occ.slug) ? '★' : '☆' }}</button>
        </NuxtLink>
      </div>
    </div>

    <template #footer>
      <div class="legend">
        <span class="legend-title">Légende</span>
        <div class="legend-item">
          <span class="match-pill">Compétence</span>
          <span class="legend-desc">acquise d'office par l'occupation.</span>
        </div>
        <div class="legend-item">
          <span class="match-pill match-pill--maybe">Compétence<span class="match-mark">?</span></span>
          <span class="legend-desc">accessible seulement si le joueur la choisit parmi plusieurs options.</span>
        </div>
        <div class="legend-item">
          <span class="badge badge-lore">Lovecraft</span>
          <span class="legend-desc">occupation importante dans les récits du maître de Providence.</span>
        </div>
        <div class="legend-item">
          <span class="badge badge-classic">Classique</span>
          <span class="legend-desc">disponible uniquement dans les années 1920.</span>
        </div>
        <div class="legend-item">
          <span class="badge badge-modern">Moderne</span>
          <span class="legend-desc">disponible uniquement à l'époque contemporaine.</span>
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
  margin-bottom: var(--space-md);
  flex-wrap: wrap;
}
.search-field { display: flex; flex-direction: column; gap: var(--space-xs); }
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

/* ── DROPDOWN COMPÉTENCES ─────────────────────────────────── */
.tag--primary { border-color: var(--color-gold-dim); }
.tag-count {
  display: inline-block;
  min-width: 16px;
  padding: 0 4px;
  margin-left: 4px;
  border-radius: 8px;
  /* fond translucide + texte doré : le texte sombre sur or était illisible */
  background: rgba(184, 146, 74, 0.25);
  border: 1px solid var(--color-gold-dim);
  color: var(--color-gold);
  font-size: var(--fs-micro);
  font-weight: 700;
  text-align: center;
}
.dropdown-menu--skills { width: 300px; }
.dropdown-search { padding: var(--space-sm); border-bottom: 1px solid var(--color-border); }
.dropdown-search-input {
  width: 100%;
  box-sizing: border-box;
  background: var(--color-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: var(--space-xs) var(--space-sm);
  color: var(--color-text-primary);
  font-family: var(--font-body);
  font-size: var(--fs-secondary);
  outline: none;
}
.dropdown-search-input:focus { border-color: var(--color-gold-dim); }

.dropdown-modes { display: flex; gap: 4px; padding: var(--space-sm) var(--space-sm) 0; }
.mode-btn {
  flex: 1;
  padding: 4px 6px;
  background: transparent;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  color: var(--color-text-muted);
  font-family: var(--font-heading);
  font-size: var(--fs-micro);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  cursor: pointer;
  transition: all var(--transition-fast);
}
.mode-btn.active { background: rgba(184, 146, 74, 0.15); border-color: var(--color-gold-dim); color: var(--color-gold); }

.dropdown-toggle {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-sm);
  font-family: var(--font-body);
  font-size: var(--fs-secondary);
  color: var(--color-text-muted);
  cursor: pointer;
  border-bottom: 1px solid var(--color-border);
}
.dropdown-scroll { max-height: 260px; overflow-y: auto; }
.dropdown-empty {
  padding: var(--space-md);
  font-family: var(--font-flavor);
  font-style: italic;
  font-size: var(--fs-secondary);
  color: var(--color-text-muted);
}

/* ── FILTRES ACTIFS ───────────────────────────────────────── */
.active-filters { align-items: center; margin-bottom: var(--space-lg); }
.filters-mode {
  font-family: var(--font-heading);
  font-size: var(--fs-micro);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-gold);
}
/* Les chips sont des <button> : sans couleur explicite, le navigateur
   applique `buttontext` (noir) et le texte devient illisible sur le fond sombre. */
.active-filter {
  cursor: pointer;
  color: var(--accent-text);
  font-family: var(--font-heading);
  font-size: var(--fs-secondary);
  letter-spacing: 0.08em;
}
.active-filter:hover { background: rgba(var(--accent-rgb), 0.22); }
.active-filter-x { opacity: 0.6; font-size: var(--fs-micro); }
.active-filter:hover .active-filter-x { opacity: 1; }
.clear-all {
  padding: var(--space-xs) var(--space-md);
  background: none;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  color: var(--color-text-secondary);
  font-family: var(--font-heading);
  font-size: var(--fs-badge);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  cursor: pointer;
  transition: all var(--transition-fast);
}
.clear-all:hover { color: var(--color-crimson); border-color: var(--color-crimson); }

/* ── TABLE ───────────────────────────────────────────────── */
.list-container { --list-cols: 1fr 220px 80px 200px 28px; }
.list-container .list-body { max-height: 640px; }
.list-container .list-header-row { position: sticky; top: 0; z-index: 1; }
.list-container .list-header-row,
.list-container .list-row { align-items: center; gap: var(--space-md); }
.list-row {
  cursor: pointer;
  user-select: none;
  text-decoration: none;
  color: inherit;
}
.list-row:hover .row-title { color: var(--color-gold); }

/* ── FAVORIS ─────────────────────────────────────────────── */
.col-fav { text-align: center; color: var(--color-gold-dim); }
.fav-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  background: none;
  border: none;
  border-radius: var(--radius-sm);
  font-size: 1.05rem;
  line-height: 1;
  color: var(--color-text-muted);
  cursor: pointer;
  transition: color var(--transition-fast), transform var(--transition-fast), background var(--transition-fast);
}
.fav-btn:hover { color: var(--color-gold); transform: scale(1.2); background: rgba(184, 146, 74, 0.12); }
.fav-btn--on { color: var(--color-gold); }
.tag--fav.active { background: rgba(184, 146, 74, 0.2); border-color: var(--color-gold); color: var(--color-gold); }

.row-name { min-width: 0; display: flex; flex-direction: column; gap: 3px; }
.row-title { transition: color var(--transition-fast); }
.row-parent {
  font-family: var(--font-flavor);
  font-style: italic;
  font-size: var(--fs-micro);
  color: var(--color-text-muted);
}
.row-matches { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 2px; }
.match-pill {
  font-family: var(--font-heading);
  font-size: var(--fs-micro);
  letter-spacing: 0.06em;
  padding: 1px 6px;
  border-radius: var(--radius-sm);
  background: rgba(127, 179, 138, 0.15);
  color: var(--color-arcane);
  border: 1px solid var(--color-arcane-dim);
  white-space: nowrap;
}
.match-pill--maybe {
  background: rgba(74, 85, 104, 0.25);
  color: var(--color-fog);
  border: 1px dashed var(--color-fog);
}
.match-mark { margin-left: 2px; font-weight: 700; }

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
.badge-classic { background: rgba(139, 58, 58, 0.15); color: var(--color-crimson); border: 1px solid var(--color-crimson); }
.badge-variants { background: rgba(74, 85, 104, 0.25); color: var(--color-fog); border: 1px solid var(--color-fog); }

/* ── RESPONSIVE ──────────────────────────────────────────── */
@media (max-width: 900px) {
  .list-container { --list-cols: 1fr 80px 160px 28px; }
  .col-formula, .row-formula { display: none; }
}
@media (max-width: 768px) {
  .search-row { flex-direction: column; }
  .search-field { width: 100%; }
  .search-bar { width: 100%; }
  .search-input,
  .search-input--credit { width: 100%; box-sizing: border-box; }
  .dropdown-menu--skills { width: min(300px, calc(100vw - 48px)); }
  .list-container { --list-cols: 1fr 80px 28px; }
  .col-type, .row-badges { display: none; }
}
@media (max-width: 640px) {
  .list-container { --list-cols: 1fr 70px 28px; }
  .list-container .list-body { max-height: none; }
}
</style>
