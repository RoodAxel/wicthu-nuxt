<script setup lang="ts">
import type { ChoiceListPicker, FreeChoicePicker, FreeSpecPicker, FixedSpecPicker } from '~/types/investigateur'
import { competences, CATEGORY_KEYS } from '~/utils/investigateur/constants'

const {
  form, occupationDetail, occSkillPickers,
  choiceSelections, freeSpecSelections, freeChoiceSelections, catSubSelections,
  updateChoice, updateFreeSpec, updateFreeChoice, updateCatSub,
  fixedKeys, choiceKeys, selectedChoiceKeys, occupationVarSlots, toggleChoiceKey,
  getSkillBase,
  occPointsTotal, occPointsSpent, occPointsRemaining, occOverflow,
  intPointsTotal, intPointsSpent, intPointsRemaining
} = injectCharacterCreation()

// Fourchette de Crédit recommandée par l'occupation (rappel dans la grille)
const creditRange = computed(() => {
  const d = occupationDetail.value
  if (!d || d.credit_min == null || d.credit_max == null) return null
  return `${d.credit_min}–${d.credit_max}`
})

// Pickers regroupés par type (narrowing TS explicite pour le template)
const fixedSpecPickers = computed(() => occSkillPickers.value.filter((p): p is FixedSpecPicker => p.type === 'FIXED_SPEC'))
const choiceListPickers = computed(() => occSkillPickers.value.filter((p): p is ChoiceListPicker => p.type === 'CHOICE_FROM_LIST'))
const freeSpecPickers = computed(() => occSkillPickers.value.filter((p): p is FreeSpecPicker => p.type === 'FREE_SPEC'))
const freeChoicePickers = computed(() => occSkillPickers.value.filter((p): p is FreeChoicePicker => p.type === 'FREE_CHOICE'))

function choiceListLabel(p: ChoiceListPicker): string {
  if (p.note && /^compétences?\b/i.test(p.note)) return `Choisissez ${p.count} ${p.note} :`
  if (p.note) return `Choisissez (${p.count}) — ${p.note} :`
  return `Choisissez ${p.count} compétence${p.count > 1 ? 's' : ''} :`
}

// Option catégorie choisie dans une liste → demande une sous-spécialité
function selectedCatOption(p: ChoiceListPicker, slot: number) {
  const name = (choiceSelections.value[p.i] ?? [])[slot]
  const opt = p.options.find(o => o.competence.name === name)
  return opt?.competence.isCategory ? opt.competence : null
}

// ── Saisie libre « Autre… » : les listes de spécialités de la BDD ne sont
// qu'un échantillon, le joueur peut donc toujours entrer la sienne. ─────────
const CUSTOM_SPEC = '__custom__'
const freeSpecCustom = ref<Record<number, boolean>>({})
const catSubCustom = ref<Record<string, boolean>>({})

function isCustomSpec(p: FreeSpecPicker): boolean {
  if (freeSpecCustom.value[p.i]) return true
  const sel = freeSpecSelections.value[p.i]
  return !!sel && !p.children.some(c => c.name === sel)
}
function freeSpecSelectValue(p: FreeSpecPicker): string {
  return isCustomSpec(p) ? CUSTOM_SPEC : (freeSpecSelections.value[p.i] ?? '')
}
function onFreeSpecSelect(i: number, value: string) {
  freeSpecCustom.value = { ...freeSpecCustom.value, [i]: value === CUSTOM_SPEC }
  updateFreeSpec(i, value === CUSTOM_SPEC ? '' : value)
}

function isCustomCatSub(p: ChoiceListPicker, slot: number): boolean {
  const cat = selectedCatOption(p, slot)
  if (cat && cat.children.length === 0) return true
  const k = `${p.i}_${slot}`
  if (catSubCustom.value[k]) return true
  const sel = catSubSelections.value[k]
  return !!sel && !!cat && !cat.children.some(c => c.name === sel)
}
function catSubSelectValue(p: ChoiceListPicker, slot: number): string {
  return isCustomCatSub(p, slot) ? CUSTOM_SPEC : (catSubSelections.value[`${p.i}_${slot}`] ?? '')
}
function onCatSubSelect(p: ChoiceListPicker, slot: number, value: string) {
  catSubCustom.value = { ...catSubCustom.value, [`${p.i}_${slot}`]: value === CUSTOM_SPEC }
  updateCatSub(p.i, slot, value === CUSTOM_SPEC ? '' : value)
}

