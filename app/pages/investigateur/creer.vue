<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

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
  CHA_0: '', DIS_0: '', DRO_0: '', ECO_0: '', ELE_0: '',
  EQU_0: '', ESQ_0: '', EST_0: '', GRI_0: '', HIS_0: '',
  IPO_0: '', ITI_0: '', LAN_0: '', MEC_0: '', MED_0: '',
  MYT_0: '', NAG_0: '', NAT_0: '', OCC_0: '', ORI_0: '',
  PER_0: '', PIL_0: '', PIC_0: '', PIS_0: '', PLO_0: '',
  PRE_0: '', PSA_0: '', PSO_0: '', SAU_0: '', SCI_0: '',
  SUR_0: '', TOC_0: '',
  // Langues
  LG1_label: '', LG1_0: '', LG2_label: '', LG2_0: '', LG3_label: '', LG3_0: '',
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
  const v = n(form['POU_0']) * 5
  return v > 0 ? String(v) : ''
})

// Synchronise les dérivées calculées dans form pour l'envoi
watchEffect(() => {
  if (pv_max.value) form['pv_max'] = pv_max.value
  if (pm_max.value) form['pm_max'] = pm_max.value
  if (sm_initial.value) form['sm_initial'] = sm_initial.value
})

const isLoading = ref(false)
const error = ref<string | null>(null)

async function generatePdf() {
  if (!form['Nom']?.trim()) { error.value = 'Le nom de l\'investigateur est requis.'; return }
  error.value = null
  isLoading.value = true
  try {
    const { url } = await $fetch<{ url: string }>('/api/investigateur/generate-pdf', {
      method: 'POST',
      body: form
    })
    // Déclencher le téléchargement depuis l'URL Supabase signée
    const a = document.createElement('a')
    a.href = url
    a.download = `fiche_${form['Nom'] || 'investigateur'}.pdf`
    a.click()
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
  { key: 'ART_0', label: 'Art / Artisanat', base: 5 },
  { key: 'BAR_0', label: 'Baratin', base: 5 },
  { key: 'BIB_0', label: 'Bibliothèque', base: 20 },
  { key: 'CHA_0', label: 'Charme', base: 15 },
  { key: 'DIS_0', label: 'Discrétion', base: 20 },
  { key: 'DRO_0', label: 'Droit', base: 5 },
  { key: 'ECO_0', label: 'Écoute', base: 20 },
  { key: 'ELE_0', label: 'Électronique', base: 1 },
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
  { key: 'NAG_0', label: 'Navigation', base: 1 },
  { key: 'NAT_0', label: 'Natation', base: 20 },
  { key: 'OCC_0', label: 'Occultisme', base: 5 },
  { key: 'ORI_0', label: 'Orientation', base: 10 },
  { key: 'PER_0', label: 'Persuasion', base: 10 },
  { key: 'PIL_0', label: 'Pilotage', base: 1 },
  { key: 'PIC_0', label: 'Pistage', base: 10 },
  { key: 'PIS_0', label: 'Pistolet', base: 20 },
  { key: 'PLO_0', label: 'Plongée', base: 1 },
  { key: 'PRE_0', label: 'Premier secours', base: 30 },
  { key: 'PSA_0', label: 'Psychanalyse', base: 1 },
  { key: 'PSO_0', label: 'Psychologie', base: 10 },
  { key: 'SAU_0', label: 'Saut', base: 20 },
  { key: 'SCI_0', label: 'Sciences', base: 1 },
  { key: 'SUR_0', label: 'Survie', base: 10 },
  { key: 'TOC_0', label: 'Toucher', base: 25 }
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
      <h1 class="page-title">Nouvelle Fiche</h1>
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
            <label class="field-label" for="Nom">Nom de l'investigateur <span class="required">*</span></label>
            <input id="Nom" v-model="form['Nom']" class="field-input" type="text" placeholder="Arkham, 1923…" required>
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
            <span class="derived-formula">POU × 5</span>
          </div>
          <div class="derived-card derived-input-card">
            <label class="derived-label" for="BlessureGrave">Blessure grave</label>
            <input id="BlessureGrave" v-model="form['BlessureGrave']" class="derived-input" type="number" min="0" placeholder="—">
            <span class="derived-formula">PV ÷ 2</span>
          </div>
          <div class="derived-card derived-input-card">
            <label class="derived-label" for="impact">Impact</label>
            <input id="impact" v-model="form['impact']" class="derived-input" type="text" placeholder="ex: +1D4">
            <span class="derived-formula">FOR + TAI</span>
          </div>
          <div class="derived-card derived-input-card">
            <label class="derived-label" for="carrure">Carrure</label>
            <input id="carrure" v-model="form['carrure']" class="derived-input" type="number" placeholder="—">
            <span class="derived-formula">FOR + TAI</span>
          </div>
          <div class="derived-card derived-input-card">
            <label class="derived-label" for="MVT">Mouvement</label>
            <input id="MVT" v-model="form['MVT']" class="derived-input" type="number" min="1" placeholder="8">
            <span class="derived-formula">DEX / FOR / TAI</span>
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
        <h2 class="section-title">Langues, Sciences & Compétences personnelles</h2>
        <div class="variable-grid">
          <div class="variable-group">
            <h3 class="variable-subtitle">Langues étrangères</h3>
            <div v-for="i in [1,2,3]" :key="`lg${i}`" class="variable-row">
              <input v-model="form[`LG${i}_label`]" class="field-input label-input" type="text" placeholder="Langue…">
              <input v-model="form[`LG${i}_0`]" class="comp-input" type="number" min="0" max="100" placeholder="0">
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
      <div v-if="error" class="form-error">
        {{ error }}
      </div>

      <div class="form-actions">
        <button type="submit" class="btn-generate" :class="{ loading: isLoading }" :disabled="isLoading">
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
.derived-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--space-md); }
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
.derived-formula { font-family: var(--font-flavor); font-style: italic; font-size: 0.75rem; color: var(--color-text-muted); }
.derived-input-card .derived-value { display: none; }
.derived-input {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: var(--space-xs) var(--space-sm);
  color: var(--color-arcane);
  font-family: var(--font-display);
  font-size: 1.2rem;
  text-align: center; width: 100%; outline: none;
  transition: border-color var(--transition-fast);
}
.derived-input::-webkit-inner-spin-button { display: none; }
.derived-input:focus { border-color: var(--color-arcane-dim); }

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

