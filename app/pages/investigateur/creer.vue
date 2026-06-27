<script setup lang="ts">
import {
  caracteristiques, competences, CATEGORY_KEYS, backgroundFields
} from '~/utils/investigateur/constants'
import { n, half, fifth } from '~/utils/investigateur/format'

definePageMeta({ middleware: 'auth' })

// Contexte de création : instancie tous les composables métier autour du même
// `form` réactif et le fournit aux sous-composants de section (provide/inject).
const ctx = useCharacterCreation()
provide(CharacterCreationKey, ctx)

// Ré-exposé au template (les noms disparaîtront au fur et à mesure que les
// sections seront extraites en sous-composants qui injectent le contexte).
const {
  form, pv_max, pm_max, sm_initial, impact, carrure, mvt,
  occupationList, selectedOccupationId, occupationDetail, customOccupation,
  choiceSelections, occSkillPickers, updateChoice,
  fixedKeys, choiceKeys, occupationVarSlots, isGroupHighlighted, isGroupChoice,
  getSkillBase,
  occPointsTotal, occPointsSpent, occPointsRemaining, occOverflow,
  intPointsTotal, intPointsSpent, intPointsRemaining,
  ageCategory, eduTestResults, rollEduTests, totalEduBonus, rollChance,
  genMethod, rollOneStat, rollAllClassic, lowStatsCount, option2Bonus, rollOption2,
  pool, selectedPoolIdx, isPoolMode, selectPool, assignPool, initFreePool, initQuickPool,
  clearCaracStats, buyBudget,
  showLibrary, libraryTab, rulebookSearch, rulebookCategory, importTargetSlot,
  armePersoList, rulebookCategories, filteredRulebook, uniqueWeaponCompetences,
  getCompBase, saveWeaponToLibrary, clearWeaponSlot, deleteArmePerso,
  importArmeToSlot, importRulebookToSlot,
  editId, isLoading, isSaving, error, savedSuccess, portraitDataUrl,
  handlePortraitFile, saveCharacter, generatePdf, generateRandomName
} = ctx

// ── Détection sticky de la barre d'actions ───────────────────────────────────
const bottomSentinel = ref<HTMLElement | null>(null)
const isStuck = ref(true)
onMounted(() => {
  const observer = new IntersectionObserver(([entry]) => {
    if (entry) isStuck.value = !entry.isIntersecting
  })
  if (bottomSentinel.value) observer.observe(bottomSentinel.value)
  onUnmounted(() => observer.disconnect())
})
</script>

