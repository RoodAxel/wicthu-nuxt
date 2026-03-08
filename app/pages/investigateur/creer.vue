<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const route = useRoute()
const router = useRouter()

// Mode édition si ?edit=ID est présent
const editId = computed(() => route.query.edit ? Number(route.query.edit) : null)

const form = reactive<Record<string, string>>({
  // Identité
  Nom: '', Joueur: '', Occupation: '', age: '', Sexe: '',
  'Résidence': '', 'Lieu de naissance': '', MVT: '',
  // Caractéristiques
  FOR_0: '', CON_0: '', TAI_0: '', DEX_0: '',
  APP_0: '', INT_0: '', POU_0: '', EDU_0: '',
  // Stats dérivées
  pv_max: '', pm_max: '', sm_initial: '', BlessureGrave: '', impact: '', carrure: '',
  // Compétences fixes
  ANT_0: '', ARC_0: '', ART_0: '', BAR_0: '', BIB_0: '',
  CHA_0: '', CD1_0: '', CD2_0: '', CR1_0: '', COM_0: '',
  COD_0: '', CEL_0: '', CRE_0: '', CRO_0: '',
  DIS_0: '', DRO_0: '', ECO_0: '', ELE_0: '',
  EQU_0: '', ESQ_0: '', EST_0: '', GRI_0: '', HIS_0: '',
  IPO_0: '', ITI_0: '', LAN_0: '', MEC_0: '', MED_0: '',
  MYT_0: '', NAG_0: '', NAT_0: '', OCC_0: '', ORI_0: '',
  PER_0: '', PIC_0: '', PIL_0: '', PIS_0: '', PLO_0: '',
  PRE_0: '', PSA_0: '', PSO_0: '', SAU_0: '', SCI_0: '',
  SUR_0: '', TOC_0: '',

  // Combat à distance
  CD3_label: '', CD3_0: '', CD4_label: '', CD4_0: '',
  // Combat rapproché
  CR2_label: '', CR2_0: '', CR3_label: '', CR3_0: '',
  // Art et métier
  AR1_label: '', AR1_0: '', AR2_label: '', AR2_0: '', AR3_label: '', AR3_0: '',
  // Langues
  LG1_label: '', LG1_0: '', LG2_label: '', LG2_0: '', LG3_label: '', LG3_0: '',
  // Pilotage
  PL1_label: '', PL1_0: '',
  // Sciences
  SC1_label: '', SC1_0: '', SC2_label: '', SC2_0: '', SC3_label: '', SC3_0: '',
  // Compétences perso
  CP1_label: '', CP1_0: '', CP2_label: '', CP2_0: '', CP3_label: '', CP3_0: '',
  CP4_label: '', CP4_0: '', CP5_label: '', CP5_0: '',
  // Background
  Description: '', ideologieEtCroyance: '', traits: '',
  personnesImportantes: '', sequellesCicatrices: '', lieuxSignificatifs: '',
  phobiesManies: '', 'bienPrécieux': '', ouvragesOccultes: '', rencontresEntites: '',
  // Finances
  capital: '', depencesCourantes: '', 'Espèces': ''
})

function n(val: string | undefined) { return Number(val) || 0 }
function half(val: string | undefined) { const v = Math.floor(n(val) / 2); return v > 0 ? String(v) : '' }
function fifth(val: string | undefined) { const v = Math.floor(n(val) / 5); return v > 0 ? String(v) : '' }

const pv_max = computed(() => {
  const v = Math.floor((n(form['CON_0']) + n(form['TAI_0'])) / 10)
  return v > 0 ? String(v) : ''
})
const pm_max = computed(() => {
  const v = Math.floor(n(form['POU_0']) / 5)
  return v > 0 ? String(v) : ''
})
const sm_initial = computed(() => {
  const v = n(form['POU_0'])
  return v > 0 ? String(v) : ''
})
const blessureGrave = computed(() => {
  const v = Math.ceil(Number(pv_max.value) / 2)
  return v > 0 ? String(v) : ''
})
const impact = computed(() => {
  const sum = n(form['FOR_0']) + n(form['TAI_0'])
  if (sum === 0) return ''
  if (sum <= 64) return '−2'
  if (sum <= 84) return '−1'
  if (sum <= 124) return '0'
  if (sum <= 164) return '+1D4'
  if (sum <= 204) return '+1D6'
  return '+2D6'
})
const carrure = computed(() => {
  const sum = n(form['FOR_0']) + n(form['TAI_0'])
  if (sum === 0) return ''
  if (sum <= 64) return '−2'
  if (sum <= 84) return '−1'
  if (sum <= 124) return '0'
  if (sum <= 164) return '+1'
  if (sum <= 204) return '+2'
  return '+3'
})
const mvt = computed(() => {
  const forVal = n(form['FOR_0'])
  const dex = n(form['DEX_0'])
  const tai = n(form['TAI_0'])
  if (forVal === 0 && dex === 0 && tai === 0) return ''
  if (forVal < tai && dex < tai) return '7'
  if (forVal > tai && dex > tai) return '9'
  return '8'
})

