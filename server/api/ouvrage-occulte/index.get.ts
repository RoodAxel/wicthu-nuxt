import { prisma } from '#server/lib/prisma'

export default defineEventHandler(async () => {
  return prisma.ouvrage_occulte.findMany({ orderBy: { title: 'asc' } })
})
