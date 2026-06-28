<script setup lang="ts">
useSeoMeta({
  description: 'Wicthu, le compagnon de jeu de L\'Appel de Cthulhu : créez vos fiches d\'investigateur et explorez les sorts, entités, ouvrages du Mythe et toutes les ressources de jeu.',
  ogTitle: 'Wicthu — Wiki L\'Appel de Cthulhu'
})
</script>

<template>
  <main class="home-wrapper">

    <!-- ── HERO ───────────────────────────────────────────── -->
    <section class="hero">
      <img src="/logoWicthu.png" alt="Wicthu" class="hero-logo">
      <h1 class="hero-title">
        Wicthu
        <span class="hero-title-sub">Wiki l'Appel de Cthulhu</span>
      </h1>
      <p class="hero-description">
        Un outil pour les Guardiens et joueurs de <em>L'Appel de Cthulhu</em> —
        consultez les archives et gérer vos fiches d'investigateurs.
      </p>
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

    <!-- ── RESSOURCES ─────────────────────────────────────── -->
    <section class="section">
      <h2 class="section-title">Archives</h2>
      <p class="section-subtitle">Ressources consultables</p>

      <div class="resources-grid">
        <NuxtLink to="/ressources/arme" class="resource-card">
          <div class="resource-body">
            <span class="resource-name">Arme</span>
            <span class="resource-desc">Arsenal complet — dégâts, portées, cadences et compétences associées.</span>
          </div>
          <span class="resource-arrow">→</span>
        </NuxtLink>

        <NuxtLink to="/ressources/artefact" class="resource-card">
          <div class="resource-body">
            <span class="resource-name">Artefact</span>
            <span class="resource-desc">Objets d'origine inconnu aux propriétés surnaturelles.</span>
          </div>
          <span class="resource-arrow">→</span>
        </NuxtLink>

        <NuxtLink to="/ressources/competence" class="resource-card">
          <div class="resource-body">
            <span class="resource-name">Compétence</span>
            <span class="resource-desc">Liste complète des savoir-faire, valeurs de base et catégories.</span>
          </div>
          <span class="resource-arrow">→</span>
        </NuxtLink>

        <NuxtLink to="/ressources/entite" class="resource-card">
          <div class="resource-body">
            <span class="resource-name">Entité</span>
            <span class="resource-desc">Créatures et divinités du Mythe de Cthulhu.</span>
          </div>
          <span class="resource-arrow">→</span>
        </NuxtLink>

        <NuxtLink to="/ressources/equipement-classique" class="resource-card">
          <div class="resource-body">
            <span class="resource-name">Équipement Classique</span>
            <span class="resource-desc">Matériel des années 1920 — prix et catégories.</span>
          </div>
          <span class="resource-arrow">→</span>
        </NuxtLink>

        <NuxtLink to="/ressources/equipement-moderne" class="resource-card">
          <div class="resource-body">
            <span class="resource-name">Équipement Moderne</span>
            <span class="resource-desc">Matériel contemporain — prix et catégories.</span>
          </div>
          <span class="resource-arrow">→</span>
        </NuxtLink>

        <NuxtLink to="/ressources/manie" class="resource-card">
          <div class="resource-body">
            <span class="resource-name">Manie</span>
            <span class="resource-desc">Troubles obsessionnels issus du contact avec l'indicible.</span>
          </div>
          <span class="resource-arrow">→</span>
        </NuxtLink>

        <NuxtLink to="/ressources/phobie" class="resource-card">
          <div class="resource-body">
            <span class="resource-name">Phobie</span>
            <span class="resource-desc">Terreurs irrationnelles ancrées dans la psyché des survivants.</span>
          </div>
          <span class="resource-arrow">→</span>
        </NuxtLink>

        <NuxtLink to="/ressources/occupation" class="resource-card">
          <div class="resource-body">
            <span class="resource-name">Occupation</span>
            <span class="resource-desc">Métiers des investigateurs — compétences associées et formules de points.</span>
          </div>
          <span class="resource-arrow">→</span>
        </NuxtLink>

        <NuxtLink to="/ressources/ouvrage-mythe" class="resource-card">
          <div class="resource-body">
            <span class="resource-name">Ouvrage du Mythe</span>
            <span class="resource-desc">Tomes sacrés et maudits — gains de Mythe et sorts contenus.</span>
          </div>
          <span class="resource-arrow">→</span>
        </NuxtLink>

        <NuxtLink to="/ressources/ouvrage-occulte" class="resource-card">
          <div class="resource-body">
            <span class="resource-name">Ouvrage Occulte</span>
            <span class="resource-desc">Volumes maudits — description et informations.</span>
          </div>
          <span class="resource-arrow">→</span>
        </NuxtLink>

        <NuxtLink to="/ressources/sort" class="resource-card">
          <div class="resource-body">
            <span class="resource-name">Sort</span>
            <span class="resource-desc">Rituels et formules ésotériques — coûts, temps d'incantation et variantes.</span>
          </div>
          <span class="resource-arrow">→</span>
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

.hero-title {
  font-family: var(--font-display);
  font-size: clamp(2.5rem, 8vw, 4rem);
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: 0.04em;
  color: var(--color-text-primary);
  margin-bottom: var(--space-md);
}

.hero-title-sub {
  display: block;
  margin-top: var(--space-sm);
  font-family: var(--font-heading);
  font-size: clamp(1rem, 3vw, 1.4rem);
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--color-arcane);
}

.hero-tagline {
  font-family: var(--font-heading);
  font-size: var(--fs-btn);
  letter-spacing: 0.25em;
  text-transform: uppercase;
  color: var(--color-arcane);
  margin-bottom: var(--space-xl);
}

.hero-description {
  font-family: var(--font-flavor);
  font-size: var(--fs-hero-desc);
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
  font-size: var(--fs-section-title);
  letter-spacing: 0.25em;
  text-transform: uppercase;
  color: var(--color-arcane);
  margin-bottom: var(--space-xs);
}

.section-subtitle {
  font-family: var(--font-flavor);
  font-style: italic;
  font-size: var(--fs-page-subtitle);
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
  font-size: var(--fs-2xl);
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
  font-size: var(--fs-row-name);
  font-weight: 600;
  letter-spacing: 0.06em;
  color: var(--color-text-primary);
}

.resource-desc {
  font-family: var(--font-flavor);
  font-style: italic;
  font-size: var(--fs-secondary);
  color: var(--color-text-muted);
}

.resource-arrow {
  font-size: var(--fs-base);
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
  font-size: var(--fs-micro);
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
  font-size: var(--fs-modal-title);
  font-weight: 600;
  letter-spacing: 0.06em;
  color: var(--color-text-primary);
  margin-bottom: var(--space-xs);
}

.cta-text {
  font-family: var(--font-flavor);
  font-style: italic;
  font-size: var(--fs-cta-text);
  color: var(--color-text-secondary);
  line-height: 1.7;
}

.cta-btn {
  font-family: var(--font-heading);
  font-size: var(--fs-btn);
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
  .home-wrapper { padding: var(--space-md); gap: var(--space-xl); }
  .hero { padding: var(--space-md) 0; }
  .hero-logo { height: 120px; }
  .hero-description { font-size: var(--fs-hero-desc); }
  .cta-card {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-md);
    padding: var(--space-lg);
  }
  .cta-btn { width: 100%; text-align: center; box-sizing: border-box; }
  .resource-card { gap: var(--space-md); padding: var(--space-sm) var(--space-md); }
  .resource-desc { display: none; }
}
</style>