// Synchronise les dérivées calculées dans form pour l'envoi
watchEffect(() => {
  form['pv_max'] = pv_max.value
  form['pm_max'] = pm_max.value
  form['sm_initial'] = sm_initial.value
  form['BlessureGrave'] = blessureGrave.value
  form['impact'] = impact.value
  form['carrure'] = carrure.value
  form['MVT'] = mvt.value
})

const isLoading = ref(false)
const isSaving = ref(false)
const error = ref<string | null>(null)
const savedSuccess = ref(false)

// Charge les données si mode édition
onMounted(async () => {
  if (!editId.value) return
  try {
    const data = await $fetch<{ data: Record<string, string> }>(`/api/investigateur/${editId.value}`)
    Object.assign(form, data.data)
  }
  catch {
    error.value = 'Impossible de charger la fiche.'
  }
})

async function persistForm(): Promise<number> {
  if (editId.value) {
    const res = await $fetch<{ id: number }>(`/api/investigateur/${editId.value}`, {
      method: 'PUT',
      body: form
    })
    return res.id
  }
  else {
    const res = await $fetch<{ id: number }>('/api/investigateur', {
      method: 'POST',
      body: form
    })
    return res.id
  }
}

async function saveCharacter() {
  error.value = null
  savedSuccess.value = false
  isSaving.value = true
  try {
    const id = await persistForm()
    savedSuccess.value = true
    if (!editId.value) {
      await router.replace(`/investigateur/creer?edit=${id}`)
    }
  }
  catch (e: unknown) {
    error.value = `Erreur : ${e instanceof Error ? e.message : String(e)}`
  }
  finally { isSaving.value = false }
}

async function generatePdf() {
  error.value = null
  savedSuccess.value = false
  isLoading.value = true
  try {
    // Sauvegarde d'abord
    const id = await persistForm()
    if (!editId.value) {
      await router.replace(`/investigateur/creer?edit=${id}`)
    }
    // Génération du PDF
    const { url } = await $fetch<{ url: string }>('/api/investigateur/generate-pdf', {
      method: 'POST',
      body: form
    })
    window.open(url, '_blank')
  }
  catch (e: unknown) {
    error.value = `Erreur : ${e instanceof Error ? e.message : String(e)}`
  }
  finally { isLoading.value = false }
}

const caracteristiques = [
  { key: 'FOR_0', label: 'FOR', desc: 'Force' },
  { key: 'CON_0', label: 'CON', desc: 'Constitution' },
  { key: 'TAI_0', label: 'TAI', desc: 'Taille' },
  { key: 'DEX_0', label: 'DEX', desc: 'Dextérité' },
  { key: 'APP_0', label: 'APP', desc: 'Apparence' },
  { key: 'INT_0', label: 'INT', desc: 'Intelligence' },
  { key: 'POU_0', label: 'POU', desc: 'Pouvoir' },
  { key: 'EDU_0', label: 'EDU', desc: 'Éducation' }
] as const

