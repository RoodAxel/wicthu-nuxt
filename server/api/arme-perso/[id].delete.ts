import { serverSupabaseUser } from '#supabase/server'
import { prisma } from '#server/lib/prisma'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user?.sub) throw createError({ statusCode: 401, statusMessage: 'Non authentifié' })

  const id = Number(getRouterParam(event, 'id'))
  const arme = await prisma.armePerso.findUnique({ where: { id } })
  if (!arme || arme.userId !== user.sub)
    throw createError({ statusCode: 404, statusMessage: 'Arme introuvable' })

  await prisma.armePerso.delete({ where: { id } })
  return { success: true }
})