<template>
  <main class="page-wrapper">

    <div class="page-header">
      <h1 class="page-title">{{ editId ? 'Modifier la fiche' : 'Nouvelle Fiche' }}</h1>
      <p class="page-subtitle">Création d'un investigateur — Appel de Cthulhu 7e édition</p>
    </div>

    <blockquote class="flavor-quote">
      <p>Nul homme sensé ne se lancerait dans cette enquête — mais la folie a ses propres vertus.</p>
      <cite>— Journal retrouvé à Arkham, sans date</cite>
    </blockquote>

    <form class="character-form">

      <!-- ── IDENTITÉ ─────────────────────────────────────── -->
      <section class="form-section">
        <h2 class="section-title">Identité</h2>
        <div class="identity-grid">
          <div class="field-group col-2">
            <div class="field-label-row">
              <label class="field-label" for="Nom">Nom de l'investigateur</label>
              <button
                type="button"
                class="random-name-btn"
                title="Générer un nom américain aléatoire"
                @click="generateRandomName"
              >
                ⚄
              </button>
            </div>
            <input id="Nom" v-model="form['Nom']" class="field-input" type="text" placeholder="Arkham, 1923…">
          </div>
          <div class="field-group col-2">
            <label class="field-label" for="Joueur">Nom du joueur</label>
            <input id="Joueur" v-model="form['Joueur']" class="field-input" type="text">
          </div>
          <div class="field-group col-2">
            <div class="field-label-row">
              <label class="field-label" for="Occupation">Occupation</label>
              <label class="custom-occ-label">
                <input v-model="customOccupation" type="checkbox" class="custom-occ-checkbox">
                Occupation personnalisée
              </label>
            </div>
            <input
              v-if="customOccupation"
              id="Occupation"
              v-model="form['Occupation']"
              class="field-input"
              type="text"
              placeholder="Saisir une occupation…"
            >
            <select
              v-else
              id="Occupation"
              v-model="selectedOccupationId"
              class="field-select"
            >
              <option :value="null">— Choisir une occupation —</option>
              <option v-for="occ in occupationList" :key="occ.id" :value="occ.id">{{ occ.name }}</option>
            </select>
            <div v-if="occupationDetail" class="occupation-hint">
              <span v-if="occupationDetail.credit_min !== null || occupationDetail.credit_max !== null">
                Crédit : {{ occupationDetail.credit_min ?? '?' }}–{{ occupationDetail.credit_max ?? '?' }}%
              </span>
              <span v-if="occupationDetail.point_competence">
                · Points : {{ occupationDetail.point_competence }}
              </span>
            </div>
          </div>
          <div class="field-group">
            <label class="field-label" for="age">Âge</label>
            <input id="age" v-model="form['age']" class="field-input" type="number" min="15" max="99">
          </div>
          <div class="field-group">
            <label class="field-label" for="Sexe">Sexe</label>
            <input id="Sexe" v-model="form['Sexe']" class="field-input" type="text">
          </div>
          <div class="field-group col-2">
            <label class="field-label" for="Residence">Résidence</label>
            <input id="Residence" v-model="form['Résidence']" class="field-input" type="text" placeholder="Arkham, Massachusetts">
          </div>
          <div class="field-group col-2">
            <label class="field-label" for="LieuNaissance">Lieu de naissance</label>
            <input id="LieuNaissance" v-model="form['Lieu de naissance']" class="field-input" type="text">
          </div>
          <div class="field-group col-full portrait-group">
            <label class="field-label">Portrait <span class="field-hint">(affiché dans le PDF)</span></label>
            <div class="portrait-upload">
              <label class="portrait-dropzone" :class="{ 'portrait-dropzone--filled': portraitDataUrl }">
                <img v-if="portraitDataUrl" :src="portraitDataUrl" class="portrait-preview" alt="Portrait">
                <span v-else class="portrait-placeholder">
                  <span class="portrait-icon">⊞</span>
                  <span>Choisir une image</span>
                </span>
                <input type="file" accept="image/jpeg,image/png,image/webp" class="portrait-input" @change="handlePortraitFile">
              </label>
              <button v-if="portraitDataUrl" type="button" class="portrait-clear" @click="portraitDataUrl = null">✕ Retirer</button>
            </div>
          </div>
        </div>
      </section>

      <!-- ── MODIFICATEURS D'ÂGE ──────────────────────────── -->
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

      <!-- ── CARACTÉRISTIQUES ───────────────────────────────── -->
      <section class="form-section">
        <h2 class="section-title">Caractéristiques</h2>

        <!-- Sélecteur de méthode -->
        <div class="gen-methods">
          <button
            v-for="m in ([
              { id: 'classic', label: 'Classique' },
              { id: 'free', label: 'Distribution libre' },
              { id: 'buy', label: 'Achat' },
              { id: 'quick', label: 'Création accélérée' }
            ] as const)"
            :key="m.id"
            type="button"
            class="gen-method-btn"
            :class="{ 'gen-method-btn--active': genMethod === m.id }"
            @click="genMethod = m.id"
          >{{ m.label }}</button>
        </div>

        <!-- Panneau méthode classique -->
        <div v-if="genMethod === 'classic'" class="gen-panel">
          <div class="gen-panel-actions">
            <button type="button" class="btn-roll" @click="rollAllClassic">⚂ Tout lancer</button>
            <span class="gen-formula-hint">FOR/CON/DEX/POU/APP = 3d6×5 · TAI/INT/ÉDU = (2d6+6)×5</span>
          </div>
          <div v-if="lowStatsCount >= 3" class="gen-low-stats">
            <span>{{ lowStatsCount }} caractéristiques &lt; 50</span>
            <span class="gen-opt-label">Option 1 : recommencer à zéro</span>
            <span class="gen-opt-sep">·</span>
            <span class="gen-opt-label">Option 2 : coup de pouce</span>
            <button type="button" class="btn-roll btn-roll--sm" @click="rollOption2">⚂ 1d6×5</button>
            <span v-if="option2Bonus > 0" class="gen-opt-bonus">+{{ option2Bonus }} pts à répartir sur les stats faibles</span>
          </div>
        </div>

        <!-- Panneau distribution libre -->
        <div v-else-if="genMethod === 'free'" class="gen-panel">
          <div class="gen-panel-actions">
            <button type="button" class="btn-roll" @click="initFreePool">
              ⚂ {{ pool.length ? 'Relancer le pool' : 'Générer le pool' }}
            </button>
            <span class="gen-formula-hint">5×(3d6×5) + 3×((2d6+6)×5), à distribuer librement · INT/TAI recommandées ≥ 40</span>
          </div>
          <div v-if="pool.length" class="pool-chips">
            <button
              v-for="(entry, i) in pool"
              :key="i"
              type="button"
              class="pool-chip"
              :class="{
                'pool-chip--selected': selectedPoolIdx === i,
                'pool-chip--assigned': !!entry.assignedTo
              }"
              @click="selectPool(i)"
            >
              <span class="pool-chip-value">{{ entry.value }}</span>
              <span v-if="entry.assignedTo" class="pool-chip-tag">{{ entry.assignedTo.replace('_0', '') }}</span>
            </button>
          </div>
          <p v-if="pool.length && selectedPoolIdx !== null" class="gen-hint">Cliquez une ligne du tableau pour assigner {{ pool[selectedPoolIdx]?.value }}.</p>
        </div>

        <!-- Panneau achat -->
        <div v-else-if="genMethod === 'buy'" class="gen-panel">
          <div class="gen-panel-actions">
            <div class="buy-budget" :class="{ 'buy-budget--over': buyBudget < 0 }">
              <span class="buy-budget-label">Budget restant</span>
              <span class="buy-budget-value">{{ buyBudget }} / 460</span>
            </div>
            <span class="gen-formula-hint">Valeurs entre 15 et 90 · INT/TAI recommandées ≥ 40</span>
            <button type="button" class="btn-roll btn-roll--sm" @click="clearCaracStats">Réinitialiser</button>
          </div>
        </div>

        <!-- Panneau création accélérée -->
        <div v-else-if="genMethod === 'quick'" class="gen-panel">
          <div class="gen-panel-actions">
            <button type="button" class="btn-roll btn-roll--sm" @click="initQuickPool">Réinitialiser</button>
            <span class="gen-formula-hint">Valeurs fixes à distribuer : 80, 70, 60, 60, 50, 50, 50, 40</span>
          </div>
          <div class="pool-chips">
            <button
              v-for="(entry, i) in pool"
              :key="i"
              type="button"
              class="pool-chip"
              :class="{
                'pool-chip--selected': selectedPoolIdx === i,
                'pool-chip--assigned': !!entry.assignedTo
              }"
              @click="selectPool(i)"
            >
              <span class="pool-chip-value">{{ entry.value }}</span>
              <span v-if="entry.assignedTo" class="pool-chip-tag">{{ entry.assignedTo.replace('_0', '') }}</span>
            </button>
          </div>
          <p v-if="selectedPoolIdx !== null" class="gen-hint">Cliquez une ligne du tableau pour assigner {{ pool[selectedPoolIdx]?.value }}.</p>
        </div>

        <!-- Tableau des caractéristiques -->
        <div class="carac-table">
          <div class="carac-header">
            <span>Carac.</span>
            <span class="carac-desc">Description</span>
            <span class="col-center">Valeur</span>
            <span class="col-center">½</span>
            <span class="col-center">⅕</span>
          </div>
          <div
            v-for="c in caracteristiques"
            :key="c.key"
            class="carac-row"
            :class="{
              'carac-row--assignable': isPoolMode && selectedPoolIdx !== null,
              'carac-row--pool-assigned': isPoolMode && pool.some(p => p.assignedTo === c.key)
            }"
            @click="isPoolMode ? assignPool(c.key) : undefined"
          >
            <span class="carac-code">{{ c.label }}</span>
            <span class="carac-desc">{{ c.desc }}</span>
            <div class="carac-input-wrap">
              <input
                v-model="form[c.key]"
                class="carac-input"
                :class="{ 'carac-input--buy': genMethod === 'buy' }"
                type="number"
                :min="genMethod === 'buy' ? 15 : 0"
                :max="genMethod === 'buy' ? 90 : 100"
                placeholder="—"
                @click.stop
              >
              <button
                v-if="genMethod === 'classic'"
                type="button"
                class="carac-roll-btn"
                :title="`Lancer ${c.formula}×5`"
                @click.stop="rollOneStat(c.key)"
              >⚂</button>
            </div>
            <span class="carac-derived">{{ half(form[c.key]) || '—' }}</span>
            <span class="carac-derived">{{ fifth(form[c.key]) || '—' }}</span>
          </div>
        </div>
      </section>

      <!-- ── STATS DÉRIVÉES ──────────────────────────────────── -->
      <section class="form-section">
        <h2 class="section-title">Stats dérivées & Combat</h2>
        <div class="derived-grid">
          <div class="derived-card">
            <span class="derived-label">PV max</span>
            <span class="derived-value">{{ pv_max || '—' }}</span>
            <span class="derived-formula">(CON + TAI) ÷ 10</span>
          </div>
          <div class="derived-card">
            <span class="derived-label">PM max</span>
            <span class="derived-value">{{ pm_max || '—' }}</span>
            <span class="derived-formula">POU ÷ 5</span>
          </div>
          <div class="derived-card">
            <span class="derived-label">SM départ</span>
            <span class="derived-value">{{ sm_initial || '—' }}</span>
            <span class="derived-formula">= POU</span>
          </div>
          <div class="derived-card">
            <span class="derived-label">Impact</span>
            <span class="derived-value derived-value--text">{{ impact || '—' }}</span>
            <span class="derived-formula">FOR + TAI</span>
          </div>
          <div class="derived-card">
            <span class="derived-label">Carrure</span>
            <span class="derived-value derived-value--text">{{ carrure || '—' }}</span>
            <span class="derived-formula">FOR + TAI</span>
          </div>
          <div class="derived-card">
            <span class="derived-label">Mouvement</span>
            <span class="derived-value">{{ mvt || '—' }}</span>
            <span class="derived-formula">FOR / DEX / TAI</span>
          </div>
        </div>
      </section>

      <!-- ── CHANCE ────────────────────────────────────────────── -->
      <section class="form-section chance-section">
        <h2 class="section-title">Chance</h2>
        <div class="chance-row">
          <div class="chance-card">
            <div class="chance-input-group">
              <input
                id="Chance"
                v-model="form['Chance']"
                class="chance-input"
                type="number"
                min="0"
                max="100"
                placeholder="—"
              >
            </div>
            <div class="chance-roll-col">
              <button type="button" class="btn-roll" @click="rollChance">
                ⚂ {{ form['Chance'] ? 'Relancer' : 'Tirer la Chance' }}
              </button>
              <span class="chance-formula">
                3d6 × 5
                <span v-if="ageCategory?.eduYouthMalus" class="chance-youth-note"> · ×2 meilleur</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      <!-- ── COMPÉTENCES ─────────────────────────────────────── -->
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

      <!-- ── COMPÉTENCES VARIABLES ───────────────────────────── -->
      <section class="form-section">
        <h2 class="section-title">Combat, Art, Langues, Sciences & Compétences personnelles</h2>
        <div class="variable-grid">
          <div class="variable-group" :class="{ 'variable-group--highlighted': isGroupHighlighted('ART_0', 'AR1_0', 'AR2_0', 'AR3_0'), 'variable-group--choice': isGroupChoice('ART_0', 'AR1_0', 'AR2_0', 'AR3_0') }">
            <h3 class="variable-subtitle">Art et métier</h3>
            <div v-for="i in [1, 2, 3]" :key="`ar${i}`" class="variable-row">
              <input v-model="form[`AR${i}_label`]" class="field-input label-input" type="text" placeholder="Spécialité…" :readonly="occupationVarSlots[`AR${i}_label`]?.locked" :class="{ 'input-locked': occupationVarSlots[`AR${i}_label`]?.locked }">
              <input v-model="form[`AR${i}_0`]" class="comp-input" type="number" min="0" max="100" placeholder="0">
            </div>
          </div>
          <div class="variable-group" :class="{ 'variable-group--highlighted': isGroupHighlighted('CD1_0', 'CD2_0', 'CD3_0', 'CD4_0'), 'variable-group--choice': isGroupChoice('CD1_0', 'CD2_0', 'CD3_0', 'CD4_0') }">
            <h3 class="variable-subtitle">Combat à distance (custom)</h3>
            <div v-for="i in [3, 4]" :key="`cd${i}`" class="variable-row">
              <select v-model="form[`CD${i}_label`]" class="field-select label-select">
                <option value="">— Compétence —</option>
                <option v-for="c in uniqueWeaponCompetences" :key="c.name" :value="c.name">{{ c.name }}</option>
              </select>
              <input v-model="form[`CD${i}_0`]" class="comp-input" type="number" min="0" max="100" :placeholder="getCompBase(`CD${i}_label`)">
            </div>
          </div>
          <div class="variable-group" :class="{ 'variable-group--highlighted': isGroupHighlighted('CR1_0', 'CR2_0', 'CR3_0'), 'variable-group--choice': isGroupChoice('CR1_0', 'CR2_0', 'CR3_0') }">
            <h3 class="variable-subtitle">Combat rapproché (custom)</h3>
            <div v-for="i in [2, 3]" :key="`cr${i}`" class="variable-row">
              <select v-model="form[`CR${i}_label`]" class="field-select label-select">
                <option value="">— Compétence —</option>
                <option v-for="c in uniqueWeaponCompetences" :key="c.name" :value="c.name">{{ c.name }}</option>
              </select>
              <input v-model="form[`CR${i}_0`]" class="comp-input" type="number" min="0" max="100" :placeholder="getCompBase(`CR${i}_label`)">
            </div>
          </div>
          <div class="variable-group" :class="{ 'variable-group--highlighted': isGroupHighlighted('LG1_0', 'LG2_0', 'LG3_0'), 'variable-group--choice': isGroupChoice('LG1_0', 'LG2_0', 'LG3_0') }">
            <h3 class="variable-subtitle">Langues étrangères</h3>
            <div v-for="i in [1, 2, 3]" :key="`lg${i}`" class="variable-row">
              <input v-model="form[`LG${i}_label`]" class="field-input label-input" type="text" placeholder="Langue…" :readonly="occupationVarSlots[`LG${i}_label`]?.locked" :class="{ 'input-locked': occupationVarSlots[`LG${i}_label`]?.locked }">
              <input v-model="form[`LG${i}_0`]" class="comp-input" type="number" min="0" max="100" placeholder="0">
            </div>
          </div>
          <div class="variable-group" :class="{ 'variable-group--highlighted': isGroupHighlighted('PIL_0', 'PL1_0'), 'variable-group--choice': isGroupChoice('PIL_0', 'PL1_0') }">
            <h3 class="variable-subtitle">Pilotage (custom)</h3>
            <div class="variable-row">
              <input v-model="form['PL1_label']" class="field-input label-input" type="text" placeholder="Véhicule…" :readonly="occupationVarSlots['PL1_label']?.locked" :class="{ 'input-locked': occupationVarSlots['PL1_label']?.locked }">
              <input v-model="form['PL1_0']" class="comp-input" type="number" min="0" max="100" placeholder="0">
            </div>
          </div>
          <div class="variable-group" :class="{ 'variable-group--highlighted': isGroupHighlighted('SCI_0', 'SC1_0', 'SC2_0', 'SC3_0'), 'variable-group--choice': isGroupChoice('SCI_0', 'SC1_0', 'SC2_0', 'SC3_0') }">
            <h3 class="variable-subtitle">Sciences</h3>
            <div v-for="i in [1, 2, 3]" :key="`sc${i}`" class="variable-row">
              <input v-model="form[`SC${i}_label`]" class="field-input label-input" type="text" placeholder="Spécialité…" :readonly="occupationVarSlots[`SC${i}_label`]?.locked" :class="{ 'input-locked': occupationVarSlots[`SC${i}_label`]?.locked }">
              <input v-model="form[`SC${i}_0`]" class="comp-input" type="number" min="0" max="100" placeholder="0">
            </div>
          </div>
          <div class="variable-group variable-group--full">
            <h3 class="variable-subtitle">Compétences personnelles</h3>
            <div class="variable-row-grid">
              <div v-for="i in [1, 2, 3, 4, 5]" :key="`cp${i}`" class="variable-row">
                <input v-model="form[`CP${i}_label`]" class="field-input label-input" type="text" placeholder="Compétence…">
                <input v-model="form[`CP${i}_0`]" class="comp-input" type="number" min="0" max="100" placeholder="0">
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ── ARMES ─────────────────────────────────────────────── -->
      <section class="form-section">
        <h2 class="section-title">Armes</h2>
        <div class="weapons-table-wrap">
          <div class="weapons-table">

            <!-- Header -->
            <div class="weapons-header">
              <span>Arme</span>
              <span class="col-center">Ord.</span>
              <span class="col-center">Maj.</span>
              <span class="col-center">Ext.</span>
              <span class="col-center">Dégâts</span>
              <span class="col-center">Portée</span>
              <span class="col-center">Cad.</span>
              <span class="col-center">Cap.</span>
              <span class="col-center">Panne</span>
              <span />
            </div>

            <!-- Arm1 : Corps à corps (nom et dégâts déjà dans le PDF) -->
            <div class="weapons-row weapons-row--melee">
              <span class="weapon-melee-label">Corps à corps</span>
              <span class="weapon-auto">{{ form['Arm1_ORD'] || '—' }}</span>
              <span class="weapon-auto">{{ form['Arm1_MAJ'] || '—' }}</span>
              <span class="weapon-auto">{{ form['Arm1_EXT'] || '—' }}</span>
              <span class="weapon-fixed">—</span>
              <input v-model="form['Arm1_PORT']" class="weapon-input" type="text" placeholder="Allonge">
              <span class="weapon-fixed">—</span>
              <span class="weapon-fixed">—</span>
              <span class="weapon-fixed">—</span>
              <span />
            </div>

            <!-- Arm2–5 : armes libres -->
            <div
              v-for="i in [2, 3, 4, 5]"
              :key="i"
              class="weapons-row"
            >
              <input v-model="form[`ARM${i}`]" class="weapon-input weapon-input--name" type="text" placeholder="Nom de l'arme…">
              <input v-model="form[`Arm${i}_ORD`]" class="weapon-input" type="number" min="0" max="100" placeholder="—">
              <span class="weapon-auto">{{ form[`Arm${i}_MAJ`] || '—' }}</span>
              <span class="weapon-auto">{{ form[`Arm${i}_EXT`] || '—' }}</span>
              <input v-model="form[`Arm${i}_DEG`]" class="weapon-input" type="text" placeholder="—">
              <input v-model="form[`Arm${i}_PORT`]" class="weapon-input" type="text" placeholder="—">
              <input v-model="form[`Arm${i}_CAD`]" class="weapon-input" type="text" placeholder="—">
              <input v-model="form[`Arm${i}_CAP`]" class="weapon-input" type="text" placeholder="—">
              <input v-model="form[`Arm${i}_PANN`]" class="weapon-input" type="text" placeholder="—">
              <span class="weapon-actions">
                <button
                  type="button"
                  class="weapon-save-btn"
                  :disabled="!form[`ARM${i}`]"
                  :title="form[`ARM${i}`] ? `Sauvegarder « ${form[`ARM${i}`]} » dans la bibliothèque` : 'Saisir un nom d\'arme d\'abord'"
                  @click="saveWeaponToLibrary(i)"
                >💾</button>
                <button
                  type="button"
                  class="weapon-clear-btn"
                  :disabled="!form[`ARM${i}`]"
                  title="Vider cette ligne"
                  @click="clearWeaponSlot(i)"
                >✕</button>
              </span>
            </div>

          </div>
        </div>

        <!-- ── BIBLIOTHÈQUE ─────────────────────────── -->
        <div class="library-section">
          <button type="button" class="library-toggle" @click="showLibrary = !showLibrary">
            <span class="library-toggle-icon">{{ showLibrary ? '▾' : '▸' }}</span>
            Bibliothèque d'armes
            <span v-if="armePersoList.length" class="library-count">{{ armePersoList.length }}</span>
          </button>

          <div v-show="showLibrary" class="library-panel">
            <!-- Slot cible -->
            <div class="library-target-row">
              <span class="library-target-label">Importer dans</span>
              <div class="library-slot-btns">
                <button
                  v-for="s in [2, 3, 4, 5]"
                  :key="s"
                  type="button"
                  class="library-slot-btn"
                  :class="{ 'library-slot-btn--active': importTargetSlot === s }"
                  @click="importTargetSlot = (s as 2|3|4|5)"
                >ARM{{ s }}</button>
              </div>
            </div>

            <!-- Tabs -->
            <div class="library-tabs">
              <button type="button" class="library-tab" :class="{ 'library-tab--active': libraryTab === 'perso' }" @click="libraryTab = 'perso'">
                Mes armes <span v-if="armePersoList.length" class="library-count">{{ armePersoList.length }}</span>
              </button>
              <button type="button" class="library-tab" :class="{ 'library-tab--active': libraryTab === 'rulebook' }" @click="libraryTab = 'rulebook'">
                Armurerie
              </button>
            </div>

            <!-- Mes armes -->
            <div v-if="libraryTab === 'perso'">
              <p v-if="!armePersoList.length" class="library-empty">Aucune arme sauvegardée. Remplissez un slot ARM2–5 et cliquez 💾.</p>
              <div v-else class="library-list">
                <div v-for="arme in armePersoList" :key="arme.id" class="library-item">
                  <div class="library-item-info">
                    <span class="library-item-name">{{ arme.nom }}</span>
                    <span v-if="arme.deg" class="library-item-meta">{{ arme.deg }}</span>
                    <span v-if="arme.port" class="library-item-meta">{{ arme.port }}</span>
                  </div>
                  <div class="library-item-actions">
                    <button type="button" class="btn-import" @click="importArmeToSlot(importTargetSlot, arme)">
                      → ARM{{ importTargetSlot }}
                    </button>
                    <button type="button" class="btn-delete-arme" @click="deleteArmePerso(arme.id)">✕</button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Armurerie (livre de règles) -->
            <div v-else-if="libraryTab === 'rulebook'">
              <div class="rulebook-filters">
                <input v-model="rulebookSearch" class="field-input rulebook-search" type="text" placeholder="Rechercher une arme…">
                <select v-model="rulebookCategory" class="field-select rulebook-cat">
                  <option value="">Toutes catégories</option>
                  <option v-for="cat in rulebookCategories" :key="cat" :value="cat">{{ cat }}</option>
                </select>
              </div>
              <div class="library-list">
                <div v-for="arme in filteredRulebook" :key="arme.id" class="library-item">
                  <div class="library-item-info">
                    <span class="library-item-name">{{ arme.name }}</span>
                    <span class="library-item-meta">{{ arme.competence.name }}</span>
                    <span v-if="arme.damage" class="library-item-meta">{{ arme.damage }}</span>
                    <span v-if="arme.range" class="library-item-meta">{{ arme.range }}</span>
                  </div>
                  <div class="library-item-actions">
                    <button type="button" class="btn-import" @click="importRulebookToSlot(importTargetSlot, arme)">
                      → ARM{{ importTargetSlot }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </section>

      <!-- ── BACKGROUND ──────────────────────────────────────── -->
      <section class="form-section">
        <h2 class="section-title">Histoire & Background</h2>
        <div class="background-grid">
          <div v-for="f in backgroundFields" :key="f.key" class="field-group">
            <label class="field-label" :for="f.key">{{ f.label }}</label>
            <textarea :id="f.key" v-model="form[f.key]" class="field-textarea" rows="2" />
          </div>
        </div>
      </section>

      <!-- ── FINANCES ────────────────────────────────────────── -->
      <section class="form-section">
        <h2 class="section-title">Finances</h2>
        <div class="identity-grid">
          <div class="field-group">
            <label class="field-label" for="capital">Capital</label>
            <input id="capital" v-model="form['capital']" class="field-input" type="text" placeholder="$">
          </div>
          <div class="field-group">
            <label class="field-label" for="depencesCourantes">Dépenses courantes</label>
            <input id="depencesCourantes" v-model="form['depencesCourantes']" class="field-input" type="text" placeholder="$">
          </div>
          <div class="field-group">
            <label class="field-label" for="Especes">Espèces</label>
            <input id="Especes" v-model="form['Espèces']" class="field-input" type="text" placeholder="$">
          </div>
        </div>
      </section>

      <!-- ── ÉQUIPEMENT ───────────────────────────────────────── -->
      <section class="form-section">
        <h2 class="section-title">Équipement</h2>
        <div class="equip-grid">
          <div v-for="i in 12" :key="i" class="field-group">
            <label class="field-label" :for="`EQUIP${i}`">{{ i }}</label>
            <input :id="`EQUIP${i}`" v-model="form[`EQUIP${i}`]" class="field-input" type="text" placeholder="Objet…">
          </div>
        </div>
      </section>

      <!-- ── ERROR & SUBMIT ─────────────────────────────────── -->
      <div v-if="error" class="form-error">{{ error }}</div>

      <div v-if="savedSuccess" class="form-success">Fiche sauvegardée avec succès.</div>

      <p class="pdf-credit">
        La fiche PDF est basée sur la
        <a href="https://www.orbe.be/aide-de-jeux/l-appel-de-cthulhu-v7-fiche-dynamique" target="_blank" rel="noopener noreferrer">fiche dynamique d'Orbe.be</a>.
      </p>

      <div ref="bottomSentinel" class="bottom-sentinel" />
      <div class="form-actions" :class="{ 'is-stuck': isStuck }">
        <button
          type="button"
          class="btn-save"
          :disabled="isSaving || isLoading"
          @click="saveCharacter"
        >
          <span v-if="isSaving" class="btn-sigil">۞</span>
          <span v-else>Sauvegarder</span>
        </button>
        <button
          type="button"
          class="btn-generate"
          :disabled="isLoading || isSaving"
          @click="generatePdf"
        >
          <span v-if="isLoading" class="btn-sigil">۞</span>
          <span v-else>Générer la fiche PDF</span>
        </button>
      </div>

    </form>

  </main>
</template>

<style scoped>
.page-wrapper {
  padding: var(--space-xl);
  max-width: 960px;
  margin: 0 auto;
}

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
  background: var(--color-arcane);
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

.flavor-quote {
  background: var(--color-void);
  border-left: 2px solid var(--color-arcane-dim);
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

/* ── SECTIONS ────────────────────────────────────────────── */
.character-form { display: flex; flex-direction: column; gap: var(--space-xl); }
.form-section {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-xl);
}
.section-title {
  font-family: var(--font-heading);
  font-size: var(--fs-section-title);
  font-weight: bold;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--color-gold);
  margin-bottom: var(--space-lg);
  padding-bottom: var(--space-sm);
  border-bottom: 1px solid var(--color-border);
}
.section-hint {
  font-family: var(--font-flavor);
  font-style: italic;
  font-size: var(--fs-section-hint);
  color: var(--color-text-muted);
  margin-bottom: var(--space-lg);
}

