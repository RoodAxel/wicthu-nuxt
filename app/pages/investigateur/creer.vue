<script setup lang="ts">
import type { OccupationListItem, OccupationDetail } from '~/types/investigateur'

definePageMeta({ middleware: 'auth' })

// ── ÉTAT OCCUPATION ──────────────────────────────────────────────────────────

const { data: occupationList } = useFetch<OccupationListItem[]>('/api/occupation')
const selectedOccupationId = ref<number | null>(null)
const occupationDetail = ref<OccupationDetail | null>(null)

// ── MAPPING COMPÉTENCES DB → CLÉS FORMULAIRE ─────────────────────────────────

const SKILL_TO_FORM_KEYS: Record<string, string[]> = {
  'Anthropologie': ['ANT_0'],
  'Archéologie': ['ARC_0'],
  'Arts et métiers': ['ART_0', 'AR1_0', 'AR2_0', 'AR3_0'],
  'Baratin': ['BAR_0'],
  'Bibliothèque': ['BIB_0'],
  'Charme': ['CHA_0'],
  'Combat à distance': ['CD1_0', 'CD2_0', 'CD3_0', 'CD4_0'],
  'Combat rapproché': ['CR1_0', 'CR2_0', 'CR3_0'],
  'Comptabilité': ['COM_0'],
  'Conduite': ['COD_0'],
  'Conduite engin lourd': ['CEL_0'],
  'Crédit': ['CRE_0'],
  'Crochetage': ['CRE_0'],
  'Discrétion': ['DIS_0'],
  'Droit': ['DRO_0'],
  'Écouter': ['ECO_0'],
  'Électricité': ['ELE_0'],
  'Équitation': ['EQU_0'],
  'Esquive': ['ESQ_0'],
  'Estimation': ['EST_0'],
  'Grimper': ['GRI_0'],
  'Histoire': ['HIS_0'],
  'Imposture': ['IPO_0'],
  'Intimidation': ['ITI_0'],
  'Langue maternelle': ['LAG_0'],
  'Langues': ['LG1_0', 'LG2_0', 'LG3_0'],
  'Mécanique': ['MEC_0'],
  'Médecine': ['MED_0'],
  'Mythe de Cthulhu': ['MYT_0'],
  'Nager': ['NAG_0'],
  'Naturalisme': ['NAT_0'],
  'Occultisme': ['OCC_0'],
  'Orientation': ['ORI_0'],
  'Persuasion': ['PER_0'],
  'Pickpocket': ['PIC_0'],
  'Pilotage': ['PIL_0', 'PL1_0'],
  'Pister': ['PIS_0'],
  'Plongée': ['PLO_0'],
  'Premiers soins': ['PRE_0'],
  'Psychanalyse': ['PSA_0'],
  'Psychologie': ['PSO_0'],
  'Sauter': ['SAU_0'],
  'Sciences': ['SCI_0', 'SC1_0', 'SC2_0', 'SC3_0'],
  'Survie': ['SUR_0'],
  'Trouver Objet Caché': ['TOC_0']
}

// ── Spécialité → clé principale du formulaire (pour les spéc. avec slot fixe) ──
const SPEC_TO_KEY: Record<string, string> = {
  'Corps à corps': 'CR1_0',
  'Armes de poing': 'CD1_0',
  'Fusils': 'CD2_0',
}

// ── Catégorie → slots variables (valueKey, labelKey) ─────────────────────────
const CAT_TO_VAR: Record<string, { slots: string[]; labels: string[] }> = {
  'Arts et métiers':  { slots: ['AR1_0','AR2_0','AR3_0'], labels: ['AR1_label','AR2_label','AR3_label'] },
  'Combat à distance':{ slots: ['CD3_0','CD4_0'],         labels: ['CD3_label','CD4_label'] },
  'Combat rapproché': { slots: ['CR2_0','CR3_0'],         labels: ['CR2_label','CR3_label'] },
  'Langues':          { slots: ['LG1_0','LG2_0','LG3_0'], labels: ['LG1_label','LG2_label','LG3_label'] },
  'Pilotage':         { slots: ['PL1_0'],                  labels: ['PL1_label'] },
  'Sciences':         { slots: ['SC1_0','SC2_0','SC3_0'], labels: ['SC1_label','SC2_label','SC3_label'] },
  'Survie':           { slots: [],                         labels: [] },
}

// ── État des sélections ────────────────────────────────────────────────────────
const choiceSelections    = ref<Record<number, string[]>>({}) // CHOICE_FROM_LIST
const freeSpecSelections  = ref<Record<number, string>>({})   // FREE_SPEC: idx → specName
const freeChoiceSelections= ref<Record<number, string[]>>({}) // FREE_CHOICE: idx → names
// Sous-sélection lorsqu'une option CHOICE_FROM_LIST est une catégorie : `${i}_${slot}` → specName
const catSubSelections    = ref<Record<string, string>>({})

// ── Pickers unifiés (tout type sauf FIXED) ────────────────────────────────────
type PickerBase = { i: number }
type FixedSpecPicker   = PickerBase & { type: 'FIXED_SPEC'; label: string }
type FreeSpecPicker    = PickerBase & { type: 'FREE_SPEC';  catName: string; children: { id: number; name: string }[] }
type ChoiceListPicker  = PickerBase & { type: 'CHOICE_FROM_LIST'; count: number; note: string | null; options: OccupationSkill['options'] }
type FreeChoicePicker  = PickerBase & { type: 'FREE_CHOICE'; count: number; note: string | null }
type OccPicker = FixedSpecPicker | FreeSpecPicker | ChoiceListPicker | FreeChoicePicker

const occSkillPickers = computed((): OccPicker[] => {
  if (!occupationDetail.value) return []
  return occupationDetail.value.skills.flatMap((skill, i): OccPicker[] => {
    if (skill.type === 'FIXED') return []
    if (skill.type === 'FIXED_SPEC')
      return [{ i, type: 'FIXED_SPEC', label: `${skill.specName ?? '?'} (${skill.competence?.name ?? ''})` }]
    if (skill.type === 'FREE_SPEC')
      return [{ i, type: 'FREE_SPEC', catName: skill.competence?.name ?? '?', children: skill.competence?.children ?? [] }]
    if (skill.type === 'CHOICE_FROM_LIST')
      return [{ i, type: 'CHOICE_FROM_LIST', count: skill.choiceCount ?? 1, note: skill.note, options: skill.options }]
    if (skill.type === 'FREE_CHOICE')
      return [{ i, type: 'FREE_CHOICE', count: skill.choiceCount ?? 1, note: skill.note }]
    return []
  })
})

// Options pour FREE_CHOICE : compétences non-catégorie du formulaire principal
const freeChoiceOptions = computed(() =>
  competences.filter(c => !CATEGORY_KEYS.has(c.key)).map(c => c.label)
)

// ── Calcul des clés dorées et vertes ──────────────────────────────────────────

// FIXED_SPEC → clés grille principale
const fixedSpecKeys = computed((): Set<string> => {
  const keys = new Set<string>()
  if (!occupationDetail.value) return keys
  for (const skill of occupationDetail.value.skills) {
    if (skill.type === 'FIXED_SPEC' && skill.specName) {
      const k = SPEC_TO_KEY[skill.specName]
      if (k) keys.add(k)
    }
  }
  return keys
})

// FREE_SPEC → clés grille principale (spec choisie par joueur)
const freeSpecMainKeys = computed((): Set<string> => {
  const keys = new Set<string>()
  if (!occupationDetail.value) return keys
  occupationDetail.value.skills.forEach((skill, i) => {
    if (skill.type !== 'FREE_SPEC') return
    const k = SPEC_TO_KEY[freeSpecSelections.value[i] ?? '']
    if (k) keys.add(k)
  })
  return keys
})

// CHOICE_FROM_LIST → clés grille principale des options choisies
const selectedChoiceKeys = computed((): Set<string> => {
  const keys = new Set<string>()
  if (!occupationDetail.value) return keys
  occupationDetail.value.skills.forEach((skill, i) => {
    if (skill.type !== 'CHOICE_FROM_LIST') return
    ;(choiceSelections.value[i] ?? []).filter(Boolean).forEach((name, slot) => {
      const opt = skill.options.find(o => o.competence.name === name)
      if (opt?.competence.isCategory) {
        // Option catégorie : utiliser la sous-sélection
        const sub = catSubSelections.value[`${i}_${slot}`]
        if (sub) { const k = SPEC_TO_KEY[sub]; if (k) keys.add(k) }
      } else {
        ;(SKILL_TO_FORM_KEYS[name] ?? []).forEach(k => keys.add(k))
      }
    })
  })
  return keys
})

// FREE_CHOICE → clés grille principale
const freeChoiceMainKeys = computed((): Set<string> => {
  const keys = new Set<string>()
  if (!occupationDetail.value) return keys
  occupationDetail.value.skills.forEach((skill, i) => {
    if (skill.type !== 'FREE_CHOICE') return
    ;(freeChoiceSelections.value[i] ?? []).filter(Boolean).forEach(name =>
      (SKILL_TO_FORM_KEYS[name] ?? []).slice(0, 1).forEach(k => keys.add(k))
    )
  })
  return keys
})

// Slots variables assignés par l'occupation (FIXED_SPEC, FREE_SPEC, sous-sélections catégories)
const occupationVarSlots = computed((): Record<string, { spec: string; locked: boolean }> => {
  const result: Record<string, { spec: string; locked: boolean }> = {}
  if (!occupationDetail.value) return result
  const used: Record<string, number> = {}
  const assign = (catName: string, spec: string, locked: boolean) => {
    const catVar = CAT_TO_VAR[catName]
    if (!catVar) return
    const idx = used[catName] ?? 0
    if (idx >= catVar.labels.length) return
    result[catVar.labels[idx]] = { spec, locked }
    used[catName] = idx + 1
  }
  for (const [i, skill] of occupationDetail.value.skills.entries()) {
    if (skill.type === 'FIXED_SPEC' && skill.specName && skill.competence && !SPEC_TO_KEY[skill.specName])
      assign(skill.competence.name, skill.specName, true)
    if (skill.type === 'FREE_SPEC' && skill.competence) {
      const chosen = freeSpecSelections.value[i]
      if (chosen && !SPEC_TO_KEY[chosen]) assign(skill.competence.name, chosen, false)
    }
    if (skill.type === 'CHOICE_FROM_LIST') {
      ;(choiceSelections.value[i] ?? []).filter(Boolean).forEach((name, slot) => {
        const opt = skill.options.find(o => o.competence.name === name)
        if (!opt?.competence.isCategory) return
        const sub = catSubSelections.value[`${i}_${slot}`]
        if (sub && !SPEC_TO_KEY[sub]) assign(name, sub, false)
      })
    }
  }
  return result
})

// Synchronise les labels des slots variables
watch(occupationVarSlots, (slots) => {
  for (const [labelKey, { spec }] of Object.entries(slots)) {
    if (!form[labelKey]) form[labelKey] = spec
  }
}, { deep: true })

// fixedKeys : or = FIXED + FIXED_SPEC + selections FREE_SPEC/CHOICE/FREE_CHOICE + slots variables
const fixedKeys = computed((): Set<string> => {
  const keys = new Set<string>(['CRE_0'])
  if (!occupationDetail.value) return keys
  for (const skill of occupationDetail.value.skills)
    if (skill.type === 'FIXED' && skill.competence)
      (SKILL_TO_FORM_KEYS[skill.competence.name] ?? []).forEach(k => keys.add(k))
  fixedSpecKeys.value.forEach(k => keys.add(k))
  freeSpecMainKeys.value.forEach(k => keys.add(k))
  selectedChoiceKeys.value.forEach(k => keys.add(k))
  freeChoiceMainKeys.value.forEach(k => keys.add(k))
  // Slots variables → leurs clés valeur passent en or
  for (const labelKey of Object.keys(occupationVarSlots.value)) {
    const valueKey = labelKey.replace('_label', '_0')
    keys.add(valueKey)
  }
  return keys
})

// choiceKeys : vert = options CHOICE_FROM_LIST non sélectionnées (non-catégorie)
const choiceKeys = computed((): Set<string> => {
  const keys = new Set<string>()
  if (!occupationDetail.value) return keys
  for (const picker of occSkillPickers.value) {
    if (picker.type !== 'CHOICE_FROM_LIST') continue
    const selected = new Set((choiceSelections.value[picker.i] ?? []).filter(Boolean))
    for (const opt of picker.options) {
      if (!opt.competence.isCategory && !selected.has(opt.competence.name))
        (SKILL_TO_FORM_KEYS[opt.competence.name] ?? []).forEach(k => keys.add(k))
    }
  }
  fixedKeys.value.forEach(k => keys.delete(k))
  return keys
})

const highlightedKeys = computed((): Set<string> => new Set([...fixedKeys.value, ...choiceKeys.value]))

function isGroupHighlighted(...keys: string[]) { return keys.some(k => fixedKeys.value.has(k)) }
function isGroupChoice(...keys: string[]) {
  return !isGroupHighlighted(...keys) && keys.some(k => choiceKeys.value.has(k))
}

