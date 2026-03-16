export type EntiteItem = {
  id: number
  name: string
  titre: string | null
  categorie: string
  description: string | null
  protection: string | null
  attaquesParRound: string | null
  perteSanteMentale: string | null
  _count: {
    statBlocks: number
    attaques: number
    competences: number
    pouvoirs: number
  }
}

export type StatBlock = {
  id: number
  formeName: string | null
  formeNote: string | null
  sortOrder: number
  forVal: string | null
  forJet: string | null
  conVal: string | null
  conJet: string | null
  taiVal: string | null
  taiJet: string | null
  dexVal: string | null
  dexJet: string | null
  intVal: string | null
  intJet: string | null
  pouVal: string | null
  pouJet: string | null
  appVal: string | null
  appJet: string | null
  eduVal: string | null
  eduJet: string | null
  pvMoyen: string | null
  impactMoy: string | null
  carrureMoy: string | null
  pmMoyen: string | null
  mouvement: string | null
}

export type Pouvoir = {
  id: number
  name: string
  description: string | null
  sortOrder: number
}

export type Attaque = {
  id: number
  name: string
  valeur: string | null
  degats: string | null
  isManoeuvre: boolean
  description: string | null
  sortOrder: number
}

export type EntiteCompetence = {
  id: number
  name: string
  valeur: string | null
  sortOrder: number
}

export type EntiteDetail = {
  id: number
  name: string
  titre: string | null
  categorie: string
  citationTexte: string | null
  citationSource: string | null
  description: string | null
  attaquesParRound: string | null
  optionsCombatDesc: string | null
  protection: string | null
  perteSanteMentale: string | null
  culteAdoration: string | null
  autresParticularites: string | null
  imageUrl: string | null
  statBlocks: StatBlock[]
  pouvoirs: Pouvoir[]
  attaques: Attaque[]
  competences: EntiteCompetence[]
}
