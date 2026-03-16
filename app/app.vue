<script setup>
useHead({
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

useSeoMeta({
  title: 'Wicthu — Wiki L\'Appel de Cthulhu',
  description: 'Compagnon de jeu pour L\'Appel de Cthulhu.'
})
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