// ── Fonctions de mise à jour ───────────────────────────────────────────────────
function updateChoice(idx: number, slot: number, value: string) {
  const picker = occSkillPickers.value.find(p => p.i === idx && p.type === 'CHOICE_FROM_LIST') as ChoiceListPicker | undefined
  const count = picker?.count ?? 1
  const current = [...(choiceSelections.value[idx] ?? Array(count).fill(''))]
  while (current.length < count) current.push('')
  current[slot] = value
  // Effacer la sous-sélection si l'option principale change
  const catKey = `${idx}_${slot}`
  if (catSubSelections.value[catKey]) {
    const next = { ...catSubSelections.value }; delete next[catKey]
    catSubSelections.value = next
  }
  choiceSelections.value = { ...choiceSelections.value, [idx]: current }
}
function updateCatSub(idx: number, slot: number, value: string) {
  catSubSelections.value = { ...catSubSelections.value, [`${idx}_${slot}`]: value }
}
function updateFreeSpec(idx: number, value: string) {
  freeSpecSelections.value = { ...freeSpecSelections.value, [idx]: value }
}
function updateFreeChoice(idx: number, slot: number, value: string, count: number) {
  const current = [...(freeChoiceSelections.value[idx] ?? Array(count).fill(''))]
  while (current.length < count) current.push('')
  current[slot] = value
  freeChoiceSelections.value = { ...freeChoiceSelections.value, [idx]: current }
}

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
  // Chance
  Chance: '',
  // Stats dérivées
  pv_max: '', pm_max: '', sm_initial: '', impact: '', carrure: '',
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
  // Armes
  Arm1_ORD: '', Arm1_MAJ: '', Arm1_EXT: '', Arm1_PORT: 'Allonge', Arm1_CAP: '', Arm1_PANN: '',
  ARM2: '', Arm2_ORD: '', Arm2_MAJ: '', Arm2_EXT: '', Arm2_DEG: '', Arm2_PORT: '', Arm2_CAD: '', Arm2_CAP: '', Arm2_PANN: '',
  ARM3: '', Arm3_ORD: '', Arm3_MAJ: '', Arm3_EXT: '', Arm3_DEG: '', Arm3_PORT: '', Arm3_CAD: '', Arm3_CAP: '', Arm3_PANN: '',
  ARM4: '', Arm4_ORD: '', Arm4_MAJ: '', Arm4_EXT: '', Arm4_DEG: '', Arm4_PORT: '', Arm4_CAD: '', Arm4_CAP: '', Arm4_PANN: '',
  ARM5: '', Arm5_ORD: '', Arm5_MAJ: '', Arm5_EXT: '', Arm5_DEG: '', Arm5_PORT: '', Arm5_CAD: '', Arm5_CAP: '', Arm5_PANN: '',
  // Background
  Description: '', ideologieEtCroyance: '', traits: '',
  personnesImportantes: '', sequellesCicatrices: '', lieuxSignificatifs: '',
  phobiesManies: '', 'bienPrécieux': '', ouvragesOccultes: '', rencontresEntites: '',
  // Finances
  capital: '', depencesCourantes: '', 'Espèces': '',
  // Équipement
  EQUIP1: '', EQUIP2: '', EQUIP3: '', EQUIP4: '', EQUIP5: '', EQUIP6: '',
  EQUIP7: '', EQUIP8: '', EQUIP9: '', EQUIP10: '', EQUIP11: '', EQUIP12: ''
})

function n(val: string | undefined) {
  return Number(val) || 0
}
function half(val: string | undefined) {
  const v = Math.floor(n(val) / 2)
  return v > 0 ? String(v) : ''
}
function fifth(val: string | undefined) {
  const v = Math.floor(n(val) / 5)
  return v > 0 ? String(v) : ''
}

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

// ── RICHESSE DÉRIVÉE DU CRÉDIT ───────────────────────────────────────────────

function fmtMoney(v: number): string {
  return Math.round(v).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' $'
}

const creditWealth = computed(() => {
  const cr = n(form['CRE_0'])
  if (cr === 0 && !form['CRE_0']) return null
  const modern = occupationDetail.value?.is_modern ?? false
  if (modern) {
    if (cr <= 0)  return { tranche: 'Indigent',    especes: '10 $',                capital: 'Aucun',                           depenses: '10 $' }
    if (cr <= 9)  return { tranche: 'Pauvre',      especes: fmtMoney(cr * 20),     capital: fmtMoney(cr * 200),                depenses: '40 $' }
    if (cr <= 49) return { tranche: 'Moyen',       especes: fmtMoney(cr * 40),     capital: fmtMoney(cr * 1000),               depenses: '200 $' }
    if (cr <= 89) return { tranche: 'Aisé',        especes: fmtMoney(cr * 100),    capital: fmtMoney(cr * 10000),              depenses: '1 000 $' }
    if (cr <= 98) return { tranche: 'Riche',       especes: fmtMoney(cr * 400),    capital: fmtMoney(cr * 40000),              depenses: '5 000 $' }
    return { tranche: 'Richissime', especes: '1 000 000 $', capital: '100 000 000 $ ou plus', depenses: '100 000 $' }
  } else {
    if (cr <= 0)  return { tranche: 'Indigent',    especes: '0,50 $',              capital: 'Aucun',                           depenses: '0,50 $' }
    if (cr <= 9)  return { tranche: 'Pauvre',      especes: fmtMoney(cr),          capital: fmtMoney(cr * 10),                 depenses: '2 $' }
    if (cr <= 49) return { tranche: 'Moyen',       especes: fmtMoney(cr * 2),      capital: fmtMoney(cr * 50),                 depenses: '10 $' }
    if (cr <= 89) return { tranche: 'Aisé',        especes: fmtMoney(cr * 5),      capital: fmtMoney(cr * 500),                depenses: '50 $' }
    if (cr <= 98) return { tranche: 'Riche',       especes: fmtMoney(cr * 20),     capital: fmtMoney(cr * 2000),               depenses: '250 $' }
    return { tranche: 'Richissime', especes: '50 000 $', capital: '5 000 000 $ ou plus', depenses: '5 000 $' }
  }
})

// ── ÂGE & MODIFICATEURS ──────────────────────────────────────────────────────

type AgeCat = {
  label: string
  range: string
  eduTests: number
  eduYouthMalus: boolean
  physMalus: number
  physStats: string[]
  appMalus: number
}

const ageCategory = computed((): AgeCat | null => {
  const age = Number(form['age']) || 0
  if (age < 15 || age > 89) return null
  if (age <= 19) return { label: 'Jeunesse', range: '15–19', eduTests: 0, eduYouthMalus: true, physMalus: 5, physStats: ['FOR', 'TAI'], appMalus: 0 }
  if (age <= 39) return { label: 'Adulte', range: '20–39', eduTests: 1, eduYouthMalus: false, physMalus: 0, physStats: [], appMalus: 0 }
  if (age <= 49) return { label: 'Maturité', range: '40–49', eduTests: 2, eduYouthMalus: false, physMalus: 5, physStats: ['FOR', 'CON', 'DEX'], appMalus: 5 }
  if (age <= 59) return { label: 'Âge mûr', range: '50–59', eduTests: 3, eduYouthMalus: false, physMalus: 10, physStats: ['FOR', 'CON', 'DEX'], appMalus: 10 }
  if (age <= 69) return { label: 'Sénior', range: '60–69', eduTests: 4, eduYouthMalus: false, physMalus: 20, physStats: ['FOR', 'CON', 'DEX'], appMalus: 15 }
  if (age <= 79) return { label: 'Vieillesse', range: '70–79', eduTests: 4, eduYouthMalus: false, physMalus: 40, physStats: ['FOR', 'CON', 'DEX'], appMalus: 20 }
  return { label: 'Grand âge', range: '80–89', eduTests: 4, eduYouthMalus: false, physMalus: 80, physStats: ['FOR', 'CON', 'DEX'], appMalus: 25 }
})

type EduTestResult = { index: number, roll: number, threshold: number, success: boolean, bonus: number }
const eduTestResults = ref<EduTestResult[]>([])

watch(() => form['age'], () => {
  eduTestResults.value = []
})

function rollEduTests() {
  const cat = ageCategory.value
  if (!cat || cat.eduTests === 0) return
  const results: EduTestResult[] = []
  let runningEdu = n(form['EDU_0'])
  for (let i = 0; i < cat.eduTests; i++) {
    const roll = Math.floor(Math.random() * 100) + 1
    const success = roll > runningEdu
    const bonus = success ? Math.floor(Math.random() * 10) + 1 : 0
    results.push({ index: i + 1, roll, threshold: runningEdu, success, bonus })
    if (success) runningEdu = Math.min(99, runningEdu + bonus)
  }
  eduTestResults.value = results
}

const totalEduBonus = computed(() => eduTestResults.value.reduce((s, r) => s + r.bonus, 0))

function roll3d6x5() {
  return (Math.floor(Math.random() * 6) + 1
    + Math.floor(Math.random() * 6) + 1
    + Math.floor(Math.random() * 6) + 1) * 5
}

function rollChance() {
  const isYouth = ageCategory.value?.eduYouthMalus ?? false
  if (isYouth) {
    const a = roll3d6x5()
    const b = roll3d6x5()
    form['Chance'] = String(Math.max(a, b))
  } else {
    form['Chance'] = String(roll3d6x5())
  }
}

const customOccupation = ref(false)

// ── WATCHERS OCCUPATION (après form) ─────────────────────────────────────────

watch(selectedOccupationId, async (id) => {
  choiceSelections.value = {}
  freeSpecSelections.value = {}
  freeChoiceSelections.value = {}
  catSubSelections.value = {}
  if (!id) {
    occupationDetail.value = null
    return
  }
  const occ = occupationList.value?.find(o => o.id === id)
  if (occ) form['Occupation'] = occ.name
  occupationDetail.value = await $fetch<OccupationDetail>(`/api/occupation/${id}`)
})

// En mode édition : retrouver l'occupation depuis le nom sauvegardé
watch([occupationList, () => form['Occupation']], () => {
  if (selectedOccupationId.value || !occupationList.value || !form['Occupation']) return
  const match = occupationList.value.find(
    o => o.name.toLowerCase() === form['Occupation']!.toLowerCase()
  )
  if (match) selectedOccupationId.value = match.id
  else if (form['Occupation']) customOccupation.value = true
}, { immediate: true })

watch(customOccupation, (custom) => {
  if (custom) {
    selectedOccupationId.value = null
    occupationDetail.value = null
  } else {
    form['Occupation'] = ''
  }
})

// Synchronise les dérivées calculées dans form pour l'envoi
watchEffect(() => {
  if (creditWealth.value) {
    form['Espèces'] = creditWealth.value.especes
    form['capital'] = creditWealth.value.capital
    form['depencesCourantes'] = creditWealth.value.depenses
  }
  form['pv_max'] = pv_max.value
  form['pm_max'] = pm_max.value
  form['sm_initial'] = sm_initial.value
  form['impact'] = impact.value
  form['carrure'] = carrure.value
  form['MVT'] = mvt.value
  // Arm1 synchronisée avec Corps à corps (valeur saisie ou base 25)
  form['Arm1_ORD'] = form['CR1_0'] || '25'
  // Auto-calcul ½ et ⅕ des compétences d'armes
  for (const i of [1, 2, 3, 4, 5]) {
    form[`Arm${i}_MAJ`] = half(form[`Arm${i}_ORD`])
    form[`Arm${i}_EXT`] = fifth(form[`Arm${i}_ORD`])
  }
})

// ── BIBLIOTHÈQUE D'ARMES ─────────────────────────────────────────────────────

interface ArmePerso { id: number, nom: string, deg: string | null, port: string | null, cap: string | null, pann: string | null }
interface ArmeRulebook { id: number, name: string, category: string, damage: string | null, range: string | null, cadence: string | null, capacity: string | null, failure: number | null, competence: { name: string, baseValue: number | null } }

const showLibrary = ref(false)
const libraryTab = ref<'perso' | 'rulebook'>('perso')
const rulebookSearch = ref('')
const rulebookCategory = ref('')

const { data: armePersoData, refresh: refreshArmePerso } = useFetch<ArmePerso[]>('/api/arme-perso')
const armePersoList = computed(() => armePersoData.value ?? [])

const { data: armeRulebookData } = useLazyFetch<ArmeRulebook[]>('/api/arme')
const rulebookCategories = computed(() => [...new Set((armeRulebookData.value ?? []).map(a => a.category))].sort())
const filteredRulebook = computed(() => {
  const search = rulebookSearch.value.toLowerCase()
  return (armeRulebookData.value ?? []).filter(a =>
    (!rulebookCategory.value || a.category === rulebookCategory.value)
    && (!search || a.name.toLowerCase().includes(search))
  )
})

// Compétences uniques du catalogue pour les dropdowns de spécialité
const uniqueWeaponCompetences = computed(() => {
  const seen = new Map<string, number | null>()
  for (const w of armeRulebookData.value ?? []) {
    if (!seen.has(w.competence.name)) seen.set(w.competence.name, w.competence.baseValue)
  }
  return Array.from(seen.entries())
    .map(([name, baseValue]) => ({ name, baseValue }))
    .sort((a, b) => a.name.localeCompare(b.name, 'fr'))
})

// Valeur de base de la compétence sélectionnée dans un slot de spécialité
function getCompBase(labelKey: string): string {
  const label = form[labelKey]
  if (!label) return '0'
  const comp = uniqueWeaponCompetences.value.find(c => c.name === label)
  return comp?.baseValue == null ? '0' : String(comp.baseValue)
}

