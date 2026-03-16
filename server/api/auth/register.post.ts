import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const { email, password } = await readBody(event)

  if (!email || !password) {
    throw createError({ statusCode: 400, message: 'Email et mot de passe requis.' })
  }

  const adminClient = serverSupabaseServiceRole(event)
  const { data, error } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true
  })

  if (error) {
    throw createError({ statusCode: 400, message: error.message })
  }

  return { user: data.user }
})
