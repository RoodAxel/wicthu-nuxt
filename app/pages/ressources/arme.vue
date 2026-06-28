<script setup lang="ts">
import type { arme, Competence } from '@prisma/client'

type WeaponWithSkill = arme & {
  competence: Pick<Competence, 'id' | 'name'>
}

const { data: weapons, status, error } = useFetch<WeaponWithSkill[]>('/api/arme')

// ── FILTRES ───────────────────────────────────────────────────────────────────
const searchName = ref('')
const searchSkill = ref('')
const searchPrice = ref('')
const eraFilter = ref<'all' | 'classique' | 'moderne'>('all')
const filterExplosive = ref(false)

const {
  selected: selectedCategories,
  open: categoryDropdownOpen,
  triggerRef: categoryDropdownRef,
  toggle: toggleCategory,
  remove: removeCategory
} = useMultiSelectFilter<string>()

const { expandedId, toggleExpand: toggleRow } = useExpandableRows()

// ── BIBLIOTHÈQUE ──────────────────────────────────────────────────────────────
const user = useSupabaseUser()
const savingId = ref<number | null>(null)
const savedIds = ref(new Set<number>())

async function saveToLibrary(weapon: WeaponWithSkill) {
  savingId.value = weapon.id
  try {
    await $fetch('/api/arme-perso', {
      method: 'POST',
      body: {
        nom: weapon.name,
        deg: weapon.damage ?? null,
        port: weapon.range ?? null,
        cap: weapon.capacity ?? null,
        pann: weapon.failure != null ? String(weapon.failure) : null
      }
    })
    savedIds.value.add(weapon.id)
  } finally {
    savingId.value = null
  }
}

// ── PARSEUR DÉGÂTS ────────────────────────────────────────────────────────────
function parseDamageValue(dmg: string | null): number | null {
  if (!dmg) return null
  const s = (dmg.split('/')[0] ?? '').trim()
  const diceRe = /(\d+)[dD](\d+)/g
  let total = 0
  let hasDice = false
  let lastEnd = 0
  let m: RegExpExecArray | null
  while ((m = diceRe.exec(s)) !== null) {
    total += parseInt(m[1] ?? '0') * parseInt(m[2] ?? '0')
    hasDice = true
    lastEnd = m.index + m[0].length
  }
  if (!hasDice) return null
  const bonus = s.slice(lastEnd).match(/^\+(\d+)$/)
  if (bonus) total += parseInt(bonus[1] ?? '0')
  return total
}

// ── TRIS ──────────────────────────────────────────────────────────────────────
const sortCategory = ref<'asc' | 'desc'>('asc')
const sortName = ref<'asc' | 'desc'>('asc')
const sortDamage = ref<'desc' | 'asc' | null>(null)
const sortClassicPrice = ref<'desc' | 'asc' | null>(null)
const sortModernPrice = ref<'desc' | 'asc' | null>(null)

const alphaIsActive = computed(() =>
  sortDamage.value === null && sortClassicPrice.value === null && sortModernPrice.value === null
)
const sortCategoryIcon = computed(() => sortCategory.value === 'asc' ? '↑' : '↓')
const sortNameIcon = computed(() => sortName.value === 'asc' ? '↑' : '↓')
const sortDamageIcon = computed(() => sortDamage.value === 'desc' ? '↓' : sortDamage.value === 'asc' ? '↑' : '↕')
const sortClassicPriceIcon = computed(() => sortClassicPrice.value === 'desc' ? '↓' : sortClassicPrice.value === 'asc' ? '↑' : '↕')
const sortModernPriceIcon = computed(() => sortModernPrice.value === 'desc' ? '↓' : sortModernPrice.value === 'asc' ? '↑' : '↕')

