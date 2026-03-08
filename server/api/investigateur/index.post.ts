import { serverSupabaseUser } from '#supabase/server'
import { prisma } from '#server/lib/prisma'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user?.sub) throw createError({ statusCode: 401, statusMessage: 'Non authentifié' })

  const body = await readBody(event)
  const nom = (body.Nom as string | undefined)?.trim() || 'Sans nom'

  return prisma.investigateur.create({
    data: { userId: user.sub, nom, data: body }
  })
})