/* ── IDENTITY ────────────────────────────────────────────── */
.identity-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-md);
}
.col-2 { grid-column: span 1; }
.col-full { grid-column: 1 / -1; }
.field-group { display: flex; flex-direction: column; gap: var(--space-xs); }
.field-hint { font-size: var(--fs-secondary); color: var(--color-text-muted); font-weight: normal; }

/* ── PORTRAIT ────────────────────────────────────────────── */
.portrait-upload { display: flex; align-items: flex-start; gap: var(--space-sm); }
.portrait-dropzone {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 120px;
  height: 120px;
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-elevated);
  cursor: pointer;
  overflow: hidden;
  transition: border-color var(--transition-fast);
  flex-shrink: 0;
}
.portrait-dropzone:hover { border-color: var(--color-gold); }
.portrait-dropzone--filled { border-style: solid; border-color: var(--color-border-glow); }
.portrait-preview { width: 100%; height: 100%; object-fit: cover; display: block; }
.portrait-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-xs);
  color: var(--color-text-muted);
  font-size: var(--fs-secondary);
  font-family: var(--font-flavor);
  font-style: italic;
  text-align: center;
  padding: var(--space-sm);
}
.portrait-icon { font-size: 1.6rem; line-height: 1; }
.portrait-input {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
}
.portrait-clear {
  background: none;
  border: 1px solid var(--color-crimson-dim, #5a2a2a);
  color: var(--color-crimson-light, #c06060);
  border-radius: var(--radius-sm);
  padding: var(--space-xs) var(--space-sm);
  font-size: var(--fs-secondary);
  cursor: pointer;
  align-self: flex-end;
  transition: border-color var(--transition-fast), color var(--transition-fast);
}
.portrait-clear:hover { border-color: var(--color-crimson); color: var(--color-crimson); }
.field-label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.custom-occ-label {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  font-family: var(--font-heading);
  font-size: var(--fs-micro);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-text-muted);
  cursor: pointer;
  user-select: none;
  transition: color var(--transition-fast);
}
.custom-occ-label:hover {
  color: var(--color-arcane);
}
.custom-occ-checkbox {
  appearance: none;
  -webkit-appearance: none;
  width: 14px;
  height: 14px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  cursor: pointer;
  flex-shrink: 0;
  position: relative;
  transition: all var(--transition-fast);
}
.custom-occ-checkbox:hover {
  border-color: var(--color-arcane-dim);
}
.custom-occ-checkbox:checked {
  background: var(--color-arcane-glow);
  border-color: var(--color-arcane);
}
.custom-occ-checkbox:checked::after {
  content: '';
  position: absolute;
  left: 3px;
  top: 1px;
  width: 5px;
  height: 8px;
  border: 1.5px solid var(--color-arcane);
  border-top: none;
  border-left: none;
  transform: rotate(45deg);
}
.field-label {
  font-family: var(--font-heading);
  font-size: var(--fs-field-label);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-text-muted);
}
.random-name-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  font-size: 0.95rem;
  background: transparent;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  color: var(--color-text-muted);
  cursor: pointer;
  transition: all var(--transition-fast);
  flex-shrink: 0;
  line-height: 1;
}
.random-name-btn:hover:not(:disabled) {
  border-color: var(--color-arcane-dim);
  color: var(--color-arcane);
  background: var(--color-arcane-glow);
}
.random-name-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.required { color: var(--color-crimson); }
.field-input, .field-textarea {
  background: var(--color-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-sm) var(--space-md);
  color: var(--color-text-primary);
  font-family: var(--font-body);
  font-size: var(--fs-field-input);
  outline: none;
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
  width: 100%;
}
.field-textarea { resize: vertical; }
.field-input::placeholder, .field-textarea::placeholder { color: var(--color-text-muted); font-style: italic; }
.field-input:focus, .field-textarea:focus {
  border-color: var(--color-arcane-dim);
  box-shadow: var(--shadow-glow);
}

