import { prisma } from '#server/lib/prisma'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id || isNaN(Number(id))) {
    throw createError({ statusCode: 400, message: 'ID invalide' })
  }

  const occupation = await prisma.occupation.findUnique({
    where: { id: Number(id) },
    include: {
      skills: {
        orderBy: { sortOrder: 'asc' },
        include: {
          competence: {
            select: { id: true, name: true, isCategory: true }
          },
          options: {
            include: {
              competence: {
                select: { id: true, name: true }
              }
            }
          }
        }
      }
    }
  })

  if (!occupation) {
    throw createError({ statusCode: 404, message: 'Occupation introuvable' })
  }

  return occupation
})
