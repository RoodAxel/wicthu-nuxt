<script setup lang="ts">
const { pv_max, pm_max, sm_initial, impact, carrure, mvt } = injectCharacterCreation()
</script>

<template>
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
</template>
