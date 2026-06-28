<script setup>
useHead({
  // Chaque page définit un titre court ; on suffixe la marque. Sans titre → libellé de marque.
  titleTemplate: title => (title ? `${title} · Wicthu` : 'Wicthu — Wiki L\'Appel de Cthulhu'),
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
  ],
  link: [
    { rel: 'icon', href: '/logoWicthu.png' }
  ],
  htmlAttrs: {
    lang: 'fr'
  }
})

// Description par défaut (surchargée par page) ; le titre par défaut est géré par titleTemplate.
useSeoMeta({
  description: 'Compagnon de jeu pour L\'Appel de Cthulhu : créateur de fiches d\'investigateur, sorts, entités du Mythe, ouvrages occultes et ressources de jeu.'
})

// Image Open Graph par défaut pour tout le site (surchargeable par page).
// Récupère automatiquement le titre/description du useSeoMeta de chaque page.
defineOgImageComponent('Default')
</script>

<template>
  <UApp class="app-layout">
    <AppHeader />

    <UMain class="app-main">
      <NuxtPage />
    </UMain>

    <AppFooter />
  </UApp>
</template>

<style>
.app-main {
  flex: 1;
}
</style>