/* ── OCCUPATION SELECT ───────────────────────────────────── */
.field-select {
  background: var(--color-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-sm) var(--space-md);
  color: var(--color-text-primary);
  font-family: var(--font-body);
  font-size: var(--fs-field-input);
  outline: none;
  width: 100%;
  cursor: pointer;
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}
.field-select:focus {
  border-color: var(--color-arcane-dim);
  box-shadow: var(--shadow-glow);
}
.field-select option { background: var(--color-elevated); color: var(--color-text-primary); }
.occupation-hint {
  margin-top: var(--space-xs);
  font-family: var(--font-flavor);
  font-style: italic;
  font-size: var(--fs-section-hint);
  color: var(--color-arcane);
  display: flex; gap: var(--space-sm); flex-wrap: wrap;
}

/* ── POINTS D'OCCUPATION ─────────────────────────────────── */
.points-trackers {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  margin-bottom: var(--space-lg);
}
.occ-points-tracker {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--space-sm);
  background: var(--color-elevated);
  border: 1px solid var(--color-border);
  border-left: 3px solid var(--color-arcane);
  border-radius: var(--radius-md);
  padding: var(--space-sm) var(--space-md);
  font-family: var(--font-heading);
  font-size: var(--fs-secondary);
  letter-spacing: 0.06em;
  transition: border-color var(--transition-fast);
}
.occ-points-tracker--int {
  border-left-color: var(--color-gold);
}
.occ-points-tracker--int .occ-points-count,
.occ-points-tracker--int .occ-points-remaining {
  color: var(--color-gold);
}
.occ-points-tracker.occ-points-over {
  border-left-color: var(--color-crimson);
}
.occ-points-label {
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--color-text-muted);
  font-size: var(--fs-micro);
}
.occ-points-formula {
  font-family: var(--font-flavor);
  font-style: italic;
  color: var(--color-text-secondary);
  font-size: var(--fs-secondary);
}
.occ-points-sep {
  color: var(--color-border);
}
.occ-points-count {
  color: var(--color-arcane);
  font-weight: bold;
}
.occ-points-over .occ-points-count {
  color: var(--color-crimson);
}
.occ-points-remaining {
  margin-left: auto;
  font-weight: bold;
  color: var(--color-arcane);
}
.occ-points-over .occ-points-remaining {
  color: var(--color-crimson);
}
.occ-overflow-badge {
  display: inline-block;
  margin-left: var(--space-xs);
  padding: 1px 6px;
  background: rgba(139, 58, 58, 0.15);
  border: 1px solid var(--color-crimson-dim);
  border-radius: var(--radius-sm);
  color: var(--color-crimson);
  font-size: var(--fs-micro);
  letter-spacing: 0.08em;
}