// Mapping compétence fixe → clé de formulaire + valeur de base
const FIXED_COMPETENCE_MAP: Record<string, { key: string, base: number }> = {
  'Corps à corps': { key: 'CR1_0', base: 25 },
  'Armes de poing': { key: 'CD1_0', base: 15 },
  'Fusils': { key: 'CD2_0', base: 25 }
}

function resolveOrd(weapon: ArmeRulebook): string {
  const compName = weapon.competence.name
  const base = weapon.competence.baseValue ?? 0

  // 1. Compétence fixe → valeur saisie dans la fiche ou valeur de base
  const fixed = FIXED_COMPETENCE_MAP[compName]
  if (fixed) {
    return form[fixed.key] || String(fixed.base)
  }
  // 2. Slot de spécialité labelisé avec cette compétence → valeur saisie ou base
  for (const slot of ['CR2', 'CR3', 'CD3', 'CD4']) {
    if (form[`${slot}_label`] === compName) {
      return form[`${slot}_0`] || String(base)
    }
  }
  // 3. Fallback : valeur de base de la compétence
  return base > 0 ? String(base) : ''
}

async function saveWeaponToLibrary(slot: number) {
  const nom = form[`ARM${slot}`]
  if (!nom?.trim()) return
  await $fetch('/api/arme-perso', {
    method: 'POST',
    body: {
      nom: nom.trim(),
      deg: form[`Arm${slot}_DEG`] || null,
      port: form[`Arm${slot}_PORT`] || null,
      cap: form[`Arm${slot}_CAP`] || null,
      pann: form[`Arm${slot}_PANN`] || null
    }
  })
  await refreshArmePerso()
}

function clearWeaponSlot(slot: number) {
  form[`ARM${slot}`] = ''
  form[`Arm${slot}_ORD`] = ''
  form[`Arm${slot}_DEG`] = ''
  form[`Arm${slot}_PORT`] = ''
  form[`Arm${slot}_CAD`] = ''
  form[`Arm${slot}_CAP`] = ''
  form[`Arm${slot}_PANN`] = ''
}

async function deleteArmePerso(id: number) {
  await $fetch(`/api/arme-perso/${id}`, { method: 'DELETE' })
  await refreshArmePerso()
}

function importArmeToSlot(slot: number, arme: { nom: string, deg?: string | null, port?: string | null, cap?: string | null, pann?: string | null }) {
  form[`ARM${slot}`] = arme.nom
  form[`Arm${slot}_DEG`] = arme.deg ?? ''
  form[`Arm${slot}_PORT`] = arme.port ?? ''
  form[`Arm${slot}_CAP`] = arme.cap ?? ''
  form[`Arm${slot}_PANN`] = arme.pann ?? ''
}

function importRulebookToSlot(slot: number, arme: ArmeRulebook) {
  importArmeToSlot(slot, {
    nom: arme.name,
    deg: arme.damage,
    port: arme.range,
    cap: arme.capacity,
    pann: arme.failure == null ? null : String(arme.failure)
  })
  form[`Arm${slot}_ORD`] = resolveOrd(arme)
  form[`Arm${slot}_CAD`] = arme.cadence ?? ''
}

// Auto-résolution ORD réactive pour les armes reconnues dans le catalogue (ARM2–5)
// Séparé du watchEffect principal car armeRulebookData est déclaré après
watchEffect(() => {
  for (const i of [2, 3, 4, 5]) {
    const weapon = (armeRulebookData.value ?? []).find(w => w.name === form[`ARM${i}`])
    if (weapon) form[`Arm${i}_ORD`] = resolveOrd(weapon)
  }
})

// Slot cible sélectionné dans le panel bibliothèque
const importTargetSlot = ref<2 | 3 | 4 | 5>(2)

const isLoading = ref(false)
const isSaving = ref(false)
const error = ref<string | null>(null)
const savedSuccess = ref(false)

// ── STICKY DETECTION ─────────────────────────────────────────────────────────
const bottomSentinel = ref<HTMLElement | null>(null)
const isStuck = ref(true)

// Charge les données si mode édition
onMounted(async () => {
  const observer = new IntersectionObserver(([entry]) => {
    if (entry) isStuck.value = !entry.isIntersecting
  })
  if (bottomSentinel.value) observer.observe(bottomSentinel.value)
  onUnmounted(() => observer.disconnect())
  if (!editId.value) return
  try {
    const data = await $fetch<{ data: Record<string, string> }>(`/api/investigateur/${editId.value}`)
    Object.assign(form, data.data)
  } catch {
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
  } else {
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
  } catch (e: unknown) {
    error.value = `Erreur : ${e instanceof Error ? e.message : String(e)}`
  } finally { isSaving.value = false }
}

const { generateName } = useRandomName()
function generateRandomName() {
  form['Nom'] = generateName()
}

const portraitDataUrl = ref<string | null>(null)

function handlePortraitFile(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (ev) => {
    const img = new Image()
    img.onload = () => {
      const maxW = 400, maxH = 400
      let w = img.width, h = img.height
      if (w > maxW || h > maxH) {
        const ratio = Math.min(maxW / w, maxH / h)
        w = Math.round(w * ratio)
        h = Math.round(h * ratio)
      }
      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      canvas.getContext('2d')!.drawImage(img, 0, 0, w, h)
      portraitDataUrl.value = canvas.toDataURL('image/jpeg', 0.85)
    }
    img.src = ev.target!.result as string
  }
  reader.readAsDataURL(file)
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
      body: { ...form, portrait: portraitDataUrl.value ?? undefined }
    })
    window.open(url, '_blank')
  } catch (e: unknown) {
    error.value = `Erreur : ${e instanceof Error ? e.message : String(e)}`
  } finally { isLoading.value = false }
}

const caracteristiques = [
  { key: 'FOR_0', label: 'FOR', desc: 'Force', formula: '3d6' },
  { key: 'CON_0', label: 'CON', desc: 'Constitution', formula: '3d6' },
  { key: 'TAI_0', label: 'TAI', desc: 'Taille', formula: '2d6+6' },
  { key: 'DEX_0', label: 'DEX', desc: 'Dextérité', formula: '3d6' },
  { key: 'APP_0', label: 'APP', desc: 'Apparence', formula: '3d6' },
  { key: 'INT_0', label: 'INT', desc: 'Intelligence', formula: '2d6+6' },
  { key: 'POU_0', label: 'POU', desc: 'Pouvoir', formula: '3d6' },
  { key: 'EDU_0', label: 'EDU', desc: 'Éducation', formula: '2d6+6' }
] as const

// ── GÉNÉRATION DES CARACTÉRISTIQUES ──────────────────────────────────────────

type GenMethod = 'classic' | 'free' | 'buy' | 'quick'
const genMethod = ref<GenMethod>('classic')

function d6() {
  return Math.floor(Math.random() * 6) + 1
}
function rollFormula(formula: '3d6' | '2d6+6'): number {
  return formula === '3d6'
    ? (d6() + d6() + d6()) * 5
    : (d6() + d6() + 6) * 5
}

function rollOneStat(key: string) {
  const c = caracteristiques.find(c => c.key === key)
  if (c) form[key] = String(rollFormula(c.formula as '3d6' | '2d6+6'))
}
function rollAllClassic() {
  for (const c of caracteristiques) form[c.key] = String(rollFormula(c.formula as '3d6' | '2d6+6'))
}

// Nombre de stats < 50 (options 1 & 2)
const lowStatsCount = computed(() =>
  caracteristiques.filter(c => n(form[c.key]) > 0 && n(form[c.key]) < 50).length
)

// Option 2 : coup de pouce
const option2Bonus = ref(0)
function rollOption2() {
  option2Bonus.value = d6() * 5
}

// Pool (options 3 & 5)
type PoolEntry = { value: number, assignedTo: string | null }
const pool = ref<PoolEntry[]>([])
const selectedPoolIdx = ref<number | null>(null)
const isPoolMode = computed(() => genMethod.value === 'free' || genMethod.value === 'quick')

function clearCaracStats() {
  for (const c of caracteristiques) form[c.key] = ''
}
function initFreePool() {
  const vals: number[] = []
  for (let i = 0; i < 5; i++) vals.push(rollFormula('3d6'))
  for (let i = 0; i < 3; i++) vals.push(rollFormula('2d6+6'))
  vals.sort(() => Math.random() - 0.5)
  pool.value = vals.map(v => ({ value: v, assignedTo: null }))
  selectedPoolIdx.value = null
  clearCaracStats()
}
function initQuickPool() {
  pool.value = [80, 70, 60, 60, 50, 50, 50, 40].map(v => ({ value: v, assignedTo: null }))
  selectedPoolIdx.value = null
  clearCaracStats()
}

function selectPool(idx: number) {
  const entry = pool.value[idx]
  if (!entry) return
  if (entry.assignedTo) {
    // Clic sur une valeur déjà assignée → désassigner
    form[entry.assignedTo] = ''
    entry.assignedTo = null
    return
  }
  selectedPoolIdx.value = selectedPoolIdx.value === idx ? null : idx
}
function assignPool(statKey: string) {
  const idx = selectedPoolIdx.value
  if (idx === null) return
  // Désassigner si ce stat avait déjà une valeur pool
  const prev = pool.value.findIndex(p => p.assignedTo === statKey)
  if (prev >= 0) {
    pool.value[prev]!.assignedTo = null
    if (prev === idx) {
      selectedPoolIdx.value = null
      return
    }
  }
  pool.value[idx]!.assignedTo = statKey
  form[statKey] = String(pool.value[idx]!.value)
  selectedPoolIdx.value = null
}

// Budget achat (option 4)
const buyBudget = computed(() =>
  460 - caracteristiques.reduce((sum, c) => sum + n(form[c.key]), 0)
)

watch(genMethod, (m) => {
  if (m === 'quick') initQuickPool()
  if (m !== 'free' && m !== 'quick') pool.value = []
  option2Bonus.value = 0
})

// Clés catégories parentes dans la grille : non éditables, points dans les spécialités
const CATEGORY_KEYS = new Set([
  'ART_0',  // Arts et métiers → AR1, AR2, AR3
  'SCI_0',  // Sciences → SC1, SC2, SC3
  'PIL_0',  // Pilotage → PL1
  'SUR_0',  // Survie
  'LAG_0',  // Langue maternelle → auto EDU
])

