import { prisma } from '#server/lib/prisma'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id || isNaN(Number(id))) {
    throw createError({ statusCode: 400, message: 'ID invalide' })
  }

  const sort = await prisma.sort.findUnique({
    where: { id: Number(id) },
    include: {
      parent: { select: { id: true, name: true } },
      children: {
        orderBy: { name: 'asc' },
        select: {
          id:                  true,
          name:                true,
          cout:                true,
          temps_incantation:   true,
          description:         true,
          version_approfondie: true,
          autre_name:          true,
        },
      },
    },
  })

  if (!sort) {
    throw createError({ statusCode: 404, message: 'Sort introuvable' })
  }

  return sort
})
