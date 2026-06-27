<script setup lang="ts">
const { form } = injectCharacterCreation()
</script>

<template>
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
</template>
