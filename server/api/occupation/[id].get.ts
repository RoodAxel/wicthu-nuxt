import { prisma } from '#server/lib/prisma'

/** Référence de compétence servie aux pickers du formulaire de création. */
const competenceRef = {
  select: {
    id: true, name: true, isCategory: true,
    children: { select: { id: true, name: true }, orderBy: { name: 'asc' as const } }
  }
}

export default defineEventHandler(async (event) => {
  const param = getRouterParam(event, 'id')
  if (!param) throw createError({ statusCode: 400, message: 'Identifiant manquant' })

  // Accepte l'id numérique (utilisé par le formulaire de création) ou le slug
  // (utilisé par les liens de la page de liste).
  const asId = Number(param)
  const where = Number.isInteger(asId) && asId > 0 ? { id: asId } : { slug: param }

  const occupation = await prisma.occupation.findUnique({
    where,
    include: {
      parent: { select: { id: true, name: true, slug: true } },
      children: {
        orderBy: { name: 'asc' },
        select: {
          id: true, name: true, slug: true, credit_min: true, credit_max: true,
          point_competence: true, contacts: true, era: true, is_lovecraftian: true
        }
      },
      skills: {
        orderBy: { sortOrder: 'asc' },
        include: {
          competence: competenceRef,
          options: {
            include: { competence: competenceRef }
          }
        }
      }
    }
  })

  if (!occupation) throw createError({ statusCode: 404, message: 'Occupation introuvable' })

  return occupation
})
