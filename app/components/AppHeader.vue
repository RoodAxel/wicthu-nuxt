<script setup lang="ts">
const supabase = useSupabaseClient()
const user = useSupabaseUser()
const router = useRouter()
const route = useRoute()

const resources = [
  { label: 'Compétences', to: '/competence' },
  { label: 'Armes', to: '/arme' },
  { label: 'Équip. classique', to: '/equipement-classique' },
  { label: 'Équip. moderne', to: '/equipement-moderne' },
  { label: 'Ouvrages occultes', to: '/ouvrage-occulte' },
  { label: 'Manies', to: '/manie' },
  { label: 'Phobies', to: '/phobie' },
]

const menuOpen = ref(false)

function toggleMenu() { menuOpen.value = !menuOpen.value }
function closeMenu() { menuOpen.value = false }

watch(() => route.path, closeMenu)

async function signOut() {
  await supabase.auth.signOut()
  await router.push('/auth/login')
  closeMenu()
}
</script>

<template>
  <header class="app-header">
    <div class="header-inner">
      <!-- Logo -->
      <NuxtLink to="/" class="header-logo" aria-label="Accueil" @click="closeMenu">
        <img src="/logoWicthu.png" alt="Wicthu" class="logo-img">
      </NuxtLink>

      <!-- Navigation desktop -->
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

      <!-- Auth desktop -->
      <div class="header-auth">
        <template v-if="user">
          <NuxtLink to="/investigateur/creer" class="auth-btn auth-btn--accent">+ Nouvelle fiche</NuxtLink>
          <NuxtLink to="/profil" class="auth-email auth-profile" :class="{ active: route.path === '/profil' }">{{ user.email }}</NuxtLink>
          <button class="auth-btn" @click="signOut">Déconnexion</button>
        </template>
        <NuxtLink v-else to="/auth/login" class="auth-btn">Connexion</NuxtLink>
      </div>

      <!-- Hamburger -->
      <button
        class="hamburger"
        :class="{ open: menuOpen }"
        aria-label="Menu"
        @click="toggleMenu"
      >
        <span /><span /><span />
      </button>
    </div>

    <!-- Mobile menu -->
    <Transition name="mobile-menu">
      <div v-if="menuOpen" class="mobile-nav">
        <nav class="mobile-nav-links">
          <NuxtLink
            v-for="resource in resources"
            :key="resource.to"
            :to="resource.to"
            class="mobile-nav-link"
            :class="{ active: route.path.startsWith(resource.to) }"
          >
            {{ resource.label }}
          </NuxtLink>
        </nav>
        <div class="mobile-auth">
          <template v-if="user">
            <NuxtLink to="/investigateur/creer" class="mobile-nav-link" @click="closeMenu">+ Nouvelle fiche</NuxtLink>
            <NuxtLink to="/profil" class="mobile-nav-link" :class="{ active: route.path === '/profil' }" @click="closeMenu">Mon profil</NuxtLink>
            <button class="auth-btn" @click="signOut">Déconnexion</button>
          </template>
          <NuxtLink v-else to="/auth/login" class="auth-btn" @click="closeMenu">Connexion</NuxtLink>
        </div>
      </div>
    </Transition>
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
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 var(--space-xl);
  height: 56px;
  display: flex;
  align-items: center;
  gap: var(--space-lg);
}

/* ── LOGO ──────────────────────────────────────────────── */
.header-logo {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  transition: opacity var(--transition-fast);
}
.header-logo:hover { opacity: 0.8; }
.logo-img { height: 32px; width: auto; object-fit: contain; }

/* ── NAV DESKTOP ───────────────────────────────────────── */
.header-nav {
  display: flex;
  align-items: center;
  gap: 2px;
  flex: 1;
  flex-wrap: wrap;
}

.nav-link {
  font-family: var(--font-heading);
  font-size: 0.62rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-sm);
  color: var(--color-text-secondary);
  text-decoration: none;
  border: 1px solid transparent;
  transition: all var(--transition-fast);
  white-space: nowrap;
}
.nav-link:hover { color: var(--color-arcane); border-color: var(--color-arcane-dim); }
.nav-link.active {
  color: var(--color-arcane);
  background: var(--color-arcane-glow);
  border-color: var(--color-arcane-dim);
}

/* ── AUTH DESKTOP ──────────────────────────────────────── */
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
  max-width: 160px;
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
.auth-btn:hover { border-color: var(--color-arcane-dim); color: var(--color-arcane); }
.auth-btn--accent {
  background: var(--color-arcane);
  color: var(--color-deep);
  border-color: var(--color-arcane);
}
.auth-btn--accent:hover { opacity: 0.85; color: var(--color-deep); border-color: var(--color-arcane); }
.auth-profile {
  text-decoration: none;
  border-radius: var(--radius-sm);
  padding: 2px var(--space-xs);
  transition: color var(--transition-fast);
}
.auth-profile:hover { color: var(--color-arcane); }
.auth-profile.active { color: var(--color-arcane); }

/* ── HAMBURGER ─────────────────────────────────────────── */
.hamburger {
  display: none;
  flex-direction: column;
  justify-content: center;
  gap: 5px;
  width: 36px;
  height: 36px;
  background: transparent;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  cursor: pointer;
  padding: 0 8px;
  flex-shrink: 0;
  transition: border-color var(--transition-fast);
}
.hamburger:hover { border-color: var(--color-arcane-dim); }
.hamburger span {
  display: block;
  height: 1px;
  background: var(--color-text-secondary);
  border-radius: 1px;
  transition: all var(--transition-fast);
  transform-origin: center;
}
.hamburger.open span:nth-child(1) { transform: translateY(6px) rotate(45deg); }
.hamburger.open span:nth-child(2) { opacity: 0; }
.hamburger.open span:nth-child(3) { transform: translateY(-6px) rotate(-45deg); }

/* ── MOBILE MENU ───────────────────────────────────────── */
.mobile-nav {
  background: var(--color-surface);
  border-top: 1px solid var(--color-border);
  padding: var(--space-md) var(--space-lg);
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}
.mobile-nav-links {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.mobile-nav-link {
  font-family: var(--font-heading);
  font-size: 0.75rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-sm);
  color: var(--color-text-secondary);
  text-decoration: none;
  border: 1px solid transparent;
  transition: all var(--transition-fast);
}
.mobile-nav-link:hover,
.mobile-nav-link.active {
  color: var(--color-arcane);
  background: var(--color-arcane-glow);
  border-color: var(--color-arcane-dim);
}
.mobile-auth {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding-top: var(--space-sm);
  border-top: 1px solid var(--color-border);
}
.mobile-auth-email {
  font-family: var(--font-heading);
  font-size: 0.7rem;
  color: var(--color-text-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

/* ── TRANSITION ────────────────────────────────────────── */
.mobile-menu-enter-active,
.mobile-menu-leave-active { transition: all 0.2s ease; overflow: hidden; }
.mobile-menu-enter-from,
.mobile-menu-leave-to { opacity: 0; max-height: 0; padding-top: 0; padding-bottom: 0; }
.mobile-menu-enter-to,
.mobile-menu-leave-from { max-height: 400px; }

/* ── RESPONSIVE ────────────────────────────────────────── */
@media (max-width: 900px) {
  .header-nav  { display: none; }
  .header-auth { display: none; }
  .hamburger   { display: flex; }
  .header-inner { padding: 0 var(--space-md); }
}
</style>
