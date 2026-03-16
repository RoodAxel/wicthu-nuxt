import type { CharacterFormData } from '../types/investigateur'

function s(val: unknown): string {
  return val != null ? String(val) : ''
}
function half(val: unknown): string {
  const n = Math.floor(Number(val) / 2)
  return n > 0 ? String(n) : ''
}
function fifth(val: unknown): string {
  const n = Math.floor(Number(val) / 5)
  return n > 0 ? String(n) : ''
}
function v(body: CharacterFormData, key: string): string {
  return s(body[key])
}

const CARAC = [
  { key: 'FOR', label: 'FOR' },
  { key: 'CON', label: 'CON' },
  { key: 'TAI', label: 'TAI' },
  { key: 'DEX', label: 'DEX' },
  { key: 'APP', label: 'APP' },
  { key: 'INT', label: 'INT' },
  { key: 'POU', label: 'POU' },
  { key: 'EDU', label: 'EDU' }
] as const

const SKILLS = [
  { key: 'ANT', label: 'Anthropologie', base: 1 },
  { key: 'ARC', label: 'Archéologie', base: 1 },
  { key: 'ART', label: 'Art et métiers', base: 5 },
  { key: 'BAR', label: 'Baratin', base: 5 },
  { key: 'BIB', label: 'Bibliothèque', base: 20 },
  { key: 'CHA', label: 'Charme', base: 15 },
  { key: 'CD1', label: 'Combat à dist. 1', base: 15 },
  { key: 'CD2', label: 'Combat à dist. 2', base: 25 },
  { key: 'CR1', label: 'Combat rappr. 1', base: 25 },
  { key: 'COM', label: 'Bagarre', base: 25 },
  { key: 'COD', label: 'Conduite', base: 20 },
  { key: 'CEL', label: 'Celer', base: 5 },
  { key: 'CRE', label: 'Crochetage', base: 1 },
  { key: 'CRO', label: 'Crochets', base: 25 },
  { key: 'DIS', label: 'Discrétion', base: 20 },
  { key: 'DRO', label: 'Droit', base: 5 },
  { key: 'ECO', label: 'Écoute', base: 20 },
  { key: 'ELE', label: 'Électricité', base: 1 },
  { key: 'EQU', label: 'Équitation', base: 5 },
  { key: 'ESQ', label: 'Esquive', base: 0 },
  { key: 'EST', label: 'Estimation', base: 5 },
  { key: 'GRI', label: 'Grimper', base: 20 },
  { key: 'HIS', label: 'Histoire', base: 5 },
  { key: 'IPO', label: 'Imposture', base: 5 },
  { key: 'ITI', label: 'Intimidation', base: 15 },
  { key: 'LAN', label: 'Langue maternelle', base: 0 },
  { key: 'MEC', label: 'Mécanique', base: 10 },
  { key: 'MED', label: 'Médecine', base: 1 },
  { key: 'MYT', label: 'Mythe de Cthulhu', base: 0 },
  { key: 'NAG', label: 'Nager', base: 1 },
  { key: 'NAT', label: 'Naturalisme', base: 20 },
  { key: 'OCC', label: 'Occultisme', base: 5 },
  { key: 'ORI', label: 'Orientation', base: 10 },
  { key: 'PER', label: 'Persuasion', base: 10 },
  { key: 'PIC', label: 'Pickpocket', base: 10 },
  { key: 'PIL', label: 'Pilotage', base: 1 },
  { key: 'PIS', label: 'Pister', base: 20 },
  { key: 'PLO', label: 'Plongée', base: 1 },
  { key: 'PRE', label: 'Premiers soins', base: 30 },
  { key: 'PSA', label: 'Psychanalyse', base: 1 },
  { key: 'PSO', label: 'Psychologie', base: 10 },
  { key: 'SAU', label: 'Sauter', base: 20 },
  { key: 'SCI', label: 'Sciences', base: 1 },
  { key: 'SUR', label: 'Survie', base: 10 },
  { key: 'TOC', label: 'Trouver Objet Caché', base: 25 }
]

const CUSTOM_SKILLS = [
  { prefix: 'AR', count: 3, label: 'Art et métier' },
  { prefix: 'CD', start: 3, count: 2, label: 'Combat à distance' },
  { prefix: 'CR', start: 2, count: 2, label: 'Combat rapproché' },
  { prefix: 'LG', count: 3, label: 'Langue étrangère' },
  { prefix: 'PL', count: 1, label: 'Pilotage' },
  { prefix: 'SC', count: 3, label: 'Sciences' },
  { prefix: 'CP', count: 5, label: 'Compétence perso.' }
]