const competences = [
  { key: 'ANT_0', label: 'Anthropologie', base: 1 },
  { key: 'ARC_0', label: 'Archéologie', base: 1 },
  { key: 'ART_0', label: 'Art et métiers', base: 5 },
  { key: 'BAR_0', label: 'Baratin', base: 5 },
  { key: 'BIB_0', label: 'Bibliothèque', base: 20 },
  { key: 'CHA_0', label: 'Charme', base: 15 },
  { key: 'CD1_0', label: 'Combat à dist. 1', base: 15 },
  { key: 'CD2_0', label: 'Combat à dist. 2', base: 25 },
  { key: 'CR1_0', label: 'Combat rappr. 1', base: 25 },
  { key: 'COM_0', label: 'Bagarre', base: 25 },
  { key: 'COD_0', label: 'Conduite', base: 20 },
  { key: 'CEL_0', label: 'Celer', base: 5 },
  { key: 'CRE_0', label: 'Crochetage', base: 1 },
  { key: 'CRO_0', label: 'Crochets', base: 25 },
  { key: 'DIS_0', label: 'Discrétion', base: 20 },
  { key: 'DRO_0', label: 'Droit', base: 5 },
  { key: 'ECO_0', label: 'Écoute', base: 20 },
  { key: 'ELE_0', label: 'Électricité', base: 1 },
  { key: 'EQU_0', label: 'Équitation', base: 5 },
  { key: 'ESQ_0', label: 'Esquive', base: 0 },
  { key: 'EST_0', label: 'Estimation', base: 5 },
  { key: 'GRI_0', label: 'Grimper', base: 20 },
  { key: 'HIS_0', label: 'Histoire', base: 5 },
  { key: 'IPO_0', label: 'Imposture', base: 5 },
  { key: 'ITI_0', label: 'Intimidation', base: 15 },
  { key: 'LAN_0', label: 'Langue maternelle', base: 0 },
  { key: 'MEC_0', label: 'Mécanique', base: 10 },
  { key: 'MED_0', label: 'Médecine', base: 1 },
  { key: 'MYT_0', label: 'Mythe de Cthulhu', base: 0 },
  { key: 'NAG_0', label: 'Nager', base: 1 },
  { key: 'NAT_0', label: 'Naturalisme', base: 20 },
  { key: 'OCC_0', label: 'Occultisme', base: 5 },
  { key: 'ORI_0', label: 'Orientation', base: 10 },
  { key: 'PER_0', label: 'Persuasion', base: 10 },
  { key: 'PIC_0', label: 'Pickpocket', base: 10 },
  { key: 'PIL_0', label: 'Pilotage', base: 1 },
  { key: 'PIS_0', label: 'Pister', base: 20 },
  { key: 'PLO_0', label: 'Plongée', base: 1 },
  { key: 'PRE_0', label: 'Premiers soins', base: 30 },
  { key: 'PSA_0', label: 'Psychanalyse', base: 1 },
  { key: 'PSO_0', label: 'Psychologie', base: 10 },
  { key: 'SAU_0', label: 'Sauter', base: 20 },
  { key: 'SCI_0', label: 'Sciences', base: 1 },
  { key: 'SUR_0', label: 'Survie', base: 10 },
  { key: 'TOC_0', label: 'Trouver Objet Caché', base: 25 }
] as const

const backgroundFields = [
  { key: 'Description', label: 'Description physique' },
  { key: 'ideologieEtCroyance', label: 'Idéologies et croyances' },
  { key: 'traits', label: 'Traits de personnalité' },
  { key: 'personnesImportantes', label: 'Personnes importantes' },
  { key: 'lieuxSignificatifs', label: 'Lieux significatifs' },
  { key: 'phobiesManies', label: 'Phobies et manies' },
  { key: 'bienPrécieux', label: 'Biens précieux' },
  { key: 'ouvragesOccultes', label: 'Ouvrages occultes' },
  { key: 'rencontresEntites', label: 'Rencontres avec des entités' },
  { key: 'sequellesCicatrices', label: 'Séquelles et cicatrices' }
] as const
</script>

