import { prisma } from '#server/lib/prisma'

export default defineEventHandler(async () => {
  return prisma.arme.findMany({
    include: {
      competence: {
        select: { id: true, name: true }
      }
    },
    orderBy: [{ category: 'asc' }, { name: 'asc' }]
  })
})
