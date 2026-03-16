import { prisma } from '#server/lib/prisma'

export default defineEventHandler(async (event) => {
  const id = parseInt(getRouterParam(event, 'id') ?? '')
  if (isNaN(id)) throw createError({ statusCode: 400, message: 'ID invalide' })

  const entite = await prisma.entite.findUnique({
    where: { id },
    include: {
      statBlocks: { orderBy: { sortOrder: 'asc' } },
      pouvoirs: { orderBy: { sortOrder: 'asc' } },
      attaques: { orderBy: { sortOrder: 'asc' } },
      competences: { orderBy: { sortOrder: 'asc' } }
    }
  })

  if (!entite) throw createError({ statusCode: 404, message: 'Entité introuvable' })
  return entite
})