const BACKGROUND_FIELDS = [
  { key: 'Description', label: 'Description physique' },
  { key: 'ideologieEtCroyance', label: 'Idéologies et croyances' },
  { key: 'traits', label: 'Traits de personnalité' },
  { key: 'personnesImportantes', label: 'Personnes importantes' },
  { key: 'lieuxSignificatifs', label: 'Lieux significatifs' },
  { key: 'phobiesManies', label: 'Phobies et manies' },
  { key: 'bienPrécieux', label: 'Biens précieux' },
  { key: 'ouvragesOccultes', label: 'Ouvrages occultes' },
  { key: 'rencontresEntites', label: 'Rencontres avec des entités' },
  { key: 'sequellesCicatrices', label: 'Séquelles et cicatrices' }
]

function field(label: string, value: string): string {
  return `<div class="field"><span class="field-label">${label}</span><span class="field-value">${value || '&nbsp;'}</span></div>`
}

function skillRow(label: string, base: number, val: string, customLabel?: string): string {
  const display = customLabel ? `${label} — ${customLabel}` : label
  const baseDisplay = base > 0 ? `${base}%` : '—'
  return `
    <div class="skill-row">
      <span class="skill-name">${display}</span>
      <span class="skill-base">${baseDisplay}</span>
      <span class="skill-cell">${val || ''}</span>
      <span class="skill-cell">${half(val)}</span>
      <span class="skill-cell">${fifth(val)}</span>
    </div>`
}