/* ── ERROR ───────────────────────────────────────────────── */
.form-error {
  background: rgba(139, 58, 58, 0.12);
  border: 1px solid var(--color-crimson-dim);
  border-radius: var(--radius-md);
  padding: var(--space-md) var(--space-lg);
  color: #c47070;
  font-family: var(--font-flavor);
  font-style: italic;
}

/* ── SUBMIT ──────────────────────────────────────────────── */
.form-actions { display: flex; justify-content: center; }
.btn-generate {
  font-family: var(--font-heading);
  font-size: 0.85rem; font-weight: bold;
  letter-spacing: 0.18em; text-transform: uppercase;
  color: var(--color-deep);
  background: var(--color-arcane);
  border: none; border-radius: var(--radius-md);
  padding: var(--space-md) var(--space-2xl);
  cursor: pointer; min-width: 280px;
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
  .derived-grid { grid-template-columns: repeat(2, 1fr); }
  .carac-header, .carac-row { grid-template-columns: 50px 1fr 70px 50px 50px; }
  .comp-grid { grid-template-columns: 1fr; }
  .comp-row { border-right: none; }
  .variable-grid { grid-template-columns: 1fr; }
  .variable-group--full { grid-column: span 1; }
  .variable-row-grid { grid-template-columns: 1fr; }
  .background-grid { grid-template-columns: 1fr; }
}
</style>