const competences = [
  { key: 'ANT_0', label: 'Anthropologie', base: 1 },
  { key: 'ARC_0', label: 'Archéologie', base: 1 },
  { key: 'ART_0', label: 'Art et métiers', base: 5 },
  { key: 'BAR_0', label: 'Baratin', base: 5 },
  { key: 'BIB_0', label: 'Bibliothèque', base: 20 },
  { key: 'CHA_0', label: 'Charme', base: 15 },
  { key: 'CD1_0', label: 'Armes de poing', base: 15 },
  { key: 'CD2_0', label: 'Fusils', base: 25 },
  { key: 'CR1_0', label: 'Corps à corps', base: 25 },
  { key: 'COM_0', label: 'Comptabilité', base: 25 },
  { key: 'COD_0', label: 'Conduite', base: 20 },
  { key: 'CEL_0', label: 'Conduite engin lourd', base: 5 },
  { key: 'CRE_0', label: 'Crédit', base: 0 },
  { key: 'CRO_0', label: 'Crochetage', base: 1 },
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
  { key: 'LAG_0', label: 'Langue maternelle', base: 0 },
  { key: 'MEC_0', label: 'Mécanique', base: 10 },
  { key: 'MED_0', label: 'Médecine', base: 1 },
  { key: 'MYT_0', label: 'Mythe de Cthulhu', base: 0 },
  { key: 'NAG_0', label: 'Nager', base: 20 },
  { key: 'NAT_0', label: 'Naturalisme', base: 10 },
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

// ── POINTS D'OCCUPATION ──────────────────────────────────────────────────────

const CARAC_KEY: Record<string, string> = {
  'ÉDU': 'EDU_0', 'EDU': 'EDU_0',
  'DEX': 'DEX_0', 'FOR': 'FOR_0',
  'APP': 'APP_0', 'POU': 'POU_0',
  'CON': 'CON_0', 'TAI': 'TAI_0',
  'INT': 'INT_0'
}

// base value de chaque champ compétence (valeur sans investissement)
const COMP_BASE: Record<string, number> = {
  ANT_0: 1, ARC_0: 1, ART_0: 5, BAR_0: 5, BIB_0: 20, CHA_0: 15,
  CD1_0: 15, CD2_0: 25, CR1_0: 25, COM_0: 25, COD_0: 20, CEL_0: 5,
  CRE_0: 0, CRO_0: 1, DIS_0: 20, DRO_0: 5, ECO_0: 20, ELE_0: 1,
  EQU_0: 5, ESQ_0: 0, EST_0: 5, GRI_0: 20, HIS_0: 5, IPO_0: 5,
  ITI_0: 15, LAN_0: 0, MEC_0: 10, MED_0: 1, MYT_0: 0, NAG_0: 20,
  NAT_0: 10, OCC_0: 5, ORI_0: 10, PER_0: 10, PIC_0: 10, PIL_0: 1,
  PIS_0: 20, PLO_0: 1, PRE_0: 30, PSA_0: 1, PSO_0: 10, SAU_0: 20,
  SCI_0: 1, SUR_0: 10, TOC_0: 25,
  AR1_0: 5, AR2_0: 5, AR3_0: 5,
  CD3_0: 15, CD4_0: 15,
  CR2_0: 25, CR3_0: 25,
  LG1_0: 1, LG2_0: 1, LG3_0: 1,
  PL1_0: 1,
  SC1_0: 1, SC2_0: 1, SC3_0: 1,
  CP1_0: 0, CP2_0: 0, CP3_0: 0, CP4_0: 0, CP5_0: 0
}

// Valeur de base dynamique : Esquive = DEX÷2, Langue maternelle = EDU
function getSkillBase(key: string): number {
  if (key === 'ESQ_0') return Math.floor(n(form['DEX_0']) / 2)
  if (key === 'LAG_0') return n(form['EDU_0'])
  return COMP_BASE[key] ?? 0
}

function parseOccPoints(formula: string | null): number {
  if (!formula) return 0
  let total = 0
  const terms = formula.split('+').map(t => t.trim())
  for (const term of terms) {
    if (term.startsWith('(')) {
      const inner = term.replaceAll(/[()]/g, '')
      const options = inner.split(/\s+ou\s+/i)
      const vals = options.map((opt) => {
        const m = opt.trim().match(/^([A-ZÉÈÀÂ]+)\s*x\s*(\d+)$/i)
        if (!m) return 0
        const key = CARAC_KEY[m[1]!.toUpperCase()] ?? ''
        return n(form[key]) * Number.parseInt(m[2]!)
      })
      total += Math.max(0, ...vals)
    } else {
      const m = term.match(/^([A-ZÉÈÀÂ]+)\s*x\s*(\d+)$/i)
      if (!m) continue
      const key = CARAC_KEY[m[1]!.toUpperCase()] ?? ''
      total += n(form[key]) * Number.parseInt(m[2]!)
    }
  }
  return total
}

const occPointsTotal = computed(() =>
  parseOccPoints(occupationDetail.value?.point_competence ?? null)
)

const highlightedInvested = computed(() =>
  Object.keys(COMP_BASE).reduce((sum, key) => {
    if (!highlightedKeys.value.has(key)) return sum
    return sum + Math.max(0, n(form[key]) - getSkillBase(key))
  }, 0)
)

const nonHighlightedInvested = computed(() =>
  Object.keys(COMP_BASE).reduce((sum, key) => {
    if (highlightedKeys.value.has(key)) return sum
    return sum + Math.max(0, n(form[key]) - getSkillBase(key))
  }, 0)
)

const occOverflow = computed(() => Math.max(0, highlightedInvested.value - occPointsTotal.value))

const occPointsSpent = computed(() => highlightedInvested.value)
const occPointsRemaining = computed(() => Math.max(0, occPointsTotal.value - highlightedInvested.value))

const intPointsTotal = computed(() => n(form['INT_0']) * 2)
const intPointsSpent = computed(() => nonHighlightedInvested.value + occOverflow.value)
const intPointsRemaining = computed(() => intPointsTotal.value - intPointsSpent.value)

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

    <form class="character-form">

      <!-- ── IDENTITÉ ─────────────────────────────────────── -->
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

      <!-- ── MODIFICATEURS D'ÂGE ──────────────────────────── -->
      <Transition name="age-panel">
        <section v-if="ageCategory" class="form-section age-panel">
          <h2 class="section-title">
            Modificateurs d'âge
            <span class="age-badge">{{ ageCategory.label }} · {{ ageCategory.range }}</span>
          </h2>

          <div class="age-rules">
            <!-- Malus ÉDU jeunesse -->
            <div v-if="ageCategory.eduYouthMalus" class="age-rule">
              <span class="age-rule-glyph">−</span>
              <span>
                Réduire l'<strong>ÉDU de 5</strong>.
                <span v-if="n(form['EDU_0']) > 0" class="age-target">
                  {{ n(form['EDU_0']) }} → {{ Math.max(0, n(form['EDU_0']) - 5) }}
                </span>
              </span>
            </div>

            <!-- Malus physique -->
            <div v-if="ageCategory.physMalus > 0" class="age-rule">
              <span class="age-rule-glyph">−</span>
              <span>
                Retirer <strong>{{ ageCategory.physMalus }} points</strong> à répartir entre
                <strong>{{ ageCategory.physStats.join(', ') }}</strong>.
                <span class="age-hint">Les ½ et ⅕ se recalculeront automatiquement.</span>
              </span>
            </div>

            <!-- Malus APP -->
            <div v-if="ageCategory.appMalus > 0" class="age-rule">
              <span class="age-rule-glyph">−</span>
              <span>
                Réduire l'<strong>APP de {{ ageCategory.appMalus }}</strong>.
                <span v-if="n(form['APP_0']) > 0" class="age-target">
                  {{ n(form['APP_0']) }} → {{ Math.max(0, n(form['APP_0']) - ageCategory.appMalus) }}
                </span>
              </span>
            </div>

            <!-- Tests d'expérience ÉDU -->
            <div v-if="ageCategory.eduTests > 0" class="age-rule age-rule--edu">
              <span class="age-rule-glyph">+</span>
              <div class="age-edu">
                <span>
                  <strong>{{ ageCategory.eduTests }} test{{ ageCategory.eduTests > 1 ? 's' : '' }} d'expérience</strong> en ÉDU
                  <span v-if="!n(form['EDU_0'])" class="age-hint"> — saisir ÉDU d'abord</span>
                </span>
                <button
                  type="button"
                  class="btn-roll"
                  :disabled="!n(form['EDU_0'])"
                  @click="rollEduTests"
                >
                  ⚂ {{ eduTestResults.length ? 'Relancer' : 'Lancer les dés' }}
                </button>

                <div v-if="eduTestResults.length" class="edu-results">
                  <div
                    v-for="r in eduTestResults"
                    :key="r.index"
                    class="edu-result"
                    :class="r.success ? 'edu-result--success' : 'edu-result--fail'"
                  >
                    <span class="edu-result-label">Test {{ r.index }}</span>
                    <span class="edu-result-roll">{{ r.roll }}</span>
                    <span class="edu-result-vs">/ ÉDU {{ r.threshold }}</span>
                    <span class="edu-result-outcome">{{ r.success ? `+${r.bonus}` : '—' }}</span>
                  </div>
                  <div class="edu-total">
                    <template v-if="totalEduBonus > 0">
                      Ajouter <strong>+{{ totalEduBonus }}</strong> à ÉDU
                      <span v-if="n(form['EDU_0']) > 0" class="age-target">
                        {{ n(form['EDU_0']) }} → {{ Math.min(99, n(form['EDU_0']) + totalEduBonus) }}
                      </span>
                    </template>
                    <template v-else>Aucun bonus d'ÉDU.</template>
                  </div>
                </div>
              </div>
            </div>

            <!-- Note chance pour jeunes -->
            <div v-if="ageCategory.eduYouthMalus" class="age-rule age-rule--note">
              <span class="age-rule-glyph">✦</span>
              <span class="age-hint">La Chance sera tirée deux fois, garder le meilleur résultat — disponible à l'étape Chance.</span>
            </div>
          </div>
        </section>
      </Transition>

      <!-- ── CARACTÉRISTIQUES ───────────────────────────────── -->
      <section class="form-section">
        <h2 class="section-title">Caractéristiques</h2>

        <!-- Sélecteur de méthode -->
        <div class="gen-methods">
          <button
            v-for="m in ([
              { id: 'classic', label: 'Classique' },
              { id: 'free', label: 'Distribution libre' },
              { id: 'buy', label: 'Achat' },
              { id: 'quick', label: 'Création accélérée' }
            ] as const)"
            :key="m.id"
            type="button"
            class="gen-method-btn"
            :class="{ 'gen-method-btn--active': genMethod === m.id }"
            @click="genMethod = m.id"
          >{{ m.label }}</button>
        </div>

        <!-- Panneau méthode classique -->
        <div v-if="genMethod === 'classic'" class="gen-panel">
          <div class="gen-panel-actions">
            <button type="button" class="btn-roll" @click="rollAllClassic">⚂ Tout lancer</button>
            <span class="gen-formula-hint">FOR/CON/DEX/POU/APP = 3d6×5 · TAI/INT/ÉDU = (2d6+6)×5</span>
          </div>
          <div v-if="lowStatsCount >= 3" class="gen-low-stats">
            <span>{{ lowStatsCount }} caractéristiques &lt; 50</span>
            <span class="gen-opt-label">Option 1 : recommencer à zéro</span>
            <span class="gen-opt-sep">·</span>
            <span class="gen-opt-label">Option 2 : coup de pouce</span>
            <button type="button" class="btn-roll btn-roll--sm" @click="rollOption2">⚂ 1d6×5</button>
            <span v-if="option2Bonus > 0" class="gen-opt-bonus">+{{ option2Bonus }} pts à répartir sur les stats faibles</span>
          </div>
        </div>

        <!-- Panneau distribution libre -->
        <div v-else-if="genMethod === 'free'" class="gen-panel">
          <div class="gen-panel-actions">
            <button type="button" class="btn-roll" @click="initFreePool">
              ⚂ {{ pool.length ? 'Relancer le pool' : 'Générer le pool' }}
            </button>
            <span class="gen-formula-hint">5×(3d6×5) + 3×((2d6+6)×5), à distribuer librement · INT/TAI recommandées ≥ 40</span>
          </div>
          <div v-if="pool.length" class="pool-chips">
            <button
              v-for="(entry, i) in pool"
              :key="i"
              type="button"
              class="pool-chip"
              :class="{
                'pool-chip--selected': selectedPoolIdx === i,
                'pool-chip--assigned': !!entry.assignedTo
              }"
              @click="selectPool(i)"
            >
              <span class="pool-chip-value">{{ entry.value }}</span>
              <span v-if="entry.assignedTo" class="pool-chip-tag">{{ entry.assignedTo.replace('_0', '') }}</span>
            </button>
          </div>
          <p v-if="pool.length && selectedPoolIdx !== null" class="gen-hint">Cliquez une ligne du tableau pour assigner {{ pool[selectedPoolIdx]?.value }}.</p>
        </div>

        <!-- Panneau achat -->
        <div v-else-if="genMethod === 'buy'" class="gen-panel">
          <div class="gen-panel-actions">
            <div class="buy-budget" :class="{ 'buy-budget--over': buyBudget < 0 }">
              <span class="buy-budget-label">Budget restant</span>
              <span class="buy-budget-value">{{ buyBudget }} / 460</span>
            </div>
            <span class="gen-formula-hint">Valeurs entre 15 et 90 · INT/TAI recommandées ≥ 40</span>
            <button type="button" class="btn-roll btn-roll--sm" @click="clearCaracStats">Réinitialiser</button>
          </div>
        </div>

        <!-- Panneau création accélérée -->
        <div v-else-if="genMethod === 'quick'" class="gen-panel">
          <div class="gen-panel-actions">
            <button type="button" class="btn-roll btn-roll--sm" @click="initQuickPool">Réinitialiser</button>
            <span class="gen-formula-hint">Valeurs fixes à distribuer : 80, 70, 60, 60, 50, 50, 50, 40</span>
          </div>
          <div class="pool-chips">
            <button
              v-for="(entry, i) in pool"
              :key="i"
              type="button"
              class="pool-chip"
              :class="{
                'pool-chip--selected': selectedPoolIdx === i,
                'pool-chip--assigned': !!entry.assignedTo
              }"
              @click="selectPool(i)"
            >
              <span class="pool-chip-value">{{ entry.value }}</span>
              <span v-if="entry.assignedTo" class="pool-chip-tag">{{ entry.assignedTo.replace('_0', '') }}</span>
            </button>
          </div>
          <p v-if="selectedPoolIdx !== null" class="gen-hint">Cliquez une ligne du tableau pour assigner {{ pool[selectedPoolIdx]?.value }}.</p>
        </div>

        <!-- Tableau des caractéristiques -->
        <div class="carac-table">
          <div class="carac-header">
            <span>Carac.</span>
            <span class="carac-desc">Description</span>
            <span class="col-center">Valeur</span>
            <span class="col-center">½</span>
            <span class="col-center">⅕</span>
          </div>
          <div
            v-for="c in caracteristiques"
            :key="c.key"
            class="carac-row"
            :class="{
              'carac-row--assignable': isPoolMode && selectedPoolIdx !== null,
              'carac-row--pool-assigned': isPoolMode && pool.some(p => p.assignedTo === c.key)
            }"
            @click="isPoolMode ? assignPool(c.key) : undefined"
          >
            <span class="carac-code">{{ c.label }}</span>
            <span class="carac-desc">{{ c.desc }}</span>
            <div class="carac-input-wrap">
              <input
                v-model="form[c.key]"
                class="carac-input"
                :class="{ 'carac-input--buy': genMethod === 'buy' }"
                type="number"
                :min="genMethod === 'buy' ? 15 : 0"
                :max="genMethod === 'buy' ? 90 : 100"
                placeholder="—"
                @click.stop
              >
              <button
                v-if="genMethod === 'classic'"
                type="button"
                class="carac-roll-btn"
                :title="`Lancer ${c.formula}×5`"
                @click.stop="rollOneStat(c.key)"
              >⚂</button>
            </div>
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

      <!-- ── CHANCE ────────────────────────────────────────────── -->
      <section class="form-section chance-section">
        <h2 class="section-title">Chance</h2>
        <div class="chance-row">
          <div class="chance-card">
            <div class="chance-input-group">
              <input
                id="Chance"
                v-model="form['Chance']"
                class="chance-input"
                type="number"
                min="0"
                max="100"
                placeholder="—"
              >
            </div>
            <div class="chance-roll-col">
              <button type="button" class="btn-roll" @click="rollChance">
                ⚂ {{ form['Chance'] ? 'Relancer' : 'Tirer la Chance' }}
              </button>
              <span class="chance-formula">
                3d6 × 5
                <span v-if="ageCategory?.eduYouthMalus" class="chance-youth-note"> · ×2 meilleur</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      <!-- ── COMPÉTENCES ─────────────────────────────────────── -->
      <section class="form-section">
        <h2 class="section-title">Compétences</h2>
        <p class="section-hint">Valeur finale après répartition — les ½ et ⅕ sont calculés automatiquement.</p>
        <div class="points-trackers">
          <div v-if="occupationDetail?.point_competence" class="occ-points-tracker" :class="{ 'occ-points-over': occOverflow > 0 }">
            <span class="occ-points-label">Occupation</span>
            <span class="occ-points-formula">{{ occupationDetail.point_competence }}</span>
            <span class="occ-points-sep">·</span>
            <span class="occ-points-count">{{ occPointsSpent }} / {{ occPointsTotal }}</span>
            <span class="occ-points-remaining">
              <template v-if="occOverflow > 0">
                complet <span class="occ-overflow-badge">+{{ occOverflow }} → intérêt</span>
              </template>
              <template v-else>{{ occPointsRemaining }} restants</template>
            </span>
          </div>
          <div v-if="occupationDetail" class="occ-points-tracker occ-points-tracker--int" :class="{ 'occ-points-over': intPointsRemaining < 0 }">
            <span class="occ-points-label">Intérêt personnel</span>
            <span class="occ-points-formula">INT × 2</span>
            <span class="occ-points-sep">·</span>
            <span class="occ-points-count">{{ intPointsSpent }} / {{ intPointsTotal }}</span>
            <span class="occ-points-remaining">
              {{ intPointsRemaining >= 0 ? `${intPointsRemaining} restants` : `${Math.abs(intPointsRemaining)} de trop` }}
            </span>
          </div>
        </div>
        <p v-if="occupationDetail" class="highlight-hint">
          Compétences <span class="highlight-sample highlight-sample--fixed">obligatoires</span>
          ou <span class="highlight-sample highlight-sample--choice">disponibles au choix</span> de votre occupation.
        </p>
        <div v-if="occSkillPickers.some(p => p.type === 'CHOICE_FROM_LIST' && (p as any).note?.includes('social'))" class="choice-picker">
          <div
            v-for="picker in occSkillPickers.filter(p => p.type === 'CHOICE_FROM_LIST' && (p as any).note?.includes('social'))"
            :key="picker.i"
            class="choice-group choice-group--choice-from-list"
          >
            <span class="choice-label">{{ `Choisissez ${(picker as any).count} compétence sociale :` }}</span>
            <div class="choice-slots">
              <div v-for="slot in (picker as any).count" :key="slot" class="choice-slot-group">
                <select
                  class="field-select choice-select"
                  :value="(choiceSelections[picker.i] ?? [])[slot - 1] ?? ''"
                  @change="updateChoice(picker.i, slot - 1, ($event.target as HTMLSelectElement).value)"
                >
                  <option value="">— Choisir —</option>
                  <option
                    v-for="opt in (picker as any).options"
                    :key="opt.competence.id"
                    :value="opt.competence.name"
                    :disabled="(choiceSelections[picker.i] ?? []).some((v: string, j: number) => j !== slot - 1 && v === opt.competence.name)"
                  >{{ opt.competence.name }}</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        <div class="comp-grid">
          <div
            v-for="c in competences"
            :key="c.key"
            class="comp-row"
            :class="{
              'comp-highlighted': fixedKeys.has(c.key),
              'comp-choice': choiceKeys.has(c.key),
              'comp-category': CATEGORY_KEYS.has(c.key)
            }"
          >
            <span class="comp-name">{{ c.label }}</span>
            <span class="comp-base">{{ getSkillBase(c.key) }}%</span>
            <span v-if="CATEGORY_KEYS.has(c.key)" class="comp-category-badge">—</span>
            <input v-else v-model="form[c.key]" class="comp-input" type="number" min="0" max="100" :placeholder="String(getSkillBase(c.key))">
          </div>
        </div>
      </section>

      <!-- ── COMPÉTENCES VARIABLES ───────────────────────────── -->
      <section class="form-section">
        <h2 class="section-title">Combat, Art, Langues, Sciences & Compétences personnelles</h2>
        <div class="variable-grid">
          <div class="variable-group" :class="{ 'variable-group--highlighted': isGroupHighlighted('ART_0', 'AR1_0', 'AR2_0', 'AR3_0'), 'variable-group--choice': isGroupChoice('ART_0', 'AR1_0', 'AR2_0', 'AR3_0') }">
            <h3 class="variable-subtitle">Art et métier</h3>
            <div v-for="i in [1, 2, 3]" :key="`ar${i}`" class="variable-row">
              <input v-model="form[`AR${i}_label`]" class="field-input label-input" type="text" placeholder="Spécialité…" :readonly="occupationVarSlots[`AR${i}_label`]?.locked" :class="{ 'input-locked': occupationVarSlots[`AR${i}_label`]?.locked }">
              <input v-model="form[`AR${i}_0`]" class="comp-input" type="number" min="0" max="100" placeholder="0">
            </div>
          </div>
          <div class="variable-group" :class="{ 'variable-group--highlighted': isGroupHighlighted('CD1_0', 'CD2_0', 'CD3_0', 'CD4_0'), 'variable-group--choice': isGroupChoice('CD1_0', 'CD2_0', 'CD3_0', 'CD4_0') }">
            <h3 class="variable-subtitle">Combat à distance (custom)</h3>
            <div v-for="i in [3, 4]" :key="`cd${i}`" class="variable-row">
              <select v-model="form[`CD${i}_label`]" class="field-select label-select">
                <option value="">— Compétence —</option>
                <option v-for="c in uniqueWeaponCompetences" :key="c.name" :value="c.name">{{ c.name }}</option>
              </select>
              <input v-model="form[`CD${i}_0`]" class="comp-input" type="number" min="0" max="100" :placeholder="getCompBase(`CD${i}_label`)">
            </div>
          </div>
          <div class="variable-group" :class="{ 'variable-group--highlighted': isGroupHighlighted('CR1_0', 'CR2_0', 'CR3_0'), 'variable-group--choice': isGroupChoice('CR1_0', 'CR2_0', 'CR3_0') }">
            <h3 class="variable-subtitle">Combat rapproché (custom)</h3>
            <div v-for="i in [2, 3]" :key="`cr${i}`" class="variable-row">
              <select v-model="form[`CR${i}_label`]" class="field-select label-select">
                <option value="">— Compétence —</option>
                <option v-for="c in uniqueWeaponCompetences" :key="c.name" :value="c.name">{{ c.name }}</option>
              </select>
              <input v-model="form[`CR${i}_0`]" class="comp-input" type="number" min="0" max="100" :placeholder="getCompBase(`CR${i}_label`)">
            </div>
          </div>
          <div class="variable-group" :class="{ 'variable-group--highlighted': isGroupHighlighted('LG1_0', 'LG2_0', 'LG3_0'), 'variable-group--choice': isGroupChoice('LG1_0', 'LG2_0', 'LG3_0') }">
            <h3 class="variable-subtitle">Langues étrangères</h3>
            <div v-for="i in [1, 2, 3]" :key="`lg${i}`" class="variable-row">
              <input v-model="form[`LG${i}_label`]" class="field-input label-input" type="text" placeholder="Langue…" :readonly="occupationVarSlots[`LG${i}_label`]?.locked" :class="{ 'input-locked': occupationVarSlots[`LG${i}_label`]?.locked }">
              <input v-model="form[`LG${i}_0`]" class="comp-input" type="number" min="0" max="100" placeholder="0">
            </div>
          </div>
          <div class="variable-group" :class="{ 'variable-group--highlighted': isGroupHighlighted('PIL_0', 'PL1_0'), 'variable-group--choice': isGroupChoice('PIL_0', 'PL1_0') }">
            <h3 class="variable-subtitle">Pilotage (custom)</h3>
            <div class="variable-row">
              <input v-model="form['PL1_label']" class="field-input label-input" type="text" placeholder="Véhicule…" :readonly="occupationVarSlots['PL1_label']?.locked" :class="{ 'input-locked': occupationVarSlots['PL1_label']?.locked }">
              <input v-model="form['PL1_0']" class="comp-input" type="number" min="0" max="100" placeholder="0">
            </div>
          </div>
          <div class="variable-group" :class="{ 'variable-group--highlighted': isGroupHighlighted('SCI_0', 'SC1_0', 'SC2_0', 'SC3_0'), 'variable-group--choice': isGroupChoice('SCI_0', 'SC1_0', 'SC2_0', 'SC3_0') }">
            <h3 class="variable-subtitle">Sciences</h3>
            <div v-for="i in [1, 2, 3]" :key="`sc${i}`" class="variable-row">
              <input v-model="form[`SC${i}_label`]" class="field-input label-input" type="text" placeholder="Spécialité…" :readonly="occupationVarSlots[`SC${i}_label`]?.locked" :class="{ 'input-locked': occupationVarSlots[`SC${i}_label`]?.locked }">
              <input v-model="form[`SC${i}_0`]" class="comp-input" type="number" min="0" max="100" placeholder="0">
            </div>
          </div>
          <div class="variable-group variable-group--full">
            <h3 class="variable-subtitle">Compétences personnelles</h3>
            <div class="variable-row-grid">
              <div v-for="i in [1, 2, 3, 4, 5]" :key="`cp${i}`" class="variable-row">
                <input v-model="form[`CP${i}_label`]" class="field-input label-input" type="text" placeholder="Compétence…">
                <input v-model="form[`CP${i}_0`]" class="comp-input" type="number" min="0" max="100" placeholder="0">
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ── ARMES ─────────────────────────────────────────────── -->
      <section class="form-section">
        <h2 class="section-title">Armes</h2>
        <div class="weapons-table-wrap">
          <div class="weapons-table">

            <!-- Header -->
            <div class="weapons-header">
              <span>Arme</span>
              <span class="col-center">Ord.</span>
              <span class="col-center">Maj.</span>
              <span class="col-center">Ext.</span>
              <span class="col-center">Dégâts</span>
              <span class="col-center">Portée</span>
              <span class="col-center">Cad.</span>
              <span class="col-center">Cap.</span>
              <span class="col-center">Panne</span>
              <span />
            </div>

            <!-- Arm1 : Corps à corps (nom et dégâts déjà dans le PDF) -->
            <div class="weapons-row weapons-row--melee">
              <span class="weapon-melee-label">Corps à corps</span>
              <span class="weapon-auto">{{ form['Arm1_ORD'] || '—' }}</span>
              <span class="weapon-auto">{{ form['Arm1_MAJ'] || '—' }}</span>
              <span class="weapon-auto">{{ form['Arm1_EXT'] || '—' }}</span>
              <span class="weapon-fixed">—</span>
              <input v-model="form['Arm1_PORT']" class="weapon-input" type="text" placeholder="Allonge">
              <span class="weapon-fixed">—</span>
              <span class="weapon-fixed">—</span>
              <span class="weapon-fixed">—</span>
              <span />
            </div>

            <!-- Arm2–5 : armes libres -->
            <div
              v-for="i in [2, 3, 4, 5]"
              :key="i"
              class="weapons-row"
            >
              <input v-model="form[`ARM${i}`]" class="weapon-input weapon-input--name" type="text" placeholder="Nom de l'arme…">
              <input v-model="form[`Arm${i}_ORD`]" class="weapon-input" type="number" min="0" max="100" placeholder="—">
              <span class="weapon-auto">{{ form[`Arm${i}_MAJ`] || '—' }}</span>
              <span class="weapon-auto">{{ form[`Arm${i}_EXT`] || '—' }}</span>
              <input v-model="form[`Arm${i}_DEG`]" class="weapon-input" type="text" placeholder="—">
              <input v-model="form[`Arm${i}_PORT`]" class="weapon-input" type="text" placeholder="—">
              <input v-model="form[`Arm${i}_CAD`]" class="weapon-input" type="text" placeholder="—">
              <input v-model="form[`Arm${i}_CAP`]" class="weapon-input" type="text" placeholder="—">
              <input v-model="form[`Arm${i}_PANN`]" class="weapon-input" type="text" placeholder="—">
              <span class="weapon-actions">
                <button
                  type="button"
                  class="weapon-save-btn"
                  :disabled="!form[`ARM${i}`]"
                  :title="form[`ARM${i}`] ? `Sauvegarder « ${form[`ARM${i}`]} » dans la bibliothèque` : 'Saisir un nom d\'arme d\'abord'"
                  @click="saveWeaponToLibrary(i)"
                >💾</button>
                <button
                  type="button"
                  class="weapon-clear-btn"
                  :disabled="!form[`ARM${i}`]"
                  title="Vider cette ligne"
                  @click="clearWeaponSlot(i)"
                >✕</button>
              </span>
            </div>

          </div>
        </div>

        <!-- ── BIBLIOTHÈQUE ─────────────────────────── -->
        <div class="library-section">
          <button type="button" class="library-toggle" @click="showLibrary = !showLibrary">
            <span class="library-toggle-icon">{{ showLibrary ? '▾' : '▸' }}</span>
            Bibliothèque d'armes
            <span v-if="armePersoList.length" class="library-count">{{ armePersoList.length }}</span>
          </button>

          <div v-show="showLibrary" class="library-panel">
            <!-- Slot cible -->
            <div class="library-target-row">
              <span class="library-target-label">Importer dans</span>
              <div class="library-slot-btns">
                <button
                  v-for="s in [2, 3, 4, 5]"
                  :key="s"
                  type="button"
                  class="library-slot-btn"
                  :class="{ 'library-slot-btn--active': importTargetSlot === s }"
                  @click="importTargetSlot = (s as 2|3|4|5)"
                >ARM{{ s }}</button>
              </div>
            </div>

            <!-- Tabs -->
            <div class="library-tabs">
              <button type="button" class="library-tab" :class="{ 'library-tab--active': libraryTab === 'perso' }" @click="libraryTab = 'perso'">
                Mes armes <span v-if="armePersoList.length" class="library-count">{{ armePersoList.length }}</span>
              </button>
              <button type="button" class="library-tab" :class="{ 'library-tab--active': libraryTab === 'rulebook' }" @click="libraryTab = 'rulebook'">
                Armurerie
              </button>
            </div>

            <!-- Mes armes -->
            <div v-if="libraryTab === 'perso'">
              <p v-if="!armePersoList.length" class="library-empty">Aucune arme sauvegardée. Remplissez un slot ARM2–5 et cliquez 💾.</p>
              <div v-else class="library-list">
                <div v-for="arme in armePersoList" :key="arme.id" class="library-item">
                  <div class="library-item-info">
                    <span class="library-item-name">{{ arme.nom }}</span>
                    <span v-if="arme.deg" class="library-item-meta">{{ arme.deg }}</span>
                    <span v-if="arme.port" class="library-item-meta">{{ arme.port }}</span>
                  </div>
                  <div class="library-item-actions">
                    <button type="button" class="btn-import" @click="importArmeToSlot(importTargetSlot, arme)">
                      → ARM{{ importTargetSlot }}
                    </button>
                    <button type="button" class="btn-delete-arme" @click="deleteArmePerso(arme.id)">✕</button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Armurerie (livre de règles) -->
            <div v-else-if="libraryTab === 'rulebook'">
              <div class="rulebook-filters">
                <input v-model="rulebookSearch" class="field-input rulebook-search" type="text" placeholder="Rechercher une arme…">
                <select v-model="rulebookCategory" class="field-select rulebook-cat">
                  <option value="">Toutes catégories</option>
                  <option v-for="cat in rulebookCategories" :key="cat" :value="cat">{{ cat }}</option>
                </select>
              </div>
              <div class="library-list">
                <div v-for="arme in filteredRulebook" :key="arme.id" class="library-item">
                  <div class="library-item-info">
                    <span class="library-item-name">{{ arme.name }}</span>
                    <span class="library-item-meta">{{ arme.competence.name }}</span>
                    <span v-if="arme.damage" class="library-item-meta">{{ arme.damage }}</span>
                    <span v-if="arme.range" class="library-item-meta">{{ arme.range }}</span>
                  </div>
                  <div class="library-item-actions">
                    <button type="button" class="btn-import" @click="importRulebookToSlot(importTargetSlot, arme)">
                      → ARM{{ importTargetSlot }}
                    </button>
                  </div>
                </div>
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

      <!-- ── ÉQUIPEMENT ───────────────────────────────────────── -->
      <section class="form-section">
        <h2 class="section-title">Équipement</h2>
        <div class="equip-grid">
          <div v-for="i in 12" :key="i" class="field-group">
            <label class="field-label" :for="`EQUIP${i}`">{{ i }}</label>
            <input :id="`EQUIP${i}`" v-model="form[`EQUIP${i}`]" class="field-input" type="text" placeholder="Objet…">
          </div>
        </div>
      </section>

      <!-- ── ERROR & SUBMIT ─────────────────────────────────── -->
      <div v-if="error" class="form-error">{{ error }}</div>

      <div v-if="savedSuccess" class="form-success">Fiche sauvegardée avec succès.</div>

      <p class="pdf-credit">
        La fiche PDF est basée sur la
        <a href="https://www.orbe.be/aide-de-jeux/l-appel-de-cthulhu-v7-fiche-dynamique" target="_blank" rel="noopener noreferrer">fiche dynamique d'Orbe.be</a>.
      </p>

      <div ref="bottomSentinel" class="bottom-sentinel" />
      <div class="form-actions" :class="{ 'is-stuck': isStuck }">
        <button
          type="button"
          class="btn-save"
          :disabled="isSaving || isLoading"
          @click="saveCharacter"
        >
          <span v-if="isSaving" class="btn-sigil">۞</span>
          <span v-else>Sauvegarder</span>
        </button>
        <button
          type="button"
          class="btn-generate"
          :disabled="isLoading || isSaving"
          @click="generatePdf"
        >
          <span v-if="isLoading" class="btn-sigil">۞</span>
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
  font-size: var(--fs-page-title);
  font-weight: 600;
  letter-spacing: 0.06em;
  color: var(--color-text-primary);
  margin-bottom: var(--space-xs);
}
.page-subtitle {
  font-family: var(--font-flavor);
  font-style: italic;
  color: var(--color-text-secondary);
  font-size: var(--fs-page-subtitle);
}

