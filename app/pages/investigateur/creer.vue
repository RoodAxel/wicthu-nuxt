<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

// Contexte de création : instancie tous les composables métier autour du même
// `form` réactif et le fournit aux sous-composants de section (provide/inject).
const ctx = useCharacterCreation()
provide(CharacterCreationKey, ctx)

// Seules ces valeurs servent encore au chrome de page (titre + barre d'actions) ;
// tout le reste est consommé par les sous-composants de section via le contexte injecté.
const { editId, isLoading, isSaving, error, savedSuccess, saveCharacter, generatePdf } = ctx

// ── Détection sticky de la barre d'actions ───────────────────────────────────
const bottomSentinel = ref<HTMLElement | null>(null)
const isStuck = ref(true)
onMounted(() => {
  const observer = new IntersectionObserver(([entry]) => {
    if (entry) isStuck.value = !entry.isIntersecting
  })
  if (bottomSentinel.value) observer.observe(bottomSentinel.value)
  onUnmounted(() => observer.disconnect())
})
useSeoMeta({
  title: () => editId.value ? 'Modifier la fiche' : 'Nouvelle fiche'
})
</script>

<template>
  <main class="page-wrapper">

    <div class="page-header">
      <h1 class="page-title">{{ editId ? 'Modifier la fiche' : 'Nouvelle Fiche' }}</h1>
      <p class="page-subtitle">Création d'un investigateur — Appel de Cthulhu 7e édition</p>
    </div>

    <blockquote class="flavor-quote">
      <p>Nul homme sensé ne se lancerait dans cette enquête — mais la folie a ses propres vertus.</p>
      <cite>— Journal retrouvé à Arkham, sans date</cite>
    </blockquote>

    <form class="character-form">

      <!-- ── IDENTITÉ ─────────────────────────────────────── -->
      <InvestigateurIdentitySection />

      <!-- ── MODIFICATEURS D'ÂGE ──────────────────────────── -->
      <InvestigateurAgeModifiersSection />

      <!-- ── CARACTÉRISTIQUES ───────────────────────────────── -->
      <InvestigateurCharacteristicsSection />

      <!-- ── STATS DÉRIVÉES ──────────────────────────────────── -->
      <InvestigateurDerivedStatsSection />

      <!-- ── CHANCE ────────────────────────────────────────────── -->
      <InvestigateurChanceSection />

      <!-- ── COMPÉTENCES ─────────────────────────────────────── -->
      <InvestigateurSkillsSection />

      <!-- ── COMPÉTENCES VARIABLES ───────────────────────────── -->
      <InvestigateurVariableSkillsSection />

      <!-- ── ARMES ─────────────────────────────────────────────── -->
      <InvestigateurWeaponsSection />

      <!-- ── BACKGROUND ──────────────────────────────────────── -->
      <InvestigateurBackgroundSection />

      <!-- ── FINANCES ────────────────────────────────────────── -->
      <InvestigateurFinancesSection />

      <!-- ── ÉQUIPEMENT ───────────────────────────────────────── -->
      <InvestigateurEquipmentSection />

      <!-- ── ERROR & SUBMIT ─────────────────────────────────── -->
      <div v-if="error" class="form-error">{{ error }}</div>

      <div v-if="savedSuccess" class="form-success">Fiche sauvegardée avec succès.</div>

      <p class="pdf-credit">
        La fiche PDF est basée sur la
        <a href="https://www.orbe.be/aide-de-jeux/l-appel-de-cthulhu-v7-fiche-dynamique" target="_blank" rel="noopener noreferrer">fiche dynamique d'Orbe.be</a>.
      </p>

      <div ref="bottomSentinel" class="bottom-sentinel" />
      <div class="form-actions" :class="{ 'is-stuck': isStuck }">
        <button
          type="button"
          class="btn-save"
          :disabled="isSaving || isLoading"
          @click="saveCharacter"
        >
          <span v-if="isSaving" class="btn-sigil">۞</span>
          <span v-else>Sauvegarder</span>
        </button>
        <button
          type="button"
          class="btn-generate"
          :disabled="isLoading || isSaving"
          @click="generatePdf"
        >
          <span v-if="isLoading" class="btn-sigil">۞</span>
          <span v-else>Générer la fiche PDF</span>
        </button>
      </div>

    </form>

  </main>
</template>

<style scoped>
.page-wrapper {
  padding: var(--space-xl);
  max-width: 960px;
  margin: 0 auto;
}

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

