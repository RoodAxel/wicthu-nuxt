import { serverSupabaseUser } from '#supabase/server'
import { prisma } from '#server/lib/prisma'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user?.sub) throw createError({ statusCode: 401, statusMessage: 'Non authentifié' })

  const id = Number(getRouterParam(event, 'id'))
  const investigateur = await prisma.investigateur.findFirst({
    where: { id, userId: user.sub }
  })

  if (!investigateur) throw createError({ statusCode: 404, statusMessage: 'Fiche introuvable' })
  return investigateur
})
