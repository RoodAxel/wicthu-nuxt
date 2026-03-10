<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const user = useSupabaseUser()

interface FicheResume {
  id: number
  nom: string
  createdAt: string
  updatedAt: string
}

const { data: fiches, status, refresh } = useFetch<FicheResume[]>('/api/investigateur', {
  server: false
})

// Modal de confirmation PDF
const modalFiche = ref<FicheResume | null>(null)
const isGenerating = ref(false)
const pdfError = ref<string | null>(null)

function openPdfModal(fiche: FicheResume) {
  modalFiche.value = fiche
  pdfError.value = null
}
function closeModal() {
  modalFiche.value = null
}

async function confirmGeneratePdf() {
  if (!modalFiche.value) return
  pdfError.value = null
  isGenerating.value = true
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
    pdfError.value = `Erreur : ${e instanceof Error ? e.message : String(e)}`
  }
  finally { isGenerating.value = false }
}

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

    <section class="history-section">
      <div class="history-header">
        <h2 class="section-title">Historique des fiches</h2>
        <NuxtLink to="/investigateur/creer" class="btn-new">+ Nouvelle fiche</NuxtLink>
      </div>

      <div v-if="status === 'pending'" class="state-message">
        <span class="state-sigil">⬡</span>
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
            <NuxtLink
              :to="`/investigateur/creer?edit=${fiche.id}`"
              class="btn-action btn-edit"
            >
              Modifier
            </NuxtLink>
            <button class="btn-action btn-pdf" @click="openPdfModal(fiche)">
              Générer PDF
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- ── MODAL PDF ────────────────────────────────────────── -->
    <Transition name="modal">
      <div v-if="modalFiche" class="modal-overlay" @click.self="closeModal">
        <div class="modal-box">
          <h3 class="modal-title">Générer la fiche PDF</h3>
          <p class="modal-body">
            Générer la fiche de <strong>{{ modalFiche.nom }}</strong> ?
          </p>
          <div v-if="pdfError" class="modal-error">{{ pdfError }}</div>
          <div class="modal-actions">
            <button class="btn-action btn-cancel" :disabled="isGenerating" @click="closeModal">
              Annuler
            </button>
            <button class="btn-action btn-pdf" :disabled="isGenerating" @click="confirmGeneratePdf">
              <span v-if="isGenerating" class="btn-sigil">⬡</span>
              <span v-else>Confirmer</span>
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
}

/* ── PAGE HEADER ─────────────────────────────────────────── */
.page-header {
  margin-bottom: var(--space-xl);
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

/* ── HISTORY ─────────────────────────────────────────────── */
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
}

/* ── STATE ───────────────────────────────────────────────── */
.state-message {
  text-align: center;
  padding: var(--space-2xl);
  color: var(--color-text-muted);
  font-family: var(--font-flavor);
  font-style: italic;
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
.fiche-info { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
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
.btn-edit:hover { border-color: var(--color-arcane-dim); color: var(--color-arcane); }

.btn-pdf {
  background: var(--color-arcane);
  color: var(--color-deep);
  border-color: var(--color-arcane);
}
.btn-pdf:hover:not(:disabled) { opacity: 0.85; }

.btn-cancel {
  background: transparent;
  border-color: var(--color-border);
  color: var(--color-text-secondary);
}
.btn-cancel:hover:not(:disabled) { border-color: var(--color-crimson-dim); color: #c47070; }

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
}
</style>
