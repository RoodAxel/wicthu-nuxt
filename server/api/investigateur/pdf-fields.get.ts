import { defineEventHandler, createError } from 'h3'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

/**
 * GET /api/investigateur/pdf-fields
 * Retourne la liste des champs EditBox du formulaire PDF via PDF.co.
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)

  if (!config.pdfcoApiKey) {
    throw createError({ statusCode: 500, statusMessage: 'PDF.co API key not configured' })
  }

  const pdfBase64 = readFileSync(resolve('public/fiche_investigateur.pdf')).toString('base64')

  const upload = await $fetch<{ error: boolean; url?: string; message?: string }>(
    'https://api.pdf.co/v1/file/upload/base64',
    {
      method: 'POST',
      headers: { 'x-api-key': config.pdfcoApiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'fiche_investigateur.pdf', file: pdfBase64 })
    }
  )

  if (upload.error || !upload.url) {
    throw createError({ statusCode: 500, statusMessage: upload.message ?? 'PDF.co upload error' })
  }

  const response = await $fetch<{ error: boolean; info?: { FieldsInfo?: { Fields?: unknown[] } }; message?: string }>(
    'https://api.pdf.co/v1/pdf/info/fields',
    {
      method: 'POST',
      headers: { 'x-api-key': config.pdfcoApiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: upload.url })
    }
  )

  if (response.error) {
    throw createError({ statusCode: 500, statusMessage: response.message ?? 'PDF.co error' })
  }

  const fields = response.info?.FieldsInfo?.Fields ?? []
  return { fields }
})
