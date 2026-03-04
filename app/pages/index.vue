<template>
  <main class="home-wrapper">

    <!-- ── HERO ───────────────────────────────────────────── -->
    <section class="hero">
      <img src="/logoclair.png" alt="Wicthu" class="hero-logo">
      <p class="hero-tagline">Compagnon de l'Investigateur</p>
      <p class="hero-description">
        Un outil de référence pour les joueurs de <em>L'Appel de Cthulhu</em> —
        consultez les règles, gérez vos fiches et explorez les archives occultes
        sans jamais quitter la table de jeu.
      </p>
    </section>

    <!-- ── RESSOURCES ─────────────────────────────────────── -->
    <section class="section">
      <h2 class="section-title">Archives</h2>
      <p class="section-subtitle">Ressources consultables</p>

      <div class="resources-grid">
        <NuxtLink to="/competence" class="resource-card">
          <span class="resource-icon">📜</span>
          <div class="resource-body">
            <span class="resource-name">Compétences</span>
            <span class="resource-desc">Liste complète des savoir-faire, valeurs de base et catégories.</span>
          </div>
          <span class="resource-arrow">→</span>
        </NuxtLink>

        <div class="resource-card resource-soon">
          <span class="resource-icon">🕯️</span>
          <div class="resource-body">
            <span class="resource-name">Sorts</span>
            <span class="resource-desc">Rituels et invocations issus des grimoires interdits.</span>
          </div>
          <span class="resource-badge">Bientôt</span>
        </div>

        <div class="resource-card resource-soon">
          <span class="resource-icon">📖</span>
          <div class="resource-body">
            <span class="resource-name">Ouvrages</span>
            <span class="resource-desc">Volumes maudits, leur contenu et leurs effets sur la Santé Mentale.</span>
          </div>
          <span class="resource-badge">Bientôt</span>
        </div>
      </div>
    </section>

    <!-- ── FICHE INVESTIGATEUR ────────────────────────────── -->
    <section class="section cta-section">
      <div class="cta-card">
        <div class="cta-content">
          <h2 class="cta-title">Fiche d'Investigateur</h2>
          <p class="cta-text">
            Créez et gérez la fiche de votre personnage — caractéristiques,
            compétences, équipement et état mental.
          </p>
        </div>
        <NuxtLink to="/investigateur/creer" class="cta-btn">
          Créer une fiche
        </NuxtLink>
      </div>
    </section>

  </main>
</template>

<style scoped>
.home-wrapper {
  max-width: 860px;
  margin: 0 auto;
  padding: var(--space-2xl) var(--space-xl);
  display: flex;
  flex-direction: column;
  gap: var(--space-2xl);
}

/* ── HERO ────────────────────────────────────────────────── */
.hero {
  text-align: center;
  padding: var(--space-xl) 0;
}

.hero-logo {
  height: 200px;
  width: auto;
  object-fit: contain;
  margin-bottom: var(--space-md);
}

.hero-tagline {
  font-family: var(--font-heading);
  font-size: 0.75rem;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  color: var(--color-arcane);
  margin-bottom: var(--space-xl);
}

.hero-description {
  font-family: var(--font-flavor);
  font-size: 1.1rem;
  font-style: italic;
  color: var(--color-text-secondary);
  line-height: 1.9;
  max-width: 560px;
  margin: 0 auto;
}

.hero-description em {
  font-style: normal;
  color: var(--color-text-primary);
}

/* ── SECTIONS ────────────────────────────────────────────── */
.section-title {
  font-family: var(--font-heading);
  font-size: 0.65rem;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  color: var(--color-arcane);
  margin-bottom: var(--space-xs);
}

.section-subtitle {
  font-family: var(--font-flavor);
  font-style: italic;
  font-size: 1rem;
  color: var(--color-text-muted);
  margin-bottom: var(--space-lg);
}

/* ── RESOURCES ───────────────────────────────────────────── */
.resources-grid {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.resource-card {
  display: flex;
  align-items: center;
  gap: var(--space-lg);
  padding: var(--space-md) var(--space-lg);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  text-decoration: none;
  transition: all var(--transition-fast);
}

.resource-card:not(.resource-soon):hover {
  border-color: var(--color-arcane-dim);
  background: var(--color-elevated);
}

.resource-soon {
  opacity: 0.5;
  cursor: default;
}

.resource-icon {
  font-size: 1.4rem;
  flex-shrink: 0;
  width: 2rem;
  text-align: center;
}

.resource-body {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}

.resource-name {
  font-family: var(--font-heading);
  font-size: 0.85rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  color: var(--color-text-primary);
}

.resource-desc {
  font-family: var(--font-flavor);
  font-style: italic;
  font-size: 0.85rem;
  color: var(--color-text-muted);
}

.resource-arrow {
  font-size: 1rem;
  color: var(--color-arcane-dim);
  transition: transform var(--transition-fast), color var(--transition-fast);
  flex-shrink: 0;
}

.resource-card:not(.resource-soon):hover .resource-arrow {
  color: var(--color-arcane);
  transform: translateX(4px);
}

.resource-badge {
  font-family: var(--font-heading);
  font-size: 0.55rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  color: var(--color-text-muted);
  flex-shrink: 0;
}

/* ── CTA FICHE ───────────────────────────────────────────── */
.cta-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-xl);
  padding: var(--space-xl);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  position: relative;
  overflow: hidden;
}

.cta-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at 0% 50%, rgba(127, 179, 138, 0.05) 0%, transparent 60%);
  pointer-events: none;
}

.cta-title {
  font-family: var(--font-heading);
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  color: var(--color-text-primary);
  margin-bottom: var(--space-xs);
}

.cta-text {
  font-family: var(--font-flavor);
  font-style: italic;
  font-size: 0.9rem;
  color: var(--color-text-secondary);
  line-height: 1.7;
}

.cta-btn {
  font-family: var(--font-heading);
  font-size: 0.65rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  padding: var(--space-sm) var(--space-lg);
  background: var(--color-arcane-dim);
  border: 1px solid var(--color-arcane);
  border-radius: var(--radius-md);
  color: var(--color-arcane);
  text-decoration: none;
  white-space: nowrap;
  flex-shrink: 0;
  transition: all var(--transition-fast);
}

.cta-btn:hover {
  background: var(--color-arcane);
  color: var(--color-void);
}

/* ── RESPONSIVE ──────────────────────────────────────────── */
@media (max-width: 640px) {
  .hero-logo { height: 56px; }
  .cta-card { flex-direction: column; align-items: flex-start; }
}
</style>
