import { prisma } from '#server/lib/prisma'

/**
 * Liste des occupations pour la page de ressources et le formulaire de création.
 *
 * Les compétences sont aplaties en deux tableaux de noms pour permettre le
 * filtrage côté client sans charger le détail complet de chaque occupation :
 *   - `skillsSure`  : acquises d'office (FIXED, FIXED_SPEC, FREE_SPEC)
 *   - `skillsMaybe` : accessibles via un choix (options de CHOICE_FROM_LIST)
 */
export default defineEventHandler(async () => {
  const rows = await prisma.occupation.findMany({
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
      slug: true,
      credit_min: true,
      credit_max: true,
      point_competence: true,
      is_lovecraftian: true,
      is_modern: true,
      era: true,
      autre_name: true,
      parentId: true,
      parent: { select: { id: true, name: true, slug: true } },
      _count: { select: { children: true } },
      skills: {
        select: {
          type: true,
          specName: true,
          competence: { select: { name: true } },
          options: { select: { specName: true, competence: { select: { name: true } } } }
        }
      }
    }
  })

  return rows.map(({ skills, ...occ }) => {
    const sure = new Set<string>()
    const maybe = new Set<string>()

    // Une spécialité est ajoutée en plus de sa catégorie : « Sciences (Biologie) »
    // doit être trouvable par « Sciences » comme par « Biologie ».
    // On écarte les libellés qui ne désignent pas UNE spécialité précise
    // (« au choix », « Chimie, Physique, etc. », « Avions ou Bateaux »).
    const atomic = (spec: string) =>
      !/,|\bou\b|\bet\b|etc\.|au choix/i.test(spec)

    const add = (set: Set<string>, name: string, spec: string | null) => {
      set.add(name)
      if (spec && atomic(spec)) set.add(`${name} (${spec})`)
    }

    for (const s of skills) {
      if (s.type === 'CHOICE_FROM_LIST') {
        for (const o of s.options) add(maybe, o.competence.name, o.specName)
      } else if (s.competence) {
        add(sure, s.competence.name, s.type === 'FIXED_SPEC' ? s.specName : null)
      }
    }
    // une compétence acquise d'office n'a pas à figurer aussi comme optionnelle
    for (const n of sure) maybe.delete(n)
    return { ...occ, skillsSure: [...sure].sort(), skillsMaybe: [...maybe].sort() }
  })
})
