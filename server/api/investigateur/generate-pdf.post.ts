import { defineEventHandler, readBody, createError } from 'h3'
import { PDFDocument } from 'pdf-lib'
import { createClient } from '@supabase/supabase-js'

interface CharacterFormData {
  Nom: string; Joueur: string; Occupation: string; age: string
  Sexe: string; 'Résidence': string; 'Lieu de naissance': string; MVT: string
  FOR_0: string; CON_0: string; TAI_0: string; DEX_0: string
  APP_0: string; INT_0: string; POU_0: string; EDU_0: string
  pv_max: string; pm_max: string; sm_initial: string
  BlessureGrave: string; impact: string; carrure: string
  LG1_label: string; LG1_0: string; LG2_label: string; LG2_0: string; LG3_label: string; LG3_0: string
  SC1_label: string; SC1_0: string; SC2_label: string; SC2_0: string; SC3_label: string; SC3_0: string
  CP1_label: string; CP1_0: string; CP2_label: string; CP2_0: string; CP3_label: string; CP3_0: string
  CP4_label: string; CP4_0: string; CP5_label: string; CP5_0: string
  Description: string; ideologieEtCroyance: string; traits: string
  personnesImportantes: string; sequellesCicatrices: string; lieuxSignificatifs: string
  phobiesManies: string; 'bienPrécieux': string; ouvragesOccultes: string; rencontresEntites: string
  capital: string; depencesCourantes: string; 'Espèces': string
  [key: string]: string
}

function half(val: string) { return val ? String(Math.floor(Number(val) / 2)) : '' }
function fifth(val: string) { return val ? String(Math.floor(Number(val) / 5)) : '' }

function setField(form: ReturnType<PDFDocument['getForm']>, name: string, value: string) {
  if (!value) return
  try { form.getTextField(name).setText(value) }
  catch { /* champ absent — ignoré */ }
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)

  if (!config.supabaseServiceKey) {
    throw createError({ statusCode: 500, statusMessage: 'SUPABASE_SERVICE_KEY not configured' })
  }

  const body = await readBody<CharacterFormData>(event)

  // ── 1. Remplissage du PDF avec pdf-lib ─────────────────────
  const pdfBytes = await useStorage('assets:pdfs').getItemRaw('fiche_investigateur.pdf')
  if (!pdfBytes) {
    throw createError({ statusCode: 500, statusMessage: 'PDF template not found in server assets' })
  }
  const pdfDoc = await PDFDocument.load(pdfBytes)
  const form = pdfDoc.getForm()

  const carac = ['FOR', 'CON', 'TAI', 'DEX', 'APP', 'INT', 'POU', 'EDU'] as const
  const skills = ['ANT','ARC','ART','BAR','BIB','CHA','DIS','DRO','ECO','ELE',
    'EQU','ESQ','EST','GRI','HIS','IPO','ITI','LAN','MEC','MED','MYT','NAG',
    'NAT','OCC','ORI','PER','PIL','PIC','PIS','PLO','PRE','PSA','PSO','SAU',
    'SCI','SUR','TOC'] as const
  const customGroups = [
    ['LG1', 'LG2', 'LG3'],
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
