<script setup lang="ts">
const { form } = injectCharacterCreation()
</script>

<template>
  <section class="form-section">
    <h2 class="section-title">Équipement</h2>
    <div class="equip-grid">
      <div v-for="i in 12" :key="i" class="field-group">
        <label class="field-label" :for="`EQUIP${i}`">{{ i }}</label>
        <input :id="`EQUIP${i}`" v-model="form[`EQUIP${i}`]" class="field-input" type="text" placeholder="Objet…">
      </div>
    </div>
  </section>
</template>
