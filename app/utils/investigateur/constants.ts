// Constantes de la fiche d'investigateur (données pures, sans réactivité).
// Extraites de app/pages/investigateur/creer.vue.

// ── MAPPING COMPÉTENCES DB → CLÉS FORMULAIRE ─────────────────────────────────
export const SKILL_TO_FORM_KEYS: Record<string, string[]> = {
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

// Spécialité → clé principale du formulaire (pour les spéc. avec slot fixe)
export const SPEC_TO_KEY: Record<string, string> = {
  'Corps à corps': 'CR1_0',
  'Armes de poing': 'CD1_0',
  'Fusils': 'CD2_0'
}

// Catégorie → slots variables (valueKey, labelKey)
export const CAT_TO_VAR: Record<string, { slots: string[], labels: string[] }> = {
  'Arts et métiers': { slots: ['AR1_0', 'AR2_0', 'AR3_0'], labels: ['AR1_label', 'AR2_label', 'AR3_label'] },
  'Combat à distance': { slots: ['CD3_0', 'CD4_0'], labels: ['CD3_label', 'CD4_label'] },
  'Combat rapproché': { slots: ['CR2_0', 'CR3_0'], labels: ['CR2_label', 'CR3_label'] },
  'Langues': { slots: ['LG1_0', 'LG2_0', 'LG3_0'], labels: ['LG1_label', 'LG2_label', 'LG3_label'] },
  'Pilotage': { slots: ['PL1_0'], labels: ['PL1_label'] },
  'Sciences': { slots: ['SC1_0', 'SC2_0', 'SC3_0'], labels: ['SC1_label', 'SC2_label', 'SC3_label'] },
  'Survie': { slots: [], labels: [] }
}

// Mapping compétence fixe → clé de formulaire + valeur de base
export const FIXED_COMPETENCE_MAP: Record<string, { key: string, base: number }> = {
  'Corps à corps': { key: 'CR1_0', base: 25 },
  'Armes de poing': { key: 'CD1_0', base: 15 },
  'Fusils': { key: 'CD2_0', base: 25 }
}

// Code caractéristique (formule de points) → clé de formulaire
export const CARAC_KEY: Record<string, string> = {
  'ÉDU': 'EDU_0', 'EDU': 'EDU_0',
  'DEX': 'DEX_0', 'FOR': 'FOR_0',
  'APP': 'APP_0', 'POU': 'POU_0',
  'CON': 'CON_0', 'TAI': 'TAI_0',
  'INT': 'INT_0'
}

// Valeur de base de chaque champ compétence (valeur sans investissement)
export const COMP_BASE: Record<string, number> = {
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

// Clés catégories parentes dans la grille : non éditables, points dans les spécialités
export const CATEGORY_KEYS = new Set([
  'ART_0', // Arts et métiers → AR1, AR2, AR3
  'SCI_0', // Sciences → SC1, SC2, SC3
  'PIL_0', // Pilotage → PL1
  'SUR_0', // Survie
  'LAG_0' // Langue maternelle → auto EDU
])

// Caractéristiques principales (8) + formules de tirage
export const caracteristiques = [
  { key: 'FOR_0', label: 'FOR', desc: 'Force', formula: '3d6' },
  { key: 'CON_0', label: 'CON', desc: 'Constitution', formula: '3d6' },
  { key: 'TAI_0', label: 'TAI', desc: 'Taille', formula: '2d6+6' },
  { key: 'DEX_0', label: 'DEX', desc: 'Dextérité', formula: '3d6' },
  { key: 'APP_0', label: 'APP', desc: 'Apparence', formula: '3d6' },
  { key: 'INT_0', label: 'INT', desc: 'Intelligence', formula: '2d6+6' },
  { key: 'POU_0', label: 'POU', desc: 'Pouvoir', formula: '3d6' },
  { key: 'EDU_0', label: 'EDU', desc: 'Éducation', formula: '2d6+6' }
] as const

// Compétences principales de la grille + valeur de base
export const competences = [
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

// Champs de la section « Background »
export const backgroundFields = [
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
