import { n, half, fifth } from '~/utils/investigateur/format'

/**
 * État central de la fiche : le `form` réactif (~150 champs) + les stats dérivées
 * calculées, et la synchro automatique des dérivées / des ½ & ⅕ des armes dans `form`.
 * Instancié une seule fois ; `form` est ensuite partagé avec les autres composables.
 */
export function useCharacterForm() {
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

  // ── Stats dérivées ───────────────────────────────────────────────────────────
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

  // Synchronise les dérivées + les ½/⅕ des armes dans `form` (pour l'envoi/PDF)
  watchEffect(() => {
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

  return { form, pv_max, pm_max, sm_initial, impact, carrure, mvt }
}
