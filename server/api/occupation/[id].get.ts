import { prisma } from '#server/lib/prisma'

/**
 * Détail d'une occupation, par id numérique ou par slug.
 *
 * `?pickers=1` ajoute, pour chaque compétence de catégorie, la liste de ses
 * spécialités (`competence.children`). Seul le formulaire de création en a
 * besoin, pour alimenter ses menus de choix de spécialité ; la page publique
 * ne s'en sert pas et s'en passe (le poids de la réponse double sinon).
 */
const competenceRef = (withChildren: boolean) => ({
  select: {
    id: true,
    name: true,
    isCategory: true,
    ...(withChildren
      ? { children: { select: { id: true, name: true }, orderBy: { name: 'asc' as const } } }
      : {})
  }
})

export default defineEventHandler(async (event) => {
  const param = getRouterParam(event, 'id')
  if (!param) throw createError({ statusCode: 400, message: 'Identifiant manquant' })

  const withChildren = getQuery(event)['pickers'] === '1'
  const ref = competenceRef(withChildren)

  // Accepte l'id numérique (formulaire de création) ou le slug (liens du site).
  const asId = Number(param)
  const where = Number.isInteger(asId) && asId > 0 ? { id: asId } : { slug: param }

  const occupation = await prisma.occupation.findUnique({
    // un seul SELECT avec LATERAL JOIN au lieu d'une requête par relation
    relationLoadStrategy: 'join',
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
          competence: ref,
          options: { include: { competence: ref } }
        }
      }
    }
  })

  if (!occupation) throw createError({ statusCode: 404, message: 'Occupation introuvable' })

  // `children` est toujours présent côté client, vide quand non demandé :
  // les consommateurs gardent un type unique, sans champ optionnel.
  if (withChildren) return occupation
  const fill = <T extends object>(c: T | null) => (c ? { ...c, children: [] } : null)
  return {
    ...occupation,
    skills: occupation.skills.map(s => ({
      ...s,
      competence: fill(s.competence),
      options: s.options.map(o => ({ ...o, competence: fill(o.competence)! }))
    }))
  }
})
