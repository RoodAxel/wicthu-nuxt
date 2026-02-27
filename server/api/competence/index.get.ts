import { prisma } from '#server/lib/prisma'

export default defineEventHandler(async () => {
  const competences = await prisma.competence.findMany()
  return competences
})
