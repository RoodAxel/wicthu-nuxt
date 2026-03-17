export type OuvrageMytheItem = {
  id: number
  titre: string
  langue: string | null
  date: string | null
  auteur: string | null
  sante_mental: string | null
  gain_mythe_initial: number | null
  gain_mythe_complet: number | null
  mythe_cthulhu: number | null
  semaine: number | null
  _count: { ouvrage_sort: number }
}

export type OuvrageSortEntry = {
  id: number
  nom_dans_ouvrage: string | null
  note: string | null
  sort: { id: number, name: string } | null
}

export type OuvrageMytheDetail = {
  id: number
  titre: string
  langue: string | null
  date: string | null
  auteur: string | null
  description: string | null
  sante_mental: string | null
  gain_mythe_initial: number | null
  gain_mythe_complet: number | null
  mythe_cthulhu: number | null
  semaine: number | null
  ouvrage_sort: OuvrageSortEntry[]
}
