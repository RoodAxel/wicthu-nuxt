export default defineNuxtPlugin(() => {
  const supabase = useSupabaseClient()
  const router = useRouter()

  supabase.auth.onAuthStateChange((event) => {
    if (event === 'PASSWORD_RECOVERY' && router.currentRoute.value.path !== '/auth/reset-password') {
      router.replace('/auth/reset-password')
    }
  })
})
