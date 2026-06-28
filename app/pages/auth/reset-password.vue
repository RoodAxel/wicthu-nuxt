<script setup lang="ts">
definePageMeta({ layout: false })

const supabase = useSupabaseClient()
const router = useRouter()
const route = useRoute()

const password = ref('')
const confirm = ref('')
const loading = ref(false)
const errorMsg = ref('')
const done = ref(false)

// Flow PKCE : le lien email contient ?token_hash=...&type=recovery directement sur cette page
onMounted(async () => {
  const token_hash = route.query.token_hash as string
  const type = route.query.type as string
  if (token_hash && type === 'recovery') {
    const { error } = await supabase.auth.verifyOtp({ token_hash, type: 'recovery' })
    if (error) errorMsg.value = 'Lien invalide ou expiré. Veuillez recommencer.'
  }
})

async function handleUpdate() {
  errorMsg.value = ''
  if (password.value !== confirm.value) {
    errorMsg.value = 'Les mots de passe ne correspondent pas.'
    return
  }
  if (password.value.length < 8) {
    errorMsg.value = 'Le mot de passe doit contenir au moins 8 caractères.'
    return
  }
  loading.value = true
  const { error } = await supabase.auth.updateUser({ password: password.value })
  loading.value = false
  if (error) {
    errorMsg.value = error.message
  } else {
    done.value = true
    await supabase.auth.signOut()
    setTimeout(() => router.push('/auth/login'), 3000)
  }
}
useSeoMeta({ title: 'Réinitialiser le mot de passe' })
</script>

<template>
  <div class="auth-page">
    <div class="auth-card">
      <div class="auth-sigil">✦</div>
      <h1 class="auth-title">Nouveau mot de passe</h1>
      <p class="auth-subtitle">Choisissez un nouveau mot de passe pour vos archives</p>

      <template v-if="done">
        <p class="auth-success">
          Mot de passe mis à jour. Vous allez être redirigé vers la connexion…
        </p>
      </template>

      <form v-else class="auth-form" @submit.prevent="handleUpdate">
        <div class="field">
          <label class="field-label" for="password">Nouveau mot de passe</label>
          <input
            id="password"
            v-model="password"
            type="password"
            class="field-input"
            placeholder="••••••••"
            autocomplete="new-password"
            required
          >
        </div>

        <div class="field">
          <label class="field-label" for="confirm">Confirmer le mot de passe</label>
          <input
            id="confirm"
            v-model="confirm"
            type="password"
            class="field-input"
            placeholder="••••••••"
            autocomplete="new-password"
            required
          >
        </div>

        <p v-if="errorMsg" class="auth-error">{{ errorMsg }}</p>

        <button type="submit" class="auth-btn" :disabled="loading">
          <span v-if="loading">Mise à jour…</span>
          <span v-else>Valider le nouveau mot de passe</span>
        </button>
      </form>
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
  margin-bottom: var(--space-xl);
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  text-align: left;
}

.field {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.field-label {
  font-family: var(--font-heading);
  font-size: var(--fs-field-label);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-text-muted);
}

.field-input {
  background: var(--color-deep);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-sm) var(--space-md);
  color: var(--color-text-primary);
  font-family: var(--font-body);
  font-size: var(--fs-field-input);
  width: 100%;
  outline: none;
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}

.field-input::placeholder {
  color: var(--color-text-muted);
  font-style: italic;
}

.field-input:focus {
  border-color: var(--color-arcane-dim);
  box-shadow: var(--shadow-glow);
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
}

.auth-success {
  font-family: var(--font-flavor);
  font-style: italic;
  font-size: var(--fs-auth-subtitle);
  color: var(--color-arcane);
  text-align: center;
  padding: var(--space-md);
  background: rgba(127, 179, 138, 0.08);
  border: 1px solid var(--color-arcane-dim);
  border-radius: var(--radius-md);
  line-height: 1.7;
}

.auth-btn {
  font-family: var(--font-heading);
  font-size: var(--fs-btn);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  padding: var(--space-sm) var(--space-xl);
  background: var(--color-arcane-dim);
  border: 1px solid var(--color-arcane);
  border-radius: var(--radius-md);
  color: var(--color-arcane);
  cursor: pointer;
  transition: all var(--transition-fast);
  margin-top: var(--space-sm);
}

.auth-btn:hover:not(:disabled) {
  background: var(--color-arcane);
  color: var(--color-void);
}

.auth-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
