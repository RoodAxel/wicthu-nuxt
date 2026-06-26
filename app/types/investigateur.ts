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
