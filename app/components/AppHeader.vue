<script setup lang="ts">
const supabase = useSupabaseClient()
const user = useSupabaseUser()
const router = useRouter()
const route = useRoute()

type SimpleLink = { label: string; to: string }
type GroupLink  = { label: string; children: SimpleLink[] }
type NavItem    = SimpleLink | GroupLink

function isGroup(item: NavItem): item is GroupLink {
  return 'children' in item
}

const resources: NavItem[] = [
  { label: 'Arme',        to: '/ressources/arme' },
  { label: 'Artefact',    to: '/ressources/artefact' },
  { label: 'Compétence',  to: '/ressources/competence' },
  { label: 'Entité',      to: '/ressources/entite' },
  { label: 'Équipement',  children: [
    { label: 'Classique', to: '/ressources/equipement-classique' },
    { label: 'Moderne',   to: '/ressources/equipement-moderne' },
  ]},
  { label: 'Trauma', children: [
    { label: 'Manie',  to: '/ressources/manie' },
    { label: 'Phobie', to: '/ressources/phobie' },
  ]},
  { label: 'Occupation',  to: '/ressources/occupation' },
  { label: 'Ouvrage', children: [
    { label: 'Mythe',    to: '/ressources/ouvrage-mythe' },
    { label: 'Occulte',  to: '/ressources/ouvrage-occulte' },
  ]},
  { label: 'Sort',        to: '/ressources/sort' },
]

const menuOpen     = ref(false)
const userMenuOpen = ref(false)
const showSignOutModal = ref(false)
const openGroup    = ref<string | null>(null)

function toggleMenu()    { menuOpen.value = !menuOpen.value }
function closeMenu()     { menuOpen.value = false }
function toggleUserMenu() { userMenuOpen.value = !userMenuOpen.value }
function closeUserMenu() { userMenuOpen.value = false }
function toggleGroup(label: string) {
  openGroup.value = openGroup.value === label ? null : label
}

function isGroupActive(item: GroupLink) {
  return item.children.some(c => route.path.startsWith(c.to))
}

watch(() => route.path, () => {
  closeMenu()
  closeUserMenu()
  openGroup.value = null
})

