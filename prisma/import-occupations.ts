/**
 * Import des occupations du Manuel de l'Investigateur.
 *
 * Remplace INTÉGRALEMENT le contenu des tables occupation, OccupationSkill et
 * OccupationSkillOption par les données de `prisma/data/occupations.json`.
 *
 *   npx tsx prisma/import-occupations.ts            → simulation (n'écrit rien)
 *   npx tsx prisma/import-occupations.ts --apply    → écrit réellement
 *
 * La validation des noms de compétences est faite AVANT toute suppression :
 * si un libellé ne se résout pas, le script s'arrête sans avoir rien touché.
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { PrismaClient, type OccupationEra, type OccupationSkillType } from '@prisma/client'

const prisma = new PrismaClient()
const APPLY = process.argv.includes('--apply')
const DATA_DIR = join(import.meta.dirname, 'data')

// ── Types du fichier de données ──────────────────────────────────────────────
type SkillDef
  = | { type: 'FIXED', name: string }
    | { type: 'FIXED_SPEC', categoryName: string, specName: string }
    | { type: 'FREE_SPEC', categoryName: string, count?: number, note?: string }
    | { type: 'CHOICE_FROM_LIST', count: number, options: { name: string, specName: string | null }[], note?: string }
    | { type: 'FREE_CHOICE', count: number, note?: string | null }

type OccupationDef = {
  name: string
  parent: string | null
  era: OccupationEra | null
  is_lovecraftian: boolean
  autre_name: string[]
  voir_aussi: string[] | null
  description: string | null
  credit_min: number | null
  credit_max: number | null
  point_competence: string | null
  contacts: string | null
  note: string | null
  skills: SkillDef[]
  review: string[]
}

type NewCompetence = {
  name: string
  baseValue: number | null
  isCategory: boolean
  categoryId: number | null
  rare: boolean
  modern: boolean
}

const read = <T>(f: string): T => JSON.parse(readFileSync(join(DATA_DIR, f), 'utf8')) as T
const occupations = read<OccupationDef[]>('occupations.json')
const newCompetences = read<NewCompetence[]>('new-competences.json')

// ── Helpers ──────────────────────────────────────────────────────────────────
const norm = (s: string) =>
  s.normalize('NFD').replace(/\p{Mn}/gu, '').toLowerCase().replace(/[’']/g, '\'').trim()

function slugify(s: string): string {
  return s
    .normalize('NFD').replace(/\p{Mn}/gu, '')
    .toLowerCase()
    .replace(/[’']/g, '-')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** Slugs uniques : en cas de collision on suffixe -2, -3, … */
function buildSlugs(defs: OccupationDef[]): Map<string, string> {
  const used = new Set<string>()
  const out = new Map<string, string>()
  for (const d of defs) {
    const base = slugify(d.name)
    let slug = base
    for (let i = 2; used.has(slug); i++) slug = `${base}-${i}`
    used.add(slug)
    out.set(d.name, slug)
  }
  return out
}

/** Tous les libellés de compétence référencés par une définition. */
function referencedNames(s: SkillDef): string[] {
  switch (s.type) {
    case 'FIXED': return [s.name]
    case 'FIXED_SPEC':
    case 'FREE_SPEC': return [s.categoryName]
    case 'CHOICE_FROM_LIST': return s.options.map(o => o.name)
    case 'FREE_CHOICE': return []
  }
}

