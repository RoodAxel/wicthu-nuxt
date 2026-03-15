<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const user = useSupabaseUser()
const supabase = useSupabaseClient()
const router = useRouter()

interface FicheResume {
  id: number
  nom: string
  createdAt: string
  updatedAt: string
}

const { data: fiches, status, refresh } = useFetch<FicheResume[]>('/api/investigateur', {
  server: false
})

// ── MODAL state ──────────────────────────────────────────────
type ModalType = 'pdf' | 'delete-fiche' | 'delete-account' | null
const activeModal = ref<ModalType>(null)
const modalFiche = ref<FicheResume | null>(null)
const modalError = ref<string | null>(null)
const isLoading = ref(false)

function openPdfModal(fiche: FicheResume) {
  modalFiche.value = fiche
  modalError.value = null
  activeModal.value = 'pdf'
}
function openDeleteFicheModal(fiche: FicheResume) {
  modalFiche.value = fiche
  modalError.value = null
  activeModal.value = 'delete-fiche'
}
function openDeleteAccountModal() {
  modalError.value = null
  activeModal.value = 'delete-account'
}
function closeModal() {
  activeModal.value = null
  modalFiche.value = null
  modalError.value = null
}

// ── PDF ───────────────────────────────────────────────────────
async function confirmGeneratePdf() {
  if (!modalFiche.value) return
  modalError.value = null
  isLoading.value = true
  try {
    const full = await $fetch<{ data: Record<string, string> }>(`/api/investigateur/${modalFiche.value.id}`)
    const { url } = await $fetch<{ url: string }>('/api/investigateur/generate-pdf', {
      method: 'POST',
      body: full.data
    })
    window.open(url, '_blank')
    closeModal()
  }
  catch (e: unknown) {
    modalError.value = `Erreur : ${e instanceof Error ? e.message : String(e)}`
  }
  finally { isLoading.value = false }
}

// ── SUPPRIMER FICHE ───────────────────────────────────────────
async function confirmDeleteFiche() {
  if (!modalFiche.value) return
  modalError.value = null
  isLoading.value = true
  try {
    await $fetch(`/api/investigateur/${modalFiche.value.id}`, { method: 'DELETE' })
    closeModal()
    await refresh()
  }
  catch (e: unknown) {
    modalError.value = `Erreur : ${e instanceof Error ? e.message : String(e)}`
  }
  finally { isLoading.value = false }
}

// ── CHANGER MOT DE PASSE ──────────────────────────────────────
const passwordEmailSent = ref(false)
const passwordError = ref<string | null>(null)
const isSendingPassword = ref(false)

async function sendPasswordReset() {
  if (!user.value?.email) return
  passwordError.value = null
  isSendingPassword.value = true
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(user.value.email)
    if (error) throw error
    passwordEmailSent.value = true
  }
  catch (e: unknown) {
    passwordError.value = `Erreur : ${e instanceof Error ? e.message : String(e)}`
  }
  finally { isSendingPassword.value = false }
}

// ── SUPPRIMER COMPTE ──────────────────────────────────────────
async function confirmDeleteAccount() {
  modalError.value = null
  isLoading.value = true
  try {
    await $fetch('/api/user', { method: 'DELETE' })
    await supabase.auth.signOut()
    router.push('/')
  }
  catch (e: unknown) {
    modalError.value = `Erreur : ${e instanceof Error ? e.message : String(e)}`
  }
  finally { isLoading.value = false }
}

// ── UTILS ─────────────────────────────────────────────────────
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}
</script>