/* ── HIGHLIGHT ───────────────────────────────────────────── */
.highlight-hint {
  font-family: var(--font-flavor);
  font-style: italic;
  font-size: var(--fs-section-hint);
  color: var(--color-text-muted);
  margin-bottom: var(--space-md);
}
.highlight-sample {
  padding: 0 4px;
  border-radius: 2px;
}
.highlight-sample--fixed {
  color: var(--color-gold);
  background: rgba(184, 146, 74, 0.08);
}
.highlight-sample--choice {
  color: var(--color-arcane);
  background: rgba(127, 179, 138, 0.08);
}
.comp-highlighted {
  background: rgba(184, 146, 74, 0.07) !important;
  border-left: 2px solid var(--color-gold);
}
.comp-highlighted .comp-name { color: var(--color-gold); }
.comp-choice {
  background: rgba(127, 179, 138, 0.06) !important;
  border-left: 2px solid var(--color-arcane);
}
.comp-choice .comp-name { color: var(--color-arcane); }
.comp-category {
  cursor: default;
  border-left: 2px solid var(--color-border);
}
.comp-category-badge {
  color: var(--color-text-muted);
  text-align: right;
  font-size: var(--fs-secondary);
}
.variable-group--highlighted {
  outline: 1px solid rgba(184, 146, 74, 0.35);
  outline-offset: 4px;
  border-radius: var(--radius-sm);
}
.variable-group--highlighted .variable-subtitle { color: var(--color-gold); }
.variable-group--choice {
  outline: 1px solid rgba(127, 179, 138, 0.3);
  outline-offset: 4px;
  border-radius: var(--radius-sm);
}
.variable-group--choice .variable-subtitle { color: var(--color-arcane); }

/* ── CHOICE PICKER ───────────────────────────────────────── */
.choice-picker {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  margin-bottom: var(--space-md);
}
.choice-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: var(--space-xs) var(--space-sm);
  background: rgba(127, 179, 138, 0.05);
  border-left: 2px solid var(--color-arcane);
  border-radius: var(--radius-sm);
}
.choice-label {
  font-family: var(--font-flavor);
  font-style: italic;
  font-size: var(--fs-secondary);
  color: var(--color-arcane);
}
.choice-slots {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-xs);
}
.choice-slot-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  min-width: 160px;
  max-width: 260px;
}
.choice-select {
  width: 100%;
}
.choice-select--sub {
  border-color: var(--color-arcane-dim);
  font-style: italic;
}
.choice-label--fixed {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
}
.choice-badge-fixed {
  font-family: var(--font-heading);
  font-style: normal;
  font-size: var(--fs-micro);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-gold);
  border: 1px solid rgba(184,146,74,0.4);
  border-radius: 2px;
  padding: 1px 5px;
}
.choice-group--fixed-spec {
  border-left-color: var(--color-gold);
  background: rgba(184,146,74,0.04);
}
.choice-group--free-choice {
  border-left-color: var(--color-text-muted);
}
.input-locked {
  opacity: 0.7;
  cursor: default;
  background: rgba(184,146,74,0.04) !important;
  color: var(--color-gold) !important;
  border-color: rgba(184,146,74,0.3) !important;
}