.flavor-quote {
  background: var(--color-void);
  border-left: 2px solid var(--color-arcane-dim);
  padding: var(--space-lg);
  margin-bottom: var(--space-xl);
  border-radius: 0 var(--radius-md) var(--radius-md) 0;
}
.flavor-quote p {
  font-family: var(--font-flavor);
  font-style: italic;
  font-size: var(--fs-flavor-quote);
  color: var(--color-text-secondary);
  line-height: 1.8;
}
.flavor-quote cite {
  display: block;
  margin-top: var(--space-sm);
  font-family: var(--font-heading);
  font-size: var(--fs-section-title);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-text-muted);
}

/* Conteneur du formulaire (le style « contenu » vit dans investigateur-form.css,
   namespacé sous .character-form, car les sections sont des sous-composants). */
.character-form { display: flex; flex-direction: column; gap: var(--space-xl); }

/* ── PDF CREDIT ──────────────────────────────────────────── */
.pdf-credit {
  text-align: center;
  font-family: var(--font-flavor);
  font-style: italic;
  font-size: var(--fs-secondary);
  color: var(--color-text-muted);
  margin-bottom: var(--space-md);
}
.pdf-credit a {
  color: var(--color-gold);
  text-decoration: underline;
  text-underline-offset: 2px;
}
.pdf-credit a:hover {
  color: var(--color-gold-light, #d4a96a);
}

/* ── ERROR / SUCCESS ─────────────────────────────────────── */
.form-error {
  background: rgba(139, 58, 58, 0.12);
  border: 1px solid var(--color-crimson-dim);
  border-radius: var(--radius-md);
  padding: var(--space-md) var(--space-lg);
  color: var(--color-crimson-light);
  font-family: var(--font-flavor);
  font-style: italic;
}
.form-success {
  background: rgba(127, 179, 138, 0.1);
  border: 1px solid var(--color-arcane-dim);
  border-radius: var(--radius-md);
  padding: var(--space-md) var(--space-lg);
  color: var(--color-arcane);
  font-family: var(--font-flavor);
  font-style: italic;
}

/* ── SUBMIT ──────────────────────────────────────────────── */
.form-actions {
  display: flex; justify-content: center; gap: var(--space-md); flex-wrap: wrap;
  position: sticky; bottom: 0; z-index: 10;
  padding: var(--space-md) var(--space-xl);
}
.btn-save {
  font-family: var(--font-heading);
  font-size: var(--fs-btn); font-weight: bold;
  letter-spacing: 0.18em; text-transform: uppercase;
  color: var(--color-arcane);
  background: transparent;
  border: 1px solid var(--color-arcane-dim);
  border-radius: var(--radius-md);
  padding: var(--space-md) var(--space-2xl);
  cursor: pointer; min-width: 200px;
  opacity: 0.45;
  transform: scale(0.88);
  transition: all var(--transition-fast);
}
.form-actions:not(.is-stuck) .btn-save { opacity: 1; transform: scale(1); }
.btn-save:hover:not(:disabled) { background: var(--color-arcane-glow); opacity: 1; transform: scale(1); }
.btn-save:disabled { opacity: 0.2; cursor: not-allowed; transform: scale(0.88); }
.btn-generate {
  font-family: var(--font-heading);
  font-size: var(--fs-btn); font-weight: bold;
  letter-spacing: 0.18em; text-transform: uppercase;
  color: var(--color-deep);
  background: var(--color-arcane);
  border: none; border-radius: var(--radius-md);
  padding: var(--space-md) var(--space-2xl);
  cursor: pointer; min-width: 220px;
  opacity: 0.45;
  transform: scale(0.88);
  transition: opacity var(--transition-fast), box-shadow var(--transition-fast), transform var(--transition-fast);
}
.form-actions:not(.is-stuck) .btn-generate { opacity: 1; transform: scale(1); }
.btn-generate:hover:not(:disabled) { opacity: 1; transform: scale(1); box-shadow: var(--shadow-glow); }
.btn-generate:disabled { opacity: 0.2; cursor: not-allowed; transform: scale(0.88); }
.bottom-sentinel { height: 1px; }
.btn-sigil { display: inline-block; animation: pulse-sigil 1s ease-in-out infinite; font-size: var(--fs-xl); }
@keyframes pulse-sigil { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; } }

/* ── RESPONSIVE (chrome de page) ─────────────────────────── */
@media (max-width: 700px) {
  .page-wrapper { padding: var(--space-md); }
}
@media (max-width: 480px) {
  .page-wrapper { padding: var(--space-sm); }
}
</style>
