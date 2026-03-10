import { prisma } from '#server/lib/prisma'

export default defineEventHandler(async () => {
  return prisma.occupation.findMany({
    orderBy: { name: 'asc' },
    select: {
      id:              true,
      name:            true,
      credit_min:      true,
      credit_max:      true,
      point_competence: true,
      is_lovecraftian: true,
      is_modern:       true,
    },
  })
})