function cycleSortCategory() {
  sortDamage.value = null
  sortClassicPrice.value = null
  sortModernPrice.value = null
  sortCategory.value = sortCategory.value === 'asc' ? 'desc' : 'asc'
}
function cycleSortName() {
  sortDamage.value = null
  sortClassicPrice.value = null
  sortModernPrice.value = null
  sortName.value = sortName.value === 'asc' ? 'desc' : 'asc'
}
function cycleSortDamage() {
  sortClassicPrice.value = null
  sortModernPrice.value = null
  sortDamage.value = sortDamage.value === null ? 'desc' : sortDamage.value === 'desc' ? 'asc' : null
}
function cycleSortClassicPrice() {
  sortDamage.value = null
  sortModernPrice.value = null
  sortClassicPrice.value = sortClassicPrice.value === null ? 'desc' : sortClassicPrice.value === 'desc' ? 'asc' : null
}
function cycleSortModernPrice() {
  sortDamage.value = null
  sortClassicPrice.value = null
  sortModernPrice.value = sortModernPrice.value === null ? 'desc' : sortModernPrice.value === 'desc' ? 'asc' : null
}

// ── DONNÉES ───────────────────────────────────────────────────────────────────
const categories = computed(() => {
  if (!weapons.value) return []
  return [...new Set(weapons.value.map(w => w.category))].sort()
})

const selectedCategoryNames = computed(() =>
  categories.value.filter(c => selectedCategories.value.has(c))
)

// ── FILTERED + SORTED ─────────────────────────────────────────────────────────
const filtered = computed(() => {
  if (!weapons.value) return []

  let result = weapons.value.filter((w) => {
    if (searchName.value.trim() && !normalizeStr(w.name).includes(normalizeStr(searchName.value.trim()))) return false
    if (searchSkill.value.trim() && !normalizeStr(w.competence.name).includes(normalizeStr(searchSkill.value.trim()))) return false
    if (searchPrice.value.trim()) {
      const q = searchPrice.value.trim()
      const matchClassic = w.classic_price !== null && String(w.classic_price).includes(q)
      const matchModern = w.modern_price !== null && String(w.modern_price).includes(q)
      if (!matchClassic && !matchModern) return false
    }
    if (selectedCategories.value.size > 0 && !selectedCategories.value.has(w.category)) return false
    if (eraFilter.value !== 'all' && !w.epoque.includes(eraFilter.value)) return false
    if (filterExplosive.value && !w.damage?.includes('(E)')) return false
    return true
  })

  if (sortDamage.value) {
    result = [...result].sort((a, b) => {
      const av = parseDamageValue(a.damage)
      const bv = parseDamageValue(b.damage)
      if (av === null && bv === null) return 0
      if (av === null) return 1
      if (bv === null) return -1
      return sortDamage.value === 'desc' ? bv - av : av - bv
    })
  } else if (sortClassicPrice.value) {
    result = [...result].sort((a, b) => {
      const aNull = a.classic_price === null
      const bNull = b.classic_price === null
      if (aNull && bNull) return 0
      if (aNull) return 1
      if (bNull) return -1
      return sortClassicPrice.value === 'desc'
        ? (b.classic_price! - a.classic_price!)
        : (a.classic_price! - b.classic_price!)
    })
  } else if (sortModernPrice.value) {
    result = [...result].sort((a, b) => {
      const aNull = a.modern_price === null
      const bNull = b.modern_price === null
      if (aNull && bNull) return 0
      if (aNull) return 1
      if (bNull) return -1
      return sortModernPrice.value === 'desc'
        ? (b.modern_price! - a.modern_price!)
        : (a.modern_price! - b.modern_price!)
    })
  } else {
    result = [...result].sort((a, b) => {
      const catCmp = a.category.localeCompare(b.category, 'fr')
      if (catCmp !== 0) return sortCategory.value === 'asc' ? catCmp : -catCmp
      const nameCmp = a.name.localeCompare(b.name, 'fr')
      return sortName.value === 'asc' ? nameCmp : -nameCmp
    })
  }

  return result
})

const stats = computed(() => [
  { number: weapons.value?.length ?? 0, label: 'Armes' },
  { number: categories.value.length, label: 'Catégories' },
  { number: weapons.value?.filter(w => w.epoque.includes('classique')).length ?? 0, label: 'Classiques' },
  { number: weapons.value?.filter(w => w.epoque.includes('moderne')).length ?? 0, label: 'Modernes' },
  { number: filtered.value.length, label: 'Résultats', highlight: true }
])