<template>
  <main class="page-wrapper">

    <div class="page-header">
      <h1 class="page-title">{{ editId ? 'Modifier la fiche' : 'Nouvelle Fiche' }}</h1>
      <p class="page-subtitle">Création d'un investigateur — Appel de Cthulhu 7e édition</p>
    </div>

    <blockquote class="flavor-quote">
      <p>Nul homme sensé ne se lancerait dans cette enquête — mais la folie a ses propres vertus.</p>
      <cite>— Journal retrouvé à Arkham, sans date</cite>
    </blockquote>

    <form class="character-form" @submit.prevent="generatePdf">

      <!-- ── IDENTITÉ ─────────────────────────────────────── -->
      <section class="form-section">
        <h2 class="section-title">Identité</h2>
        <div class="identity-grid">
          <div class="field-group col-2">
            <label class="field-label" for="Nom">Nom de l'investigateur</label>
            <input id="Nom" v-model="form['Nom']" class="field-input" type="text" placeholder="Arkham, 1923…">
          </div>
          <div class="field-group col-2">
            <label class="field-label" for="Joueur">Nom du joueur</label>
            <input id="Joueur" v-model="form['Joueur']" class="field-input" type="text">
          </div>
          <div class="field-group col-2">
            <label class="field-label" for="Occupation">Profession</label>
            <input id="Occupation" v-model="form['Occupation']" class="field-input" type="text" placeholder="Détective, Médecin…">
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
        </div>
      </section>

      <!-- ── CARACTÉRISTIQUES ───────────────────────────────── -->
      <section class="form-section">
        <h2 class="section-title">Caractéristiques</h2>
        <p class="section-hint">Valeur principale — les ½ et ⅕ sont remplis automatiquement dans le PDF.</p>
        <div class="carac-table">
          <div class="carac-header">
            <span>Carac.</span>
            <span>Description</span>
            <span class="col-center">Valeur</span>
            <span class="col-center">½</span>
            <span class="col-center">⅕</span>
          </div>
          <div v-for="c in caracteristiques" :key="c.key" class="carac-row">
            <span class="carac-code">{{ c.label }}</span>
            <span class="carac-desc">{{ c.desc }}</span>
            <input v-model="form[c.key]" class="carac-input" type="number" min="0" max="100" placeholder="—">
            <span class="carac-derived">{{ half(form[c.key]) || '—' }}</span>
            <span class="carac-derived">{{ fifth(form[c.key]) || '—' }}</span>
          </div>
        </div>
      </section>

      <!-- ── STATS DÉRIVÉES ──────────────────────────────────── -->
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
            <span class="derived-label">Blessure grave</span>
            <span class="derived-value">{{ blessureGrave || '—' }}</span>
            <span class="derived-formula">PV ÷ 2</span>
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

      <!-- ── COMPÉTENCES ─────────────────────────────────────── -->
      <section class="form-section">
        <h2 class="section-title">Compétences</h2>
        <p class="section-hint">Valeur finale après répartition — les ½ et ⅕ sont calculés automatiquement.</p>
        <div class="comp-grid">
          <div v-for="c in competences" :key="c.key" class="comp-row">
            <span class="comp-name">{{ c.label }}</span>
            <span class="comp-base">{{ c.base }}%</span>
            <input v-model="form[c.key]" class="comp-input" type="number" min="0" max="100" :placeholder="String(c.base)">
          </div>
        </div>
      </section>

      <!-- ── COMPÉTENCES VARIABLES ───────────────────────────── -->
      <section class="form-section">
        <h2 class="section-title">Combat, Art, Langues, Sciences & Compétences personnelles</h2>
        <div class="variable-grid">
          <div class="variable-group">
            <h3 class="variable-subtitle">Art et métier</h3>
            <div v-for="i in [1,2,3]" :key="`ar${i}`" class="variable-row">
              <input v-model="form[`AR${i}_label`]" class="field-input label-input" type="text" placeholder="Spécialité…">
              <input v-model="form[`AR${i}_0`]" class="comp-input" type="number" min="0" max="100" placeholder="0">
            </div>
          </div>
          <div class="variable-group">
            <h3 class="variable-subtitle">Combat à distance (custom)</h3>
            <div v-for="i in [3,4]" :key="`cd${i}`" class="variable-row">
              <input v-model="form[`CD${i}_label`]" class="field-input label-input" type="text" placeholder="Arme…">
              <input v-model="form[`CD${i}_0`]" class="comp-input" type="number" min="0" max="100" placeholder="0">
            </div>
          </div>
          <div class="variable-group">
            <h3 class="variable-subtitle">Combat rapproché (custom)</h3>
            <div v-for="i in [2,3]" :key="`cr${i}`" class="variable-row">
              <input v-model="form[`CR${i}_label`]" class="field-input label-input" type="text" placeholder="Arme…">
              <input v-model="form[`CR${i}_0`]" class="comp-input" type="number" min="0" max="100" placeholder="0">
            </div>
          </div>
          <div class="variable-group">
            <h3 class="variable-subtitle">Langues étrangères</h3>
            <div v-for="i in [1,2,3]" :key="`lg${i}`" class="variable-row">
              <input v-model="form[`LG${i}_label`]" class="field-input label-input" type="text" placeholder="Langue…">
              <input v-model="form[`LG${i}_0`]" class="comp-input" type="number" min="0" max="100" placeholder="0">
            </div>
          </div>
          <div class="variable-group">
            <h3 class="variable-subtitle">Pilotage (custom)</h3>
            <div class="variable-row">
              <input v-model="form['PL1_label']" class="field-input label-input" type="text" placeholder="Véhicule…">
              <input v-model="form['PL1_0']" class="comp-input" type="number" min="0" max="100" placeholder="0">
            </div>
          </div>
          <div class="variable-group">
            <h3 class="variable-subtitle">Sciences</h3>
            <div v-for="i in [1,2,3]" :key="`sc${i}`" class="variable-row">
              <input v-model="form[`SC${i}_label`]" class="field-input label-input" type="text" placeholder="Spécialité…">
              <input v-model="form[`SC${i}_0`]" class="comp-input" type="number" min="0" max="100" placeholder="0">
            </div>
          </div>
          <div class="variable-group variable-group--full">
            <h3 class="variable-subtitle">Compétences personnelles</h3>
            <div class="variable-row-grid">
              <div v-for="i in [1,2,3,4,5]" :key="`cp${i}`" class="variable-row">
                <input v-model="form[`CP${i}_label`]" class="field-input label-input" type="text" placeholder="Compétence…">
                <input v-model="form[`CP${i}_0`]" class="comp-input" type="number" min="0" max="100" placeholder="0">
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ── BACKGROUND ──────────────────────────────────────── -->
      <section class="form-section">
        <h2 class="section-title">Histoire & Background</h2>
        <div class="background-grid">
          <div v-for="f in backgroundFields" :key="f.key" class="field-group">
            <label class="field-label" :for="f.key">{{ f.label }}</label>
            <textarea :id="f.key" v-model="form[f.key]" class="field-textarea" rows="2" />
          </div>
        </div>
      </section>

      <!-- ── FINANCES ────────────────────────────────────────── -->
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

      <!-- ── ERROR & SUBMIT ─────────────────────────────────── -->
      <div v-if="error" class="form-error">{{ error }}</div>

      <div v-if="savedSuccess" class="form-success">Fiche sauvegardée avec succès.</div>

      <div class="form-actions">
        <button
          type="button"
          class="btn-save"
          :disabled="isSaving || isLoading"
          @click="saveCharacter"
        >
          <span v-if="isSaving" class="btn-sigil">⬡</span>
          <span v-else>Sauvegarder</span>
        </button>
        <button
          type="submit"
          class="btn-generate"
          :disabled="isLoading || isSaving"
        >
          <span v-if="isLoading" class="btn-sigil">⬡</span>
          <span v-else>Générer la fiche PDF</span>
        </button>
      </div>

    </form>

  </main>
