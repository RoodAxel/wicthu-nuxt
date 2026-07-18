<script setup lang="ts">
import { backgroundFields } from '~/utils/investigateur/constants'
import { BACKGROUND_LIMITS } from '#shared/investigateur-background'

const { form } = injectCharacterCreation()

const maxOf = (key: string) => BACKGROUND_LIMITS[key]?.max ?? 999
const lenOf = (key: string) => form[key]?.length ?? 0
</script>

<template>
  <section class="form-section">
    <h2 class="section-title">Histoire & Background</h2>
    <p class="section-hint">
      L'espace sur la fiche PDF est limité : chaque champ est plafonné au nombre
      de caractères qu'elle peut réellement afficher.
    </p>
    <div class="background-grid">
      <div v-for="f in backgroundFields" :key="f.key" class="field-group">
        <div class="field-label-row">
          <label class="field-label" :for="f.key">{{ f.label }}</label>
          <span
            class="field-counter"
            :class="{ 'field-counter--full': lenOf(f.key) >= maxOf(f.key) }"
          >{{ lenOf(f.key) }} / {{ maxOf(f.key) }}</span>
        </div>
        <textarea
          :id="f.key"
          v-model="form[f.key]"
          class="field-textarea"
          rows="2"
          :maxlength="maxOf(f.key)"
        />
      </div>
    </div>
  </section>
</template>