async function main() {
  const host = (process.env['DATABASE_URL'] ?? '').match(/@([^:/?]+)/)?.[1] ?? '(inconnu)'
  console.log(`\n${APPLY ? '⚠️  ÉCRITURE RÉELLE' : '🔍 SIMULATION (aucune écriture)'}`)
  console.log(`   Base cible : ${host}`)
  console.log(`   Données    : ${occupations.length} occupations, `
    + `${occupations.reduce((n, o) => n + o.skills.length, 0)} lignes de compétences\n`)

  // ── 1. Compétences existantes + celles à créer ─────────────────────────────
  const existing = await prisma.competence.findMany({ select: { id: true, name: true } })
  const byName = new Map(existing.map(c => [norm(c.name), c.id]))

  const toCreate = newCompetences.filter(c => !byName.has(norm(c.name)))
  if (toCreate.length) {
    console.log(`📌 Compétences à créer : ${toCreate.map(c => c.name).join(', ')}`)
    if (APPLY) {
      for (const c of toCreate) {
        const created = await prisma.competence.create({
          data: {
            name: c.name, baseValue: c.baseValue, isCategory: c.isCategory,
            categoryId: c.categoryId, rare: c.rare, modern: c.modern
          }
        })
        byName.set(norm(created.name), created.id)
      }
    } else {
      // en simulation, on suppose qu'elles existeront
      for (const c of toCreate) byName.set(norm(c.name), -1)
    }
  }

  // ── 2. VALIDATION avant toute suppression ──────────────────────────────────
  const missing = new Map<string, string[]>()
  for (const occ of occupations) {
    for (const s of occ.skills) {
      for (const n of referencedNames(s)) {
        if (!byName.has(norm(n))) {
          if (!missing.has(n)) missing.set(n, [])
          missing.get(n)!.push(occ.name)
        }
      }
    }
  }
  const names = new Set(occupations.map(o => o.name))
  const orphans = occupations.filter(o => o.parent && !names.has(o.parent))

  if (missing.size || orphans.length) {
    console.error('\n❌ Import interrompu — rien n’a été modifié.\n')
    for (const [n, occs] of missing) {
      console.error(`   compétence introuvable : « ${n} »  (${[...new Set(occs)].join(', ')})`)
    }
    for (const o of orphans) console.error(`   parent introuvable : ${o.name} → « ${o.parent} »`)
    process.exit(1)
  }
  console.log('✅ Tous les libellés de compétences et tous les parents se résolvent.\n')

  if (!APPLY) {
    const byType = new Map<string, number>()
    for (const o of occupations) for (const s of o.skills) byType.set(s.type, (byType.get(s.type) ?? 0) + 1)
    console.log('   Répartition des compétences :')
    for (const [t, n] of [...byType].sort((a, b) => b[1] - a[1])) console.log(`     ${String(n).padStart(4)}  ${t}`)
    console.log(`\n   Parents : ${occupations.filter(o => !o.parent && occupations.some(c => c.parent === o.name)).length}`)
    console.log(`   Variantes : ${occupations.filter(o => o.parent).length}`)
    console.log('\n   Relancer avec --apply pour écrire.\n')
    return
  }

  // ── 3. Purge ───────────────────────────────────────────────────────────────
  await prisma.occupationSkillOption.deleteMany()
  await prisma.occupationSkill.deleteMany()
  const purged = await prisma.occupation.deleteMany()
  console.log(`🗑️  ${purged.count} occupations supprimées.\n`)

  // ── 4. Insertion (passe 1 : sans parentId) ─────────────────────────────────
  const slugs = buildSlugs(occupations)
  const idByName = new Map<string, number>()

  for (const occ of occupations) {
    const created = await prisma.occupation.create({
      data: {
        name: occ.name,
        slug: slugs.get(occ.name)!,
        credit_min: occ.credit_min,
        credit_max: occ.credit_max,
        point_competence: occ.point_competence,
        era: occ.era,
        is_lovecraftian: occ.is_lovecraftian,
        // conservé pour useCreditWealth (table de richesse moderne vs années 20)
        is_modern: occ.era === 'MODERNE',
        description: occ.description,
        contacts: occ.contacts,
        note: occ.note,
        autre_name: occ.autre_name,
        voir_aussi: occ.voir_aussi ?? []
      }
    })
    idByName.set(occ.name, created.id)

    // ── Compétences de l'occupation ──
    for (const [i, s] of occ.skills.entries()) {
      const base = { occupationId: created.id, type: s.type as OccupationSkillType, sortOrder: i }
      const skill = await prisma.occupationSkill.create({
        data:
          s.type === 'FIXED'
            ? { ...base, competenceId: byName.get(norm(s.name))! }
            : s.type === 'FIXED_SPEC'
              ? { ...base, competenceId: byName.get(norm(s.categoryName))!, specName: s.specName }
              : s.type === 'FREE_SPEC'
                ? { ...base, competenceId: byName.get(norm(s.categoryName))!, choiceCount: s.count ?? 1, note: s.note ?? null }
                : s.type === 'CHOICE_FROM_LIST'
                  ? { ...base, choiceCount: s.count, note: s.note ?? null }
                  : { ...base, choiceCount: s.count, note: s.note ?? null }
      })

      if (s.type === 'CHOICE_FROM_LIST') {
        await prisma.occupationSkillOption.createMany({
          data: s.options.map(o => ({
            occupationSkillId: skill.id,
            competenceId: byName.get(norm(o.name))!,
            specName: o.specName
          }))
        })
      }
    }
  }
  console.log(`✅ ${occupations.length} occupations insérées.`)

  // ── 5. Passe 2 : rattachement des variantes à leur parent ──────────────────
  let linked = 0
  for (const occ of occupations) {
    if (!occ.parent) continue
    await prisma.occupation.update({
      where: { id: idByName.get(occ.name)! },
      data: { parentId: idByName.get(occ.parent)! }
    })
    linked++
  }
  console.log(`🔗 ${linked} variantes rattachées à leur parent.`)

  const flagged = occupations.filter(o => o.review.length)
  if (flagged.length) {
    console.log(`\nℹ️  ${flagged.length} fiches portent une note de relecture (champ "review" du JSON) :`)
    for (const o of flagged) console.log(`   ${o.name} — ${o.review[0]}`)
  }
  console.log('\n✨ Import terminé.\n')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