</template>

<style scoped>
.page-wrapper {
  padding: var(--space-xl);
  max-width: 960px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: var(--space-xl);
  padding-bottom: var(--space-lg);
  border-bottom: 1px solid var(--color-border);
  position: relative;
}
.page-header::after {
  content: '';
  position: absolute;
  bottom: -1px; left: 0;
  width: 80px; height: 1px;
  background: var(--color-arcane);
}
.page-title {
  font-family: var(--font-heading);
  font-size: 1.6rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  color: var(--color-text-primary);
  margin-bottom: var(--space-xs);
}
.page-subtitle {
  font-family: var(--font-flavor);
  font-style: italic;
  color: var(--color-text-secondary);
  font-size: 0.95rem;
}

.flavor-quote {
  background: var(--color-abyssal);
  border-left: 2px solid var(--color-arcane-dim);
  padding: var(--space-lg);
  margin-bottom: var(--space-xl);
  border-radius: 0 var(--radius-md) var(--radius-md) 0;
}
.flavor-quote p {
  font-family: var(--font-flavor);
  font-style: italic;
  font-size: 1.1rem;
  color: var(--color-text-secondary);
  line-height: 1.8;
}
.flavor-quote cite {
  display: block;
  margin-top: var(--space-sm);
  font-family: var(--font-heading);
  font-size: 0.7rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-text-muted);
}

