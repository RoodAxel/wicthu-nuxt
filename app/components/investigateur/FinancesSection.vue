<script setup lang="ts">
const { form, creditWealth } = injectCharacterCreation()
</script>

<template>
  <section class="form-section">
    <h2 class="section-title">Finances</h2>
    <p v-if="creditWealth" class="section-hint">
      Valeurs déduites automatiquement de votre Crédit
      (<span class="wealth-tranche">{{ creditWealth.tranche }}</span>) — modifiables selon les besoins du scénario.
    </p>
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
</template>