useSeoMeta({
  title: 'Armes',
  description: 'Catalogue des armes pour L\'Appel de Cthulhu : dégâts, portée, cadence de tir, capacité et compétence de combat associée.'
})
</script>

<template>
  <ResourceListLayout
    title="Armes"
    subtitle="Arsenal des investigateurs et équipements de combat"
    quote="Dans les ruelles sombres d'Arkham comme dans les jungles d'Afrique, l'acier reste la dernière réponse aux horreurs que la raison refuse d'admettre."
    cite="— Registre du Commissariat d'Arkham, 1923"
    accent="crimson"
    max-width="1200px"
    :stats-cols="5"
    :stats-cols-mobile="3"
    stats-max-width="none"
    :status="status"
    :error="error"
    :result-count="filtered.length"
    :stats="stats"
    loading-text="Consultation du catalogue…"
    empty-text="Aucune arme ne correspond à votre requête."
  >
    <template #subtoolbar>
      <div class="weapon-toolbar">
        <!-- Époque -->
        <div class="filter-block">
          <span class="filter-block-label">Époque</span>
          <div class="filter-block-controls">
            <button class="tag" :class="{ active: eraFilter === 'all' }" @click="eraFilter = 'all'">Toutes</button>
            <button class="tag" :class="{ active: eraFilter === 'classique' }" @click="eraFilter = 'classique'">Classique</button>
            <button class="tag modern-tag" :class="{ active: eraFilter === 'moderne' }" @click="eraFilter = 'moderne'">Moderne</button>
          </div>
        </div>

        <div class="toolbar-sep" />

        <!-- Catégories -->
        <div class="filter-block">
          <span class="filter-block-label">Catégories</span>
          <div class="filter-block-controls">
            <div ref="categoryDropdownRef" class="dropdown-wrapper">
              <button
                class="tag"
                :class="{ active: selectedCategories.size > 0 }"
                @click="categoryDropdownOpen = !categoryDropdownOpen"
              >
                Filtrer <span class="dropdown-caret">{{ categoryDropdownOpen ? '▲' : '▼' }}</span>
              </button>
              <div v-if="categoryDropdownOpen" class="dropdown-menu">
                <button
                  v-for="cat in categories"
                  :key="cat"
                  class="dropdown-item"
                  :class="{ selected: selectedCategories.has(cat) }"
                  @click="toggleCategory(cat)"
                >
                  <span class="dropdown-check">{{ selectedCategories.has(cat) ? '✓' : '' }}</span>
                  {{ cat }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="toolbar-sep" />

        <!-- Spécial -->
        <div class="filter-block">
          <span class="filter-block-label">Spécial</span>
          <div class="filter-block-controls">
            <label class="checkbox-filter">
              <input v-model="filterExplosive" type="checkbox" class="checkbox-input">
              <span class="checkbox-label">(E) Empalement</span>
            </label>
          </div>
        </div>

        <div class="toolbar-sep toolbar-sep--push" />

        <!-- Tris prix -->
        <div class="filter-block">
          <span class="filter-block-label">Prix</span>
          <div class="filter-block-controls">
            <button class="tag sort-tag" :class="{ active: sortClassicPrice !== null }" @click="cycleSortClassicPrice">
              Classique <span class="sort-icon">{{ sortClassicPriceIcon }}</span>
            </button>
            <button class="tag sort-tag modern-sort-tag" :class="{ active: sortModernPrice !== null }" @click="cycleSortModernPrice">
              Moderne <span class="sort-icon">{{ sortModernPriceIcon }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Catégories actives -->
      <div v-if="selectedCategoryNames.length > 0" class="active-filters">
        <span v-for="cat in selectedCategoryNames" :key="cat" class="active-category-filter">
          <span class="active-category-label">{{ cat }}</span>
          <button class="active-category-clear" :aria-label="`Retirer ${cat}`" @click="removeCategory(cat)">✕</button>
        </span>
      </div>

      <!-- Ligne de recherche -->
      <div class="search-row">
        <div class="search-field">
          <label class="search-label">Arme</label>
          <div class="search-bar">
            <span class="search-icon">🔍</span>
            <input v-model="searchName" type="text" class="search-input" placeholder="Nom…">
          </div>
        </div>
        <div class="search-field">
          <label class="search-label">Compétence</label>
          <div class="search-bar">
            <span class="search-icon">🔍</span>
            <input v-model="searchSkill" type="text" class="search-input" placeholder="ex : Corps à corps…">
          </div>
        </div>
        <div class="search-field">
          <label class="search-label">Prix</label>
          <div class="search-bar">
            <span class="search-icon">🔍</span>
            <input v-model="searchPrice" type="text" class="search-input search-input--sm" placeholder="ex : 25…">
          </div>
        </div>
      </div>
    </template>

    <div class="table-outer">
      <div class="list-body">
        <div class="list-header-row">
          <button class="col-header-btn" :class="{ 'sort-active': alphaIsActive }" @click="cycleSortName">
            Arme <span class="sort-icon">{{ sortNameIcon }}</span>
          </button>
          <button class="col-header-btn" :class="{ 'sort-active': alphaIsActive }" @click="cycleSortCategory">
            Catégorie <span class="sort-icon">{{ sortCategoryIcon }}</span>
          </button>
          <span class="col-skill">Compétence</span>
          <button class="col-header-btn col-damage" :class="{ 'sort-active': sortDamage !== null }" @click="cycleSortDamage">
            Dégâts <span class="sort-icon">{{ sortDamageIcon }}</span>
          </button>
          <span class="col-range">Portée</span>
          <span class="col-price">Prix</span>
          <span class="col-era">Époque</span>
          <span class="col-chevron" />
        </div>
        <template v-for="(weapon, index) in filtered" :key="weapon.id">
          <div
            class="list-row"
            :class="[index % 2 === 0 ? 'row-even' : 'row-odd', { 'row-expanded': expandedId === weapon.id }]"
            @click="toggleRow(weapon.id)"
          >
            <span class="col-name row-name">{{ weapon.name }}</span>
            <span class="col-category row-muted">{{ weapon.category.toLowerCase() }}</span>
            <span class="col-skill row-skill">{{ weapon.competence.name }}</span>
            <span class="col-damage row-value">{{ weapon.damage ?? '—' }}</span>
            <span class="col-range row-muted">{{ weapon.range ?? '—' }}</span>
            <span class="col-price">
              <span v-if="weapon.classic_price" class="price-classic">{{ weapon.classic_price }}$</span>
              <span v-if="weapon.classic_price && weapon.modern_price" class="price-sep">/</span>
              <span v-if="weapon.modern_price" class="price-modern">{{ weapon.modern_price }}$</span>
              <span v-if="!weapon.classic_price && !weapon.modern_price" class="row-muted">—</span>
            </span>
            <span class="col-era">
              <span v-for="era in weapon.epoque" :key="era" class="era-badge" :class="`era-${era}`">
                {{ era === 'classique' ? 'C' : era === 'moderne' ? 'M' : era }}
              </span>
            </span>
            <span class="col-chevron chevron" :class="{ open: expandedId === weapon.id }">›</span>
          </div>

          <Transition name="expand">
            <div v-if="expandedId === weapon.id" class="detail-panel" :class="index % 2 === 0 ? 'row-even' : 'row-odd'">
              <p class="detail-full-name">{{ weapon.name }}</p>
              <div class="detail-grid">
                <div class="detail-section">
                  <h3 class="detail-section-title">Combat</h3>
                  <div class="detail-fields">
                    <div class="detail-field">
                      <span class="field-label">Dégâts</span>
                      <span class="field-value row-value">{{ weapon.damage ?? '—' }}</span>
                    </div>
                    <div class="detail-field">
                      <span class="field-label">Dégâts moyens</span>
                      <span class="field-value row-value">{{ weapon.average_dmg ?? '—' }}</span>
                    </div>
                    <div class="detail-field">
                      <span class="field-label">Portée</span>
                      <span class="field-value">{{ weapon.range ?? '—' }}</span>
                    </div>
                    <div class="detail-field">
                      <span class="field-label">Cadence</span>
                      <span class="field-value">{{ weapon.cadence ?? '—' }}</span>
                    </div>
                    <div class="detail-field">
                      <span class="field-label">Capacité</span>
                      <span class="field-value">{{ weapon.capacity ?? '—' }}</span>
                    </div>
                    <div class="detail-field">
                      <span class="field-label">Panne</span>
                      <span class="field-value row-failure">{{ weapon.failure ?? '—' }}</span>
                    </div>
                  </div>
                </div>

                <div class="detail-section">
                  <h3 class="detail-section-title">Infos</h3>
                  <div class="detail-fields">
                    <div class="detail-field">
                      <span class="field-label">Compétence</span>
                      <span class="field-value row-skill">{{ weapon.competence.name }}</span>
                    </div>
                    <div class="detail-field">
                      <span class="field-label">Catégorie</span>
                      <span class="field-value">{{ weapon.category }}</span>
                    </div>
                    <div class="detail-field">
                      <span class="field-label">Époque</span>
                      <span class="field-value era-list">
                        <span v-for="era in weapon.epoque" :key="era" class="era-badge" :class="`era-${era}`">
                          {{ era }}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>

                <div class="detail-section">
                  <h3 class="detail-section-title">Prix</h3>
                  <div class="detail-fields">
                    <div class="detail-field">
                      <span class="field-label">Époque classique</span>
                      <span class="field-value price-classic">{{ weapon.classic_price ? weapon.classic_price + ' $' : '—' }}</span>
                    </div>
                    <div class="detail-field">
                      <span class="field-label">Époque moderne</span>
                      <span class="field-value price-modern">{{ weapon.modern_price ? weapon.modern_price + ' $' : '—' }}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div v-if="user" class="detail-actions">
                <button
                  type="button"
                  class="btn-save-library"
                  :disabled="savingId === weapon.id || savedIds.has(weapon.id)"
                  @click.stop="saveToLibrary(weapon)"
                >
                  <span v-if="savingId === weapon.id">…</span>
                  <span v-else-if="savedIds.has(weapon.id)">✓ Dans la bibliothèque</span>
                  <span v-else>💾 Sauvegarder dans ma bibliothèque</span>
                </button>
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
          <span class="era-badge era-classique">C</span>
          <span class="legend-desc">Classique — arme disponible à l'époque classique (années 1920)</span>
        </div>
        <div class="legend-item">
          <span class="era-badge era-moderne">M</span>
          <span class="legend-desc">Moderne — arme disponible à l'époque moderne</span>
        </div>
        <div class="legend-item">
          <span class="legend-token token-rare">Rare</span>
          <span class="legend-desc">Arme obsolète, illégale ou recherchée par les collectionneurs — difficile à trouver</span>
        </div>
        <div class="legend-item">
          <span class="legend-token token-damage">(E)</span>
          <span class="legend-desc">Empalement — en cas de coup critique, en plus des dégâts maximum, rajoute un lancer des dés de dégâts</span>
        </div>
        <div class="legend-item">
          <span class="legend-token token-damage">Etourd.</span>
          <span class="legend-desc">Étourdissement — la cible ne peut plus agir pendant 1d6 tours (ou à la discrétion du gardien)</span>
        </div>
        <div class="legend-item">
          <span class="legend-token token-damage">Feu</span>
          <span class="legend-desc">La cible doit réussir un test de Chance ou prendre feu</span>
        </div>
        <div class="legend-item">
          <span class="legend-token token-neutral">Cadence 1(3)</span>
          <span class="legend-desc">La valeur entre parenthèses représente le nombre maximum de tirs possibles en un seul round</span>
        </div>
        <div class="legend-item">
          <span class="legend-token token-failure">Panne</span>
          <span class="legend-desc">Si le jet d'attaque est supérieur ou égal à ce seuil, le tir ne part pas et l'arme risque l'enrayement</span>
        </div>
      </div>
    </template>
  </ResourceListLayout>
</template>

<style scoped>
/* ══ TOOLBAR (carte de filtres) ══════════════════════════════ */
.weapon-toolbar {
  display: flex;
  align-items: flex-end;
  gap: var(--space-md);
  margin-bottom: var(--space-md);
  flex-wrap: wrap;
  padding: var(--space-md) var(--space-lg);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
}
.filter-block { display: flex; flex-direction: column; gap: var(--space-xs); }
.filter-block-label {
  font-family: var(--font-heading);
  font-size: var(--fs-2xs);
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--color-text-muted);
}
.filter-block-controls { display: flex; align-items: center; gap: var(--space-sm); flex-wrap: wrap; }
.toolbar-sep {
  width: 1px;
  height: 36px;
  background: var(--color-border);
  flex-shrink: 0;
  align-self: flex-end;
  margin-bottom: 2px;
}
.toolbar-sep--push { margin-left: auto; visibility: hidden; }

/* Tags (dans la toolbar) */
.weapon-toolbar .tag {
  font-family: var(--font-heading);
  font-size: var(--fs-md);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  padding: var(--space-xs) var(--space-md);
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
  background: transparent;
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
}
.weapon-toolbar .tag:hover { border-color: var(--color-crimson-dim); color: #c47070; }
.weapon-toolbar .tag.active { background: var(--color-crimson-dim); border-color: var(--color-crimson); color: #c47070; }
.weapon-toolbar .tag.modern-tag { border-color: var(--color-arcane-dim); color: var(--color-arcane); }
.weapon-toolbar .tag.modern-tag:hover { border-color: var(--color-arcane); }
.weapon-toolbar .tag.modern-tag.active { background: var(--color-arcane-dim); border-color: var(--color-arcane); color: var(--color-arcane); }

.weapon-toolbar .sort-tag { border-color: var(--color-gold-dim); color: var(--color-gold); }
.weapon-toolbar .sort-tag:hover { border-color: var(--color-gold); }
.weapon-toolbar .sort-tag.active { background: var(--color-gold-dim); border-color: var(--color-gold); color: var(--color-gold); }
.weapon-toolbar .sort-tag.modern-sort-tag { border-color: var(--color-arcane-dim); color: var(--color-arcane); }
.weapon-toolbar .sort-tag.modern-sort-tag:hover { border-color: var(--color-arcane); }
.weapon-toolbar .sort-tag.modern-sort-tag.active { background: var(--color-arcane-dim); border-color: var(--color-arcane); color: var(--color-arcane); }

.weapon-toolbar .dropdown-item.selected { color: #c47070; }
.weapon-toolbar .dropdown-check { color: #c47070; }

/* Checkbox (E) */
.checkbox-filter {
  display: inline-flex;
  align-items: center;
  gap: var(--space-sm);
  cursor: pointer;
  padding: var(--space-xs) var(--space-md);
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  background: transparent;
  transition: all var(--transition-fast);
  user-select: none;
}
.checkbox-filter:hover { border-color: var(--color-crimson-dim); }
.checkbox-filter:has(.checkbox-input:checked) { background: var(--color-crimson-dim); border-color: var(--color-crimson); }
.checkbox-input {
  appearance: none;
  -webkit-appearance: none;
  width: 13px;
  height: 13px;
  border: 1px solid var(--color-border);
  border-radius: 2px;
  background: transparent;
  cursor: pointer;
  flex-shrink: 0;
  position: relative;
  transition: all var(--transition-fast);
}
.checkbox-input:checked { background: var(--color-crimson); border-color: var(--color-crimson); }
.checkbox-input:checked::after {
  content: '';
  position: absolute;
  left: 3px; top: 1px;
  width: 5px; height: 8px;
  border: 1.5px solid #f0d8d8;
  border-top: none;
  border-left: none;
  transform: rotate(40deg);
}
.checkbox-label {
  font-family: var(--font-heading);
  font-size: var(--fs-md);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
  transition: color var(--transition-fast);
}
.checkbox-filter:has(.checkbox-input:checked) .checkbox-label { color: #c47070; }

/* ══ FILTRES ACTIFS ══════════════════════════════════════════ */
.active-category-filter {
  display: inline-flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-xs) var(--space-sm) var(--space-xs) var(--space-md);
  background: rgba(139, 58, 58, 0.1);
  border: 1px solid var(--color-crimson-dim);
  border-radius: var(--radius-sm);
}
.active-category-label {
  font-family: var(--font-heading);
  font-size: var(--fs-md);
  font-weight: bold;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #c47070;
}
.active-category-clear {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px; height: 18px;
  font-size: var(--fs-2xs);
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-crimson-dim);
  color: #c47070;
  background: transparent;
  cursor: pointer;
  transition: all var(--transition-fast);
  line-height: 1;
}
.active-category-clear:hover { background: var(--color-crimson-dim); }

/* ══ RECHERCHE ═══════════════════════════════════════════════ */
.search-row { display: flex; gap: var(--space-md); margin-bottom: var(--space-xl); flex-wrap: wrap; }
.search-field { display: flex; flex-direction: column; gap: var(--space-xs); }
.search-label {
  font-family: var(--font-heading);
  font-size: var(--fs-sm);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-text-muted);
}
.search-row .search-input { width: 220px; }
.search-row .search-input--sm { width: 140px; }
.search-row .search-input:focus {
  border-color: var(--color-crimson-dim);
  box-shadow: 0 0 0 2px rgba(139, 58, 58, 0.15);
}

/* ══ TABLE ═══════════════════════════════════════════════════ */
.table-outer {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
}
.table-outer .list-header-row,
.table-outer .list-row {
  grid-template-columns: 1fr 140px 160px 90px 100px 120px 70px 28px;
  align-items: center;
  gap: var(--space-md);
}
.table-outer .list-header-row {
  font-size: var(--fs-sm);
  position: sticky;
  top: 0;
  z-index: 1;
}
.col-header-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  background: transparent;
  border: none;
  font-family: var(--font-heading);
  font-size: var(--fs-sm);
  font-weight: bold;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--color-text-muted);
  cursor: pointer;
  padding: 0;
  transition: color var(--transition-fast);
}
.col-header-btn:hover { color: var(--color-gold); }
.col-header-btn.sort-active { color: var(--color-gold); }

.table-outer .list-body { max-height: 640px; }
.table-outer .list-body::-webkit-scrollbar-thumb:hover { background: var(--color-crimson-dim); }
.table-outer .list-row { cursor: pointer; user-select: none; }
.table-outer .list-row.row-expanded { border-bottom: 1px solid var(--color-border); }

.chevron {
  font-family: var(--font-heading);
  font-size: var(--fs-lg);
  color: var(--color-text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform var(--transition-fast);
  transform: rotate(0deg);
}
.chevron.open { transform: rotate(90deg); color: var(--color-crimson); }

/* Cellules */
.table-outer .row-name {
  color: var(--color-text-primary);
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.row-muted {
  font-family: var(--font-flavor);
  font-style: italic;
  font-size: var(--fs-base);
  color: var(--color-text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.row-skill {
  font-family: var(--font-heading);
  font-size: var(--fs-sm);
  letter-spacing: 0.05em;
  color: var(--color-arcane);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.row-value {
  font-family: var(--font-heading);
  font-size: var(--fs-md);
  font-weight: 600;
  color: var(--color-crimson);
}
.row-failure { font-family: var(--font-heading); font-size: var(--fs-md); color: var(--color-gold); }

.col-price {
  display: flex;
  align-items: center;
  gap: 3px;
  font-family: var(--font-heading);
  font-size: var(--fs-sm);
}
.price-classic { color: var(--color-gold); }
.price-sep { color: var(--color-text-muted); }
.price-modern { color: var(--color-arcane); }

.col-era { display: flex; gap: 4px; flex-wrap: wrap; }
.era-list { display: flex; gap: 6px; flex-wrap: wrap; }
.era-badge {
  font-family: var(--font-heading);
  font-size: var(--fs-2xs);
  font-weight: bold;
  letter-spacing: 0.1em;
  padding: 2px 5px;
  border-radius: var(--radius-sm);
}
.era-classique { background: rgba(184, 146, 74, 0.12); color: var(--color-gold); border: 1px solid var(--color-gold-dim); }
.era-moderne { background: rgba(127, 179, 138, 0.12); color: var(--color-arcane); border: 1px solid var(--color-arcane-dim); }

/* ══ PANNEAU DE DÉTAIL ═══════════════════════════════════════ */
.detail-panel {
  border-bottom: 1px solid var(--color-border);
  padding: var(--space-lg) var(--space-xl);
  border-top: 1px solid var(--color-border-glow);
}
.detail-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-xl); }
.detail-section-title {
  font-family: var(--font-heading);
  font-size: var(--fs-badge);
  font-weight: bold;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--color-text-muted);
  margin-bottom: var(--space-md);
  padding-bottom: var(--space-xs);
  border-bottom: 1px solid var(--color-border);
}
.detail-fields { display: flex; flex-direction: column; gap: var(--space-sm); }
.detail-field { display: flex; justify-content: space-between; align-items: baseline; gap: var(--space-sm); }
.field-label {
  font-family: var(--font-heading);
  font-size: var(--fs-sm);
  font-weight: bold;
  letter-spacing: 0.05em;
  color: var(--color-text-muted);
  white-space: nowrap;
}
.field-value {
  font-family: var(--font-body);
  font-size: var(--fs-section-hint);
  color: var(--color-text-secondary);
  text-align: right;
}
.detail-full-name {
  display: none;
  font-family: var(--font-heading);
  font-size: var(--fs-md);
  font-weight: 600;
  letter-spacing: 0.03em;
  color: var(--color-text-primary);
  margin-bottom: var(--space-md);
  padding-bottom: var(--space-sm);
  border-bottom: 1px solid var(--color-border);
}
.detail-actions {
  margin-top: var(--space-md);
  padding-top: var(--space-md);
  border-top: 1px solid var(--color-border);
  display: flex;
  justify-content: flex-end;
}
.btn-save-library {
  font-family: var(--font-heading);
  font-size: var(--fs-sm);
  letter-spacing: 0.1em;
  color: var(--color-arcane);
  background: transparent;
  border: 1px solid var(--color-arcane-dim);
  border-radius: var(--radius-sm);
  padding: var(--space-xs) var(--space-md);
  cursor: pointer;
  transition: all var(--transition-fast);
}
.btn-save-library:hover:not(:disabled) { background: rgba(127, 179, 138, 0.1); border-color: var(--color-arcane); }
.btn-save-library:disabled { opacity: 0.6; cursor: default; color: var(--color-text-muted); border-color: var(--color-border); }

/* ══ LÉGENDE (jetons spécifiques armes) ══════════════════════ */
.legend-token {
  font-family: var(--font-heading);
  font-size: var(--fs-row-value);
  font-weight: bold;
  letter-spacing: 0.1em;
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  white-space: nowrap;
  flex-shrink: 0;
}
.token-rare { background: rgba(139, 58, 58, 0.15); color: #c47070; border: 1px solid var(--color-crimson-dim); }
.token-damage { background: rgba(139, 58, 58, 0.1); color: var(--color-crimson); border: 1px solid var(--color-crimson-dim); }
.token-failure { background: rgba(184, 146, 74, 0.12); color: var(--color-gold); border: 1px solid var(--color-gold-dim); }
.token-neutral { background: var(--color-surface); color: var(--color-text-secondary); border: 1px solid var(--color-border); }

/* ══ RESPONSIVE ══════════════════════════════════════════════ */
@media (max-width: 768px) {
  .table-outer .list-header-row,
  .table-outer .list-row { grid-template-columns: 1fr 140px 110px 28px; }
  .col-skill, .col-damage, .col-range, .col-era { display: none; }
  .detail-grid { grid-template-columns: 1fr; }
}
@media (max-width: 640px) {
  .weapon-toolbar { flex-direction: column; align-items: stretch; gap: var(--space-md); }
  .toolbar-sep, .toolbar-sep--push { display: none; }
  .search-row { flex-direction: column; }
  .search-field, .search-bar { width: 100%; }
  .search-row .search-input,
  .search-row .search-input--sm { width: 100%; box-sizing: border-box; }
  .table-outer .list-header-row,
  .table-outer .list-row { grid-template-columns: 1fr 120px 28px; }
  .col-price { display: none; }
  .table-outer .list-body { max-height: 480px; }
  .detail-full-name { display: block; }
}
</style>
