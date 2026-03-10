import { prisma } from '#server/lib/prisma'

export default defineEventHandler(async () => {
  return prisma.artefact.findMany({ orderBy: { name: 'asc' } })
})
