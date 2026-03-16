import { createClient } from '@supabase/supabase-js'
import type { CharacterFormData } from '../../types/investigateur'
import { buildInvestigateurHtml } from '../../utils/investigateur-html'

const GOTENBERG_URL = 'https://demo.gotenberg.dev/forms/chromium/convert/html'

function str(val: unknown): string { return val != null ? String(val) : '' }

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)

  if (!config.supabaseServiceKey) {
    throw createError({ statusCode: 500, statusMessage: 'SUPABASE_SERVICE_KEY not configured' })
  }

  const rawBody = await readBody<Record<string, unknown>>(event)
  const body = Object.fromEntries(
    Object.entries(rawBody).map(([k, v]) => [k, str(v)])
  ) as CharacterFormData

  // ── 1. Génération du HTML et envoi à Gotenberg ─────────────
  const html = buildInvestigateurHtml(body)

  const formData = new FormData()
  formData.append('files', new Blob([html], { type: 'text/html' }), 'index.html')
  formData.append('paperWidth', '8.27')   // A4
  formData.append('paperHeight', '11.69') // A4
  formData.append('marginTop', '0')
  formData.append('marginBottom', '0')
  formData.append('marginLeft', '0')
  formData.append('marginRight', '0')
  formData.append('printBackground', 'true')

  const gotenbergRes = await fetch(GOTENBERG_URL, { method: 'POST', body: formData })

  if (!gotenbergRes.ok) {
    const detail = await gotenbergRes.text().catch(() => '')
    throw createError({ statusCode: 502, statusMessage: `Gotenberg error: ${gotenbergRes.status} ${detail}` })
  }

  const pdfBuffer = await gotenbergRes.arrayBuffer()

  // ── 2. Upload sur Supabase Storage ─────────────────────────
  const supabase = createClient(config.public.supabaseUrl, config.supabaseServiceKey)
  const fileName = `${Date.now()}_${(body.Nom || 'investigateur').replace(/\s+/g, '_')}.pdf`

  const { error: uploadError } = await supabase.storage
    .from('fiches')
    .upload(fileName, Buffer.from(pdfBuffer), {
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

  setTimeout(() => {
    supabase.storage.from('fiches').remove([fileName]).catch(() => {})
  }, 70_000)

  return { url: signedData.signedUrl, fileName }
})
