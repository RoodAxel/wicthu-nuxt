<script setup lang="ts">
const {
  form, occupationList, selectedOccupationId, occupationDetail, customOccupation,
  portraitDataUrl, handlePortraitFile, generateRandomName
} = injectCharacterCreation()
</script>

<template>
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
</template>