<template>
  <main class="page-wrapper">

    <div class="page-header">
      <h1 class="page-title">Profil</h1>
      <p class="page-subtitle">{{ user?.email }}</p>
    </div>

    <!-- ── HISTORIQUE ─────────────────────────────────────────── -->
    <section class="history-section">
      <div class="history-header">
        <h2 class="section-title">Historique des fiches</h2>
        <NuxtLink to="/investigateur/creer" class="btn-new">+ Nouvelle fiche</NuxtLink>
      </div>

      <div v-if="status === 'pending'" class="state-message">
        <span class="state-sigil">۞</span>
        <p>Chargement des archives…</p>
      </div>

      <div v-else-if="!fiches?.length" class="state-message">
        <p>Aucune fiche sauvegardée.</p>
        <NuxtLink to="/investigateur/creer" class="btn-new" style="margin-top: 1rem;">Créer un investigateur</NuxtLink>
      </div>

      <div v-else class="fiche-list">
        <div
          v-for="fiche in fiches"
          :key="fiche.id"
          class="fiche-card"
        >
          <div class="fiche-info">
            <span class="fiche-nom">{{ fiche.nom }}</span>
            <span class="fiche-dates">
              Créée le {{ formatDate(fiche.createdAt) }}
              <template v-if="fiche.updatedAt !== fiche.createdAt">
                · Modifiée le {{ formatDate(fiche.updatedAt) }}
              </template>
            </span>
          </div>
          <div class="fiche-actions">
            <NuxtLink :to="`/investigateur/creer?edit=${fiche.id}`" class="btn-action btn-edit">
              Modifier
            </NuxtLink>
            <button class="btn-action btn-pdf" @click="openPdfModal(fiche)">
              Générer PDF
            </button>
            <button class="btn-action btn-delete-fiche" @click="openDeleteFicheModal(fiche)" title="Supprimer">
              ✕
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- ── SÉCURITÉ ───────────────────────────────────────────── -->
    <section class="account-section">
      <div class="account-row">
        <span v-if="passwordEmailSent" class="success-msg">E-mail envoyé !</span>
        <span v-else-if="passwordError" class="error-msg">{{ passwordError }}</span>
        <button
          class="btn-subtle"
          :disabled="isSendingPassword || passwordEmailSent"
          @click="sendPasswordReset"
        >
          <span v-if="isSendingPassword" class="btn-sigil">۞</span>
          <span v-else>Changer le mot de passe</span>
        </button>
        <span class="account-sep">·</span>
        <button class="btn-subtle btn-subtle--danger" @click="openDeleteAccountModal">
          Supprimer mon compte
        </button>
      </div>
    </section>

    <!-- ── MODAL PDF ──────────────────────────────────────────── -->
    <Transition name="modal">
      <div v-if="activeModal === 'pdf'" class="modal-overlay" @click.self="closeModal">
        <div class="modal-box">
          <h3 class="modal-title">Générer la fiche PDF</h3>
          <p class="modal-body">
            Générer la fiche de <strong>{{ modalFiche?.nom }}</strong> ?
          </p>
          <div v-if="modalError" class="modal-error">{{ modalError }}</div>
          <div class="modal-actions">
            <button class="btn-action btn-cancel" :disabled="isLoading" @click="closeModal">Annuler</button>
            <button class="btn-action btn-pdf" :disabled="isLoading" @click="confirmGeneratePdf">
              <span v-if="isLoading" class="btn-sigil">۞</span>
              <span v-else>Confirmer</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- ── MODAL SUPPRIMER FICHE ──────────────────────────────── -->
    <Transition name="modal">
      <div v-if="activeModal === 'delete-fiche'" class="modal-overlay" @click.self="closeModal">
        <div class="modal-box">
          <h3 class="modal-title modal-title--red">Supprimer la fiche</h3>
          <p class="modal-body">
            Supprimer définitivement la fiche de <strong>{{ modalFiche?.nom }}</strong> ?
            Cette action est irréversible.
          </p>
          <div v-if="modalError" class="modal-error">{{ modalError }}</div>
          <div class="modal-actions">
            <button class="btn-action btn-cancel" :disabled="isLoading" @click="closeModal">Annuler</button>
            <button class="btn-action btn-danger" :disabled="isLoading" @click="confirmDeleteFiche">
              <span v-if="isLoading" class="btn-sigil">۞</span>
              <span v-else>Supprimer</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- ── MODAL SUPPRIMER COMPTE ─────────────────────────────── -->
    <Transition name="modal">
      <div v-if="activeModal === 'delete-account'" class="modal-overlay" @click.self="closeModal">
        <div class="modal-box">
          <h3 class="modal-title modal-title--red">Supprimer le compte</h3>
          <p class="modal-body">
            Votre compte et <strong>toutes vos fiches</strong> seront supprimés définitivement.
            Cette action est irréversible.
          </p>
          <div v-if="modalError" class="modal-error">{{ modalError }}</div>
          <div class="modal-actions">
            <button class="btn-action btn-cancel" :disabled="isLoading" @click="closeModal">Annuler</button>
            <button class="btn-action btn-danger" :disabled="isLoading" @click="confirmDeleteAccount">
              <span v-if="isLoading" class="btn-sigil">۞</span>
              <span v-else>Supprimer définitivement</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>

  </main>