export function buildInvestigateurHtml(body: CharacterFormData): string {
  // Compétences variables — collectées dans un tableau pour répartition en 2 colonnes de 10
  const customSkillRows: string[] = []
  for (const { prefix, count, start = 1, label } of CUSTOM_SKILLS) {
    for (let i = 0; i < count; i++) {
      const idx = start + i
      const customLabel = v(body, `${prefix}${idx}_label`)
      if (customLabel || v(body, `${prefix}${idx}_0`)) {
        customSkillRows.push(skillRow(label, 0, v(body, `${prefix}${idx}_0`), customLabel || '?'))
      }
    }
  }
  const customLeft = customSkillRows.slice(0, 10).join('')
  const customRight = customSkillRows.slice(10, 20).join('')

  // Background
  const backgroundHtml = BACKGROUND_FIELDS.map((f) => {
    const val = v(body, f.key)
    return val
      ? `
      <div class="bg-field">
        <div class="bg-label">${f.label}</div>
        <div class="bg-value">${val}</div>
      </div>`
      : ''
  }).filter(Boolean).join('')

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, Helvetica, sans-serif; font-size: 8pt; color: #1a1a1a; }
    .sheet { padding: 8mm; }

    h1 { font-size: 12pt; text-align: center; text-transform: uppercase;
         letter-spacing: 0.15em; border-bottom: 2px solid #1a1a1a;
         padding-bottom: 4px; margin-bottom: 8px; }

    h2 { font-size: 8pt; text-transform: uppercase; letter-spacing: 0.12em;
         background: #1a1a1a; color: white; padding: 2px 6px; margin: 8px 0 4px; }

    .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    .three-col { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; }

    .field { display: flex; gap: 4px; align-items: baseline;
             border-bottom: 1px solid #ccc; padding: 1px 0; margin-bottom: 2px; }
    .field-label { font-weight: bold; white-space: nowrap; font-size: 7pt;
                   color: #444; min-width: 80px; }
    .field-value { flex: 1; font-size: 8pt; }

    /* Caractéristiques */
    .carac-table { width: 100%; border-collapse: collapse; }
    .carac-table th { background: #444; color: white; padding: 2px 4px;
                      font-size: 7pt; text-align: center; border: 1px solid #999; }
    .carac-table td { padding: 2px 5px; border: 1px solid #ccc; text-align: center; }
    .carac-label { font-weight: bold; font-size: 8pt; background: #f5f5f5; }

    /* Stats dérivées */
    .derived-grid { display: grid; grid-template-columns: repeat(8, 1fr); gap: 3px; }
    .derived-card { border: 1px solid #ccc; text-align: center; padding: 3px 2px; background: #fafafa; }
    .derived-card--empty { background: white; }
    .derived-card-label { font-size: 6.5pt; color: #555; text-transform: uppercase; letter-spacing: 0.05em; }
    .derived-card-value { font-size: 10pt; font-weight: bold; }

    /* Armes */
    .weapons-table { width: 100%; border-collapse: collapse; margin-top: 2px; }
    .weapons-table th { background: #444; color: white; padding: 2px 4px; font-size: 6.5pt;
                        text-align: center; border: 1px solid #999; text-transform: uppercase; }
    .weapons-table td { padding: 2px 4px; border: 1px solid #ddd; font-size: 7.5pt; }
    .weapons-table td:first-child { font-weight: bold; }
    .weapons-table tr:nth-child(even) { background: #f9f9f9; }

    /* Compétences */
    .skills-cols { display: grid; grid-template-columns: 1fr 1fr; gap: 0 6px; }
    .skills-header { display: grid; grid-template-columns: 1fr 30px 28px 28px 28px;
                     gap: 2px; align-items: center; background: #444;
                     color: white; padding: 2px 4px; font-size: 6.5pt;
                     text-transform: uppercase; }
    .skill-row { display: grid; grid-template-columns: 1fr 30px 28px 28px 28px;
                 gap: 2px; align-items: center; border-bottom: 1px solid #eee;
                 padding: 1px 4px; }
    .skill-row:nth-child(even) { background: #f9f9f9; }
    .skill-name { font-size: 7.5pt; }
    .skill-base { font-size: 6.5pt; color: #888; text-align: center; }
    .skill-cell { font-size: 8pt; font-weight: bold; text-align: center;
                  border: 1px solid #ddd; min-height: 14px; padding: 1px; background: white; }

    /* Background */
    .bg-field { margin-bottom: 5px; }
    .bg-label { font-weight: bold; font-size: 7pt; text-transform: uppercase;
                letter-spacing: 0.08em; color: #444; }
    .bg-value { font-size: 8pt; padding: 2px 4px; border-left: 2px solid #ccc;
                min-height: 16px; color: #222; }

    .page-break { page-break-before: always; }
    .mt { margin-top: 6px; }
  </style>
</head>
<body>
<div class="sheet">

  <h1>Fiche d'Investigateur — L'Appel de Cthulhu 7e édition</h1>

  <!-- ── IDENTITÉ ── -->
  <h2>Identité</h2>
  <div class="two-col">
    <div>
      ${field('Nom', v(body, 'Nom'))}
      ${field('Profession', v(body, 'Occupation'))}
      ${field('Résidence', v(body, 'Résidence'))}
    </div>
    <div>
      ${field('Joueur', v(body, 'Joueur'))}
      ${field('Âge / Sexe', `${v(body, 'age')} / ${v(body, 'Sexe')}`)}
      ${field('Lieu de naissance', v(body, 'Lieu de naissance'))}
    </div>
  </div>

  <!-- ── CARACTÉRISTIQUES ── -->
  <h2>Caractéristiques</h2>
  <table class="carac-table">
    <thead>
      <tr>
        <th>Carac.</th><th>Valeur</th><th>½</th><th>⅕</th>
        <th style="border-left:3px solid #999">Carac.</th><th>Valeur</th><th>½</th><th>⅕</th>
      </tr>
    </thead>
    <tbody>
      ${CARAC.slice(0, 4).map((c, i) => {
        const val1 = v(body, `${c.key}_0`)
        const c2 = CARAC[i + 4]
        const val2 = c2 ? v(body, `${c2.key}_0`) : ''
        return `<tr>
          <td class="carac-label">${c.label}</td>
          <td>${val1}</td><td>${half(val1)}</td><td>${fifth(val1)}</td>
          <td class="carac-label" style="border-left:3px solid #999">${c2?.label ?? ''}</td>
          <td>${val2}</td><td>${half(val2)}</td><td>${fifth(val2)}</td>
        </tr>`
      }).join('')}
    </tbody>
  </table>

  <!-- ── STATS DÉRIVÉES ── -->
  <h2>Stats dérivées &amp; Combat</h2>
  <div class="derived-grid">
    <div class="derived-card">
      <div class="derived-card-label">PV max</div>
      <div class="derived-card-value">${v(body, 'pv_max') || '—'}</div>
    </div>
    <div class="derived-card derived-card--empty">
      <div class="derived-card-label">PV courants</div>
      <div class="derived-card-value">&nbsp;</div>
    </div>
    <div class="derived-card">
      <div class="derived-card-label">PM max</div>
      <div class="derived-card-value">${v(body, 'pm_max') || '—'}</div>
    </div>
    <div class="derived-card">
      <div class="derived-card-label">SM départ</div>
      <div class="derived-card-value">${v(body, 'sm_initial') || '—'}</div>
    </div>
    <div class="derived-card">
      <div class="derived-card-label">Chance</div>
      <div class="derived-card-value">${v(body, 'Chance') || '—'}</div>
    </div>
    <div class="derived-card">
      <div class="derived-card-label">Impact</div>
      <div class="derived-card-value">${v(body, 'impact') || '—'}</div>
    </div>
    <div class="derived-card">
      <div class="derived-card-label">Carrure</div>
      <div class="derived-card-value">${v(body, 'carrure') || '—'}</div>
    </div>
    <div class="derived-card">
      <div class="derived-card-label">Mouvement</div>
      <div class="derived-card-value">${v(body, 'MVT') || '—'}</div>
    </div>
  </div>

  <!-- ── COMPÉTENCES ── -->
  <h2>Compétences</h2>
  <div class="skills-cols">
    <div>
      <div class="skills-header">
        <span>Compétence</span><span>Base</span><span>Val.</span><span>½</span><span>⅕</span>
      </div>
      ${SKILLS.slice(0, Math.ceil(SKILLS.length / 2)).map(sk =>
        skillRow(sk.label, sk.base, v(body, `${sk.key}_0`))
      ).join('')}
    </div>
    <div>
      <div class="skills-header">
        <span>Compétence</span><span>Base</span><span>Val.</span><span>½</span><span>⅕</span>
      </div>
      ${SKILLS.slice(Math.ceil(SKILLS.length / 2)).map(sk =>
        skillRow(sk.label, sk.base, v(body, `${sk.key}_0`))
      ).join('')}
    </div>
  </div>

  <!-- ── COMPÉTENCES VARIABLES ── -->
  ${customSkillRows.length
    ? `
  <h2>Combat, Arts, Langues, Sciences &amp; Compétences personnelles</h2>
  <div class="skills-cols">
    <div>
      <div class="skills-header">
        <span>Compétence</span><span>Base</span><span>Val.</span><span>½</span><span>⅕</span>
      </div>
      ${customLeft}
    </div>
    <div>
      ${customRight ? `<div class="skills-header">
        <span>Compétence</span><span>Base</span><span>Val.</span><span>½</span><span>⅕</span>
      </div>${customRight}` : ''}
    </div>
  </div>`
    : ''}

  <!-- ── PAGE 2 : ARMES, BACKGROUND & FINANCES ── -->
  <div class="page-break"></div>

  <h1>Fiche d'Investigateur — ${v(body, 'Nom') || 'Sans nom'}</h1>

  <!-- ── ARMES ── -->
  <h2>Armes</h2>
  <table class="weapons-table">
    <thead>
      <tr>
        <th>Arme</th><th>Ord.</th><th>Maj.</th><th>Ext.</th>
        <th>Dégâts</th><th>Portée</th><th>Cap.</th><th>Panne</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Corps à corps</td>
        <td>${v(body, 'Arm1_ORD')}</td>
        <td>${v(body, 'Arm1_MAJ')}</td>
        <td>${v(body, 'Arm1_EXT')}</td>
        <td>—</td>
        <td>${v(body, 'Arm1_PORT') || 'Allonge'}</td>
        <td>—</td>
        <td>—</td>
      </tr>
      ${[2, 3, 4, 5].map((i) => {
        const nom = v(body, `ARM${i}`)
        if (!nom) return ''
        return `<tr>
          <td>${nom}</td>
          <td>${v(body, `Arm${i}_ORD`)}</td>
          <td>${v(body, `Arm${i}_MAJ`)}</td>
          <td>${v(body, `Arm${i}_EXT`)}</td>
          <td>${v(body, `Arm${i}_DEG`)}</td>
          <td>${v(body, `Arm${i}_PORT`)}</td>
          <td>${v(body, `Arm${i}_CAP`)}</td>
          <td>${v(body, `Arm${i}_PANN`)}</td>
        </tr>`
      }).filter(Boolean).join('')}
    </tbody>
  </table>

  <h2 class="mt">Histoire &amp; Background</h2>
  <div class="two-col">
    ${backgroundHtml}
  </div>

  <h2 class="mt">Finances</h2>
  <div class="three-col">
    ${field('Capital', v(body, 'capital'))}
    ${field('Dépenses courantes', v(body, 'depencesCourantes'))}
    ${field('Espèces', v(body, 'Espèces'))}
  </div>

</div>
</body>
</html>`
}