// Compétences proposables en choix libre (grille principale, hors catégories)
const freeChoiceOptions = competences.filter(c => !CATEGORY_KEYS.has(c.key))

// Une option est indisponible si elle est déjà en or ailleurs (imposée ou choisie)
function isFreeChoiceTaken(idx: number, slot: number, key: string): boolean {
  if ((freeChoiceSelections.value[idx] ?? [])[slot] === key) return false
  return fixedKeys.value.has(key)
}

// Choix libre « Autre… » : la compétence personnalisée occupe un slot des
// Compétences personnelles (CP1–5), dont la ligne passe en or.
function firstFreeCpKey(): string | null {
  const used = new Set<string>()
  for (const sel of Object.values(freeChoiceSelections.value))
    sel.forEach((k) => { if (k?.startsWith('CP')) used.add(k) })
  for (const i of [1, 2, 3, 4, 5]) {
    const key = `CP${i}_0`
    if (!used.has(key) && !form[`CP${i}_label`]) return key
  }
  return null
}
const hasFreeCpSlot = computed(() => firstFreeCpKey() !== null)

function freeChoiceSelectValue(idx: number, slot: number): string {
  const sel = (freeChoiceSelections.value[idx] ?? [])[slot] ?? ''
  return sel.startsWith('CP') ? CUSTOM_SPEC : sel
}
function isCustomFreeChoice(idx: number, slot: number): boolean {
  return ((freeChoiceSelections.value[idx] ?? [])[slot] ?? '').startsWith('CP')
}
function customFreeChoiceLabelKey(idx: number, slot: number): string {
  return ((freeChoiceSelections.value[idx] ?? [])[slot] ?? '').replace('_0', '_label')
}
function onFreeChoiceSelect(idx: number, slot: number, value: string) {
  if (value !== CUSTOM_SPEC) {
    updateFreeChoice(idx, slot, value)
    return
  }
  if (isCustomFreeChoice(idx, slot)) return
  const cp = firstFreeCpKey()
  if (cp) updateFreeChoice(idx, slot, cp)
}

// ── Sous-lignes de spécialités (texte libre), intégrées sous leur catégorie ──
type SubRow = { key: string, labelKey: string, placeholder: string }
const SUB_ROWS: Record<string, SubRow[]> = {
  ART_0: [1, 2, 3].map(i => ({ key: `AR${i}_0`, labelKey: `AR${i}_label`, placeholder: 'Spécialité…' })),
  LAG_0: [1, 2, 3].map(i => ({ key: `LG${i}_0`, labelKey: `LG${i}_label`, placeholder: 'Langue…' })),
  PIL_0: [{ key: 'PL1_0', labelKey: 'PL1_label', placeholder: 'Véhicule…' }],
  SUR_0: [{ key: 'SR1_0', labelKey: 'SR1_label', placeholder: 'Milieu (mer, désert…)' }],
  SCI_0: [1, 2, 3].map(i => ({ key: `SC${i}_0`, labelKey: `SC${i}_label`, placeholder: 'Spécialité…' }))
}

// ── Combat : deux catégories avec leurs vraies spécialités (hiérarchie BDD) ──
// Combat rapproché → Corps à corps (fixe) + 2 slots ; Combat à distance →
// Armes de poing, Fusils (fixes) + 2 slots. Les listes ne proposent que les
// enfants de la catégorie, moins les trois compétences à slot fixe.
type CombatSub
  = | { kind: 'fixed', key: string, label: string }
    | { kind: 'pick', key: string, labelKey: string, list: 'melee' | 'ranged' }