async function confirmSignOut() {
  showSignOutModal.value = false
  closeUserMenu()
  closeMenu()
  await supabase.auth.signOut()
  await router.push('/auth/login')
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
        <template v-for="item in resources" :key="isGroup(item) ? item.label : item.to">
          <!-- Simple link -->
          <NuxtLink
            v-if="!isGroup(item)"
            :to="item.to"
            class="nav-link"
            :class="{ active: route.path.startsWith(item.to) }"
          >
            {{ item.label }}
          </NuxtLink>

          <!-- Group with dropdown -->
          <div v-else class="nav-group" :class="{ 'group-active': isGroupActive(item) }">
            <button
              class="nav-group-btn"
              :class="{ active: isGroupActive(item) }"
              @click="toggleGroup(item.label)"
            >
              {{ item.label }}
              <span class="group-chevron" :class="{ open: openGroup === item.label }">›</span>
            </button>
            <Transition name="dropdown">
              <div v-if="openGroup === item.label" class="nav-dropdown">
                <NuxtLink
                  v-for="child in item.children"
                  :key="child.to"
                  :to="child.to"
                  class="nav-dropdown-item"
                  :class="{ active: route.path.startsWith(child.to) }"
                >
                  {{ child.label }}
                </NuxtLink>
              </div>
            </Transition>
          </div>
        </template>
      </nav>

      <!-- Auth desktop -->
      <div class="header-auth">
        <template v-if="user">
          <div class="user-menu-wrapper">
            <button
              class="user-icon-btn"
              :class="{ active: userMenuOpen }"
              aria-label="Menu utilisateur"
              @click="toggleUserMenu"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
              </svg>
            </button>

            <Transition name="dropdown">
              <div v-if="userMenuOpen" class="user-dropdown">
                <div class="dropdown-email">{{ user.email }}</div>
                <div class="dropdown-divider" />
                <NuxtLink to="/profil" class="dropdown-item" @click="closeUserMenu">
                  <span class="dropdown-item-icon">◈</span> Mon profil
                </NuxtLink>
                <NuxtLink to="/investigateur/creer" class="dropdown-item" @click="closeUserMenu">
                  <span class="dropdown-item-icon">✚</span> Nouvelle fiche
                </NuxtLink>
                <div class="dropdown-divider" />
                <button class="dropdown-item dropdown-item--danger" @click="showSignOutModal = true; closeUserMenu()">
                  <span class="dropdown-item-icon">✖</span> Déconnexion
                </button>
              </div>
            </Transition>
          </div>
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
          <template v-for="item in resources" :key="isGroup(item) ? item.label : item.to">
            <!-- Simple link -->
            <NuxtLink
              v-if="!isGroup(item)"
              :to="item.to"
              class="mobile-nav-link"
              :class="{ active: route.path.startsWith(item.to) }"
            >
              {{ item.label }}
            </NuxtLink>

            <!-- Group accordion -->
            <div v-else class="mobile-group">
              <button
                class="mobile-nav-link mobile-group-btn"
                :class="{ active: isGroupActive(item) }"
                @click="toggleGroup(item.label)"
              >
                {{ item.label }}
                <span class="group-chevron" :class="{ open: openGroup === item.label }">›</span>
              </button>
              <Transition name="expand">
                <div v-if="openGroup === item.label" class="mobile-group-children">
                  <NuxtLink
                    v-for="child in item.children"
                    :key="child.to"
                    :to="child.to"
                    class="mobile-nav-link mobile-child-link"
                    :class="{ active: route.path.startsWith(child.to) }"
                  >
                    {{ child.label }}
                  </NuxtLink>
                </div>
              </Transition>
            </div>
          </template>
        </nav>

        <div class="mobile-auth">
          <template v-if="user">
            <NuxtLink to="/investigateur/creer" class="mobile-nav-link" @click="closeMenu">+ Nouvelle fiche</NuxtLink>
            <NuxtLink to="/profil" class="mobile-nav-link" :class="{ active: route.path === '/profil' }" @click="closeMenu">Mon profil</NuxtLink>
            <button class="mobile-nav-link mobile-signout" @click="showSignOutModal = true; closeMenu()">Déconnexion</button>
          </template>
          <NuxtLink v-else to="/auth/login" class="auth-btn" @click="closeMenu">Connexion</NuxtLink>
        </div>
      </div>
    </Transition>

    <!-- Overlay pour fermer les dropdowns -->
    <div v-if="userMenuOpen || openGroup !== null" class="dropdown-overlay" @click="closeUserMenu(); openGroup = null" />

    <!-- Modal de confirmation déconnexion -->
    <Transition name="modal">
      <div v-if="showSignOutModal" class="modal-backdrop" @click.self="showSignOutModal = false">
        <div class="modal">
          <p class="modal-sigil">⊗</p>
          <h2 class="modal-title">Quitter l'Ordre ?</h2>
          <p class="modal-body">Votre session sera fermée. Vous pourrez vous reconnecter à tout moment.</p>
          <div class="modal-actions">
            <button class="modal-btn modal-btn--cancel" @click="showSignOutModal = false">Annuler</button>
            <button class="modal-btn modal-btn--confirm" @click="confirmSignOut">Se déconnecter</button>
          </div>
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
  font-size: var(--fs-nav);
  font-weight: bold;
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

/* ── NAV GROUP (dropdown) ──────────────────────────────── */
.nav-group {
  position: relative;
}

.nav-group-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-family: var(--font-heading);
  font-size: var(--fs-nav);
  font-weight: bold;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-sm);
  color: var(--color-text-secondary);
  background: transparent;
  border: 1px solid transparent;
  cursor: pointer;
  white-space: nowrap;
  transition: all var(--transition-fast);
}
.nav-group-btn:hover { color: var(--color-arcane); border-color: var(--color-arcane-dim); }
.nav-group-btn.active {
  color: var(--color-arcane);
  background: var(--color-arcane-glow);
  border-color: var(--color-arcane-dim);
}

.group-chevron {
  font-size: 0.8rem;
  display: inline-block;
  transition: transform var(--transition-fast);
  line-height: 1;
}
.group-chevron.open { transform: rotate(90deg); }

.nav-dropdown {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  min-width: 140px;
  background: var(--color-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-card);
  overflow: hidden;
  z-index: 100;
}

.nav-dropdown-item {
  display: block;
  padding: var(--space-sm) var(--space-md);
  font-family: var(--font-heading);
  font-size: var(--fs-nav);
  font-weight: bold;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
  text-decoration: none;
  transition: all var(--transition-fast);
  white-space: nowrap;
}
.nav-dropdown-item:hover { background: var(--color-arcane-glow); color: var(--color-arcane); }
.nav-dropdown-item.active { color: var(--color-arcane); background: var(--color-arcane-glow); }

/* ── AUTH DESKTOP ──────────────────────────────────────── */
.header-auth {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  flex-shrink: 0;
}

.auth-btn {
  font-family: var(--font-heading);
  font-size: var(--fs-btn);
  font-weight: bold;
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

/* ── USER MENU ─────────────────────────────────────────── */
.user-menu-wrapper { position: relative; }

.user-icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  background: transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
}
.user-icon-btn:hover,
.user-icon-btn.active {
  border-color: var(--color-arcane-dim);
  color: var(--color-arcane);
  background: var(--color-arcane-glow);
}

.user-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  min-width: 200px;
  background: var(--color-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-card);
  overflow: hidden;
  z-index: 100;
}

