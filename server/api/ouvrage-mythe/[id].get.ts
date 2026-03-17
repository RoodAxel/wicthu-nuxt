import { prisma } from '#server/lib/prisma'
import { Prisma } from '@prisma/client'

type RawRow = {
  id: number
  titre: string
  auteur: string | null
  langue: string | null
  date: string | null
  description: string | null
  sante_mental: string | null
  gain_mythe_initial: number | null
  gain_mythe_complet: number | null
  mythe_cthulhu: number | null
  semaine: number | null
  os_id: number | null
  nom_dans_ouvrage: string | null
  note: string | null
  sort_id: number | null
  sort_name: string | null
}

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id || isNaN(Number(id))) {
    throw createError({ statusCode: 400, message: 'ID invalide' })
  }

  const rows = await prisma.$queryRaw<RawRow[]>(Prisma.sql`
    SELECT
      om.id, om.titre, om.auteur, om.langue, om.date, om.description,
      om.sante_mental, om.gain_mythe_initial, om.gain_mythe_complet,
      om.mythe_cthulhu, om.semaine,
      os.id        AS os_id,
      os.nom_dans_ouvrage,
      os.note,
      s.id         AS sort_id,
      s.name       AS sort_name
    FROM ouvrage_mythe om
    LEFT JOIN ouvrage_sort os ON os.ouvrage_id = om.id
    LEFT JOIN sort s ON s.id = os.sort_id
    WHERE om.id = ${Number(id)}
    ORDER BY os.nom_dans_ouvrage ASC
  `)

  if (!rows.length) {
    throw createError({ statusCode: 404, message: 'Ouvrage introuvable' })
  }

  const first = rows[0]!

  return {
    id: first.id,
    titre: first.titre,
    auteur: first.auteur,
    langue: first.langue,
    date: first.date,
    description: first.description,
    sante_mental: first.sante_mental,
    gain_mythe_initial: first.gain_mythe_initial,
    gain_mythe_complet: first.gain_mythe_complet,
    mythe_cthulhu: first.mythe_cthulhu,
    semaine: first.semaine,
    ouvrage_sort: rows
      .filter(r => r.os_id !== null)
      .map(r => ({
        id: r.os_id!,
        nom_dans_ouvrage: r.nom_dans_ouvrage,
        note: r.note,
        sort: r.sort_id !== null ? { id: r.sort_id, name: r.sort_name! } : null
      }))
  }
})
