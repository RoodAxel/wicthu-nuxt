<script setup lang="ts">
definePageMeta({ layout: false })

const supabase = useSupabaseClient()
const router = useRouter()
const route = useRoute()

const errorMsg = ref('')

onMounted(async () => {
  const token_hash = route.query.token_hash as string
  const type = route.query.type as string

  // Flow PKCE : token_hash dans les query params
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as 'recovery' | 'signup' | 'invite' | 'magiclink' | 'email'
    })
    if (error) {
      errorMsg.value = error.message
      return
    }
    await router.replace(type === 'recovery' ? '/auth/reset-password' : '/')
    return
  }

  // Flow implicite : access_token dans le hash fragment (#access_token=...&type=recovery)
  // Le client Supabase détecte et établit la session automatiquement au chargement
  const { data: { session } } = await supabase.auth.getSession()
  if (session) {
    const hashType = new URLSearchParams(window.location.hash.slice(1)).get('type')
    await router.replace(hashType === 'recovery' ? '/auth/reset-password' : '/')
    return
  }

  errorMsg.value = 'Lien invalide ou expiré.'
})
</script>

<template>
  <div class="auth-page">
    <div class="auth-card">
      <div class="auth-sigil">✦</div>

      <template v-if="errorMsg">
        <h1 class="auth-title">Lien invalide</h1>
        <p class="auth-error">{{ errorMsg }}</p>
        <p class="auth-link">
          <NuxtLink to="/auth/login">← Retour à la connexion</NuxtLink>
        </p>
      </template>

      <template v-else>
        <h1 class="auth-title">Vérification…</h1>
        <p class="auth-subtitle">Validation du lien en cours</p>
      </template>
    </div>
  </div>
</template>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-deep);
  padding: var(--space-xl);
}

.auth-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-2xl);
  width: 100%;
  max-width: 420px;
  text-align: center;
}

.auth-sigil {
  font-size: var(--fs-sigil);
  color: var(--color-arcane);
  margin-bottom: var(--space-md);
  opacity: 0.8;
}

.auth-title {
  font-family: var(--font-heading);
  font-size: var(--fs-auth-title);
  font-weight: 600;
  letter-spacing: 0.08em;
  color: var(--color-text-primary);
  margin-bottom: var(--space-xs);
}

.auth-subtitle {
  font-family: var(--font-flavor);
  font-style: italic;
  font-size: var(--fs-auth-subtitle);
  color: var(--color-text-muted);
}

.auth-error {
  font-family: var(--font-body);
  font-size: var(--fs-error);
  color: var(--color-crimson);
  text-align: center;
  padding: var(--space-sm);
  background: rgba(139, 58, 58, 0.1);
  border: 1px solid var(--color-crimson-dim);
  border-radius: var(--radius-sm);
  margin-bottom: var(--space-md);
}

.auth-link {
  margin-top: var(--space-lg);
  font-family: var(--font-flavor);
  font-style: italic;
  font-size: var(--fs-auth-link);
  color: var(--color-text-muted);
}

.auth-link a {
  color: var(--color-arcane);
  text-decoration: none;
}

.auth-link a:hover {
  text-decoration: underline;
}
</style>