.dropdown-email {
  font-family: var(--font-heading);
  font-size: var(--fs-dropdown-meta);
  letter-spacing: 0.05em;
  color: var(--color-text-muted);
  padding: var(--space-sm) var(--space-md);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dropdown-divider { height: 1px; background: var(--color-border); }

.dropdown-item {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  width: 100%;
  padding: var(--space-sm) var(--space-md);
  font-family: var(--font-heading);
  font-size: var(--fs-nav);
  font-weight: bold;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
  text-decoration: none;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all var(--transition-fast);
  text-align: left;
}
.dropdown-item:hover { background: var(--color-arcane-glow); color: var(--color-arcane); }
.dropdown-item--danger:hover { background: rgba(139, 58, 58, 0.15); color: var(--color-crimson); }
.dropdown-item-icon { font-size: var(--fs-nav); opacity: 0.7; flex-shrink: 0; }

.dropdown-overlay { position: fixed; inset: 0; z-index: 99; }

/* ── DROPDOWN TRANSITION ───────────────────────────────── */
.dropdown-enter-active,
.dropdown-leave-active { transition: opacity 0.15s ease, transform 0.15s ease; }
.dropdown-enter-from,
.dropdown-leave-to { opacity: 0; transform: translateY(-6px); }

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
  font-size: var(--fs-nav-mobile);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-sm);
  color: var(--color-text-secondary);
  text-decoration: none;
  border: 1px solid transparent;
  transition: all var(--transition-fast);
  background: transparent;
  cursor: pointer;
  text-align: left;
  width: 100%;
}
.mobile-nav-link:hover,
.mobile-nav-link.active {
  color: var(--color-arcane);
  background: var(--color-arcane-glow);
  border-color: var(--color-arcane-dim);
}

.mobile-group { display: flex; flex-direction: column; }
.mobile-group-btn {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.mobile-group-children {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding-left: var(--space-md);
  overflow: hidden;
}
.mobile-child-link {
  font-size: var(--fs-xs) !important;
  opacity: 0.9;
}

.mobile-signout:hover {
  color: var(--color-crimson) !important;
  background: rgba(139, 58, 58, 0.1) !important;
  border-color: var(--color-crimson-dim) !important;
}
.mobile-auth {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding-top: var(--space-sm);
  border-top: 1px solid var(--color-border);
}

/* ── EXPAND TRANSITION (mobile accordion) ──────────────── */
.expand-enter-active, .expand-leave-active { transition: all 0.2s ease; overflow: hidden; }
.expand-enter-from, .expand-leave-to { opacity: 0; max-height: 0; }
.expand-enter-to, .expand-leave-from { max-height: 200px; }

/* ── MODAL ─────────────────────────────────────────────── */
.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 200;
  background: rgba(8, 10, 12, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-xl);
}
.modal {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-2xl);
  max-width: 360px;
  width: 100%;
  text-align: center;
}
.modal-sigil { font-size: var(--fs-sigil); color: var(--color-crimson); margin-bottom: var(--space-md); opacity: 0.8; }
.modal-title {
  font-family: var(--font-heading);
  font-size: var(--fs-modal-title);
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-text-primary);
  margin-bottom: var(--space-sm);
}
.modal-body {
  font-family: var(--font-flavor);
  font-style: italic;
  font-size: var(--fs-modal-body);
  color: var(--color-text-secondary);
  line-height: 1.7;
  margin-bottom: var(--space-xl);
}
.modal-actions { display: flex; gap: var(--space-md); justify-content: center; }
.modal-btn {
  font-family: var(--font-heading);
  font-size: var(--fs-btn);
  font-weight: bold;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  padding: var(--space-sm) var(--space-lg);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
}
.modal-btn--cancel { background: transparent; border: 1px solid var(--color-border); color: var(--color-text-secondary); }
.modal-btn--cancel:hover { border-color: var(--color-arcane-dim); color: var(--color-arcane); }
.modal-btn--confirm { background: rgba(139, 58, 58, 0.15); border: 1px solid var(--color-crimson-dim); color: var(--color-crimson); }
.modal-btn--confirm:hover { background: var(--color-crimson); color: var(--color-text-inverse); border-color: var(--color-crimson); }

/* ── MODAL TRANSITION ──────────────────────────────────── */
.modal-enter-active, .modal-leave-active { transition: opacity 0.2s ease; }
.modal-enter-active .modal, .modal-leave-active .modal { transition: transform 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-from .modal, .modal-leave-to .modal { transform: scale(0.95); }

/* ── TRANSITION MOBILE MENU ────────────────────────────── */
.mobile-menu-enter-active,
.mobile-menu-leave-active { transition: all 0.2s ease; overflow: hidden; }
.mobile-menu-enter-from,
.mobile-menu-leave-to { opacity: 0; max-height: 0; padding-top: 0; padding-bottom: 0; }
.mobile-menu-enter-to,
.mobile-menu-leave-from { max-height: 600px; }

/* ── RESPONSIVE ────────────────────────────────────────── */
@media (max-width: 900px) {
  .header-nav  { display: none; }
  .header-auth { display: none; }
  .hamburger   { display: flex; }
  .header-inner { padding: 0 var(--space-md); }
}
</style>