type GridCell
  = | { kind: 'skill', key: string, label: string }
    | { kind: 'combat', key: string, label: string, subs: CombatSub[] }

const gridCells = computed((): GridCell[] => {
  const cells: GridCell[] = []
  for (const c of competences) {
    if (c.key === 'CD1_0') {
      cells.push({ kind: 'combat', key: 'CAT_CD', label: 'Combat à distance', subs: [
        { kind: 'fixed', key: 'CD1_0', label: 'Armes de poing' },
        { kind: 'fixed', key: 'CD2_0', label: 'Fusils' },
        { kind: 'pick', key: 'CD3_0', labelKey: 'CD3_label', list: 'ranged' },
        { kind: 'pick', key: 'CD4_0', labelKey: 'CD4_label', list: 'ranged' }
      ] })
    } else if (c.key === 'CR1_0') {
      cells.push({ kind: 'combat', key: 'CAT_CR', label: 'Combat rapproché', subs: [
        { kind: 'fixed', key: 'CR1_0', label: 'Corps à corps' },
        { kind: 'pick', key: 'CR2_0', labelKey: 'CR2_label', list: 'melee' },
        { kind: 'pick', key: 'CR3_0', labelKey: 'CR3_label', list: 'melee' }
      ] })
    } else if (c.key !== 'CD2_0') {
      cells.push({ kind: 'skill', key: c.key, label: c.label })
    }
  }
  return cells
})

type CompetenceApi = {
  id: number
  name: string
  baseValue: number | null
  isCategory: boolean | null
  category: { id: number, name: string } | null
}
const { data: allCompetences } = useFetch<CompetenceApi[]>('/api/competence')

function combatChildren(cat: string, excluded: string[]) {
  return (allCompetences.value ?? [])
    .filter(c => c.category?.name === cat && !excluded.includes(c.name))
    .sort((a, b) => a.name.localeCompare(b.name, 'fr'))
}
const meleeOptions = computed(() => combatChildren('Combat rapproché', ['Corps à corps']))
const rangedOptions = computed(() => combatChildren('Combat à distance', ['Armes de poing', 'Fusils']))

function combatBase(labelKey: string): string {
  const name = form[labelKey]
  if (!name) return '0'
  const comp = (allCompetences.value ?? []).find(c => c.name === name)
  return String(comp?.baseValue ?? 0)
}

// Une même spécialité ne peut pas occuper les deux slots de sa catégorie
const PICK_SIBLING: Record<string, string> = {
  CD3_label: 'CD4_label', CD4_label: 'CD3_label',
  CR2_label: 'CR3_label', CR3_label: 'CR2_label'
}
function isCombatOptionTaken(labelKey: string, name: string): boolean {
  const sibling = PICK_SIBLING[labelKey]
  return sibling ? form[sibling] === name : false
}

// ── Clic sur une ligne verte / or-choisie : (dé)sélection directe ────────────
function isClickable(key: string) {
  return choiceKeys.value.has(key) || selectedChoiceKeys.value.has(key)
}
function rowTitle(key: string): string | undefined {
  if (choiceKeys.value.has(key)) return 'Cliquer pour la choisir pour votre occupation'
  if (selectedChoiceKeys.value.has(key)) return 'Cliquer pour annuler ce choix'
  return undefined
}
function onRowClick(key: string) {
  if (isClickable(key)) toggleChoiceKey(key)
}
</script>