/* ── GÉNÉRATION DES CARACTÉRISTIQUES ─────────────────────── */
.gen-methods {
  display: flex; flex-wrap: wrap; gap: 4px;
  margin-bottom: var(--space-md);
}
.gen-method-btn {
  font-family: var(--font-heading);
  font-size: var(--fs-secondary);
  letter-spacing: 0.08em;
  color: var(--color-text-muted);
  background: transparent;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: var(--space-xs) var(--space-md);
  cursor: pointer;
  transition: all var(--transition-fast);
}
.gen-method-btn:hover { color: var(--color-text-secondary); border-color: var(--color-border-glow); }
.gen-method-btn--active {
  color: var(--color-gold);
  border-color: var(--color-gold);
  background: rgba(184,146,74,0.08);
}
.gen-panel {
  display: flex; flex-direction: column; gap: var(--space-sm);
  margin-bottom: var(--space-md);
  padding: var(--space-md);
  background: var(--color-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}
.gen-panel-actions { display: flex; align-items: center; flex-wrap: wrap; gap: var(--space-md); }
.gen-formula-hint { font-family: var(--font-flavor); font-style: italic; font-size: var(--fs-secondary); color: var(--color-text-muted); }
.gen-hint { font-family: var(--font-flavor); font-style: italic; font-size: var(--fs-secondary); color: var(--color-gold); }
.gen-low-stats {
  display: flex; align-items: center; flex-wrap: wrap; gap: var(--space-sm);
  padding: var(--space-sm) var(--space-md);
  background: rgba(139,58,58,0.12);
  border: 1px solid rgba(139,58,58,0.3);
  border-radius: var(--radius-sm);
  font-size: var(--fs-secondary);
  color: var(--color-crimson);
}
.gen-opt-label { color: var(--color-text-muted); font-style: italic; font-family: var(--font-flavor); }
.gen-opt-sep { color: var(--color-border-glow); }
.gen-opt-bonus { color: var(--color-arcane); font-family: var(--font-heading); font-weight: bold; }
/* Chips pool */
.pool-chips { display: flex; flex-wrap: wrap; gap: var(--space-sm); }
.pool-chip {
  display: flex; flex-direction: column; align-items: center;
  min-width: 52px; padding: var(--space-xs) var(--space-sm);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
}
.pool-chip:hover:not(.pool-chip--assigned) { border-color: var(--color-border-glow); }
.pool-chip--selected { border-color: var(--color-gold); background: rgba(184,146,74,0.12); }
.pool-chip--assigned { border-color: var(--color-arcane-dim); background: rgba(127,179,138,0.08); cursor: pointer; }
.pool-chip-value { font-family: var(--font-heading); font-size: var(--fs-carac-code); font-weight: bold; color: var(--color-arcane); }
.pool-chip--selected .pool-chip-value { color: var(--color-gold); }
.pool-chip--assigned .pool-chip-value { color: var(--color-text-muted); }
.pool-chip-tag { font-family: var(--font-heading); font-size: 10px; letter-spacing: 0.1em; color: var(--color-arcane); margin-top: 2px; }
/* Budget achat */
.buy-budget {
  display: flex; align-items: baseline; gap: var(--space-sm);
  padding: var(--space-xs) var(--space-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
}
.buy-budget--over { border-color: var(--color-crimson); }
.buy-budget-label { font-family: var(--font-heading); font-size: var(--fs-secondary); color: var(--color-text-muted); letter-spacing: 0.1em; }
.buy-budget-value { font-family: var(--font-display); font-size: var(--fs-xl); color: var(--color-arcane); }
.buy-budget--over .buy-budget-value { color: var(--color-crimson); }
.btn-roll--sm { padding: var(--space-xs) var(--space-sm); font-size: var(--fs-secondary); }
/* Carac-input-wrap */
.carac-input-wrap { display: flex; align-items: center; gap: 4px; }
.carac-roll-btn {
  flex-shrink: 0;
  background: transparent;
  border: none;
  color: var(--color-text-muted);
  font-size: var(--fs-xl);
  cursor: pointer;
  padding: 0 2px;
  line-height: 1;
  transition: color var(--transition-fast);
}
.carac-roll-btn:hover { color: var(--color-gold); }
/* Assignation pool sur les lignes */
.carac-row--assignable { cursor: pointer; }
.carac-row--assignable:hover { background: rgba(184,146,74,0.07) !important; }
.carac-row--pool-assigned { background: rgba(127,179,138,0.06) !important; }

/* ── CARACTÉRISTIQUES ────────────────────────────────────── */
.carac-table { border: 1px solid var(--color-border); border-radius: var(--radius-md); overflow: hidden; }
.carac-header, .carac-row {
  display: grid;
  grid-template-columns: 60px 1fr 110px 60px 60px;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-sm) var(--space-md);
}
.carac-header {
  background: var(--color-elevated);
  font-family: var(--font-heading);
  font-size: var(--fs-table-header);
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--color-text-muted);
  border-bottom: 1px solid var(--color-border);
}
.col-center { text-align: center; }
.carac-row { border-bottom: 1px solid var(--color-border); }
.carac-row:last-child { border-bottom: none; }
.carac-row:nth-child(even) { background: var(--color-deep); }
.carac-code { font-family: var(--font-heading); font-size: var(--fs-carac-code); font-weight: bold; letter-spacing: 0.1em; color: var(--color-gold); }
.carac-desc { font-family: var(--font-flavor); font-style: italic; font-size: var(--fs-carac-desc); color: var(--color-text-secondary); }
.carac-input {
  background: var(--color-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: var(--space-xs) var(--space-sm);
  color: var(--color-arcane);
  font-family: var(--font-heading);
  font-size: var(--fs-carac-code); font-weight: bold;
  text-align: center; width: 100%; outline: none;
  transition: border-color var(--transition-fast);
}
.carac-input::-webkit-inner-spin-button { display: none; }
.carac-input:focus { border-color: var(--color-arcane-dim); }
.carac-derived { font-family: var(--font-heading); font-size: var(--fs-secondary); color: var(--color-text-muted); text-align: center; }

/* ── STATS DÉRIVÉES ──────────────────────────────────────── */
.derived-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: var(--space-md); }
.derived-card {
  background: var(--color-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-md);
  text-align: center;
  display: flex; flex-direction: column; gap: var(--space-xs);
}
.derived-label { font-family: var(--font-heading); font-size: var(--fs-derived-label); letter-spacing: 0.12em; text-transform: uppercase; color: var(--color-text-muted); }
.derived-value { font-family: var(--font-display); font-size: var(--fs-derived-value); color: var(--color-arcane); line-height: 1; }
.derived-value--text { font-size: var(--fs-xl); }
.derived-formula { font-family: var(--font-flavor); font-style: italic; font-size: var(--fs-secondary); color: var(--color-text-muted); }

/* ── RICHESSE ────────────────────────────────────────────── */
.wealth-tranche {
  font-family: var(--font-flavor);
  font-style: italic;
  font-size: var(--fs-body);
  color: var(--color-gold);
  text-transform: none;
  letter-spacing: 0;
}

/* ── COMPÉTENCES ─────────────────────────────────────────── */
.comp-grid {
  display: grid; grid-template-columns: repeat(2, 1fr);
  border: 1px solid var(--color-border); border-radius: var(--radius-md); overflow: hidden;
}
.comp-row {
  display: grid; grid-template-columns: 1fr 42px 70px;
  align-items: center; gap: var(--space-sm);
  padding: var(--space-xs) var(--space-md);
  border-bottom: 1px solid var(--color-border);
  border-right: 1px solid var(--color-border);
}
.comp-row:nth-child(4n+2),
.comp-row:nth-child(4n+3) { background: var(--color-deep); }
.comp-name { font-family: var(--font-heading); font-size: var(--fs-row-name); letter-spacing: 0.03em; color: var(--color-text-primary); }
.comp-base { font-family: var(--font-heading); font-size: var(--fs-secondary); color: var(--color-text-muted); text-align: right; }
.comp-input {
  background: var(--color-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: 2px var(--space-xs);
  color: var(--color-arcane);
  font-family: var(--font-heading);
  font-size: var(--fs-field-input); font-weight: bold;
  text-align: center; width: 100%; outline: none;
  transition: border-color var(--transition-fast);
}
.comp-input::-webkit-inner-spin-button { display: none; }
.comp-input:focus { border-color: var(--color-arcane-dim); }

/* ── VARIABLE SKILLS ─────────────────────────────────────── */
.variable-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-xl); }
.variable-group--full { grid-column: span 2; }
.variable-subtitle {
  font-family: var(--font-heading);
  font-size: var(--fs-section-title); letter-spacing: 0.12em; text-transform: uppercase;
  color: var(--color-text-muted);
  margin-bottom: var(--space-md);
}
.variable-row { display: grid; grid-template-columns: 1fr 70px; gap: var(--space-sm); margin-bottom: var(--space-sm); }
.label-input { font-size: var(--fs-md); }
.variable-row-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--space-sm) var(--space-xl); }

