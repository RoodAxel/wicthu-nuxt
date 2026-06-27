<script setup lang="ts">
import { backgroundFields } from '~/utils/investigateur/constants'

const { form } = injectCharacterCreation()
</script>

<template>
  <section class="form-section">
    <h2 class="section-title">Histoire & Background</h2>
    <div class="background-grid">
      <div v-for="f in backgroundFields" :key="f.key" class="field-group">
        <label class="field-label" :for="f.key">{{ f.label }}</label>
        <textarea :id="f.key" v-model="form[f.key]" class="field-textarea" rows="2" />
      </div>
    </div>
  </section>
</template>
