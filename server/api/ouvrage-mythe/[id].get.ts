import { prisma } from '#server/lib/prisma'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id || isNaN(Number(id))) {
    throw createError({ statusCode: 400, message: 'ID invalide' })
  }

  const ouvrage = await prisma.ouvrage_mythe.findUnique({
    where: { id: Number(id) },
    include: {
      ouvrage_sort: {
        orderBy: { nom_dans_ouvrage: 'asc' },
        include: {
          sort: { select: { id: true, name: true } },
        },
      },
    },
  })

  if (!ouvrage) {
    throw createError({ statusCode: 404, message: 'Ouvrage introuvable' })
  }

  return ouvrage
})