/* ── ARMES ────────────────────────────────────────────────── */
.weapons-table-wrap { overflow-x: auto; }
.weapons-table {
  min-width: 640px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  overflow: hidden;
}
.weapons-header,
.weapons-row {
  display: grid;
  grid-template-columns: 1fr 70px 50px 50px 80px 80px 55px 65px 30px;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-md);
}
.weapons-header {
  background: var(--color-elevated);
  font-family: var(--font-heading);
  font-size: var(--fs-table-header);
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--color-text-muted);
  border-bottom: 1px solid var(--color-border);
}
.weapons-row { border-bottom: 1px solid var(--color-border); }
.weapons-row:last-child { border-bottom: none; }
.weapons-row:nth-child(even) { background: var(--color-deep); }
.weapons-row--melee { background: rgba(139,58,58,0.06); }
.weapon-melee-label {
  font-family: var(--font-heading);
  font-size: var(--fs-secondary);
  letter-spacing: 0.08em;
  color: var(--color-crimson);
  font-style: italic;
}
.weapon-input {
  background: var(--color-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: var(--space-xs) var(--space-sm);
  color: var(--color-text-primary);
  font-family: var(--font-heading);
  font-size: var(--fs-secondary);
  text-align: center;
  width: 100%; outline: none;
  transition: border-color var(--transition-fast);
}
.weapon-input::-webkit-inner-spin-button { display: none; }
.weapon-input:focus { border-color: var(--color-arcane-dim); }
.weapon-input--name { text-align: left; color: var(--color-text-secondary); }
.weapon-auto {
  font-family: var(--font-heading);
  font-size: var(--fs-secondary);
  color: var(--color-text-muted);
  text-align: center;
}
.weapon-fixed {
  font-family: var(--font-heading);
  font-size: var(--fs-secondary);
  color: var(--color-border-glow);
  text-align: center;
}
.weapon-save-btn {
  background: transparent; border: none;
  font-size: 14px; cursor: pointer; opacity: 0.4;
  transition: opacity var(--transition-fast);
  padding: 0; line-height: 1;
}
.weapon-save-btn:hover:not(:disabled) { opacity: 1; }
.weapon-save-btn:disabled { opacity: 0.15; cursor: not-allowed; }
.weapon-actions { display: flex; gap: 4px; align-items: center; }
.weapon-clear-btn {
  background: transparent; border: none;
  font-size: 11px; cursor: pointer; opacity: 0.3;
  transition: opacity var(--transition-fast);
  padding: 0; line-height: 1; color: var(--color-crimson);
}
.weapon-clear-btn:hover:not(:disabled) { opacity: 1; }
.weapon-clear-btn:disabled { opacity: 0.1; cursor: not-allowed; }

/* ── BIBLIOTHÈQUE D'ARMES ─────────────────────────────────── */
.library-section { margin-top: var(--space-md); }
.library-toggle {
  display: flex; align-items: center; gap: var(--space-sm);
  font-family: var(--font-heading); font-size: var(--fs-secondary);
  letter-spacing: 0.1em; text-transform: uppercase;
  color: var(--color-text-muted);
  background: transparent; border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: var(--space-xs) var(--space-md); cursor: pointer;
  transition: all var(--transition-fast);
}
.library-toggle:hover { color: var(--color-gold); border-color: var(--color-gold); }
.library-toggle-icon { font-size: var(--fs-secondary); }
.library-count {
  font-family: var(--font-heading); font-size: 11px;
  color: var(--color-arcane);
  background: rgba(127,179,138,0.15);
  border-radius: 10px; padding: 1px 6px;
}
.library-panel {
  margin-top: var(--space-sm);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  overflow: hidden;
}
.library-target-row {
  display: flex; align-items: center; gap: var(--space-md);
  padding: var(--space-sm) var(--space-md);
  background: var(--color-elevated);
  border-bottom: 1px solid var(--color-border);
}
.library-target-label { font-family: var(--font-heading); font-size: var(--fs-secondary); color: var(--color-text-muted); letter-spacing: 0.08em; }
.library-slot-btns { display: flex; gap: 4px; }
.library-slot-btn {
  font-family: var(--font-heading); font-size: var(--fs-secondary);
  color: var(--color-text-muted);
  background: transparent; border: 1px solid var(--color-border);
  border-radius: var(--radius-sm); padding: 2px var(--space-sm);
  cursor: pointer; transition: all var(--transition-fast);
}
.library-slot-btn:hover { color: var(--color-gold); border-color: var(--color-gold); }
.library-slot-btn--active { color: var(--color-gold); border-color: var(--color-gold); background: rgba(184,146,74,0.1); }
.library-tabs {
  display: flex;
  border-bottom: 1px solid var(--color-border);
}
.library-tab {
  flex: 1; font-family: var(--font-heading); font-size: var(--fs-secondary);
  letter-spacing: 0.08em;
  color: var(--color-text-muted);
  background: transparent; border: none; border-bottom: 2px solid transparent;
  padding: var(--space-sm) var(--space-md); cursor: pointer;
  transition: all var(--transition-fast);
}
.library-tab:hover { color: var(--color-text-secondary); }
.library-tab--active { color: var(--color-gold); border-bottom-color: var(--color-gold); }
.library-empty {
  padding: var(--space-lg) var(--space-md);
  text-align: center;
  font-family: var(--font-flavor); font-style: italic;
  font-size: var(--fs-secondary); color: var(--color-text-muted);
}
.library-list { max-height: 280px; overflow-y: auto; }
.library-item {
  display: flex; align-items: center; justify-content: space-between;
  gap: var(--space-md);
  padding: var(--space-sm) var(--space-md);
  border-bottom: 1px solid var(--color-border);
}
.library-item:last-child { border-bottom: none; }
.library-item:nth-child(even) { background: var(--color-deep); }
.library-item-info { display: flex; align-items: center; gap: var(--space-sm); flex: 1; min-width: 0; flex-wrap: wrap; }
.library-item-name { font-family: var(--font-heading); font-size: var(--fs-secondary); color: var(--color-text-secondary); }
.library-item-meta {
  font-family: var(--font-flavor); font-style: italic;
  font-size: var(--fs-secondary); color: var(--color-text-muted);
}
.library-item-meta::before { content: '·'; margin-right: var(--space-xs); }
.library-item-actions { display: flex; gap: var(--space-xs); flex-shrink: 0; }
.btn-import {
  font-family: var(--font-heading); font-size: var(--fs-secondary);
  letter-spacing: 0.05em; color: var(--color-arcane);
  background: transparent; border: 1px solid var(--color-arcane-dim);
  border-radius: var(--radius-sm); padding: 2px var(--space-sm);
  cursor: pointer; transition: all var(--transition-fast);
  white-space: nowrap;
}
.btn-import:hover { background: rgba(127,179,138,0.1); }
.btn-delete-arme {
  font-size: var(--fs-secondary); color: var(--color-text-muted);
  background: transparent; border: none; cursor: pointer;
  transition: color var(--transition-fast); padding: 2px 4px;
}
.btn-delete-arme:hover { color: var(--color-crimson); }
.rulebook-filters { display: flex; gap: var(--space-sm); padding: var(--space-sm) var(--space-md); border-bottom: 1px solid var(--color-border); }
.rulebook-search { flex: 1; }
.rulebook-cat { width: 180px; }

/* ── BACKGROUND ──────────────────────────────────────────── */
.background-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-md); }

/* ── ÉQUIPEMENT ──────────────────────────────────────────── */
.equip-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-sm) var(--space-md); }

