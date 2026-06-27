export type OccupationListItem = {
  id: number
  name: string
  credit_min: number | null
  credit_max: number | null
  point_competence: string | null
  is_lovecraftian: boolean
  is_modern: boolean
}

type ChildComp = { id: number, name: string }
type CompetenceRef = { id: number, name: string, isCategory: boolean | null, children: ChildComp[] }

export type OccupationSkill = {
  type: 'FIXED' | 'FIXED_SPEC' | 'FREE_SPEC' | 'CHOICE_FROM_LIST' | 'FREE_CHOICE'
  competence: CompetenceRef | null
  specName: string | null
  choiceCount: number | null
  note: string | null
  options: { competence: CompetenceRef }[]
}

export type OccupationDetail = OccupationListItem & { skills: OccupationSkill[] }

// ── Pickers occupation (tout type sauf FIXED) ────────────────────────────────
type PickerBase = { i: number }
export type FixedSpecPicker = PickerBase & { type: 'FIXED_SPEC', label: string }
export type FreeSpecPicker = PickerBase & { type: 'FREE_SPEC', catName: string, children: ChildComp[] }
export type ChoiceListPicker = PickerBase & { type: 'CHOICE_FROM_LIST', count: number, note: string | null, options: OccupationSkill['options'] }
export type FreeChoicePicker = PickerBase & { type: 'FREE_CHOICE', count: number, note: string | null }
export type OccPicker = FixedSpecPicker | FreeSpecPicker | ChoiceListPicker | FreeChoicePicker

// ── Âge & génération ─────────────────────────────────────────────────────────
export type AgeCat = {
  label: string
  range: string
  eduTests: number
  eduYouthMalus: boolean
  physMalus: number
  physStats: string[]
  appMalus: number
}

export type EduTestResult = { index: number, roll: number, threshold: number, success: boolean, bonus: number }

export type PoolEntry = { value: number, assignedTo: string | null }

export type GenMethod = 'classic' | 'free' | 'buy' | 'quick'

// ── Armes (bibliothèque + catalogue) ─────────────────────────────────────────
export interface ArmePerso { id: number, nom: string, deg: string | null, port: string | null, cap: string | null, pann: string | null }
export interface ArmeRulebook { id: number, name: string, category: string, damage: string | null, range: string | null, cadence: string | null, capacity: string | null, failure: number | null, competence: { name: string, baseValue: number | null } }
