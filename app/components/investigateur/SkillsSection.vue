<script setup lang="ts">
import { competences, CATEGORY_KEYS } from '~/utils/investigateur/constants'

const {
  form, occupationDetail, occSkillPickers, choiceSelections, updateChoice,
  fixedKeys, choiceKeys, getSkillBase,
  occPointsTotal, occPointsSpent, occPointsRemaining, occOverflow,
  intPointsTotal, intPointsSpent, intPointsRemaining
} = injectCharacterCreation()
</script>

<template>
  <section class="form-section">
    <h2 class="section-title">Compétences</h2>
    <p class="section-hint">Valeur finale après répartition — les ½ et ⅕ sont calculés automatiquement.</p>
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
    <div v-if="occSkillPickers.some(p => p.type === 'CHOICE_FROM_LIST' && (p as any).note?.includes('social'))" class="choice-picker">
      <div
        v-for="picker in occSkillPickers.filter(p => p.type === 'CHOICE_FROM_LIST' && (p as any).note?.includes('social'))"
        :key="picker.i"
        class="choice-group choice-group--choice-from-list"
      >
        <span class="choice-label">{{ `Choisissez ${(picker as any).count} compétence sociale :` }}</span>
        <div class="choice-slots">
          <div v-for="slot in (picker as any).count" :key="slot" class="choice-slot-group">
            <select
              class="field-select choice-select"
              :value="(choiceSelections[picker.i] ?? [])[slot - 1] ?? ''"
              @change="updateChoice(picker.i, slot - 1, ($event.target as HTMLSelectElement).value)"
            >
              <option value="">— Choisir —</option>
              <option
                v-for="opt in (picker as any).options"
                :key="opt.competence.id"
                :value="opt.competence.name"
                :disabled="(choiceSelections[picker.i] ?? []).some((v: string, j: number) => j !== slot - 1 && v === opt.competence.name)"
              >{{ opt.competence.name }}</option>
            </select>
          </div>
        </div>
      </div>
    </div>
    <div class="comp-grid">
      <div
        v-for="c in competences"
        :key="c.key"
        class="comp-row"
        :class="{
          'comp-highlighted': fixedKeys.has(c.key),
          'comp-choice': choiceKeys.has(c.key),
          'comp-category': CATEGORY_KEYS.has(c.key)
        }"
      >
        <span class="comp-name">{{ c.label }}</span>
        <span class="comp-base">{{ getSkillBase(c.key) }}%</span>
        <span v-if="CATEGORY_KEYS.has(c.key)" class="comp-category-badge">—</span>
        <input v-else v-model="form[c.key]" class="comp-input" type="number" min="0" max="100" :placeholder="String(getSkillBase(c.key))">
      </div>
    </div>
  </section>
</template>
