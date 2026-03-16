import { defineEventHandler, readBody, createError, getRequestHeader } from 'h3'
import { PDFDocument, StandardFonts } from 'pdf-lib'
import { createClient } from '@supabase/supabase-js'
import type { CharacterFormData } from '../../types/investigateur'

function str(val: unknown): string { return val !== undefined && val !== null ? String(val) : '' }
function half(val: unknown) { const n = Math.floor(Number(val) / 2); return n > 0 ? String(n) : '' }
function fifth(val: unknown) { const n = Math.floor(Number(val) / 5); return n > 0 ? String(n) : '' }

function setField(form: ReturnType<PDFDocument['getForm']>, name: string, value: unknown) {
  const s = str(value)
  if (!s) return
  try { form.getTextField(name).setText(s) }
  catch { /* champ absent — ignoré */ }
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)

  if (!config.supabaseServiceKey) {
    throw createError({ statusCode: 500, statusMessage: 'SUPABASE_SERVICE_KEY not configured' })
  }

  const rawBody = await readBody<Record<string, unknown>>(event)
  // Convertit toutes les valeurs en string (les <input type="number"> envoient des nombres JSON)
  const body = Object.fromEntries(
    Object.entries(rawBody).map(([k, v]) => [k, str(v)])
  ) as CharacterFormData

  // ── 1. Remplissage du PDF avec pdf-lib ─────────────────────
  const host = getRequestHeader(event, 'host') ?? ''
  const protocol = host.includes('localhost') ? 'http' : 'https'
  const pdfResponse = await fetch(`${protocol}://${host}/fiche_investigateur.pdf`)
  if (!pdfResponse.ok) {
    throw createError({ statusCode: 500, statusMessage: `PDF template fetch failed: ${pdfResponse.status}` })
  }
  const pdfBytes = await pdfResponse.arrayBuffer()
  const pdfDoc = await PDFDocument.load(pdfBytes)
  const form = pdfDoc.getForm()

  const carac = ['FOR', 'CON', 'TAI', 'DEX', 'APP', 'INT', 'POU', 'EDU'] as const
  const skills = ['ANT','ARC','ART','BAR','BIB','CHA',
    'CD1','CD2','CR1','COM','COD','CEL','CRE','CRO',
    'DIS','DRO','ECO','ELE',
    'EQU','ESQ','EST','GRI','HIS','IPO','ITI','LAN','MEC','MED','MYT','NAG',
    'NAT','OCC','ORI','PER','PIL','PIC','PIS','PLO','PRE','PSA','PSO','SAU',
    'SCI','SUR','TOC'] as const
  const customGroups = [
    ['AR1', 'AR2', 'AR3'],
    ['CD3', 'CD4'],
    ['CR2', 'CR3'],
    ['LG1', 'LG2', 'LG3'],
    ['PL1'],
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
  setField(form, 'BlessureGrave', body.BlessureGrave ?? '')
  setField(form, 'impact', body.impact ?? '')
  setField(form, 'carrure', body.carrure ?? '')

  for (const s of skills) {
    const v = body[`${s}_0`] ?? ''
    setField(form, `${s}_0`, v)
    setField(form, `${s}_1`, half(v))
    setField(form, `${s}_2`, fifth(v))
  }

  for (const group of customGroups) {
    for (const prefix of group) {
      setField(form, `${prefix}_label`, body[`${prefix}_label`] ?? '')
      const v = body[`${prefix}_0`] ?? ''
      setField(form, `${prefix}_0`, v)
      setField(form, `${prefix}_1`, half(v))
      setField(form, `${prefix}_2`, fifth(v))
    }
  }

  for (const key of ['Description', 'ideologieEtCroyance', 'traits', 'personnesImportantes',
    'sequellesCicatrices', 'lieuxSignificatifs', 'phobiesManies', 'bienPrécieux',
    'ouvragesOccultes', 'rencontresEntites']) {
    setField(form, key, body[key] ?? '')
  }

  setField(form, 'capital', body.capital ?? '')
  setField(form, 'depencesCourantes', body.depencesCourantes ?? '')
  setField(form, 'Espèces', body['Espèces'] ?? '')

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
  const { data: signedData, error: signError } = await supabase.storage
    .from('fiches')
    .createSignedUrl(fileName, 60)

  if (signError || !signedData?.signedUrl) {
    throw createError({ statusCode: 500, statusMessage: `Signed URL error: ${signError?.message}` })
  }

  // Nettoyage asynchrone après 70s (une fois le téléchargement terminé)
  setTimeout(() => {
    supabase.storage.from('fiches').remove([fileName]).catch(() => {})
  }, 70_000)

  return { url: signedData.signedUrl, fileName }
})
