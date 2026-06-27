import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// ── TYPES ────────────────────────────────────────────────────────────────────

type SkillDef
  = | { type: 'FIXED', name: string }
    | { type: 'FIXED_SPEC', categoryName: string, specName: string }
    | { type: 'FREE_SPEC', categoryName: string, note?: string }
    | { type: 'CHOICE_FROM_LIST', count: number, options: string[], note?: string }
    | { type: 'FREE_CHOICE', count: number, note?: string }

type OccupationDef = {
  name: string
  credit_min: number
  credit_max: number
  point_competence: string
  is_lovecraftian?: boolean
  is_modern?: boolean
  skills: SkillDef[]
}

// ── HELPERS ──────────────────────────────────────────────────────────────────

const SOCIAL: string[] = ['Baratin', 'Charme', 'Intimidation', 'Persuasion']

// ── DONNÉES ──────────────────────────────────────────────────────────────────

const occupations: OccupationDef[] = [
  {
    name: 'Athlète',
    credit_min: 9, credit_max: 70,
    point_competence: 'ÉDU x 2 + (DEX x 2 ou FOR x 2)',
    skills: [
      { type: 'FIXED_SPEC', categoryName: 'Combat rapproché', specName: 'Corps à corps' },
      { type: 'FIXED', name: 'Équitation' },
      { type: 'FIXED', name: 'Grimper' },
      { type: 'FIXED', name: 'Lancer' },
      { type: 'FIXED', name: 'Nager' },
      { type: 'FIXED', name: 'Sauter' },
      { type: 'CHOICE_FROM_LIST', count: 1, options: SOCIAL, note: 'compétence sociale' },
      { type: 'FREE_CHOICE', count: 1 }
    ]
  },
  {
    name: 'Avocat',
    credit_min: 30, credit_max: 80,
    point_competence: 'ÉDU x 4',
    skills: [
      { type: 'FIXED', name: 'Bibliothèque' },
      { type: 'FIXED', name: 'Comptabilité' },
      { type: 'FIXED', name: 'Droit' },
      { type: 'FIXED', name: 'Psychologie' },
      { type: 'CHOICE_FROM_LIST', count: 2, options: SOCIAL, note: 'compétences sociales' },
      { type: 'FREE_CHOICE', count: 2 }
    ]
  },
  {
    name: 'Bibliothécaire',
    credit_min: 9, credit_max: 35,
    point_competence: 'ÉDU x 4',
    is_lovecraftian: true,
    skills: [
      { type: 'FIXED', name: 'Bibliothèque' },
      { type: 'FIXED', name: 'Comptabilité' },
      { type: 'FIXED', name: 'Langue maternelle' },
      { type: 'FIXED', name: 'Langues' },
      { type: 'FREE_CHOICE', count: 4, note: 'spécialités personnelles ou des lectures spécifiques' }
    ]
  },
  {
    name: 'Criminel',
    credit_min: 5, credit_max: 65,
    point_competence: 'ÉDU x 2 + (DEX x 2 ou APP x 2)',
    skills: [
      { type: 'FIXED', name: 'Discrétion' },
      { type: 'FIXED', name: 'Psychologie' },
      { type: 'FIXED', name: 'Trouver Objet Caché' },
      { type: 'CHOICE_FROM_LIST', count: 1, options: SOCIAL, note: 'compétence sociale' },
      { type: 'CHOICE_FROM_LIST', count: 4,
        options: ['Combat à distance', 'Combat rapproché', 'Crochetage', 'Estimation', 'Imposture', 'Mécanique', 'Pickpocket'],
        note: 'spécialités au choix' }
    ]
  },
  {
    name: 'Détective privé',
    credit_min: 9, credit_max: 30,
    point_competence: 'ÉDU x 2 + (DEX x 2 ou FOR x 2)',
    skills: [
      { type: 'FIXED_SPEC', categoryName: 'Arts et métiers', specName: 'Photographie' },
      { type: 'FIXED', name: 'Bibliothèque' },
      { type: 'FIXED', name: 'Droit' },
      { type: 'FIXED', name: 'Imposture' },
      { type: 'FIXED', name: 'Psychologie' },
      { type: 'FIXED', name: 'Trouver Objet Caché' },
      { type: 'CHOICE_FROM_LIST', count: 1, options: SOCIAL, note: 'compétence sociale' },
      { type: 'FREE_CHOICE', count: 1 }
    ]
  },
  {
    name: 'Dilettante',
    credit_min: 50, credit_max: 99,
    point_competence: 'ÉDU x 2 + APP x 2',
    is_lovecraftian: true,
    skills: [
      { type: 'FREE_SPEC', categoryName: 'Arts et métiers' },
      { type: 'FREE_SPEC', categoryName: 'Combat à distance' },
      { type: 'FIXED', name: 'Équitation' },
      { type: 'FREE_SPEC', categoryName: 'Langues' },
      { type: 'CHOICE_FROM_LIST', count: 1, options: SOCIAL, note: 'compétence sociale' },
      { type: 'FREE_CHOICE', count: 3 }
    ]
  },
  {
    name: 'Écrivain',
    credit_min: 9, credit_max: 30,
    point_competence: 'ÉDU x 4',
    is_lovecraftian: true,
    skills: [
      { type: 'FIXED_SPEC', categoryName: 'Arts et métiers', specName: 'Littérature' },
      { type: 'FIXED', name: 'Bibliothèque' },
      { type: 'FIXED', name: 'Histoire' },
      { type: 'FIXED', name: 'Langue maternelle' },
      { type: 'FIXED', name: 'Langues' },
      { type: 'CHOICE_FROM_LIST', count: 1, options: ['Naturalisme', 'Occultisme'] },
      { type: 'FIXED', name: 'Psychologie' },
      { type: 'FREE_CHOICE', count: 1 }
    ]
  },
  {
    name: 'Fanatique',
    credit_min: 0, credit_max: 30,
    point_competence: 'ÉDU x 2 + (APP x 2 ou POU x 2)',
    skills: [
      { type: 'FIXED', name: 'Discrétion' },
      { type: 'FIXED', name: 'Histoire' },
      { type: 'FIXED', name: 'Psychologie' },
      { type: 'CHOICE_FROM_LIST', count: 2, options: SOCIAL, note: 'compétences sociales' },
      { type: 'FREE_CHOICE', count: 3 }
    ]
  },
  {
    name: 'Agriculteur',
    credit_min: 9, credit_max: 30,
    point_competence: 'ÉDU x 2 + (DEX x 2 ou FOR x 2)',
    skills: [
      { type: 'FIXED_SPEC', categoryName: 'Arts et métiers', specName: 'Agriculture' },
      { type: 'CHOICE_FROM_LIST', count: 1, options: ['Conduite', 'Conduite d\'attelage'], note: 'Conduite ou Conduite d\'attelage' },
      { type: 'FIXED', name: 'Conduite engin lourd' },
      { type: 'FIXED', name: 'Mécanique' },
      { type: 'FIXED', name: 'Naturalisme' },
      { type: 'FIXED', name: 'Pister' },
      { type: 'CHOICE_FROM_LIST', count: 1, options: SOCIAL, note: 'compétence sociale' },
      { type: 'FREE_CHOICE', count: 1 }
    ]
  },
  {
    name: 'Antiquaire',
    credit_min: 30, credit_max: 70,
    point_competence: 'ÉDU x 4',
    is_lovecraftian: true,
    skills: [
      { type: 'FREE_SPEC', categoryName: 'Arts et métiers' },
      { type: 'FIXED', name: 'Bibliothèque' },
      { type: 'FIXED', name: 'Estimation' },
      { type: 'FIXED', name: 'Histoire' },
      { type: 'FREE_SPEC', categoryName: 'Langues' },
      { type: 'FIXED', name: 'Trouver Objet Caché' },
      { type: 'CHOICE_FROM_LIST', count: 1, options: SOCIAL, note: 'compétence sociale' },
      { type: 'FREE_CHOICE', count: 1 }
    ]
  },
  {
    name: 'Artiste plasticien',
    credit_min: 9, credit_max: 50,
    point_competence: 'ÉDU x 2 + (DEX x 2 ou POU x 2)',
    skills: [
      { type: 'FREE_SPEC', categoryName: 'Arts et métiers' },
      { type: 'CHOICE_FROM_LIST', count: 1, options: ['Histoire', 'Naturalisme'] },
      { type: 'FREE_SPEC', categoryName: 'Langues' },
      { type: 'FIXED', name: 'Psychologie' },
      { type: 'FIXED', name: 'Trouver Objet Caché' },
      { type: 'CHOICE_FROM_LIST', count: 1, options: SOCIAL, note: 'compétence sociale' },
      { type: 'FREE_CHOICE', count: 2 }
    ]
  },
  {
    name: 'Artiste scénique',
    credit_min: 9, credit_max: 70,
    point_competence: 'ÉDU x 2 + APP x 2',
    skills: [
      { type: 'FREE_SPEC', categoryName: 'Arts et métiers', note: 'Comédie, Chant, Humour, etc.' },
      { type: 'FIXED', name: 'Écouter' },
      { type: 'FIXED', name: 'Imposture' },
      { type: 'FIXED', name: 'Psychologie' },
      { type: 'CHOICE_FROM_LIST', count: 2, options: SOCIAL, note: 'compétences sociales' },
      { type: 'FREE_CHOICE', count: 2 }
    ]
  },
  {
    name: 'Officier militaire',
    credit_min: 20, credit_max: 70,
    point_competence: 'ÉDU x 2 + (DEX x 2 ou FOR x 2)',
    skills: [
      { type: 'FREE_SPEC', categoryName: 'Combat à distance' },
      { type: 'FIXED', name: 'Comptabilité' },
      { type: 'FIXED', name: 'Orientation' },
      { type: 'FIXED', name: 'Premiers soins' },
      { type: 'FIXED', name: 'Psychologie' },
      { type: 'CHOICE_FROM_LIST', count: 2, options: SOCIAL, note: 'compétences sociales' },
      { type: 'FREE_CHOICE', count: 1 }
    ]
  },
  {
    name: 'Parapsychologue',
    credit_min: 9, credit_max: 30,
    point_competence: 'ÉDU x 4',
    skills: [
      { type: 'FIXED', name: 'Anthropologie' },
      { type: 'FIXED_SPEC', categoryName: 'Arts et métiers', specName: 'Photographie' },
      { type: 'FIXED', name: 'Bibliothèque' },
      { type: 'FIXED', name: 'Histoire' },
      { type: 'FREE_SPEC', categoryName: 'Langues' },
      { type: 'FIXED', name: 'Occultisme' },
      { type: 'FIXED', name: 'Psychologie' },
      { type: 'FREE_CHOICE', count: 1 }
    ]
  },
  {
    name: 'Pilote',
    credit_min: 20, credit_max: 70,
    point_competence: 'ÉDU x 2 + DEX x 2',
    skills: [
      { type: 'FIXED', name: 'Conduite engin lourd' },
      { type: 'FIXED', name: 'Électricité' },
      { type: 'FIXED', name: 'Mécanique' },
      { type: 'FIXED', name: 'Orientation' },
      { type: 'FIXED_SPEC', categoryName: 'Pilotage', specName: 'Avions' },
      { type: 'FIXED_SPEC', categoryName: 'Sciences', specName: 'Astronomie' },
      { type: 'FREE_CHOICE', count: 2 }
    ]
  },
  {
    name: 'Pirate informatique',
    credit_min: 10, credit_max: 70,
    point_competence: 'ÉDU x 4',
    is_modern: true,
    skills: [
      { type: 'FIXED', name: 'Bibliothèque' },
      { type: 'FIXED', name: 'Électricité' },
      { type: 'FIXED', name: 'Électronique' },
      { type: 'FIXED', name: 'Informatique' },
      { type: 'FIXED', name: 'Trouver Objet Caché' },
      { type: 'CHOICE_FROM_LIST', count: 1, options: SOCIAL, note: 'compétence sociale' },
      { type: 'FREE_CHOICE', count: 2 }
    ]
  },
  {
    name: 'Professeur',
    credit_min: 20, credit_max: 70,
    point_competence: 'ÉDU x 4',
    is_lovecraftian: true,
    skills: [
      { type: 'FIXED', name: 'Bibliothèque' },
      { type: 'FIXED', name: 'Langue maternelle' },
      { type: 'FREE_SPEC', categoryName: 'Langues' },
      { type: 'FIXED', name: 'Psychologie' },
      { type: 'FREE_CHOICE', count: 4, note: 'spécialités personnelles ou universitaires' }
    ]
  },
  {
    name: 'Religieux',
    credit_min: 9, credit_max: 60,
    point_competence: 'ÉDU x 4',
    skills: [
      { type: 'FIXED', name: 'Bibliothèque' },
      { type: 'FIXED', name: 'Comptabilité' },
      { type: 'FIXED', name: 'Écouter' },
      { type: 'FIXED', name: 'Histoire' },
      { type: 'FREE_SPEC', categoryName: 'Langues' },
      { type: 'FIXED', name: 'Psychologie' },
      { type: 'CHOICE_FROM_LIST', count: 1, options: SOCIAL, note: 'compétence sociale' },
      { type: 'FREE_CHOICE', count: 1 }
    ]
  },
  {
    name: 'Soldat',
    credit_min: 9, credit_max: 30,
    point_competence: 'ÉDU x 2 + (DEX x 2 ou FOR x 2)',
    skills: [
      { type: 'FREE_SPEC', categoryName: 'Combat à distance' },
      { type: 'FREE_SPEC', categoryName: 'Combat rapproché' },
      { type: 'FIXED', name: 'Discrétion' },
      { type: 'FIXED', name: 'Esquive' },
      { type: 'CHOICE_FROM_LIST', count: 1, options: ['Grimper', 'Nager'] },
      { type: 'FIXED', name: 'Survie' },
      { type: 'CHOICE_FROM_LIST', count: 2, options: ['Langues', 'Mécanique', 'Premiers soins'] }
    ]
  },
  {
    name: 'Vagabond',
    credit_min: 0, credit_max: 5,
    point_competence: 'ÉDU x 2 + (APP x 2 ou DEX x 2 ou FOR x 2)',
    skills: [
      { type: 'FIXED', name: 'Discrétion' },
      { type: 'FIXED', name: 'Écouter' },
      { type: 'FIXED', name: 'Grimper' },
      { type: 'FIXED', name: 'Orientation' },
      { type: 'FIXED', name: 'Sauter' },
      { type: 'CHOICE_FROM_LIST', count: 1, options: SOCIAL, note: 'compétence sociale' },
      { type: 'FREE_CHOICE', count: 2 }
    ]
  },
  {
    name: 'Ingénieur',
    credit_min: 30, credit_max: 60,
    point_competence: 'ÉDU x 4',
    skills: [
      { type: 'FIXED_SPEC', categoryName: 'Arts et métiers', specName: 'Dessin technique' },
      { type: 'FIXED', name: 'Bibliothèque' },
      { type: 'FIXED', name: 'Conduite engin lourd' },
      { type: 'FIXED', name: 'Électricité' },
      { type: 'FIXED', name: 'Mécanique' },
      { type: 'FIXED_SPEC', categoryName: 'Sciences', specName: 'Ingénierie et Physique' },
      { type: 'FREE_CHOICE', count: 1 }
    ]
  },
  {
    name: 'Inspecteur',
    credit_min: 20, credit_max: 50,
    point_competence: 'ÉDU x 2 + (DEX x 2 ou FOR x 2)',
    is_lovecraftian: true,
    skills: [
      { type: 'CHOICE_FROM_LIST', count: 1, options: ['Arts et métiers', 'Imposture'], note: 'Arts et métiers (Comédie) ou Imposture' },
      { type: 'FREE_SPEC', categoryName: 'Combat à distance' },
      { type: 'FIXED', name: 'Droit' },
      { type: 'FIXED', name: 'Écouter' },
      { type: 'FIXED', name: 'Psychologie' },
      { type: 'FIXED', name: 'Trouver Objet Caché' },
      { type: 'CHOICE_FROM_LIST', count: 1, options: SOCIAL, note: 'compétence sociale' },
      { type: 'FREE_CHOICE', count: 1 }
    ]
  },
  {
    name: 'Journaliste',
    credit_min: 9, credit_max: 30,
    point_competence: 'ÉDU x 4',
    is_lovecraftian: true,
    skills: [
      { type: 'FIXED_SPEC', categoryName: 'Arts et métiers', specName: 'Photographie' },
      { type: 'FIXED', name: 'Bibliothèque' },
      { type: 'FIXED', name: 'Histoire' },
      { type: 'FIXED', name: 'Langue maternelle' },
      { type: 'FIXED', name: 'Psychologie' },
      { type: 'CHOICE_FROM_LIST', count: 1, options: SOCIAL, note: 'compétence sociale' },
      { type: 'FREE_CHOICE', count: 2 }
    ]
  },
  {
    name: 'Médecin',
    credit_min: 30, credit_max: 80,
    point_competence: 'ÉDU x 4',
    is_lovecraftian: true,
    skills: [
      { type: 'FIXED_SPEC', categoryName: 'Langues', specName: 'Latin' },
      { type: 'FIXED', name: 'Médecine' },
      { type: 'FIXED', name: 'Premiers soins' },
      { type: 'FIXED', name: 'Psychologie' },
      { type: 'FIXED_SPEC', categoryName: 'Sciences', specName: 'Biologie et Pharmacologie' },
      { type: 'FREE_CHOICE', count: 2, note: 'spécialités personnelles ou d\'époque' }
    ]
  },
  {
    name: 'Membre de tribu',
    credit_min: 0, credit_max: 15,
    point_competence: 'ÉDU x 2 + (DEX x 2 ou FOR x 2)',
    skills: [
      { type: 'CHOICE_FROM_LIST', count: 1, options: ['Combat rapproché', 'Lancer'] },
      { type: 'FIXED', name: 'Écouter' },
      { type: 'FIXED', name: 'Grimper' },
      { type: 'FIXED', name: 'Nager' },
      { type: 'FIXED', name: 'Naturalisme' },
      { type: 'FIXED', name: 'Occultisme' },
      { type: 'FREE_SPEC', categoryName: 'Survie' },
      { type: 'FIXED', name: 'Trouver Objet Caché' }
    ]
  },
  {
    name: 'Missionnaire',
    credit_min: 0, credit_max: 30,
    point_competence: 'ÉDU x 2 + APP x 2',
    skills: [
      { type: 'FREE_SPEC', categoryName: 'Arts et métiers' },
      { type: 'FIXED', name: 'Mécanique' },
      { type: 'FIXED', name: 'Médecine' },
      { type: 'FIXED', name: 'Naturalisme' },
      { type: 'FIXED', name: 'Premiers soins' },
      { type: 'CHOICE_FROM_LIST', count: 1, options: SOCIAL, note: 'compétence sociale' },
      { type: 'FREE_CHOICE', count: 2 }
    ]
  },
  {
    name: 'Musicien',
    credit_min: 9, credit_max: 30,
    point_competence: 'ÉDU x 2 + (APP x 2 ou DEX x 2)',
    skills: [
      { type: 'FREE_SPEC', categoryName: 'Arts et métiers', note: 'Instrument' },
      { type: 'FIXED', name: 'Écouter' },
      { type: 'FIXED', name: 'Psychologie' },
      { type: 'CHOICE_FROM_LIST', count: 1, options: SOCIAL, note: 'compétence sociale' },
      { type: 'FREE_CHOICE', count: 4 }
    ]
  },
  {
    name: 'Officier de police',
    credit_min: 9, credit_max: 30,
    point_competence: 'ÉDU x 2 + (DEX x 2 ou FOR x 2)',
    skills: [
      { type: 'FREE_SPEC', categoryName: 'Combat à distance' },
      { type: 'FIXED_SPEC', categoryName: 'Combat rapproché', specName: 'Corps à corps' },
      { type: 'FIXED', name: 'Droit' },
      { type: 'FIXED', name: 'Premiers soins' },
      { type: 'FIXED', name: 'Psychologie' },
      { type: 'FIXED', name: 'Trouver Objet Caché' },
      { type: 'CHOICE_FROM_LIST', count: 1, options: SOCIAL, note: 'compétence sociale' },
      { type: 'CHOICE_FROM_LIST', count: 1, options: ['Conduite', 'Équitation'], note: 'spécialité personnelle' }
    ]
  }
]

