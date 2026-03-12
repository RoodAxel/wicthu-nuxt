<template>
  <footer class="app-footer">
    <div class="footer-content">
      <p class="footer-disclaimer">
        Wicthu est un projet indépendant et n'est pas un produit officiel de Chaosium, Inc.
        L'Appel de Cthulhu est une marque déposée de Chaosium, Inc.
      </p>
      <div class="footer-links">
        <a href="mailto:contact@wicthu.com" class="footer-link">contact@wicthu.com</a>
        <span class="footer-separator">·</span>
        <NuxtLink to="/politique-de-confidentialite" class="footer-link">Politique de confidentialité</NuxtLink>
        <span class="footer-separator">·</span>
        <NuxtLink to="/mentions-legales" class="footer-link">Mentions légales</NuxtLink>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.app-footer {
  border-top: 1px solid var(--color-border);
  background: var(--color-deep);
  padding: var(--space-lg) var(--space-xl);
}

.footer-content {
  max-width: 960px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-sm);
  text-align: center;
}

.footer-disclaimer {
  font-family: var(--font-body);
  font-size: 0.75rem;
  color: var(--color-text-muted);
  line-height: 1.5;
  margin: 0;
}

.footer-links {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  font-family: var(--font-body);
  font-size: 0.75rem;
}

.footer-link {
  color: var(--color-text-secondary);
  text-decoration: none;
  transition: color var(--transition-fast);
}

.footer-link:hover {
  color: var(--color-arcane);
}

.footer-separator {
  color: var(--color-border);
}
</style>
