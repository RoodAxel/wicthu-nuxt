import { serverSupabaseUser } from '#supabase/server'
import { prisma } from '#server/lib/prisma'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user?.sub) throw createError({ statusCode: 401, statusMessage: 'Non authentifié' })

  const body = await readBody<{ nom: string, deg?: string, port?: string, cap?: string, pann?: string }>(event)
  if (!body?.nom?.trim()) throw createError({ statusCode: 400, statusMessage: 'Nom requis' })

  return prisma.armePerso.create({
    data: {
      userId: user.sub,
      nom: body.nom.trim(),
      deg: body.deg || null,
      port: body.port || null,
      cap: body.cap || null,
      pann: body.pann || null
    }
  })
})
