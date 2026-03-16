import { prisma } from '#server/lib/prisma'

export default defineEventHandler(async () => {
  return prisma.entite.findMany({
    orderBy: [{ categorie: 'asc' }, { name: 'asc' }],
    select: {
      id: true,
      name: true,
      titre: true,
      categorie: true,
      description: true,
      protection: true,
      attaquesParRound: true,
      perteSanteMentale: true,
      _count: {
        select: {
          statBlocks: true,
          attaques: true,
          competences: true,
          pouvoirs: true
        }
      }
    }
  })
})
