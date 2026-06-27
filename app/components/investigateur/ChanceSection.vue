<script setup lang="ts">
const { form, ageCategory, rollChance } = injectCharacterCreation()
</script>

<template>
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
</template>