.flavor-quote {
  background: var(--color-void);
  border-left: 2px solid var(--color-arcane-dim);
  padding: var(--space-lg);
  margin-bottom: var(--space-xl);
  border-radius: 0 var(--radius-md) var(--radius-md) 0;
}
.flavor-quote p {
  font-family: var(--font-flavor);
  font-style: italic;
  font-size: var(--fs-flavor-quote);
  color: var(--color-text-secondary);
  line-height: 1.8;
}
.flavor-quote cite {
  display: block;
  margin-top: var(--space-sm);
  font-family: var(--font-heading);
  font-size: var(--fs-section-title);
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
  font-size: var(--fs-section-title);
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
  font-size: var(--fs-section-hint);
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
.col-full { grid-column: 1 / -1; }
.field-group { display: flex; flex-direction: column; gap: var(--space-xs); }
.field-hint { font-size: var(--fs-secondary); color: var(--color-text-muted); font-weight: normal; }

/* ── PORTRAIT ────────────────────────────────────────────── */
.portrait-upload { display: flex; align-items: flex-start; gap: var(--space-sm); }
.portrait-dropzone {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 120px;
  height: 120px;
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-elevated);
  cursor: pointer;
  overflow: hidden;
  transition: border-color var(--transition-fast);
  flex-shrink: 0;
}
.portrait-dropzone:hover { border-color: var(--color-gold); }
.portrait-dropzone--filled { border-style: solid; border-color: var(--color-border-glow); }
.portrait-preview { width: 100%; height: 100%; object-fit: cover; display: block; }
.portrait-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-xs);
  color: var(--color-text-muted);
  font-size: var(--fs-secondary);
  font-family: var(--font-flavor);
  font-style: italic;
  text-align: center;
  padding: var(--space-sm);
}
.portrait-icon { font-size: 1.6rem; line-height: 1; }
.portrait-input {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
}
.portrait-clear {
  background: none;
  border: 1px solid var(--color-crimson-dim, #5a2a2a);
  color: var(--color-crimson-light, #c06060);
  border-radius: var(--radius-sm);
  padding: var(--space-xs) var(--space-sm);
  font-size: var(--fs-secondary);
  cursor: pointer;
  align-self: flex-end;
  transition: border-color var(--transition-fast), color var(--transition-fast);
}
.portrait-clear:hover { border-color: var(--color-crimson); color: var(--color-crimson); }
.field-label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.custom-occ-label {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  font-family: var(--font-heading);
  font-size: var(--fs-micro);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-text-muted);
  cursor: pointer;
  user-select: none;
  transition: color var(--transition-fast);
}
.custom-occ-label:hover {
  color: var(--color-arcane);
}
.custom-occ-checkbox {
  appearance: none;
  -webkit-appearance: none;
  width: 14px;
  height: 14px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  cursor: pointer;
  flex-shrink: 0;
  position: relative;
  transition: all var(--transition-fast);
}
.custom-occ-checkbox:hover {
  border-color: var(--color-arcane-dim);
}
.custom-occ-checkbox:checked {
  background: var(--color-arcane-glow);
  border-color: var(--color-arcane);
}
.custom-occ-checkbox:checked::after {
  content: '';
  position: absolute;
  left: 3px;
  top: 1px;
  width: 5px;
  height: 8px;
  border: 1.5px solid var(--color-arcane);
  border-top: none;
  border-left: none;
  transform: rotate(45deg);
}
.field-label {
  font-family: var(--font-heading);
  font-size: var(--fs-field-label);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-text-muted);
}
.random-name-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  font-size: 0.95rem;
  background: transparent;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  color: var(--color-text-muted);
  cursor: pointer;
  transition: all var(--transition-fast);
  flex-shrink: 0;
  line-height: 1;
}
.random-name-btn:hover:not(:disabled) {
  border-color: var(--color-arcane-dim);
  color: var(--color-arcane);
  background: var(--color-arcane-glow);
}
.random-name-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.required { color: var(--color-crimson); }
.field-input, .field-textarea {
  background: var(--color-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-sm) var(--space-md);
  color: var(--color-text-primary);
  font-family: var(--font-body);
  font-size: var(--fs-field-input);
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

/* ── OCCUPATION SELECT ───────────────────────────────────── */
.field-select {
  background: var(--color-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-sm) var(--space-md);
  color: var(--color-text-primary);
  font-family: var(--font-body);
  font-size: var(--fs-field-input);
  outline: none;
  width: 100%;
  cursor: pointer;
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}
.field-select:focus {
  border-color: var(--color-arcane-dim);
  box-shadow: var(--shadow-glow);
}
.field-select option { background: var(--color-elevated); color: var(--color-text-primary); }
.occupation-hint {
  margin-top: var(--space-xs);
  font-family: var(--font-flavor);
  font-style: italic;
  font-size: var(--fs-section-hint);
  color: var(--color-arcane);
  display: flex; gap: var(--space-sm); flex-wrap: wrap;
}

/* ── POINTS D'OCCUPATION ─────────────────────────────────── */
.points-trackers {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  margin-bottom: var(--space-lg);
}
.occ-points-tracker {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--space-sm);
  background: var(--color-elevated);
  border: 1px solid var(--color-border);
  border-left: 3px solid var(--color-arcane);
  border-radius: var(--radius-md);
  padding: var(--space-sm) var(--space-md);
  font-family: var(--font-heading);
  font-size: var(--fs-secondary);
  letter-spacing: 0.06em;
  transition: border-color var(--transition-fast);
}
.occ-points-tracker--int {
  border-left-color: var(--color-gold);
}
.occ-points-tracker--int .occ-points-count,
.occ-points-tracker--int .occ-points-remaining {
  color: var(--color-gold);
}
.occ-points-tracker.occ-points-over {
  border-left-color: var(--color-crimson);
}
.occ-points-label {
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--color-text-muted);
  font-size: var(--fs-micro);
}
.occ-points-formula {
  font-family: var(--font-flavor);
  font-style: italic;
  color: var(--color-text-secondary);
  font-size: var(--fs-secondary);
}
.occ-points-sep {
  color: var(--color-border);
}
.occ-points-count {
  color: var(--color-arcane);
  font-weight: bold;
}
.occ-points-over .occ-points-count {
  color: var(--color-crimson);
}
.occ-points-remaining {
  margin-left: auto;
  font-weight: bold;
  color: var(--color-arcane);
}
.occ-points-over .occ-points-remaining {
  color: var(--color-crimson);
}
.occ-overflow-badge {
  display: inline-block;
  margin-left: var(--space-xs);
  padding: 1px 6px;
  background: rgba(139, 58, 58, 0.15);
  border: 1px solid var(--color-crimson-dim);
  border-radius: var(--radius-sm);
  color: var(--color-crimson);
  font-size: var(--fs-micro);
  letter-spacing: 0.08em;
}

