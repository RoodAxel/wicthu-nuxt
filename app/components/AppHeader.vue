<script setup lang="ts">
const supabase = useSupabaseClient()
const user = useSupabaseUser()
const router = useRouter()
const route = useRoute()

const resources = [
  { label: 'Compétences', to: '/competence' },
  { label: 'Ouvrages', to: '/competence' }
]

async function signOut() {
  await supabase.auth.signOut()
  await router.push('/auth/login')
}
</script>

<template>
  <header class="app-header">
    <div class="header-inner">
      <!-- Logo -->
      <NuxtLink to="/" class="header-logo" aria-label="Accueil">
        <img src="/logoclair.png" alt="Wicthu" class="logo-img">
      </NuxtLink>

      <!-- Navigation ressources -->
      <nav class="header-nav" aria-label="Ressources">
        <NuxtLink
          v-for="resource in resources"
          :key="resource.to"
          :to="resource.to"
          class="nav-link"
          :class="{ active: route.path.startsWith(resource.to) }"
        >
          {{ resource.label }}
        </NuxtLink>
      </nav>

      <!-- Auth -->
      <div class="header-auth">
        <template v-if="user">
          <span class="auth-email">{{ user.email }}</span>
          <button class="auth-btn" @click="signOut">Déconnexion</button>
        </template>
        <NuxtLink v-else to="/auth/login" class="auth-btn">Connexion</NuxtLink>
      </div>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: 50;
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
}

.header-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--space-xl);
  height: 56px;
  display: flex;
  align-items: center;
  gap: var(--space-xl);
}

/* ── LOGO ──────────────────────────────────────────────── */
.header-logo {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  color: var(--color-text-primary);
  transition: color var(--transition-fast);
}

.header-logo:hover {
  color: var(--color-arcane);
}

.logo-img {
  height: 32px;
  width: auto;
  object-fit: contain;
}

/* ── NAV ───────────────────────────────────────────────── */
.header-nav {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  flex: 1;
}

.nav-link {
  font-family: var(--font-heading);
  font-size: 0.65rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  padding: var(--space-xs) var(--space-md);
  border-radius: var(--radius-sm);
  color: var(--color-text-secondary);
  text-decoration: none;
  border: 1px solid transparent;
  transition: all var(--transition-fast);
}

.nav-link:hover {
  color: var(--color-arcane);
  border-color: var(--color-arcane-dim);
}

.nav-link.active {
  color: var(--color-arcane);
  background: var(--color-arcane-glow);
  border-color: var(--color-arcane-dim);
}

/* ── AUTH ──────────────────────────────────────────────── */
.header-auth {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  flex-shrink: 0;
}

.auth-email {
  font-family: var(--font-heading);
  font-size: 0.7rem;
  font-weight: bold;
  letter-spacing: 0.08em;
  color: var(--color-text-muted);
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.auth-btn {
  font-family: var(--font-heading);
  font-size: 0.62rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  padding: var(--space-xs) var(--space-md);
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  color: var(--color-text-secondary);
  background: transparent;
  cursor: pointer;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  transition: all var(--transition-fast);
}

.auth-btn:hover {
  border-color: var(--color-arcane-dim);
  color: var(--color-arcane);
}

/* ── RESPONSIVE ────────────────────────────────────────── */
@media (max-width: 640px) {
  .header-inner {
    padding: 0 var(--space-md);
    gap: var(--space-md);
  }

  .auth-email {
    display: none;
  }
}
</style>
