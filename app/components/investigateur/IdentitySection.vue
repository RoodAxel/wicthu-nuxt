<script setup lang="ts">
const {
  form, occupationList, selectedOccupationId, occupationDetail, customOccupation,
  portraitDataUrl, handlePortraitFile, generateRandomName,
  genderChoice, genderCustom, genderOptions
} = injectCharacterCreation()

const { isFavorite, toggle: toggleFavorite } = useOccupationFavorites()

// ── Sélecteur d'occupation ───────────────────────────────────────────────────
// 124 occupations : une liste déroulante simple n'est plus exploitable.
// Champ vide → on propose les favoris ; dès que l'utilisateur tape, on filtre
// sur les occupations qui *commencent* par ce qu'il a saisi.
const occQuery = ref('')
const occOpen = ref(false)
const occBoxRef = ref<HTMLElement | null>(null)

const selectedOccupation = computed(() =>
  occupationList.value?.find(o => o.id === selectedOccupationId.value) ?? null
)

const favoriteOccupations = computed(() =>
  (occupationList.value ?? [])
    .filter(o => isFavorite(o.slug))
    .sort((a, b) => a.name.localeCompare(b.name, 'fr'))
)

const occSuggestions = computed(() => {
  const list = occupationList.value ?? []
  const q = normalizeStr(occQuery.value.trim())
  if (!q) return favoriteOccupations.value
  // « commence par » d'abord (nom ou nom alternatif), puis le reste du nom
  const starts = list.filter(o => [o.name, ...o.autre_name].some(n => normalizeStr(n).startsWith(q)))
  const contains = list.filter(o =>
    !starts.includes(o) && [o.name, ...o.autre_name].some(n => normalizeStr(n).includes(q))
  )
  return [...starts, ...contains].sort((a, b) => a.name.localeCompare(b.name, 'fr'))
})

function pickOccupation(id: number) {
  selectedOccupationId.value = id
  occQuery.value = ''
  occOpen.value = false
}

function clearOccupation() {
  selectedOccupationId.value = null
  form['Occupation'] = ''
  occQuery.value = ''
  occOpen.value = true
}

function onOccClickOutside(e: MouseEvent) {
  if (occBoxRef.value && !occBoxRef.value.contains(e.target as Node)) occOpen.value = false
}
onMounted(() => document.addEventListener('mousedown', onOccClickOutside))
onUnmounted(() => document.removeEventListener('mousedown', onOccClickOutside))
</script>

<template>
  <section class="form-section">
    <h2 class="section-title">Identité</h2>
    <InvestigateurFormHint title="Nom aléatoire">
      Le bouton <strong>⚄</strong> tire un nom en fonction du genre renseigné.
    </InvestigateurFormHint>
    <div class="identity-grid">
      <div class="field-group col-2">
        <div class="field-label-row">
          <label class="field-label" for="Nom">Nom de l'investigateur</label>
          <button
            type="button"
            class="random-name-btn"
            title="Générer un nom américain aléatoire (prénom choisi selon le genre ; les deux listes si « Autre » ou genre non renseigné)"
            aria-label="Générer un nom aléatoire selon le genre"
            @click="generateRandomName"
          >
            ⚄
          </button>
        </div>
        <input id="Nom" v-model="form['Nom']" class="field-input" type="text">
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
        <div v-else ref="occBoxRef" class="occ-picker">
          <!-- Occupation choisie : on l'affiche en pastille plutôt qu'en champ -->
          <div v-if="selectedOccupation && !occOpen" class="occ-selected">
            <button type="button" class="occ-selected-name" @click="occOpen = true">
              {{ selectedOccupation.name }}
            </button>
            <button
              type="button"
              class="occ-fav"
              :class="{ 'occ-fav--on': isFavorite(selectedOccupation.slug) }"
              :title="isFavorite(selectedOccupation.slug) ? 'Retirer des favoris' : 'Ajouter aux favoris'"
              @click="toggleFavorite(selectedOccupation.slug)"
            >{{ isFavorite(selectedOccupation.slug) ? '★' : '☆' }}</button>
            <button type="button" class="occ-clear" title="Changer d'occupation" @click="clearOccupation">✕</button>
          </div>

          <template v-else>
            <input
              id="Occupation"
              v-model="occQuery"
              class="field-input"
              type="text"
              autocomplete="off"
              :placeholder="favoriteOccupations.length ? 'Taper pour chercher…' : 'Taper les premières lettres…'"
              @focus="occOpen = true"
            >
            <div v-if="occOpen" class="occ-menu">
              <p class="occ-menu-head">
                <template v-if="!occQuery.trim()">
                  <template v-if="favoriteOccupations.length">
                    ★ Vos favoris ({{ favoriteOccupations.length }})
                  </template>
                  <template v-else>
                    Aucun favori — tapez une lettre, ou mettez des occupations en favori depuis
                    <NuxtLink to="/ressources/occupation" class="occ-menu-link">les ressources</NuxtLink>.
                  </template>
                </template>
                <template v-else>{{ occSuggestions.length }} résultat{{ occSuggestions.length > 1 ? 's' : '' }}</template>
              </p>
              <div class="occ-menu-scroll">
                <button
                  v-for="occ in occSuggestions"
                  :key="occ.id"
                  type="button"
                  class="occ-item"
                  @click="pickOccupation(occ.id)"
                >
                  <span class="occ-item-star" :class="{ 'occ-item-star--on': isFavorite(occ.slug) }">
                    {{ isFavorite(occ.slug) ? '★' : '☆' }}
                  </span>
                  <span class="occ-item-name">{{ occ.name }}</span>
                  <span v-if="occ.credit_min !== null" class="occ-item-credit">{{ occ.credit_min }}–{{ occ.credit_max }}</span>
                </button>
                <p v-if="occQuery.trim() && !occSuggestions.length" class="occ-menu-empty">
                  Aucune occupation ne correspond.
                </p>
              </div>
            </div>
          </template>
        </div>
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
        <label class="field-label" for="Sexe">Genre</label>
        <select id="Sexe" v-model="genderChoice" class="field-select">
          <option value="">— Non renseigné —</option>
          <option v-for="opt in genderOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
        </select>
        <input
          v-if="genderChoice === 'autre'"
          v-model="genderCustom"
          class="field-input"
          type="text"
          placeholder="Préciser…"
          aria-label="Préciser le genre"
        >
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