/* ── HIGHLIGHT ───────────────────────────────────────────── */
.highlight-hint {
  font-family: var(--font-flavor);
  font-style: italic;
  font-size: var(--fs-section-hint);
  color: var(--color-text-muted);
  margin-bottom: var(--space-md);
}
.highlight-sample {
  padding: 0 4px;
  border-radius: 2px;
}
.highlight-sample--fixed {
  color: var(--color-gold);
  background: rgba(184, 146, 74, 0.08);
}
.highlight-sample--choice {
  color: var(--color-arcane);
  background: rgba(127, 179, 138, 0.08);
}
.comp-highlighted {
  background: rgba(184, 146, 74, 0.07) !important;
  border-left: 2px solid var(--color-gold);
}
.comp-highlighted .comp-name { color: var(--color-gold); }
.comp-choice {
  background: rgba(127, 179, 138, 0.06) !important;
  border-left: 2px solid var(--color-arcane);
}
.comp-choice .comp-name { color: var(--color-arcane); }
.comp-category {
  cursor: default;
  border-left: 2px solid var(--color-border);
}
.comp-category-badge {
  color: var(--color-text-muted);
  text-align: right;
  font-size: var(--fs-secondary);
}
.variable-group--highlighted {
  outline: 1px solid rgba(184, 146, 74, 0.35);
  outline-offset: 4px;
  border-radius: var(--radius-sm);
}
.variable-group--highlighted .variable-subtitle { color: var(--color-gold); }
.variable-group--choice {
  outline: 1px solid rgba(127, 179, 138, 0.3);
  outline-offset: 4px;
  border-radius: var(--radius-sm);
}
.variable-group--choice .variable-subtitle { color: var(--color-arcane); }

