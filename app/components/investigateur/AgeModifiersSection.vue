<script setup lang="ts">
import { n } from '~/utils/investigateur/format'

const { form, ageCategory, eduTestResults, rollEduTests, totalEduBonus } = injectCharacterCreation()
</script>

<template>
  <Transition name="age-panel">
    <section v-if="ageCategory" class="form-section age-panel">
      <h2 class="section-title">
        Modificateurs d'âge
        <span class="age-badge">{{ ageCategory.label }} · {{ ageCategory.range }}</span>
      </h2>

      <div class="age-rules">
        <!-- Malus ÉDU jeunesse -->
        <div v-if="ageCategory.eduYouthMalus" class="age-rule">
          <span class="age-rule-glyph">−</span>
          <span>
            Réduire l'<strong>ÉDU de 5</strong>.
            <span v-if="n(form['EDU_0']) > 0" class="age-target">
              {{ n(form['EDU_0']) }} → {{ Math.max(0, n(form['EDU_0']) - 5) }}
            </span>
          </span>
        </div>

        <!-- Malus physique -->
        <div v-if="ageCategory.physMalus > 0" class="age-rule">
          <span class="age-rule-glyph">−</span>
          <span>
            Retirer <strong>{{ ageCategory.physMalus }} points</strong> à répartir entre
            <strong>{{ ageCategory.physStats.join(', ') }}</strong>.
            <span class="age-hint">Les ½ et ⅕ se recalculeront automatiquement.</span>
          </span>
        </div>

        <!-- Malus APP -->
        <div v-if="ageCategory.appMalus > 0" class="age-rule">
          <span class="age-rule-glyph">−</span>
          <span>
            Réduire l'<strong>APP de {{ ageCategory.appMalus }}</strong>.
            <span v-if="n(form['APP_0']) > 0" class="age-target">
              {{ n(form['APP_0']) }} → {{ Math.max(0, n(form['APP_0']) - ageCategory.appMalus) }}
            </span>
          </span>
        </div>

        <!-- Tests d'expérience ÉDU -->
        <div v-if="ageCategory.eduTests > 0" class="age-rule age-rule--edu">
          <span class="age-rule-glyph">+</span>
          <div class="age-edu">
            <span>
              <strong>{{ ageCategory.eduTests }} test{{ ageCategory.eduTests > 1 ? 's' : '' }} d'expérience</strong> en ÉDU
              <span v-if="!n(form['EDU_0'])" class="age-hint"> — saisir ÉDU d'abord</span>
            </span>
            <button
              type="button"
              class="btn-roll"
              :disabled="!n(form['EDU_0'])"
              @click="rollEduTests"
            >
              ⚂ {{ eduTestResults.length ? 'Relancer' : 'Lancer les dés' }}
            </button>

            <div v-if="eduTestResults.length" class="edu-results">
              <div
                v-for="r in eduTestResults"
                :key="r.index"
                class="edu-result"
                :class="r.success ? 'edu-result--success' : 'edu-result--fail'"
              >
                <span class="edu-result-label">Test {{ r.index }}</span>
                <span class="edu-result-roll">{{ r.roll }}</span>
                <span class="edu-result-vs">/ ÉDU {{ r.threshold }}</span>
                <span class="edu-result-outcome">{{ r.success ? `+${r.bonus}` : '—' }}</span>
              </div>
              <div class="edu-total">
                <template v-if="totalEduBonus > 0">
                  Ajouter <strong>+{{ totalEduBonus }}</strong> à ÉDU
                  <span v-if="n(form['EDU_0']) > 0" class="age-target">
                    {{ n(form['EDU_0']) }} → {{ Math.min(99, n(form['EDU_0']) + totalEduBonus) }}
                  </span>
                </template>
                <template v-else>Aucun bonus d'ÉDU.</template>
              </div>
            </div>
          </div>
        </div>

        <!-- Note chance pour jeunes -->
        <div v-if="ageCategory.eduYouthMalus" class="age-rule age-rule--note">
          <span class="age-rule-glyph">✦</span>
          <span class="age-hint">La Chance sera tirée deux fois, garder le meilleur résultat — disponible à l'étape Chance.</span>
        </div>
      </div>
    </section>
  </Transition>
</template>