// ── MAIN ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🌱 Début du seed occupations...\n')

  // Charger toutes les compétences
  const competences = await prisma.competence.findMany()
  const byName = new Map(competences.map(c => [c.name.toLowerCase().trim(), c]))

  const find = (name: string): number | null => {
    const c = byName.get(name.toLowerCase().trim())
    if (!c) console.warn(`  ⚠️  Compétence introuvable: "${name}"`)
    return c?.id ?? null
  }

  // Nettoyage idempotent
  await prisma.occupationSkillOption.deleteMany()
  await prisma.occupationSkill.deleteMany()
  await prisma.occupation.deleteMany()
  console.log('🗑️  Tables occupation vidées\n')

  // Insertion
  for (const occ of occupations) {
    const created = await prisma.occupation.create({
      data: {
        name: occ.name,
        credit_min: occ.credit_min,
        credit_max: occ.credit_max,
        point_competence: occ.point_competence,
        is_lovecraftian: occ.is_lovecraftian ?? false,
        is_modern: occ.is_modern ?? false
      }
    })

    for (let i = 0; i < occ.skills.length; i++) {
      const skill = occ.skills[i]!

      if (skill.type === 'FIXED') {
        await prisma.occupationSkill.create({
          data: {
            occupationId: created.id,
            type: 'FIXED',
            competenceId: find(skill.name),
            sortOrder: i
          }
        })
      } else if (skill.type === 'FIXED_SPEC') {
        await prisma.occupationSkill.create({
          data: {
            occupationId: created.id,
            type: 'FIXED_SPEC',
            competenceId: find(skill.categoryName),
            specName: skill.specName,
            sortOrder: i
          }
        })
      } else if (skill.type === 'FREE_SPEC') {
        await prisma.occupationSkill.create({
          data: {
            occupationId: created.id,
            type: 'FREE_SPEC',
            competenceId: find(skill.categoryName),
            note: skill.note ?? null,
            sortOrder: i
          }
        })
      } else if (skill.type === 'CHOICE_FROM_LIST') {
        const createdSkill = await prisma.occupationSkill.create({
          data: {
            occupationId: created.id,
            type: 'CHOICE_FROM_LIST',
            choiceCount: skill.count,
            note: skill.note ?? null,
            sortOrder: i
          }
        })
        for (const optName of skill.options) {
          const cId = find(optName)
          if (cId) {
            await prisma.occupationSkillOption.create({
              data: {
                occupationSkillId: createdSkill.id,
                competenceId: cId
              }
            })
          }
        }
      } else if (skill.type === 'FREE_CHOICE') {
        await prisma.occupationSkill.create({
          data: {
            occupationId: created.id,
            type: 'FREE_CHOICE',
            choiceCount: skill.count,
            note: skill.note ?? null,
            sortOrder: i
          }
        })
      }
    }

    console.log(`  ✅ ${created.name} (${occ.skills.length} compétences)`)
  }

  console.log(`\n✨ Seed terminé — ${occupations.length} occupations insérées.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
