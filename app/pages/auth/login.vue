<script setup lang="ts">
definePageMeta({ layout: false })

const supabase = useSupabaseClient()
const router = useRouter()

const email = ref('')
const password = ref('')
const loading = ref(false)
const errorMsg = ref('')

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
</script>

<template>
  <div class="auth-page">
    <div class="auth-card">
      <div class="auth-sigil">✦</div>
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
          <label class="field-label" for="password">Mot de passe</label>
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
    </div>
  </div>
</template>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-void);
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
  font-size: 2rem;
  color: var(--color-arcane);
  margin-bottom: var(--space-md);
  opacity: 0.8;
}

.auth-title {
  font-family: var(--font-heading);
  font-size: 1.4rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  color: var(--color-text-primary);
  margin-bottom: var(--space-xs);
}

.auth-subtitle {
  font-family: var(--font-flavor);
  font-style: italic;
  font-size: 0.9rem;
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
  font-size: 0.65rem;
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
  font-size: 0.95rem;
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
  font-size: 0.85rem;
  color: var(--color-crimson);
  text-align: center;
  padding: var(--space-sm);
  background: rgba(139, 58, 58, 0.1);
  border: 1px solid var(--color-crimson-dim);
  border-radius: var(--radius-sm);
}

.auth-btn {
  font-family: var(--font-heading);
  font-size: 0.75rem;
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
  font-size: 0.85rem;
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