</template>

<style scoped>
.page-wrapper {
  padding: var(--space-xl);
  max-width: 860px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: var(--space-xl);
}

/* ── PAGE HEADER ─────────────────────────────────────────── */
.page-header {
  padding-bottom: var(--space-lg);
  border-bottom: 1px solid var(--color-border);
  position: relative;
}
.page-header::after {
  content: '';
  position: absolute;
  bottom: -1px; left: 0;
  width: 80px; height: 1px;
  background: var(--color-arcane);
}
.page-title {
  font-family: var(--font-heading);
  font-size: var(--fs-page-title);
  font-weight: 600;
  letter-spacing: 0.06em;
  color: var(--color-text-primary);
  margin-bottom: var(--space-xs);
}
.page-subtitle {
  font-family: var(--font-flavor);
  font-style: italic;
  color: var(--color-text-secondary);
  font-size: var(--fs-page-subtitle);
}

/* ── SECTIONS ────────────────────────────────────────────── */
.history-section {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-xl);
}
.history-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-lg);
}
.section-title {
  font-family: var(--font-heading);
  font-size: var(--fs-section-title);
  font-weight: bold;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--color-gold);
  margin-bottom: var(--space-lg);
}
.history-header .section-title { margin-bottom: 0; }

/* ── STATE ───────────────────────────────────────────────── */
.state-message {
  text-align: center;
  padding: var(--space-2xl);
  color: var(--color-text-muted);
  font-family: var(--font-flavor);
  display: flex;
  flex-direction: column;
  align-items: center;
}
.state-sigil {
  font-size: var(--fs-sigil);
  color: var(--color-arcane);
  margin-bottom: var(--space-md);
  animation: pulse 2s ease-in-out infinite;
}
@keyframes pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; } }

