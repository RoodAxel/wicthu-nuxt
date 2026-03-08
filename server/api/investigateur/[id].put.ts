import { serverSupabaseUser } from '#supabase/server'
import { prisma } from '#server/lib/prisma'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user?.sub) throw createError({ statusCode: 401, statusMessage: 'Non authentifié' })

  const id = Number(getRouterParam(event, 'id'))
  const body = await readBody(event)

  const existing = await prisma.investigateur.findFirst({ where: { id, userId: user.sub } })
  if (!existing) throw createError({ statusCode: 404, statusMessage: 'Fiche introuvable' })

  const nom = (body.Nom as string | undefined)?.trim() || 'Sans nom'

  return prisma.investigateur.update({
    where: { id },
    data: { nom, data: body }
  })
})