/* ── SECTIONS ────────────────────────────────────────────── */
.character-form { display: flex; flex-direction: column; gap: var(--space-xl); }
.form-section {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-xl);
}
.section-title {
  font-family: var(--font-heading);
  font-size: 0.85rem;
  font-weight: bold;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--color-gold);
  margin-bottom: var(--space-lg);
  padding-bottom: var(--space-sm);
  border-bottom: 1px solid var(--color-border);
}
.section-hint {
  font-family: var(--font-flavor);
  font-style: italic;
  font-size: 0.9rem;
  color: var(--color-text-muted);
  margin-bottom: var(--space-lg);
}

/* ── IDENTITY ────────────────────────────────────────────── */
.identity-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-md);
}
.col-2 { grid-column: span 1; }
.field-group { display: flex; flex-direction: column; gap: var(--space-xs); }
.field-label {
  font-family: var(--font-heading);
  font-size: 0.7rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-text-muted);
}
.required { color: var(--color-crimson); }
.field-input, .field-textarea {
  background: var(--color-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-sm) var(--space-md);
  color: var(--color-text-primary);
  font-family: var(--font-body);
  font-size: 1rem;
  outline: none;
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
  width: 100%;
}
.field-textarea { resize: vertical; }
.field-input::placeholder, .field-textarea::placeholder { color: var(--color-text-muted); font-style: italic; }
.field-input:focus, .field-textarea:focus {
  border-color: var(--color-arcane-dim);
  box-shadow: var(--shadow-glow);
}

/* ── CARACTÉRISTIQUES ────────────────────────────────────── */
.carac-table { border: 1px solid var(--color-border); border-radius: var(--radius-md); overflow: hidden; }
.carac-header, .carac-row {
  display: grid;
  grid-template-columns: 60px 1fr 90px 60px 60px;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-sm) var(--space-md);
}
.carac-header {
  background: var(--color-elevated);
  font-family: var(--font-heading);
  font-size: 0.65rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--color-text-muted);
  border-bottom: 1px solid var(--color-border);
}
.col-center { text-align: center; }
.carac-row { border-bottom: 1px solid var(--color-border); }
.carac-row:last-child { border-bottom: none; }
.carac-row:nth-child(even) { background: var(--color-deep); }
.carac-code { font-family: var(--font-heading); font-size: 0.85rem; font-weight: bold; letter-spacing: 0.1em; color: var(--color-gold); }
.carac-desc { font-family: var(--font-flavor); font-style: italic; font-size: 0.95rem; color: var(--color-text-secondary); }
.carac-input {
  background: var(--color-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: var(--space-xs) var(--space-sm);
  color: var(--color-arcane);
  font-family: var(--font-heading);
  font-size: 1rem; font-weight: bold;
  text-align: center; width: 100%; outline: none;
  transition: border-color var(--transition-fast);
}
.carac-input::-webkit-inner-spin-button { display: none; }
.carac-input:focus { border-color: var(--color-arcane-dim); }
.carac-derived { font-family: var(--font-heading); font-size: 0.85rem; color: var(--color-text-muted); text-align: center; }

/* ── STATS DÉRIVÉES ──────────────────────────────────────── */
.derived-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: var(--space-md); }
.derived-card {
  background: var(--color-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-md);
  text-align: center;
  display: flex; flex-direction: column; gap: var(--space-xs);
}
.derived-label { font-family: var(--font-heading); font-size: 0.65rem; letter-spacing: 0.12em; text-transform: uppercase; color: var(--color-text-muted); }
.derived-value { font-family: var(--font-display); font-size: 1.8rem; color: var(--color-arcane); line-height: 1; }
.derived-value--text { font-size: 1.2rem; }
.derived-formula { font-family: var(--font-flavor); font-style: italic; font-size: 0.75rem; color: var(--color-text-muted); }

