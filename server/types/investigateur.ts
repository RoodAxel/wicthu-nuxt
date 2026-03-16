export interface CharacterFormData {
  Nom: string
  Joueur: string
  Occupation: string
  age: string
  Sexe: string
  'Résidence': string
  'Lieu de naissance': string
  MVT: string
  // Caractéristiques
  FOR_0: string; CON_0: string; TAI_0: string; DEX_0: string
  APP_0: string; INT_0: string; POU_0: string; EDU_0: string
  // Stats dérivées
  pv_max: string; pm_max: string; sm_initial: string
  impact: string; carrure: string
  // Langues
  LG1_label: string; LG1_0: string
  LG2_label: string; LG2_0: string
  LG3_label: string; LG3_0: string
  // Sciences
  SC1_label: string; SC1_0: string
  SC2_label: string; SC2_0: string
  SC3_label: string; SC3_0: string
  // Compétences personnelles
  CP1_label: string; CP1_0: string
  CP2_label: string; CP2_0: string
  CP3_label: string; CP3_0: string
  CP4_label: string; CP4_0: string
  CP5_label: string; CP5_0: string
  // Background
  Description: string
  ideologieEtCroyance: string
  traits: string
  personnesImportantes: string
  sequellesCicatrices: string
  lieuxSignificatifs: string
  phobiesManies: string
  'bienPrécieux': string
  ouvragesOccultes: string
  rencontresEntites: string
  // Finances
  capital: string
  depencesCourantes: string
  'Espèces': string
  // Index signature pour les champs dynamiques (compétences variables, etc.)
  [key: string]: string
}
