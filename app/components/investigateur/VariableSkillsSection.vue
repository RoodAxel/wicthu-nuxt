<script setup lang="ts">
const {
  form, isGroupHighlighted, isGroupChoice, occupationVarSlots,
  uniqueWeaponCompetences, getCompBase
} = injectCharacterCreation()
</script>

<template>
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
</template>