/* ── CHOICE PICKER ───────────────────────────────────────── */
.choice-picker {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  margin-bottom: var(--space-md);
}
.choice-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: var(--space-xs) var(--space-sm);
  background: rgba(127, 179, 138, 0.05);
  border-left: 2px solid var(--color-arcane);
  border-radius: var(--radius-sm);
}
.choice-label {
  font-family: var(--font-flavor);
  font-style: italic;
  font-size: var(--fs-secondary);
  color: var(--color-arcane);
}
.choice-slots {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-xs);
}
.choice-slot-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  min-width: 160px;
  max-width: 260px;
}
.choice-select {
  width: 100%;
}
.choice-select--sub {
  border-color: var(--color-arcane-dim);
  font-style: italic;
}
.choice-label--fixed {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
}
.choice-badge-fixed {
  font-family: var(--font-heading);
  font-style: normal;
  font-size: var(--fs-micro);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-gold);
  border: 1px solid rgba(184,146,74,0.4);
  border-radius: 2px;
  padding: 1px 5px;
}
.choice-group--fixed-spec {
  border-left-color: var(--color-gold);
  background: rgba(184,146,74,0.04);
}
.choice-group--free-choice {
  border-left-color: var(--color-text-muted);
}
.input-locked {
  opacity: 0.7;
  cursor: default;
  background: rgba(184,146,74,0.04) !important;
  color: var(--color-gold) !important;
  border-color: rgba(184,146,74,0.3) !important;
}

/* ── GÉNÉRATION DES CARACTÉRISTIQUES ─────────────────────── */
.gen-methods {
  display: flex; flex-wrap: wrap; gap: 4px;
  margin-bottom: var(--space-md);
}
.gen-method-btn {
  font-family: var(--font-heading);
  font-size: var(--fs-secondary);
  letter-spacing: 0.08em;
  color: var(--color-text-muted);
  background: transparent;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: var(--space-xs) var(--space-md);
  cursor: pointer;
  transition: all var(--transition-fast);
}
.gen-method-btn:hover { color: var(--color-text-secondary); border-color: var(--color-border-glow); }
.gen-method-btn--active {
  color: var(--color-gold);
  border-color: var(--color-gold);
  background: rgba(184,146,74,0.08);
}
.gen-panel {
  display: flex; flex-direction: column; gap: var(--space-sm);
  margin-bottom: var(--space-md);
  padding: var(--space-md);
  background: var(--color-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}
.gen-panel-actions { display: flex; align-items: center; flex-wrap: wrap; gap: var(--space-md); }
.gen-formula-hint { font-family: var(--font-flavor); font-style: italic; font-size: var(--fs-secondary); color: var(--color-text-muted); }
.gen-hint { font-family: var(--font-flavor); font-style: italic; font-size: var(--fs-secondary); color: var(--color-gold); }
.gen-low-stats {
  display: flex; align-items: center; flex-wrap: wrap; gap: var(--space-sm);
  padding: var(--space-sm) var(--space-md);
  background: rgba(139,58,58,0.12);
  border: 1px solid rgba(139,58,58,0.3);
  border-radius: var(--radius-sm);
  font-size: var(--fs-secondary);
  color: var(--color-crimson);
}
.gen-opt-label { color: var(--color-text-muted); font-style: italic; font-family: var(--font-flavor); }
.gen-opt-sep { color: var(--color-border-glow); }
.gen-opt-bonus { color: var(--color-arcane); font-family: var(--font-heading); font-weight: bold; }
/* Chips pool */
.pool-chips { display: flex; flex-wrap: wrap; gap: var(--space-sm); }
.pool-chip {
  display: flex; flex-direction: column; align-items: center;
  min-width: 52px; padding: var(--space-xs) var(--space-sm);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
}
.pool-chip:hover:not(.pool-chip--assigned) { border-color: var(--color-border-glow); }
.pool-chip--selected { border-color: var(--color-gold); background: rgba(184,146,74,0.12); }
.pool-chip--assigned { border-color: var(--color-arcane-dim); background: rgba(127,179,138,0.08); cursor: pointer; }
.pool-chip-value { font-family: var(--font-heading); font-size: var(--fs-carac-code); font-weight: bold; color: var(--color-arcane); }
.pool-chip--selected .pool-chip-value { color: var(--color-gold); }
.pool-chip--assigned .pool-chip-value { color: var(--color-text-muted); }
.pool-chip-tag { font-family: var(--font-heading); font-size: 10px; letter-spacing: 0.1em; color: var(--color-arcane); margin-top: 2px; }
/* Budget achat */
.buy-budget {
  display: flex; align-items: baseline; gap: var(--space-sm);
  padding: var(--space-xs) var(--space-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
}
.buy-budget--over { border-color: var(--color-crimson); }
.buy-budget-label { font-family: var(--font-heading); font-size: var(--fs-secondary); color: var(--color-text-muted); letter-spacing: 0.1em; }
.buy-budget-value { font-family: var(--font-display); font-size: var(--fs-xl); color: var(--color-arcane); }
.buy-budget--over .buy-budget-value { color: var(--color-crimson); }
.btn-roll--sm { padding: var(--space-xs) var(--space-sm); font-size: var(--fs-secondary); }
/* Carac-input-wrap */
.carac-input-wrap { display: flex; align-items: center; gap: 4px; }
.carac-roll-btn {
  flex-shrink: 0;
  background: transparent;
  border: none;
  color: var(--color-text-muted);
  font-size: var(--fs-xl);
  cursor: pointer;
  padding: 0 2px;
  line-height: 1;
  transition: color var(--transition-fast);
}
.carac-roll-btn:hover { color: var(--color-gold); }
/* Assignation pool sur les lignes */
.carac-row--assignable { cursor: pointer; }
.carac-row--assignable:hover { background: rgba(184,146,74,0.07) !important; }
.carac-row--pool-assigned { background: rgba(127,179,138,0.06) !important; }

/* ── CARACTÉRISTIQUES ────────────────────────────────────── */
.carac-table { border: 1px solid var(--color-border); border-radius: var(--radius-md); overflow: hidden; }
.carac-header, .carac-row {
  display: grid;
  grid-template-columns: 60px 1fr 110px 60px 60px;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-sm) var(--space-md);
}
.carac-header {
  background: var(--color-elevated);
  font-family: var(--font-heading);
  font-size: var(--fs-table-header);
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--color-text-muted);
  border-bottom: 1px solid var(--color-border);
}
.col-center { text-align: center; }
.carac-row { border-bottom: 1px solid var(--color-border); }
.carac-row:last-child { border-bottom: none; }
.carac-row:nth-child(even) { background: var(--color-deep); }
.carac-code { font-family: var(--font-heading); font-size: var(--fs-carac-code); font-weight: bold; letter-spacing: 0.1em; color: var(--color-gold); }
.carac-desc { font-family: var(--font-flavor); font-style: italic; font-size: var(--fs-carac-desc); color: var(--color-text-secondary); }
.carac-input {
  background: var(--color-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: var(--space-xs) var(--space-sm);
  color: var(--color-arcane);
  font-family: var(--font-heading);
  font-size: var(--fs-carac-code); font-weight: bold;
  text-align: center; width: 100%; outline: none;
  transition: border-color var(--transition-fast);
}
.carac-input::-webkit-inner-spin-button { display: none; }
.carac-input:focus { border-color: var(--color-arcane-dim); }
.carac-derived { font-family: var(--font-heading); font-size: var(--fs-secondary); color: var(--color-text-muted); text-align: center; }

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
.derived-label { font-family: var(--font-heading); font-size: var(--fs-derived-label); letter-spacing: 0.12em; text-transform: uppercase; color: var(--color-text-muted); }
.derived-value { font-family: var(--font-display); font-size: var(--fs-derived-value); color: var(--color-arcane); line-height: 1; }
.derived-value--text { font-size: var(--fs-xl); }
.derived-formula { font-family: var(--font-flavor); font-style: italic; font-size: var(--fs-secondary); color: var(--color-text-muted); }

/* ── RICHESSE ────────────────────────────────────────────── */
.wealth-tranche {
  font-family: var(--font-flavor);
  font-style: italic;
  font-size: var(--fs-body);
  color: var(--color-gold);
  text-transform: none;
  letter-spacing: 0;
}

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
.comp-row:nth-child(4n+2),
.comp-row:nth-child(4n+3) { background: var(--color-deep); }
.comp-name { font-family: var(--font-heading); font-size: var(--fs-row-name); letter-spacing: 0.03em; color: var(--color-text-primary); }
.comp-base { font-family: var(--font-heading); font-size: var(--fs-secondary); color: var(--color-text-muted); text-align: right; }
.comp-input {
  background: var(--color-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: 2px var(--space-xs);
  color: var(--color-arcane);
  font-family: var(--font-heading);
  font-size: var(--fs-field-input); font-weight: bold;
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
  font-size: var(--fs-section-title); letter-spacing: 0.12em; text-transform: uppercase;
  color: var(--color-text-muted);
  margin-bottom: var(--space-md);
}
.variable-row { display: grid; grid-template-columns: 1fr 70px; gap: var(--space-sm); margin-bottom: var(--space-sm); }
.label-input { font-size: var(--fs-md); }
.variable-row-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--space-sm) var(--space-xl); }

