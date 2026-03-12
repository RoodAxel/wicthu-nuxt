import { serverSupabaseUser, serverSupabaseServiceRole } from '#supabase/server'
import { prisma } from '#server/lib/prisma'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user?.sub) throw createError({ statusCode: 401, statusMessage: 'Non authentifié' })

  await prisma.investigateur.deleteMany({ where: { userId: user.sub } })

  const adminClient = serverSupabaseServiceRole(event)
  const { error } = await adminClient.auth.admin.deleteUser(user.sub)
  if (error) throw createError({ statusCode: 500, statusMessage: error.message })

  return { success: true }
})
