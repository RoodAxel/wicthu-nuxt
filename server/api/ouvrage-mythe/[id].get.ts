import { prisma } from '#server/lib/prisma'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id || isNaN(Number(id))) {
    throw createError({ statusCode: 400, message: 'ID invalide' })
  }

  const ouvrage = await prisma.ouvrage_mythe.findUnique({
    where: { id: Number(id) },
    select: {
      id: true,
      titre: true,
      auteur: true,
      langue: true,
      date: true,
      description: true,
      sante_mental: true,
      gain_mythe_initial: true,
      gain_mythe_complet: true,
      mythe_cthulhu: true,
      semaine: true,
      ouvrage_sort: {
        orderBy: { nom_dans_ouvrage: 'asc' },
        select: {
          id: true,
          nom_dans_ouvrage: true,
          note: true,
          sort: { select: { id: true, name: true } }
        }
      }
    }
  })

  if (!ouvrage) {
    throw createError({ statusCode: 404, message: 'Ouvrage introuvable' })
  }

  return ouvrage
})
