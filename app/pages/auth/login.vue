<script setup lang="ts">
definePageMeta({ layout: false })

const supabase = useSupabaseClient()
const router = useRouter()

const mode = ref<'login' | 'reset'>('login')

const email = ref('')
const password = ref('')
const loading = ref(false)
const errorMsg = ref('')

const resetEmail = ref('')
const resetSent = ref(false)

async function handleLogin() {
  loading.value = true
  errorMsg.value = ''
  const { error } = await supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value
  })
  loading.value = false
  if (error) {
    errorMsg.value = error.message
  } else {
    await router.push('/')
  }
}

async function handleReset() {
  loading.value = true
  errorMsg.value = ''
  const redirectTo = `${window.location.origin}/auth/reset-password`
  const { error } = await supabase.auth.resetPasswordForEmail(resetEmail.value, { redirectTo })
  loading.value = false
  if (error) {
    errorMsg.value = error.message
  } else {
    resetSent.value = true
  }
}

function switchMode(m: 'login' | 'reset') {
  mode.value = m
  errorMsg.value = ''
  resetSent.value = false
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-card">
      <div class="auth-sigil">✦</div>

      <template v-if="mode === 'login'">
        <h1 class="auth-title">Accès aux Archives</h1>
        <p class="auth-subtitle">Identifiez-vous pour consulter les grimoires</p>

        <form class="auth-form" @submit.prevent="handleLogin">
          <div class="field">
            <label class="field-label" for="email">Adresse électronique</label>
            <input
              id="email"
              v-model="email"
              type="email"
              class="field-input"
              placeholder="investigateur@arkham.edu"
              autocomplete="email"
              required
            >
          </div>

          <div class="field">
            <div class="field-label-row">
              <label class="field-label" for="password">Mot de passe</label>
              <button type="button" class="forgot-link" @click="switchMode('reset')">
                Mot de passe oublié ?
              </button>
            </div>
            <input
              id="password"
              v-model="password"
              type="password"
              class="field-input"
              placeholder="••••••••"
              autocomplete="current-password"
              required
            >
          </div>

          <p v-if="errorMsg" class="auth-error">{{ errorMsg }}</p>

          <button type="submit" class="auth-btn" :disabled="loading">
            <span v-if="loading">Vérification…</span>
            <span v-else>Entrer dans les Archives</span>
          </button>
        </form>

        <p class="auth-link">
          Pas encore de compte ?
          <NuxtLink to="/auth/register">S'inscrire</NuxtLink>
        </p>
      </template>

      <template v-else>
        <h1 class="auth-title">Réinitialisation</h1>
        <p class="auth-subtitle">Un lien vous sera envoyé par courrier électronique</p>

        <template v-if="resetSent">
          <p class="auth-success">
            Un message a été envoyé à <strong>{{ resetEmail }}</strong>. Consultez votre boîte de réception et suivez le lien pour choisir un nouveau mot de passe.
          </p>
        </template>

        <form v-else class="auth-form" @submit.prevent="handleReset">
          <div class="field">
            <label class="field-label" for="reset-email">Adresse électronique</label>
            <input
              id="reset-email"
              v-model="resetEmail"
              type="email"
              class="field-input"
              placeholder="investigateur@arkham.edu"
              autocomplete="email"
              required
            >
          </div>

          <p v-if="errorMsg" class="auth-error">{{ errorMsg }}</p>

          <button type="submit" class="auth-btn" :disabled="loading">
            <span v-if="loading">Envoi…</span>
            <span v-else>Envoyer le lien</span>
          </button>
        </form>

        <p class="auth-link">
          <button type="button" class="forgot-link" @click="switchMode('login')">
            ← Retour à la connexion
          </button>
        </p>
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

.field-label-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}

.forgot-link {
  background: none;
  border: none;
  padding: 0;
  font-family: var(--font-flavor);
  font-style: italic;
  font-size: var(--fs-auth-link);
  color: var(--color-arcane);
  cursor: pointer;
  transition: opacity var(--transition-fast);
}

.forgot-link:hover {
  opacity: 0.75;
  text-decoration: underline;
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
  margin-bottom: var(--space-md);
}

.auth-success strong {
  font-style: normal;
  color: var(--color-text-primary);
}
</style>
