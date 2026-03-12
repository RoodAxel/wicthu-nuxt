<template>
  <main class="page-wrapper">
    <div class="page-header">
      <h1 class="page-title">Politique de confidentialité</h1>
      <p class="page-subtitle">Dernière mise à jour : mars 2026</p>
    </div>

    <div class="content">
      <section class="section">
        <h2 class="section-title">1. Données collectées</h2>
        <p>
          Wicthu collecte uniquement votre adresse e-mail, utilisée exclusivement pour
          l'authentification à votre compte. Aucune autre donnée personnelle n'est collectée
          par l'application.
        </p>
      </section>

      <section class="section">
        <h2 class="section-title">2. Finalité du traitement</h2>
        <p>
          Votre adresse e-mail est utilisée uniquement pour vous permettre de vous connecter
          à votre compte et de recevoir d'éventuelles communications liées à votre compte
          (réinitialisation de mot de passe).
        </p>
      </section>

      <section class="section">
        <h2 class="section-title">3. Conservation des données</h2>
        <p>
          Vos données sont conservées tant que votre compte est actif. En cas de suppression
          de votre compte — possible à tout moment depuis votre profil — toutes vos données
          personnelles sont supprimées définitivement.
        </p>
      </section>

      <section class="section">
        <h2 class="section-title">4. Hébergement et sous-traitants</h2>
        <p>L'application est hébergée et opérée par les services suivants :</p>
        <ul>
          <li>
            <strong>Vercel</strong> (hébergement de l'application) — peut collecter des données
            techniques à des fins de performance et de monitoring (adresses IP, user-agent).
            <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener">
              Politique de confidentialité de Vercel
            </a>
          </li>
          <li>
            <strong>Supabase</strong> (base de données et authentification) — stocke votre
            adresse e-mail de manière sécurisée.
            <a href="https://supabase.com/privacy" target="_blank" rel="noopener">
              Politique de confidentialité de Supabase
            </a>
          </li>
        </ul>
      </section>

      <section class="section">
        <h2 class="section-title">5. Cookies</h2>
        <p>
          Wicthu n'utilise pas de cookies de suivi ou publicitaires. La session utilisateur
          est gérée via le stockage local du navigateur (<em>localStorage</em>). Vercel peut
          utiliser des cookies techniques à des fins de performance.
        </p>
      </section>

      <section class="section">
        <h2 class="section-title">6. Vos droits</h2>
        <p>
          Conformément au RGPD, vous disposez d'un droit d'accès, de rectification et de
          suppression de vos données. Vous pouvez supprimer votre compte et l'ensemble de vos
          données depuis la page <NuxtLink to="/profil">Mon profil</NuxtLink>. Pour toute
          demande, contactez-nous à l'adresse
          <a href="mailto:contact@wicthu.com">contact@wicthu.com</a>.
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
  margin-bottom: var(--space-xs);
}

.page-subtitle {
  font-family: var(--font-flavor);
  font-style: italic;
  color: var(--color-text-secondary);
  font-size: 0.875rem;
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

.section p,
.section li {
  font-family: var(--font-body);
  font-size: 1rem;
  color: var(--color-text-secondary);
  line-height: 1.8;
}

.section ul {
  padding-left: var(--space-lg);
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.section a {
  color: var(--color-arcane);
  text-decoration: none;
}
.section a:hover {
  text-decoration: underline;
}
</style>
