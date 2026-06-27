<script setup lang="ts">
import { caracteristiques } from '~/utils/investigateur/constants'
import { half, fifth } from '~/utils/investigateur/format'

const {
  form, genMethod, rollOneStat, rollAllClassic, lowStatsCount, option2Bonus, rollOption2,
  pool, selectedPoolIdx, isPoolMode, selectPool, assignPool, initFreePool, initQuickPool,
  clearCaracStats, buyBudget
} = injectCharacterCreation()
</script>

<template>
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
</template>
