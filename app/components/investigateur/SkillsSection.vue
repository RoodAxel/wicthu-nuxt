<script setup lang="ts">
import type { ChoiceListPicker, FreeChoicePicker, FreeSpecPicker, FixedSpecPicker } from '~/types/investigateur'
import { competences, CATEGORY_KEYS } from '~/utils/investigateur/constants'

const {
  form, occupationDetail, occSkillPickers,
  choiceSelections, freeSpecSelections, freeChoiceSelections, catSubSelections,
  updateChoice, updateFreeSpec, updateFreeChoice, updateCatSub,
  fixedKeys, choiceKeys, selectedChoiceKeys, occupationVarSlots, toggleChoiceKey,
  getSkillBase,
  uniqueWeaponCompetences, getCompBase,
  occPointsTotal, occPointsSpent, occPointsRemaining, occOverflow,
  intPointsTotal, intPointsSpent, intPointsRemaining
} = injectCharacterCreation()

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

// Compétences proposables en choix libre (grille principale, hors catégories)
const freeChoiceOptions = competences.filter(c => !CATEGORY_KEYS.has(c.key))

// Une option est indisponible si elle est déjà en or ailleurs (imposée ou choisie)
function isFreeChoiceTaken(idx: number, slot: number, key: string): boolean {
  if ((freeChoiceSelections.value[idx] ?? [])[slot] === key) return false
  return fixedKeys.value.has(key)
}

// ── Sous-lignes de spécialités, intégrées sous leur catégorie ────────────────
type SubRow = { key: string, labelKey: string, kind: 'text' | 'weapon', placeholder: string }
const SUB_ROWS: Record<string, SubRow[]> = {
  ART_0: [1, 2, 3].map(i => ({ key: `AR${i}_0`, labelKey: `AR${i}_label`, kind: 'text' as const, placeholder: 'Spécialité…' })),
  CD2_0: [3, 4].map(i => ({ key: `CD${i}_0`, labelKey: `CD${i}_label`, kind: 'weapon' as const, placeholder: '' })),
  CR1_0: [2, 3].map(i => ({ key: `CR${i}_0`, labelKey: `CR${i}_label`, kind: 'weapon' as const, placeholder: '' })),
  LAG_0: [1, 2, 3].map(i => ({ key: `LG${i}_0`, labelKey: `LG${i}_label`, kind: 'text' as const, placeholder: 'Langue…' })),
  PIL_0: [{ key: 'PL1_0', labelKey: 'PL1_label', kind: 'text' as const, placeholder: 'Véhicule…' }],
  SCI_0: [1, 2, 3].map(i => ({ key: `SC${i}_0`, labelKey: `SC${i}_label`, kind: 'text' as const, placeholder: 'Spécialité…' }))
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
              v-if="selectedCatOption(picker, slot - 1)"
              class="field-select choice-select choice-select--sub"
              :value="catSubSelections[`${picker.i}_${slot - 1}`] ?? ''"
              @change="updateCatSub(picker.i, slot - 1, ($event.target as HTMLSelectElement).value)"
            >
              <option value="">— Spécialité —</option>
              <option
                v-for="child in selectedCatOption(picker, slot - 1)!.children"
                :key="child.id"
                :value="child.name"
              >{{ child.name }}</option>
            </select>
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
              :value="freeSpecSelections[picker.i] ?? ''"
              @change="updateFreeSpec(picker.i, ($event.target as HTMLSelectElement).value)"
            >
              <option value="">— Choisir —</option>
              <option v-for="child in picker.children" :key="child.id" :value="child.name">{{ child.name }}</option>
            </select>
            <input
              v-else
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
              :value="(freeChoiceSelections[picker.i] ?? [])[slot - 1] ?? ''"
              @change="updateFreeChoice(picker.i, slot - 1, ($event.target as HTMLSelectElement).value)"
            >
              <option value="">— Choisir —</option>
              <option
                v-for="c in freeChoiceOptions"
                :key="c.key"
                :value="c.key"
                :disabled="isFreeChoiceTaken(picker.i, slot - 1, c.key)"
              >{{ c.label }}</option>
            </select>
          </div>
        </div>
      </div>
    </div>
    <div class="comp-grid">
      <div
        v-for="(c, i) in competences"
        :key="c.key"
        class="comp-cell"
        :class="{ 'comp-cell--shaded': i % 4 === 1 || i % 4 === 2 }"
      >
        <div
          class="comp-row"
          :class="{
            'comp-highlighted': fixedKeys.has(c.key),
            'comp-choice': choiceKeys.has(c.key),
            'comp-category': CATEGORY_KEYS.has(c.key),
            'comp-clickable': isClickable(c.key)
          }"
          :title="rowTitle(c.key)"
          @click="onRowClick(c.key)"
        >
          <span class="comp-name">{{ c.label }}</span>
          <span class="comp-base">{{ getSkillBase(c.key) }}%</span>
          <span v-if="CATEGORY_KEYS.has(c.key)" class="comp-category-badge">—</span>
          <input
            v-else
            v-model="form[c.key]"
            class="comp-input"
            type="number" min="0" max="100"
            :placeholder="String(getSkillBase(c.key))"
            @click.stop
          >
        </div>
        <div
          v-for="sub in SUB_ROWS[c.key] ?? []"
          :key="sub.key"
          class="comp-subrow"
          :class="{
            'comp-highlighted': fixedKeys.has(sub.key),
            'comp-choice': choiceKeys.has(sub.key)
          }"
        >
          <span class="comp-subglyph" aria-hidden="true">↳</span>
          <select
            v-if="sub.kind === 'weapon'"
            v-model="form[sub.labelKey]"
            class="field-select label-select"
          >
            <option value="">— Compétence —</option>
            <option v-for="w in uniqueWeaponCompetences" :key="w.name" :value="w.name">{{ w.name }}</option>
          </select>
          <input
            v-else
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
            :placeholder="sub.kind === 'weapon' ? getCompBase(sub.labelKey) : String(getSkillBase(sub.key))"
          >
        </div>
      </div>
    </div>

    <!-- Compétences personnelles (hors liste officielle) -->
    <div class="perso-skills">
      <h3 class="variable-subtitle">Compétences personnelles</h3>
      <div class="variable-row-grid">
        <div v-for="i in [1, 2, 3, 4, 5]" :key="`cp${i}`" class="variable-row">
          <input v-model="form[`CP${i}_label`]" class="field-input label-input" type="text" placeholder="Compétence…">
          <input v-model="form[`CP${i}_0`]" class="comp-input" type="number" min="0" max="100" placeholder="0">
        </div>
      </div>
    </div>
  </section>
</template>
