import { prisma } from '#server/lib/prisma'

export default defineEventHandler(async () => {
  return prisma.equipement_moderne.findMany({ orderBy: [{ category: 'asc' }, { name: 'asc' }] })
})
