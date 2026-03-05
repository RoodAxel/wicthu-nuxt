import { prisma } from '#server/lib/prisma'

export default defineEventHandler(async () => {
  return prisma.equipement_classique.findMany({ orderBy: [{ category: 'asc' }, { name: 'asc' }] })
})
