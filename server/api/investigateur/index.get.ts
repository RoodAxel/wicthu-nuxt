import { serverSupabaseUser } from '#supabase/server'
import { prisma } from '#server/lib/prisma'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user?.sub) throw createError({ statusCode: 401, statusMessage: 'Non authentifié' })

  return prisma.investigateur.findMany({
    where: { userId: user.sub },
    orderBy: { updatedAt: 'desc' },
    select: { id: true, nom: true, createdAt: true, updatedAt: true }
  })
})