/* ── COMPÉTENCES ─────────────────────────────────────────── */
.comp-grid {
  display: grid; grid-template-columns: repeat(2, 1fr);
  border: 1px solid var(--color-border); border-radius: var(--radius-md); overflow: hidden;
}
.comp-row {
  display: grid; grid-template-columns: 1fr 42px 70px;
  align-items: center; gap: var(--space-sm);
  padding: var(--space-xs) var(--space-md);
  border-bottom: 1px solid var(--color-border);
  border-right: 1px solid var(--color-border);
}
.comp-row:nth-child(even) { background: var(--color-deep); }
.comp-name { font-family: var(--font-heading); font-size: 0.8rem; letter-spacing: 0.03em; color: var(--color-text-primary); }
.comp-base { font-family: var(--font-heading); font-size: 0.7rem; color: var(--color-text-muted); text-align: right; }
.comp-input {
  background: var(--color-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: 2px var(--space-xs);
  color: var(--color-arcane);
  font-family: var(--font-heading);
  font-size: 0.9rem; font-weight: bold;
  text-align: center; width: 100%; outline: none;
  transition: border-color var(--transition-fast);
}
.comp-input::-webkit-inner-spin-button { display: none; }
.comp-input:focus { border-color: var(--color-arcane-dim); }

/* ── VARIABLE SKILLS ─────────────────────────────────────── */
.variable-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-xl); }
.variable-group--full { grid-column: span 2; }
.variable-subtitle {
  font-family: var(--font-heading);
  font-size: 0.7rem; letter-spacing: 0.12em; text-transform: uppercase;
  color: var(--color-text-muted);
  margin-bottom: var(--space-md);
}
.variable-row { display: grid; grid-template-columns: 1fr 70px; gap: var(--space-sm); margin-bottom: var(--space-sm); }
.label-input { font-size: 0.9rem; }
.variable-row-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--space-sm) var(--space-xl); }

/* ── BACKGROUND ──────────────────────────────────────────── */
.background-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-md); }

/* ── ERROR / SUCCESS ─────────────────────────────────────── */
.form-error {
  background: rgba(139, 58, 58, 0.12);
  border: 1px solid var(--color-crimson-dim);
  border-radius: var(--radius-md);
  padding: var(--space-md) var(--space-lg);
  color: #c47070;
  font-family: var(--font-flavor);
  font-style: italic;
}
.form-success {
  background: rgba(127, 179, 138, 0.1);
  border: 1px solid var(--color-arcane-dim);
  border-radius: var(--radius-md);
  padding: var(--space-md) var(--space-lg);
  color: var(--color-arcane);
  font-family: var(--font-flavor);
  font-style: italic;
}

/* ── SUBMIT ──────────────────────────────────────────────── */
.form-actions { display: flex; justify-content: center; gap: var(--space-md); flex-wrap: wrap; }
.btn-save {
  font-family: var(--font-heading);
  font-size: 0.85rem; font-weight: bold;
  letter-spacing: 0.18em; text-transform: uppercase;
  color: var(--color-arcane);
  background: transparent;
  border: 1px solid var(--color-arcane-dim);
  border-radius: var(--radius-md);
  padding: var(--space-md) var(--space-2xl);
  cursor: pointer; min-width: 200px;
  transition: all var(--transition-fast);
}
.btn-save:hover:not(:disabled) { background: var(--color-arcane-glow); }
.btn-save:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-generate {
  font-family: var(--font-heading);
  font-size: 0.85rem; font-weight: bold;
  letter-spacing: 0.18em; text-transform: uppercase;
  color: var(--color-deep);
  background: var(--color-arcane);
  border: none; border-radius: var(--radius-md);
  padding: var(--space-md) var(--space-2xl);
  cursor: pointer; min-width: 220px;
  transition: opacity var(--transition-fast), box-shadow var(--transition-fast);
}
.btn-generate:hover:not(:disabled) { opacity: 0.85; box-shadow: var(--shadow-glow); }
.btn-generate:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-sigil { display: inline-block; animation: pulse-sigil 1s ease-in-out infinite; font-size: 1.2rem; }
@keyframes pulse-sigil { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; } }

/* ── RESPONSIVE ──────────────────────────────────────────── */
@media (max-width: 700px) {
  .page-wrapper { padding: var(--space-md); }
  .identity-grid { grid-template-columns: 1fr; }
  .derived-grid { grid-template-columns: repeat(4, 1fr); }
  .carac-header, .carac-row { grid-template-columns: 50px 1fr 70px 50px 50px; }
  .comp-grid { grid-template-columns: 1fr; }
  .comp-row { border-right: none; }
  .variable-grid { grid-template-columns: 1fr; }
  .variable-group--full { grid-column: span 1; }
  .variable-row-grid { grid-template-columns: 1fr; }
  .background-grid { grid-template-columns: 1fr; }
}
</style>
