<template>
  <main class="page-wrapper">
    <div class="page-header">
      <h1 class="page-title">Mentions légales</h1>
    </div>

    <div class="content">
      <section class="section">
        <h2 class="section-title">Éditeur du site</h2>
        <p>
          Wicthu est un projet personnel et étudiant, développé à titre non commercial.<br>
          Contact : <a href="mailto:contact@wicthu.com">contact@wicthu.com</a>
        </p>
      </section>

      <section class="section">
        <h2 class="section-title">Hébergement</h2>
        <p>
          Ce site est hébergé par <strong>Vercel Inc.</strong><br>
          440 N Barranca Ave #4133, Covina, CA 91723, États-Unis<br>
          <a href="https://vercel.com" target="_blank" rel="noopener">vercel.com</a>
        </p>
      </section>

      <section class="section">
        <h2 class="section-title">Base de données</h2>
        <p>
          Les données sont stockées via <strong>Supabase</strong>, service opéré par
          Supabase Inc., hébergé en Europe (région AWS eu-west-3).<br>
          <a href="https://supabase.com" target="_blank" rel="noopener">supabase.com</a>
        </p>
      </section>

      <section class="section">
        <h2 class="section-title">Propriété intellectuelle</h2>
        <p>
          Wicthu est un projet indépendant, non officiel et non affilié à Chaosium, Inc.
          L'Appel de Cthulhu est une marque déposée de Chaosium, Inc. Toute référence à cet
          univers est faite dans un cadre non commercial et à titre de fan project.
        </p>
      </section>
    </div>
  </main>
</template>

<style scoped>
.page-wrapper {
  padding: var(--space-xl);
  max-width: 800px;
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
  bottom: -1px;
  left: 0;
  width: 80px;
  height: 1px;
  background: var(--color-arcane);
}

.page-title {
  font-family: var(--font-heading);
  font-size: var(--fs-page-title);
  font-weight: 600;
  letter-spacing: 0.06em;
  color: var(--color-text-primary);
}

.content {
  display: flex;
  flex-direction: column;
  gap: var(--space-xl);
}

.section {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.section-title {
  font-family: var(--font-heading);
  font-size: 0.85rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-text-primary);
}

.section p {
  font-family: var(--font-body);
  font-size: 1rem;
  color: var(--color-text-secondary);
  line-height: 1.8;
}

.section a {
  color: var(--color-arcane);
  text-decoration: none;
}
.section a:hover {
  text-decoration: underline;
}
</style>
