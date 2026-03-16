export type OccupationListItem = {
  id: number
  name: string
  credit_min: number | null
  credit_max: number | null
  point_competence: string | null
  is_lovecraftian: boolean
  is_modern: boolean
}

export type OccupationSkill = {
  type: string
  competence: { name: string } | null
  options: { competence: { name: string } }[]
}

export type OccupationDetail = OccupationListItem & { skills: OccupationSkill[] }