/* ── ARMES ────────────────────────────────────────────────── */
.weapons-table-wrap { overflow-x: auto; }
.weapons-table {
  min-width: 640px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  overflow: hidden;
}
.weapons-header,
.weapons-row {
  display: grid;
  grid-template-columns: 1fr 70px 50px 50px 80px 80px 55px 65px 30px;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-md);
}
.weapons-header {
  background: var(--color-elevated);
  font-family: var(--font-heading);
  font-size: var(--fs-table-header);
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--color-text-muted);
  border-bottom: 1px solid var(--color-border);
}
.weapons-row { border-bottom: 1px solid var(--color-border); }
.weapons-row:last-child { border-bottom: none; }
.weapons-row:nth-child(even) { background: var(--color-deep); }
.weapons-row--melee { background: rgba(139,58,58,0.06); }
.weapon-melee-label {
  font-family: var(--font-heading);
  font-size: var(--fs-secondary);
  letter-spacing: 0.08em;
  color: var(--color-crimson);
  font-style: italic;
}
.weapon-input {
  background: var(--color-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: var(--space-xs) var(--space-sm);
  color: var(--color-text-primary);
  font-family: var(--font-heading);
  font-size: var(--fs-secondary);
  text-align: center;
  width: 100%; outline: none;
  transition: border-color var(--transition-fast);
}
.weapon-input::-webkit-inner-spin-button { display: none; }
.weapon-input:focus { border-color: var(--color-arcane-dim); }
.weapon-input--name { text-align: left; color: var(--color-text-secondary); }
.weapon-auto {
  font-family: var(--font-heading);
  font-size: var(--fs-secondary);
  color: var(--color-text-muted);
  text-align: center;
}
.weapon-fixed {
  font-family: var(--font-heading);
  font-size: var(--fs-secondary);
  color: var(--color-border-glow);
  text-align: center;
}
.weapon-save-btn {
  background: transparent; border: none;
  font-size: 14px; cursor: pointer; opacity: 0.4;
  transition: opacity var(--transition-fast);
  padding: 0; line-height: 1;
}
.weapon-save-btn:hover:not(:disabled) { opacity: 1; }
.weapon-save-btn:disabled { opacity: 0.15; cursor: not-allowed; }
.weapon-actions { display: flex; gap: 4px; align-items: center; }
.weapon-clear-btn {
  background: transparent; border: none;
  font-size: 11px; cursor: pointer; opacity: 0.3;
  transition: opacity var(--transition-fast);
  padding: 0; line-height: 1; color: var(--color-crimson);
}
.weapon-clear-btn:hover:not(:disabled) { opacity: 1; }
.weapon-clear-btn:disabled { opacity: 0.1; cursor: not-allowed; }

/* ── BIBLIOTHÈQUE D'ARMES ─────────────────────────────────── */
.library-section { margin-top: var(--space-md); }
.library-toggle {
  display: flex; align-items: center; gap: var(--space-sm);
  font-family: var(--font-heading); font-size: var(--fs-secondary);
  letter-spacing: 0.1em; text-transform: uppercase;
  color: var(--color-text-muted);
  background: transparent; border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: var(--space-xs) var(--space-md); cursor: pointer;
  transition: all var(--transition-fast);
}
.library-toggle:hover { color: var(--color-gold); border-color: var(--color-gold); }
.library-toggle-icon { font-size: var(--fs-secondary); }
.library-count {
  font-family: var(--font-heading); font-size: 11px;
  color: var(--color-arcane);
  background: rgba(127,179,138,0.15);
  border-radius: 10px; padding: 1px 6px;
}
.library-panel {
  margin-top: var(--space-sm);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  overflow: hidden;
}
.library-target-row {
  display: flex; align-items: center; gap: var(--space-md);
  padding: var(--space-sm) var(--space-md);
  background: var(--color-elevated);
  border-bottom: 1px solid var(--color-border);
}
.library-target-label { font-family: var(--font-heading); font-size: var(--fs-secondary); color: var(--color-text-muted); letter-spacing: 0.08em; }
.library-slot-btns { display: flex; gap: 4px; }
.library-slot-btn {
  font-family: var(--font-heading); font-size: var(--fs-secondary);
  color: var(--color-text-muted);
  background: transparent; border: 1px solid var(--color-border);
  border-radius: var(--radius-sm); padding: 2px var(--space-sm);
  cursor: pointer; transition: all var(--transition-fast);
}
.library-slot-btn:hover { color: var(--color-gold); border-color: var(--color-gold); }
.library-slot-btn--active { color: var(--color-gold); border-color: var(--color-gold); background: rgba(184,146,74,0.1); }
.library-tabs {
  display: flex;
  border-bottom: 1px solid var(--color-border);
}
.library-tab {
  flex: 1; font-family: var(--font-heading); font-size: var(--fs-secondary);
  letter-spacing: 0.08em;
  color: var(--color-text-muted);
  background: transparent; border: none; border-bottom: 2px solid transparent;
  padding: var(--space-sm) var(--space-md); cursor: pointer;
  transition: all var(--transition-fast);
}
.library-tab:hover { color: var(--color-text-secondary); }
.library-tab--active { color: var(--color-gold); border-bottom-color: var(--color-gold); }
.library-empty {
  padding: var(--space-lg) var(--space-md);
  text-align: center;
  font-family: var(--font-flavor); font-style: italic;
  font-size: var(--fs-secondary); color: var(--color-text-muted);
}
.library-list { max-height: 280px; overflow-y: auto; }
.library-item {
  display: flex; align-items: center; justify-content: space-between;
  gap: var(--space-md);
  padding: var(--space-sm) var(--space-md);
  border-bottom: 1px solid var(--color-border);
}
.library-item:last-child { border-bottom: none; }
.library-item:nth-child(even) { background: var(--color-deep); }
.library-item-info { display: flex; align-items: center; gap: var(--space-sm); flex: 1; min-width: 0; flex-wrap: wrap; }
.library-item-name { font-family: var(--font-heading); font-size: var(--fs-secondary); color: var(--color-text-secondary); }
.library-item-meta {
  font-family: var(--font-flavor); font-style: italic;
  font-size: var(--fs-secondary); color: var(--color-text-muted);
}
.library-item-meta::before { content: '·'; margin-right: var(--space-xs); }
.library-item-actions { display: flex; gap: var(--space-xs); flex-shrink: 0; }
.btn-import {
  font-family: var(--font-heading); font-size: var(--fs-secondary);
  letter-spacing: 0.05em; color: var(--color-arcane);
  background: transparent; border: 1px solid var(--color-arcane-dim);
  border-radius: var(--radius-sm); padding: 2px var(--space-sm);
  cursor: pointer; transition: all var(--transition-fast);
  white-space: nowrap;
}
.btn-import:hover { background: rgba(127,179,138,0.1); }
.btn-delete-arme {
  font-size: var(--fs-secondary); color: var(--color-text-muted);
  background: transparent; border: none; cursor: pointer;
  transition: color var(--transition-fast); padding: 2px 4px;
}
.btn-delete-arme:hover { color: var(--color-crimson); }
.rulebook-filters { display: flex; gap: var(--space-sm); padding: var(--space-sm) var(--space-md); border-bottom: 1px solid var(--color-border); }
.rulebook-search { flex: 1; }
.rulebook-cat { width: 180px; }

/* ── BACKGROUND ──────────────────────────────────────────── */
.background-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-md); }

/* ── ÉQUIPEMENT ──────────────────────────────────────────── */
.equip-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-sm) var(--space-md); }

/* ── PDF CREDIT ──────────────────────────────────────────── */
.pdf-credit {
  text-align: center;
  font-family: var(--font-flavor);
  font-style: italic;
  font-size: var(--fs-secondary);
  color: var(--color-text-muted);
  margin-bottom: var(--space-md);
}
.pdf-credit a {
  color: var(--color-gold);
  text-decoration: underline;
  text-underline-offset: 2px;
}
.pdf-credit a:hover {
  color: var(--color-gold-light, #d4a96a);
}

/* ── ERROR / SUCCESS ─────────────────────────────────────── */
.form-error {
  background: rgba(139, 58, 58, 0.12);
  border: 1px solid var(--color-crimson-dim);
  border-radius: var(--radius-md);
  padding: var(--space-md) var(--space-lg);
  color: var(--color-crimson-light);
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

/* ── MODIFICATEURS D'ÂGE ────────────────────────────────── */
.age-panel { border-color: var(--color-gold); }
.age-badge {
  font-family: var(--font-body);
  font-size: var(--fs-secondary);
  font-weight: normal;
  letter-spacing: 0.05em;
  text-transform: none;
  color: var(--color-gold);
  border: 1px solid var(--color-gold);
  border-radius: var(--radius-sm);
  padding: 2px var(--space-sm);
  margin-left: var(--space-sm);
  opacity: 0.8;
}
.age-rules { display: flex; flex-direction: column; gap: var(--space-md); }
.age-rule {
  display: flex; gap: var(--space-md); align-items: flex-start;
  padding: var(--space-sm) var(--space-md);
  background: var(--color-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: var(--fs-secondary);
  color: var(--color-text-secondary);
}
.age-rule--note { opacity: 0.65; }
.age-rule--edu { align-items: flex-start; }
.age-rule-glyph {
  font-family: var(--font-heading);
  font-size: var(--fs-xl);
  font-weight: bold;
  color: var(--color-gold);
  line-height: 1;
  flex-shrink: 0;
  width: 1em;
  text-align: center;
}
.age-target {
  font-family: var(--font-heading);
  font-size: var(--fs-secondary);
  color: var(--color-arcane);
  margin-left: var(--space-sm);
}
.age-hint { font-style: italic; color: var(--color-text-muted); margin-left: var(--space-xs); }
.age-edu { display: flex; flex-direction: column; gap: var(--space-sm); flex: 1; }
.btn-roll {
  align-self: flex-start;
  font-family: var(--font-heading);
  font-size: var(--fs-secondary);
  letter-spacing: 0.1em;
  color: var(--color-gold);
  background: transparent;
  border: 1px solid var(--color-gold);
  border-radius: var(--radius-sm);
  padding: var(--space-xs) var(--space-md);
  cursor: pointer;
  transition: background var(--transition-fast), opacity var(--transition-fast);
}
.btn-roll:hover:not(:disabled) { background: rgba(184,146,74,0.12); }
.btn-roll:disabled { opacity: 0.35; cursor: not-allowed; }
.edu-results { display: flex; flex-direction: column; gap: 4px; margin-top: var(--space-xs); }
.edu-result {
  display: grid;
  grid-template-columns: 60px 40px 1fr 60px;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-sm);
  font-family: var(--font-heading);
  font-size: var(--fs-secondary);
}
.edu-result--success { background: rgba(127,179,138,0.08); border: 1px solid rgba(127,179,138,0.2); }
.edu-result--fail { background: var(--color-deep); border: 1px solid var(--color-border); opacity: 0.6; }
.edu-result-label { color: var(--color-text-muted); }
.edu-result-roll { font-size: var(--fs-carac-code); font-weight: bold; text-align: center; }
.edu-result--success .edu-result-roll { color: var(--color-arcane); }
.edu-result--fail .edu-result-roll { color: var(--color-text-muted); }
.edu-result-vs { color: var(--color-text-muted); font-style: italic; font-family: var(--font-flavor); }
.edu-result-outcome { font-weight: bold; text-align: right; }
.edu-result--success .edu-result-outcome { color: var(--color-arcane); }
.edu-result--fail .edu-result-outcome { color: var(--color-text-muted); }
.edu-total {
  margin-top: var(--space-xs);
  padding: var(--space-xs) var(--space-sm);
  font-size: var(--fs-secondary);
  color: var(--color-text-secondary);
  border-top: 1px solid var(--color-border);
}
/* Transition d'apparition */
.age-panel-enter-active { transition: opacity 0.3s, transform 0.3s; }
.age-panel-leave-active { transition: opacity 0.2s, transform 0.2s; }
.age-panel-enter-from, .age-panel-leave-to { opacity: 0; transform: translateY(-6px); }

/* ── CHANCE ──────────────────────────────────────────────── */
.chance-row { display: flex; }
.chance-card {
  display: flex; align-items: center; gap: var(--space-xl);
  background: var(--color-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-md) var(--space-xl);
}
.chance-input-group { display: flex; align-items: center; }
.chance-input {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: var(--space-sm) var(--space-md);
  color: var(--color-arcane);
  font-family: var(--font-heading);
  font-size: 2rem; font-weight: bold;
  text-align: center; width: 90px; outline: none;
  transition: border-color var(--transition-fast);
}
.chance-input::-webkit-inner-spin-button { display: none; }
.chance-input:focus { border-color: var(--color-arcane-dim); }

.chance-roll-col { display: flex; flex-direction: column; gap: var(--space-sm); align-items: flex-start; }
.chance-formula {
  font-family: var(--font-flavor);
  font-style: italic;
  font-size: var(--fs-secondary);
  color: var(--color-text-muted);
}
.chance-youth-note { color: var(--color-gold); }

/* ── SUBMIT ──────────────────────────────────────────────── */
.form-actions {
  display: flex; justify-content: center; gap: var(--space-md); flex-wrap: wrap;
  position: sticky; bottom: 0; z-index: 10;
  padding: var(--space-md) var(--space-xl);
}
.btn-save {
  font-family: var(--font-heading);
  font-size: var(--fs-btn); font-weight: bold;
  letter-spacing: 0.18em; text-transform: uppercase;
  color: var(--color-arcane);
  background: transparent;
  border: 1px solid var(--color-arcane-dim);
  border-radius: var(--radius-md);
  padding: var(--space-md) var(--space-2xl);
  cursor: pointer; min-width: 200px;
  opacity: 0.45;
  transform: scale(0.88);
  transition: all var(--transition-fast);
}
.form-actions:not(.is-stuck) .btn-save { opacity: 1; transform: scale(1); }
.btn-save:hover:not(:disabled) { background: var(--color-arcane-glow); opacity: 1; transform: scale(1); }
.btn-save:disabled { opacity: 0.2; cursor: not-allowed; transform: scale(0.88); }
.btn-generate {
  font-family: var(--font-heading);
  font-size: var(--fs-btn); font-weight: bold;
  letter-spacing: 0.18em; text-transform: uppercase;
  color: var(--color-deep);
  background: var(--color-arcane);
  border: none; border-radius: var(--radius-md);
  padding: var(--space-md) var(--space-2xl);
  cursor: pointer; min-width: 220px;
  opacity: 0.45;
  transform: scale(0.88);
  transition: opacity var(--transition-fast), box-shadow var(--transition-fast), transform var(--transition-fast);
}
.form-actions:not(.is-stuck) .btn-generate { opacity: 1; transform: scale(1); }
.btn-generate:hover:not(:disabled) { opacity: 1; transform: scale(1); box-shadow: var(--shadow-glow); }
.btn-generate:disabled { opacity: 0.2; cursor: not-allowed; transform: scale(0.88); }
.bottom-sentinel { height: 1px; }
.btn-sigil { display: inline-block; animation: pulse-sigil 1s ease-in-out infinite; font-size: var(--fs-xl); }
@keyframes pulse-sigil { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; } }

/* ── RESPONSIVE ──────────────────────────────────────────── */
@media (max-width: 700px) {
  .page-wrapper { padding: var(--space-md); }
  .identity-grid { grid-template-columns: 1fr; }
  .derived-grid { grid-template-columns: repeat(4, 1fr); }
  .carac-header, .carac-row { grid-template-columns: 50px 1fr 85px 50px 50px; }
  .comp-grid { grid-template-columns: 1fr; }
  .comp-row { border-right: none; }
  .comp-row:nth-child(4n+2),
  .comp-row:nth-child(4n+3) { background: unset; }
  .comp-row:nth-child(even) { background: var(--color-deep); }
  .variable-grid { grid-template-columns: 1fr; }
  .variable-group--full { grid-column: span 1; }
  .variable-row-grid { grid-template-columns: 1fr; }
  .background-grid { grid-template-columns: 1fr; }
  .chance-card {
    flex-direction: column;
    align-items: stretch;
    gap: var(--space-md);
    padding: var(--space-md);
    width: 100%;
    box-sizing: border-box;
  }
  .chance-roll-col { align-items: stretch; }
  .btn-roll { width: 100%; text-align: center; }
}
@media (max-width: 480px) {
  .page-wrapper { padding: var(--space-sm); }
  /* Table carac : scroll horizontal, description masquée */
  .carac-table { overflow-x: auto; }
  .carac-desc { display: none; }
  .carac-header, .carac-row {
    grid-template-columns: 52px 1fr 48px 48px;
    gap: var(--space-sm);
    padding: var(--space-xs) var(--space-sm);
  }
  /* Stats dérivées : 3 colonnes */
  .derived-grid { grid-template-columns: repeat(3, 1fr); gap: var(--space-sm); }
  .derived-card { padding: var(--space-sm); }
}
</style>