/* ── PDF CREDIT ──────────────────────────────────────────── */
.pdf-credit {
  text-align: center;
  font-family: var(--font-flavor);
  font-style: italic;
  font-size: var(--fs-secondary);
  color: var(--color-text-muted);
  margin-bottom: var(--space-md);
}
.pdf-credit a {
  color: var(--color-gold);
  text-decoration: underline;
  text-underline-offset: 2px;
}
.pdf-credit a:hover {
  color: var(--color-gold-light, #d4a96a);
}

/* ── ERROR / SUCCESS ─────────────────────────────────────── */
.form-error {
  background: rgba(139, 58, 58, 0.12);
  border: 1px solid var(--color-crimson-dim);
  border-radius: var(--radius-md);
  padding: var(--space-md) var(--space-lg);
  color: var(--color-crimson-light);
  font-family: var(--font-flavor);
  font-style: italic;
}
.form-success {
  background: rgba(127, 179, 138, 0.1);
  border: 1px solid var(--color-arcane-dim);
  border-radius: var(--radius-md);
  padding: var(--space-md) var(--space-lg);
  color: var(--color-arcane);
  font-family: var(--font-flavor);
  font-style: italic;
}

/* ── MODIFICATEURS D'ÂGE ────────────────────────────────── */
.age-panel { border-color: var(--color-gold); }
.age-badge {
  font-family: var(--font-body);
  font-size: var(--fs-secondary);
  font-weight: normal;
  letter-spacing: 0.05em;
  text-transform: none;
  color: var(--color-gold);
  border: 1px solid var(--color-gold);
  border-radius: var(--radius-sm);
  padding: 2px var(--space-sm);
  margin-left: var(--space-sm);
  opacity: 0.8;
}
.age-rules { display: flex; flex-direction: column; gap: var(--space-md); }
.age-rule {
  display: flex; gap: var(--space-md); align-items: flex-start;
  padding: var(--space-sm) var(--space-md);
  background: var(--color-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: var(--fs-secondary);
  color: var(--color-text-secondary);
}
.age-rule--note { opacity: 0.65; }
.age-rule--edu { align-items: flex-start; }
.age-rule-glyph {
  font-family: var(--font-heading);
  font-size: var(--fs-xl);
  font-weight: bold;
  color: var(--color-gold);
  line-height: 1;
  flex-shrink: 0;
  width: 1em;
  text-align: center;
}
.age-target {
  font-family: var(--font-heading);
  font-size: var(--fs-secondary);
  color: var(--color-arcane);
  margin-left: var(--space-sm);
}
.age-hint { font-style: italic; color: var(--color-text-muted); margin-left: var(--space-xs); }
.age-edu { display: flex; flex-direction: column; gap: var(--space-sm); flex: 1; }
.btn-roll {
  align-self: flex-start;
  font-family: var(--font-heading);
  font-size: var(--fs-secondary);
  letter-spacing: 0.1em;
  color: var(--color-gold);
  background: transparent;
  border: 1px solid var(--color-gold);
  border-radius: var(--radius-sm);
  padding: var(--space-xs) var(--space-md);
  cursor: pointer;
  transition: background var(--transition-fast), opacity var(--transition-fast);
}
.btn-roll:hover:not(:disabled) { background: rgba(184,146,74,0.12); }
.btn-roll:disabled { opacity: 0.35; cursor: not-allowed; }
.edu-results { display: flex; flex-direction: column; gap: 4px; margin-top: var(--space-xs); }
.edu-result {
  display: grid;
  grid-template-columns: 60px 40px 1fr 60px;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-sm);
  font-family: var(--font-heading);
  font-size: var(--fs-secondary);
}
.edu-result--success { background: rgba(127,179,138,0.08); border: 1px solid rgba(127,179,138,0.2); }
.edu-result--fail { background: var(--color-deep); border: 1px solid var(--color-border); opacity: 0.6; }
.edu-result-label { color: var(--color-text-muted); }
.edu-result-roll { font-size: var(--fs-carac-code); font-weight: bold; text-align: center; }
.edu-result--success .edu-result-roll { color: var(--color-arcane); }
.edu-result--fail .edu-result-roll { color: var(--color-text-muted); }
.edu-result-vs { color: var(--color-text-muted); font-style: italic; font-family: var(--font-flavor); }
.edu-result-outcome { font-weight: bold; text-align: right; }
.edu-result--success .edu-result-outcome { color: var(--color-arcane); }
.edu-result--fail .edu-result-outcome { color: var(--color-text-muted); }
.edu-total {
  margin-top: var(--space-xs);
  padding: var(--space-xs) var(--space-sm);
  font-size: var(--fs-secondary);
  color: var(--color-text-secondary);
  border-top: 1px solid var(--color-border);
}
/* Transition d'apparition */
.age-panel-enter-active { transition: opacity 0.3s, transform 0.3s; }
.age-panel-leave-active { transition: opacity 0.2s, transform 0.2s; }
.age-panel-enter-from, .age-panel-leave-to { opacity: 0; transform: translateY(-6px); }

/* ── CHANCE ──────────────────────────────────────────────── */
.chance-row { display: flex; }
.chance-card {
  display: flex; align-items: center; gap: var(--space-xl);
  background: var(--color-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-md) var(--space-xl);
}
.chance-input-group { display: flex; align-items: center; }
.chance-input {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: var(--space-sm) var(--space-md);
  color: var(--color-arcane);
  font-family: var(--font-heading);
  font-size: 2rem; font-weight: bold;
  text-align: center; width: 90px; outline: none;
  transition: border-color var(--transition-fast);
}
.chance-input::-webkit-inner-spin-button { display: none; }
.chance-input:focus { border-color: var(--color-arcane-dim); }

.chance-roll-col { display: flex; flex-direction: column; gap: var(--space-sm); align-items: flex-start; }
.chance-formula {
  font-family: var(--font-flavor);
  font-style: italic;
  font-size: var(--fs-secondary);
  color: var(--color-text-muted);
}
.chance-youth-note { color: var(--color-gold); }

/* ── SUBMIT ──────────────────────────────────────────────── */
.form-actions {
  display: flex; justify-content: center; gap: var(--space-md); flex-wrap: wrap;
  position: sticky; bottom: 0; z-index: 10;
  padding: var(--space-md) var(--space-xl);
}
.btn-save {
  font-family: var(--font-heading);
  font-size: var(--fs-btn); font-weight: bold;
  letter-spacing: 0.18em; text-transform: uppercase;
  color: var(--color-arcane);
  background: transparent;
  border: 1px solid var(--color-arcane-dim);
  border-radius: var(--radius-md);
  padding: var(--space-md) var(--space-2xl);
  cursor: pointer; min-width: 200px;
  opacity: 0.45;
  transform: scale(0.88);
  transition: all var(--transition-fast);
}
.form-actions:not(.is-stuck) .btn-save { opacity: 1; transform: scale(1); }
.btn-save:hover:not(:disabled) { background: var(--color-arcane-glow); opacity: 1; transform: scale(1); }
.btn-save:disabled { opacity: 0.2; cursor: not-allowed; transform: scale(0.88); }
.btn-generate {
  font-family: var(--font-heading);
  font-size: var(--fs-btn); font-weight: bold;
  letter-spacing: 0.18em; text-transform: uppercase;
  color: var(--color-deep);
  background: var(--color-arcane);
  border: none; border-radius: var(--radius-md);
  padding: var(--space-md) var(--space-2xl);
  cursor: pointer; min-width: 220px;
  opacity: 0.45;
  transform: scale(0.88);
  transition: opacity var(--transition-fast), box-shadow var(--transition-fast), transform var(--transition-fast);
}
.form-actions:not(.is-stuck) .btn-generate { opacity: 1; transform: scale(1); }
.btn-generate:hover:not(:disabled) { opacity: 1; transform: scale(1); box-shadow: var(--shadow-glow); }
.btn-generate:disabled { opacity: 0.2; cursor: not-allowed; transform: scale(0.88); }
.bottom-sentinel { height: 1px; }
.btn-sigil { display: inline-block; animation: pulse-sigil 1s ease-in-out infinite; font-size: var(--fs-xl); }
@keyframes pulse-sigil { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; } }

/* ── RESPONSIVE ──────────────────────────────────────────── */
@media (max-width: 700px) {
  .page-wrapper { padding: var(--space-md); }
  .identity-grid { grid-template-columns: 1fr; }
  .derived-grid { grid-template-columns: repeat(4, 1fr); }
  .carac-header, .carac-row { grid-template-columns: 50px 1fr 85px 50px 50px; }
  .comp-grid { grid-template-columns: 1fr; }
  .comp-row { border-right: none; }
  .comp-row:nth-child(4n+2),
  .comp-row:nth-child(4n+3) { background: unset; }
  .comp-row:nth-child(even) { background: var(--color-deep); }
  .variable-grid { grid-template-columns: 1fr; }
  .variable-group--full { grid-column: span 1; }
  .variable-row-grid { grid-template-columns: 1fr; }
  .background-grid { grid-template-columns: 1fr; }
  .chance-card {
    flex-direction: column;
    align-items: stretch;
    gap: var(--space-md);
    padding: var(--space-md);
    width: 100%;
    box-sizing: border-box;
  }
  .chance-roll-col { align-items: stretch; }
  .btn-roll { width: 100%; text-align: center; }
}
@media (max-width: 480px) {
  .page-wrapper { padding: var(--space-sm); }
  /* Table carac : scroll horizontal, description masquée */
  .carac-table { overflow-x: auto; }
  .carac-desc { display: none; }
  .carac-header, .carac-row {
    grid-template-columns: 52px 1fr 48px 48px;
    gap: var(--space-sm);
    padding: var(--space-xs) var(--space-sm);
  }
  /* Stats dérivées : 3 colonnes */
  .derived-grid { grid-template-columns: repeat(3, 1fr); gap: var(--space-sm); }
  .derived-card { padding: var(--space-sm); }
}
</style>
