import { prisma } from '#server/lib/prisma'

export default defineEventHandler(async () => {
  return prisma.ouvrage_mythe.findMany({
    orderBy: { titre: 'asc' },
    select: {
      id: true,
      titre: true,
      langue: true,
      date: true,
      auteur: true,
      sante_mental: true,
      gain_mythe_initial: true,
      gain_mythe_complet: true,
      mythe_cthulhu: true,
      semaine: true,
      _count: { select: { ouvrage_sort: true } },
    },
  })
})
