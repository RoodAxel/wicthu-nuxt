import { defineEventHandler, readBody, createError, getRequestHeader } from 'h3'
import { PDFDocument, PDFName, PDFArray, PDFDict, StandardFonts } from 'pdf-lib'
import { createClient } from '@supabase/supabase-js'
import { BACKGROUND_LIMITS } from '#shared/investigateur-background'
import type { CharacterFormData } from '../../types/investigateur'

function str(val: unknown): string {
  return val !== undefined && val !== null ? String(val) : ''
}
function half(val: unknown) {
  const n = Math.floor(Number(val) / 2)
  return n > 0 ? String(n) : ''
}
function fifth(val: unknown) {
  const n = Math.floor(Number(val) / 5)
  return n > 0 ? String(n) : ''
}

function sanitize(s: string): string {
  return s
    .replace(/\u2212/g, '-') // signe moins mathématique → trait d'union
    .replace(/\u00a0/g, ' ') // espace insécable → espace
    .replace(/\u2013/g, '-') // tiret demi-cadratin → trait d'union
    .replace(/\u2014/g, '-') // tiret cadratin → trait d'union
}

function setField(form: ReturnType<PDFDocument['getForm']>, name: string, value: unknown) {
  const s = sanitize(str(value))
  if (!s) return
  try {
    form.getTextField(name).setText(s)
  } catch { /* champ absent — ignoré */ }
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)

  if (!config.supabaseServiceKey) {
    throw createError({ statusCode: 500, statusMessage: 'SUPABASE_SERVICE_KEY not configured' })
  }

  const rawBody = await readBody<Record<string, unknown>>(event)
  const portraitDataUrl = typeof rawBody.portrait === 'string' ? rawBody.portrait : null
  // Convertit toutes les valeurs en string (les <input type="number"> envoient des nombres JSON)
  const body = Object.fromEntries(
    Object.entries(rawBody).map(([k, v]) => [k, str(v)])
  ) as CharacterFormData

  // ── 1. Remplissage du PDF avec pdf-lib ─────────────────────
  const host = getRequestHeader(event, 'host') ?? ''
  const protocol = host.includes('localhost') ? 'http' : 'https'
  const pdfResponse = await fetch(`${protocol}://${host}/fiche_investigateur_generation.pdf`)
  if (!pdfResponse.ok) {
    throw createError({ statusCode: 500, statusMessage: `PDF template fetch failed: ${pdfResponse.status}` })
  }
  const pdfBytes = await pdfResponse.arrayBuffer()
  const pdfDoc = await PDFDocument.load(pdfBytes)
  const form = pdfDoc.getForm()

  const carac = ['FOR', 'CON', 'TAI', 'DEX', 'APP', 'INT', 'POU', 'EDU'] as const
  const skills = ['ANT', 'ARC', 'ART', 'BAR', 'BIB', 'CHA',
    'CD1', 'CD2', 'CR1', 'COM', 'COD', 'CEL', 'CRE', 'CRO',
    'DIS', 'DRO', 'ECO', 'ELE',
    'EQU', 'ESQ', 'EST', 'GRI', 'HIS', 'IPO', 'ITI', 'LAN', 'MEC', 'MED', 'MYT', 'NAG',
    'NAT', 'OCC', 'ORI', 'PER', 'PIL', 'PIC', 'PIS', 'PLO', 'PRE', 'PSA', 'PSO', 'SAU',
    'SCI', 'SUR', 'TOC'] as const
  const customGroups = [
    ['AR1', 'AR2', 'AR3'],
    ['CD3', 'CD4'],
    ['CR2', 'CR3'],
    ['LG1', 'LG2', 'LG3'],
    ['PL1'],
    ['SR1'],
    ['SC1', 'SC2', 'SC3'],
    ['CP1', 'CP2', 'CP3', 'CP4', 'CP5']
  ] as const

  setField(form, 'Nom', body.Nom ?? '')
  setField(form, 'Joueur', body.Joueur ?? '')
  setField(form, 'Occupation', body.Occupation ?? '')
  setField(form, 'age', body.age ?? '')
  setField(form, 'Sexe', body.Sexe ?? '')
  setField(form, 'Résidence', body['Résidence'] ?? '')
  setField(form, 'Lieu de naissance', body['Lieu de naissance'] ?? '')
  setField(form, 'MVT', body.MVT ?? '')

  for (const c of carac) {
    const v = body[`${c}_0`] ?? ''
    setField(form, `${c}_0`, v)
    setField(form, `${c}_1`, half(v))
    setField(form, `${c}_2`, fifth(v))
  }

  setField(form, 'pv_max', body.pv_max ?? '')
  setField(form, 'pm_max', body.pm_max ?? '')
  setField(form, 'sm_initial', body.sm_initial ?? '')
  setField(form, 'impact', body.impact ?? '')
  setField(form, 'carrure', body.carrure ?? '')

  for (const s of skills) {
    const v = body[`${s}_0`] ?? ''
    setField(form, `${s}_0`, v)
    setField(form, `${s}_1`, half(v))
    setField(form, `${s}_2`, fifth(v))
  }

  // Esquive : stat de combat toujours renseignée. Sans points investis, ESQ_0
  // reste vide côté formulaire (seule la base DEX÷2 est affichée en placeholder)
  // → on retombe sur la base pour qu'elle apparaisse sur la fiche.
  const esquive = str(body['ESQ_0']) || half(body['DEX_0'])
  setField(form, 'ESQ_0', esquive)
  setField(form, 'ESQ_1', half(esquive))
  setField(form, 'ESQ_2', fifth(esquive))
  // … et sa copie dans le bloc combat (EQV_*, sous impact/carrure)
  setField(form, 'EQV_0', esquive)
  setField(form, 'EQV_1', half(esquive))
  setField(form, 'EQV_2', fifth(esquive))

  // Langue maternelle : base = ÉDU si aucun point investi
  const langueMat = str(body['LAG_0']) || str(body['EDU_0'])
  setField(form, 'LAG_0', langueMat)
  setField(form, 'LAG_1', half(langueMat))
  setField(form, 'LAG_2', fifth(langueMat))

  for (const group of customGroups) {
    for (const prefix of group) {
      setField(form, `${prefix}_label`, body[`${prefix}_label`] ?? '')
      const v = body[`${prefix}_0`] ?? ''
      setField(form, `${prefix}_0`, v)
      setField(form, `${prefix}_1`, half(v))
      setField(form, `${prefix}_2`, fifth(v))
    }
  }

  // Répartition sur les 2 lignes du template : coupe sur un espace quand c'est
  // possible (sans faire déborder la 2e ligne), sinon coupe brute à `split`.
  for (const [key, { split, max }] of Object.entries(BACKGROUND_LIMITS)) {
    const val = sanitize(str(body[key])).slice(0, max)
    let cut = split
    if (val.length > split) {
      const space = val.lastIndexOf(' ', split)
      if (space > 0 && space >= split - 12 && val.length - space - 1 <= max - split) cut = space
    }
    setField(form, key, val.slice(0, cut).trimEnd())
    setField(form, `${key}1`, val.slice(cut).trimStart())
  }

  const capitalFull = sanitize(str(body.capital))
  setField(form, 'capital0', capitalFull.slice(0, 25))
  setField(form, 'capital1', capitalFull.slice(25))
  setField(form, 'depencesCourantes', body.depencesCourantes ?? '')
  setField(form, 'Espèces', body['Espèces'] ?? '')

  for (let i = 1; i <= 12; i++) {
    setField(form, `EQUIP${i}`, body[`EQUIP${i}`] ?? '')
    try {
      pdfDoc.getForm().getTextField(`EQUIP${i}`).setFontSize(9)
    } catch { /* champ absent */ }
  }

  // ── Chance (boutons radio) ──────────────────────────────────
  // Le groupe CHANCE du template est corrompu : ni /Opt ni les noms d'états
  // d'apparence ne suivent les numéros imprimés (doublons, trous, bulles
  // déplacées) — select(String(n)) coche donc une mauvaise bulle. Seule la
  // géométrie est fiable : triées par ligne (y décroissant) puis par x, les
  // bulles suivent l'ordre imprimé « Pas de chance », 01…28, 29…64, 65…100,
  // soit l'index N = la valeur N.
  const chanceVal = Math.round(Number(body.Chance))
  if (!isNaN(chanceVal) && chanceVal >= 0 && chanceVal <= 100) {
    try {
      const chanceGroup = form.getRadioGroup('CHANCE')
      const widgets = [...chanceGroup.acroField.getWidgets()].sort((a, b) => {
        const ra = a.getRectangle()
        const rb = b.getRectangle()
        // lignes espacées de ~11pt : bucket à la dizaine pour absorber le bruit
        return Math.round(rb.y / 10) - Math.round(ra.y / 10) || ra.x - rb.x
      })
      const target = widgets[chanceVal]
      const ap = target?.dict.lookupMaybe(PDFName.of('AP'), PDFDict)
      const normal = ap?.lookupMaybe(PDFName.of('N'), PDFDict)
      const onState = normal?.keys().find(k => k !== PDFName.of('Off'))
      if (target && onState) {
        for (const w of widgets) {
          w.dict.set(PDFName.of('AS'), w === target ? onState : PDFName.of('Off'))
        }
        chanceGroup.acroField.dict.set(PDFName.of('V'), onState)
      }
    } catch { /* champ absent — ignoré */ }
  }

  // ── Armes ───────────────────────────────────────────────────
  // Arm1 : Corps à corps (ORD synchronisé avec CR1, pas de nom/DEG/CAP/PANN)
  setField(form, 'Arm1_ORD', body['Arm1_ORD'] ?? '')
  setField(form, 'Arm1_MAJ', body['Arm1_MAJ'] ?? '')
  setField(form, 'Arm1_EXT', body['Arm1_EXT'] ?? '')
  setField(form, 'Arm1_PORT', body['Arm1_PORT'] ?? '')

  // Arm2–5 : armes libres
  for (let i = 2; i <= 5; i++) {
    setField(form, `ARM${i}`, body[`ARM${i}`] ?? '')
    setField(form, `Arm${i}_ORD`, body[`Arm${i}_ORD`] ?? '')
    setField(form, `Arm${i}_MAJ`, body[`Arm${i}_MAJ`] ?? '')
    setField(form, `Arm${i}_EXT`, body[`Arm${i}_EXT`] ?? '')
    setField(form, `Arm${i}_DEG`, body[`Arm${i}_DEG`] ?? '')
    setField(form, `Arm${i}_PORT`, body[`Arm${i}_PORT`] ?? '')
    setField(form, `Arm${i}_CAD`, body[`Arm${i}_CAD`] ?? '')
    setField(form, `Arm${i}_CAP`, body[`Arm${i}_CAP`] ?? '')
    setField(form, `Arm${i}_PANNE`, body[`Arm${i}_PANN`] ?? '')
  }

  // ── Portrait ─────────────────────────────────────────────────
  if (portraitDataUrl) {
    try {
      const base64 = portraitDataUrl.replace(/^data:image\/[a-z]+;base64,/, '')
      const imageBytes = Buffer.from(base64, 'base64')
      const isJpeg = portraitDataUrl.startsWith('data:image/jpeg') || portraitDataUrl.startsWith('data:image/jpg')
      const image = isJpeg ? await pdfDoc.embedJpg(imageBytes) : await pdfDoc.embedPng(imageBytes)

      const page = pdfDoc.getPages()[0]
      if (!page) throw new Error('PDF template sans page')

      // Retirer uniquement l'annotation Illu-invest pour que l'image
      // dessinée sur le contenu de page soit visible (sans flatten global)
      try {
        const annots = page.node.lookup(PDFName.of('Annots'), PDFArray)
        for (let i = 0; i < annots.size(); i++) {
          const annot = pdfDoc.context.lookupMaybe(annots.get(i), PDFDict)
          if (!annot) continue
          const T = annot.get(PDFName.of('T'))
          if (T && T.toString().replace(/[()]/g, '') === 'Illu-invest') {
            annots.remove(i)
            break
          }
        }
      } catch { /* annotation non trouvée — ignoré */ }

      // Coordonnées exactes du champ Illu-invest (pdf-lib, origine bas-gauche)
      const zoneX = 394.8, zoneY = 700.6, zoneW = 76.1, zoneH = 86.4
      const dims = image.scale(1)
      const scale = Math.min(zoneW / dims.width, zoneH / dims.height)
      const drawW = dims.width * scale
      const drawH = dims.height * scale

      page.drawImage(image, {
        x: zoneX + (zoneW - drawW) / 2,
        y: zoneY + (zoneH - drawH) / 2,
        width: drawW,
        height: drawH
      })
    } catch { /* portrait invalide — ignoré */ }
  }

  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica)
  pdfDoc.getForm().updateFieldAppearances(helvetica)

  const filledBytes = await pdfDoc.save()

  // ── 2. Upload sur Supabase Storage (API externe) ───────────
  const supabase = createClient(config.public.supabaseUrl, config.supabaseServiceKey)

  const fileName = `${Date.now()}_${(body.Nom || 'investigateur').replace(/\s+/g, '_')}.pdf`

  const { error: uploadError } = await supabase.storage
    .from('fiches')
    .upload(fileName, Buffer.from(filledBytes), {
      contentType: 'application/pdf',
      upsert: false
    })

  if (uploadError) {
    throw createError({ statusCode: 500, statusMessage: `Supabase upload error: ${uploadError.message}` })
  }

  // ── 3. URL signée valable 60 secondes ──────────────────────
  // Le nom de stockage reste horodaté (unicité), mais le fichier téléchargé
  // porte simplement le nom de l'investigateur.
  const downloadName = `${(body.Nom || 'investigateur').trim().replace(/\s+/g, '_')}.pdf`
  const { data: signedData, error: signError } = await supabase.storage
    .from('fiches')
    .createSignedUrl(fileName, 60, { download: downloadName })

  if (signError || !signedData?.signedUrl) {
    throw createError({ statusCode: 500, statusMessage: `Signed URL error: ${signError?.message}` })
  }

  // Nettoyage asynchrone après 70s (une fois le téléchargement terminé)
  setTimeout(() => {
    supabase.storage.from('fiches').remove([fileName]).catch(() => {})
  }, 70_000)

  return { url: signedData.signedUrl, fileName }
})