/* ── FICHE LIST ──────────────────────────────────────────── */
.fiche-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}
.fiche-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-md);
  padding: var(--space-md) var(--space-lg);
  background: var(--color-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  transition: border-color var(--transition-fast);
}
.fiche-card:hover { border-color: var(--color-arcane-dim); }
.fiche-info { display: flex; flex-direction: column; gap: 2px; min-width: 0; flex: 1; }
.fiche-nom {
  font-family: var(--font-heading);
  font-size: var(--fs-row-name);
  font-weight: 600;
  letter-spacing: 0.04em;
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.fiche-dates {
  font-family: var(--font-flavor);
  font-style: italic;
  font-size: var(--fs-secondary);
  color: var(--color-text-muted);
}
.fiche-actions {
  display: flex;
  gap: var(--space-sm);
  flex-shrink: 0;
  align-items: center;
}

/* ── ACCOUNT SECTION ─────────────────────────────────────── */
.account-section {
  border-top: 1px solid var(--color-border);
  padding-top: var(--space-md);
}
.account-row {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  flex-wrap: wrap;
}
.account-sep {
  color: var(--color-text-muted);
  opacity: 0.4;
  font-size: var(--fs-sm);
}
.btn-subtle {
  font-family: var(--font-heading);
  font-size: var(--fs-secondary);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  background: transparent;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  padding: 0;
  transition: color var(--transition-fast);
}
.btn-subtle:hover:not(:disabled) { color: var(--color-text-secondary); }
.btn-subtle:disabled { opacity: 0.4; cursor: not-allowed; }
.btn-subtle--danger:hover:not(:disabled) { color: #c47070; }
.success-msg {
  font-family: var(--font-flavor);
  font-style: italic;
  font-size: var(--fs-secondary);
  color: var(--color-arcane);
}
.error-msg {
  font-family: var(--font-flavor);
  font-style: italic;
  font-size: var(--fs-secondary);
  color: #c47070;
}

/* ── BUTTONS ─────────────────────────────────────────────── */
.btn-new {
  font-family: var(--font-heading);
  font-size: var(--fs-btn);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  padding: var(--space-xs) var(--space-md);
  border-radius: var(--radius-sm);
  background: var(--color-arcane);
  color: var(--color-deep);
  border: none;
  cursor: pointer;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  transition: opacity var(--transition-fast);
}
.btn-new:hover { opacity: 0.85; }

.btn-action {
  font-family: var(--font-heading);
  font-size: var(--fs-btn);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: var(--space-xs) var(--space-md);
  border-radius: var(--radius-sm);
  cursor: pointer;
  border: 1px solid transparent;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
}
.btn-action:disabled { opacity: 0.5; cursor: not-allowed; }

.btn-edit {
  background: transparent;
  border-color: var(--color-border);
  color: var(--color-text-secondary);
}
.btn-edit:hover:not(:disabled) { border-color: var(--color-arcane-dim); color: var(--color-arcane); }

.btn-pdf {
  background: var(--color-arcane);
  color: var(--color-deep);
  border-color: var(--color-arcane);
}
.btn-pdf:hover:not(:disabled) { opacity: 0.85; }

.btn-delete-fiche {
  background: transparent;
  border-color: transparent;
  color: var(--color-text-muted);
  padding: var(--space-xs);
  font-size: 0.75rem;
}
.btn-delete-fiche:hover { color: #c47070; border-color: #8b3a3a44; }

.btn-cancel {
  background: transparent;
  border-color: var(--color-border);
  color: var(--color-text-secondary);
}
.btn-cancel:hover:not(:disabled) { border-color: var(--color-crimson-dim); color: #c47070; }

.btn-danger {
  background: #8b3a3a;
  color: #f0d8d8;
  border-color: #8b3a3a;
}
.btn-danger:hover:not(:disabled) { background: #a04444; border-color: #a04444; }

/* ── MODAL ───────────────────────────────────────────────── */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: var(--space-md);
}
.modal-box {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-xl);
  max-width: 420px;
  width: 100%;
}
.modal-title {
  font-family: var(--font-heading);
  font-size: var(--fs-modal-title);
  font-weight: bold;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--color-gold);
  margin-bottom: var(--space-md);
}
.modal-title--red { color: #c47070; }
.modal-body {
  font-family: var(--font-flavor);
  font-style: italic;
  font-size: var(--fs-modal-body);
  color: var(--color-text-secondary);
  margin-bottom: var(--space-lg);
  line-height: 1.6;
}
.modal-body strong {
  color: var(--color-text-primary);
  font-style: normal;
}
.modal-error {
  color: #c47070;
  font-family: var(--font-flavor);
  font-style: italic;
  font-size: var(--fs-error);
  margin-bottom: var(--space-md);
}
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-sm);
}

.btn-sigil {
  display: inline-block;
  animation: pulse 1s ease-in-out infinite;
}

/* ── MODAL TRANSITION ────────────────────────────────────── */
.modal-enter-active, .modal-leave-active { transition: opacity 0.15s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }

/* ── RESPONSIVE ──────────────────────────────────────────── */
@media (max-width: 600px) {
  .page-wrapper { padding: var(--space-md); }
  .fiche-card { flex-direction: column; align-items: flex-start; }
  .fiche-actions { width: 100%; }
  .btn-action { flex: 1; }
  .history-header { flex-direction: column; align-items: flex-start; gap: var(--space-sm); }
  .account-row { flex-direction: column; align-items: flex-start; }
  .account-sep { display: none; }
}
</style>
