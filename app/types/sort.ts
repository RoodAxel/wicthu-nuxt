type SortBase = {
  id: number
  name: string
  cout: string | null
  temps_incantation: string | null
  description: string | null
  version_approfondie: string | null
  autre_name: string[] | null
}

export type SortChild = SortBase

export type SortItem = SortBase & {
  _count: { children: number }
}

export type SortDetail = SortBase & {
  parentId: number | null
  parent: { id: number, name: string } | null
  children: SortChild[]
}