<template>
  <section class="form-section">
    <h2 class="section-title">Compétences</h2>
    <p class="section-hint">Valeur finale après répartition — les ½ et ⅕ sont calculés automatiquement.</p>

    <InvestigateurFormHint v-if="occupationDetail" title="Comment répartir vos points">
      Deux réserves distinctes : les points d'<strong>occupation</strong> ne peuvent aller
      que dans les compétences de votre métier (en <strong>or</strong>) ; les points
      d'<strong>intérêt personnel</strong> (INT × 2) vont où bon vous semble. Les compétences
      en <strong>vert</strong> attendent un choix : cliquez sur l'une d'elles (ou utilisez les
      menus ci-dessous) pour l'ajouter à votre occupation. La valeur saisie est le
      <strong>total final</strong>, base comprise — l'Esquive part de DEX÷2, la Langue
      maternelle d'ÉDU.
    </InvestigateurFormHint>

    <div class="points-trackers">
      <div v-if="occupationDetail?.point_competence" class="occ-points-tracker" :class="{ 'occ-points-over': occOverflow > 0 }">
        <span class="occ-points-label">Occupation</span>
        <span class="occ-points-formula">{{ occupationDetail.point_competence }}</span>
        <span class="occ-points-sep">·</span>
        <span class="occ-points-count">{{ occPointsSpent }} / {{ occPointsTotal }}</span>
        <span class="occ-points-remaining">
          <template v-if="occOverflow > 0">
            complet <span class="occ-overflow-badge">+{{ occOverflow }} → intérêt</span>
          </template>
          <template v-else>{{ occPointsRemaining }} restants</template>
        </span>
      </div>
      <div v-if="occupationDetail" class="occ-points-tracker occ-points-tracker--int" :class="{ 'occ-points-over': intPointsRemaining < 0 }">
        <span class="occ-points-label">Intérêt personnel</span>
        <span class="occ-points-formula">INT × 2</span>
        <span class="occ-points-sep">·</span>
        <span class="occ-points-count">{{ intPointsSpent }} / {{ intPointsTotal }}</span>
        <span class="occ-points-remaining">
          {{ intPointsRemaining >= 0 ? `${intPointsRemaining} restants` : `${Math.abs(intPointsRemaining)} de trop` }}
        </span>
      </div>
    </div>
    <p v-if="occupationDetail" class="highlight-hint">
      Compétences <span class="highlight-sample highlight-sample--fixed">obligatoires</span>
      ou <span class="highlight-sample highlight-sample--choice">disponibles au choix</span> de votre occupation.
    </p>
    <div v-if="occSkillPickers.length" class="choice-picker">

      <!-- Spécialités imposées par l'occupation (information) -->
      <div v-for="picker in fixedSpecPickers" :key="`fs${picker.i}`" class="choice-group choice-group--fixed-spec">
        <span class="choice-label choice-label--fixed">
          <span class="choice-badge-fixed">Imposée</span>
          {{ picker.label }}
        </span>
      </div>

      <!-- Choix dans une liste fermée -->
      <div v-for="picker in choiceListPickers" :key="`cl${picker.i}`" class="choice-group choice-group--choice-from-list">
        <span class="choice-label">{{ choiceListLabel(picker) }}</span>
        <div class="choice-slots">
          <div v-for="slot in picker.count" :key="slot" class="choice-slot-group">
            <select
              class="field-select choice-select"
              :value="(choiceSelections[picker.i] ?? [])[slot - 1] ?? ''"
              @change="updateChoice(picker.i, slot - 1, ($event.target as HTMLSelectElement).value)"
            >
              <option value="">— Choisir —</option>
              <option
                v-for="opt in picker.options"
                :key="opt.competence.id"
                :value="opt.competence.name"
                :disabled="(choiceSelections[picker.i] ?? []).some((v, j) => j !== slot - 1 && v === opt.competence.name)"
              >{{ opt.competence.name }}</option>
            </select>
            <select
              v-if="selectedCatOption(picker, slot - 1) && selectedCatOption(picker, slot - 1)!.children.length"
              class="field-select choice-select choice-select--sub"
              :value="catSubSelectValue(picker, slot - 1)"
              @change="onCatSubSelect(picker, slot - 1, ($event.target as HTMLSelectElement).value)"
            >
              <option value="">— Spécialité —</option>
              <option
                v-for="child in selectedCatOption(picker, slot - 1)!.children"
                :key="child.id"
                :value="child.name"
              >{{ child.name }}</option>
              <option :value="CUSTOM_SPEC">Autre… (saisie libre)</option>
            </select>
            <input
              v-if="selectedCatOption(picker, slot - 1) && isCustomCatSub(picker, slot - 1)"
              class="field-input choice-select choice-select--sub"
              type="text"
              placeholder="Spécialité…"
              :value="catSubSelections[`${picker.i}_${slot - 1}`] ?? ''"
              @change="updateCatSub(picker.i, slot - 1, ($event.target as HTMLInputElement).value)"
            >
          </div>
        </div>
      </div>

      <!-- Spécialité libre dans une catégorie -->
      <div v-for="picker in freeSpecPickers" :key="`fp${picker.i}`" class="choice-group">
        <span class="choice-label">Choisissez une spécialité de {{ picker.catName }} :</span>
        <div class="choice-slots">
          <div class="choice-slot-group">
            <select
              v-if="picker.children.length"
              class="field-select choice-select"
              :value="freeSpecSelectValue(picker)"
              @change="onFreeSpecSelect(picker.i, ($event.target as HTMLSelectElement).value)"
            >
              <option value="">— Choisir —</option>
              <option v-for="child in picker.children" :key="child.id" :value="child.name">{{ child.name }}</option>
              <option :value="CUSTOM_SPEC">Autre… (saisie libre)</option>
            </select>
            <input
              v-if="!picker.children.length || isCustomSpec(picker)"
              class="field-input choice-select"
              type="text"
              placeholder="Spécialité…"
              :value="freeSpecSelections[picker.i] ?? ''"
              @change="updateFreeSpec(picker.i, ($event.target as HTMLInputElement).value)"
            >
          </div>
        </div>
      </div>

      <!-- Compétences entièrement libres -->
      <div v-for="picker in freeChoicePickers" :key="`fc${picker.i}`" class="choice-group choice-group--free-choice">
        <span class="choice-label">
          {{ picker.count > 1 ? `${picker.count} compétences au choix` : '1 compétence au choix' }}<template v-if="picker.note"> — {{ picker.note }}</template> :
        </span>
        <div class="choice-slots">
          <div v-for="slot in picker.count" :key="slot" class="choice-slot-group">
            <select
              class="field-select choice-select"
              :value="freeChoiceSelectValue(picker.i, slot - 1)"
              @change="onFreeChoiceSelect(picker.i, slot - 1, ($event.target as HTMLSelectElement).value)"
            >
              <option value="">— Choisir —</option>
              <option
                v-for="c in freeChoiceOptions"
                :key="c.key"
                :value="c.key"
                :disabled="isFreeChoiceTaken(picker.i, slot - 1, c.key)"
              >{{ c.label }}</option>
              <option
                :value="CUSTOM_SPEC"
                :disabled="!isCustomFreeChoice(picker.i, slot - 1) && !hasFreeCpSlot"
              >Autre… (compétence personnelle)</option>
            </select>
            <input
              v-if="isCustomFreeChoice(picker.i, slot - 1)"
              v-model="form[customFreeChoiceLabelKey(picker.i, slot - 1)]"
              class="field-input choice-select"
              type="text"
              placeholder="Nom de la compétence…"
            >
          </div>
        </div>
      </div>
    </div>
    <div class="comp-grid">
      <div
        v-for="cell in gridCells"
        :key="cell.key"
        class="comp-cell"
      >
        <!-- Compétence classique (+ éventuelles sous-lignes de spécialité) -->
        <template v-if="cell.kind === 'skill'">
          <div
            class="comp-row"
            :class="{
              'comp-highlighted': fixedKeys.has(cell.key),
              'comp-choice': choiceKeys.has(cell.key),
              'comp-category': CATEGORY_KEYS.has(cell.key),
              'comp-clickable': isClickable(cell.key)
            }"
            :title="rowTitle(cell.key)"
            @click="onRowClick(cell.key)"
          >
            <span class="comp-name">
              {{ cell.label }}<span v-if="cell.key === 'CRE_0' && creditRange" class="comp-reco">reco {{ creditRange }}</span>
            </span>
            <span class="comp-base">{{ getSkillBase(cell.key) }}%</span>
            <span v-if="CATEGORY_KEYS.has(cell.key)" class="comp-category-badge">—</span>
            <input
              v-else
              v-model="form[cell.key]"
              class="comp-input"
              type="number" min="0" max="100"
              :placeholder="String(getSkillBase(cell.key))"
              @click.stop
            >
          </div>
          <div
            v-for="sub in SUB_ROWS[cell.key] ?? []"
            :key="sub.key"
            class="comp-subrow"
            :class="{
              'comp-highlighted': fixedKeys.has(sub.key),
              'comp-choice': choiceKeys.has(sub.key)
            }"
          >
            <span class="comp-subglyph" aria-hidden="true">↳</span>
            <input
              v-model="form[sub.labelKey]"
              class="field-input label-input"
              type="text"
              :placeholder="sub.placeholder"
              :readonly="occupationVarSlots[sub.labelKey]?.locked"
              :class="{ 'input-locked': occupationVarSlots[sub.labelKey]?.locked }"
            >
            <input
              v-model="form[sub.key]"
              class="comp-input"
              type="number" min="0" max="100"
              :placeholder="String(getSkillBase(sub.key))"
            >
          </div>
        </template>

        <!-- Catégorie de combat : spécialités fixes + slots au choix -->
        <template v-else>
          <div class="comp-row comp-category">
            <span class="comp-name">{{ cell.label }}</span>
            <span class="comp-base" />
            <span class="comp-category-badge">—</span>
          </div>
          <template v-for="sub in cell.subs" :key="sub.key">
            <div
              v-if="sub.kind === 'fixed'"
              class="comp-subrow comp-subrow--named"
              :class="{
                'comp-highlighted': fixedKeys.has(sub.key),
                'comp-choice': choiceKeys.has(sub.key),
                'comp-clickable': isClickable(sub.key)
              }"
              :title="rowTitle(sub.key)"
              @click="onRowClick(sub.key)"
            >
              <span class="comp-subglyph" aria-hidden="true">↳</span>
              <span class="comp-name">{{ sub.label }}</span>
              <span class="comp-base">{{ getSkillBase(sub.key) }}%</span>
              <input
                v-model="form[sub.key]"
                class="comp-input"
                type="number" min="0" max="100"
                :placeholder="String(getSkillBase(sub.key))"
                @click.stop
              >
            </div>
            <div
              v-else
              class="comp-subrow"
              :class="{
                'comp-highlighted': fixedKeys.has(sub.key),
                'comp-choice': choiceKeys.has(sub.key)
              }"
            >
              <span class="comp-subglyph" aria-hidden="true">↳</span>
              <select v-model="form[sub.labelKey]" class="field-select label-select">
                <option value="">— Spécialité —</option>
                <option
                  v-for="o in (sub.list === 'melee' ? meleeOptions : rangedOptions)"
                  :key="o.id"
                  :value="o.name"
                  :disabled="isCombatOptionTaken(sub.labelKey, o.name)"
                >{{ o.name }}</option>
              </select>
              <input
                v-model="form[sub.key]"
                class="comp-input"
                type="number" min="0" max="100"
                :placeholder="combatBase(sub.labelKey)"
              >
            </div>
          </template>
        </template>
      </div>
    </div>

    <!-- Compétences personnelles (hors liste officielle) -->
    <div class="perso-skills">
      <h3 class="variable-subtitle">Compétences personnelles</h3>
      <div class="variable-row-grid">
        <div
          v-for="i in [1, 2, 3, 4, 5]"
          :key="`cp${i}`"
          class="variable-row"
          :class="{ 'variable-row--gold': fixedKeys.has(`CP${i}_0`) }"
        >
          <input v-model="form[`CP${i}_label`]" class="field-input label-input" type="text" placeholder="Compétence…">
          <input v-model="form[`CP${i}_0`]" class="comp-input" type="number" min="0" max="100" placeholder="0">
        </div>
      </div>
    </div>
  </section>
</template>
