import { prisma } from '#server/lib/prisma'

export default defineEventHandler(async () => {
  return prisma.sort.findMany({
    where: { parentId: null },
    orderBy: { name: 'asc' },
    select: {
      id:                  true,
      name:                true,
      cout:                true,
      temps_incantation:   true,
      description:         true,
      version_approfondie: true,
      autre_name:          true,
      _count: {
        select: { children: true },
      },
    },
  })
})
