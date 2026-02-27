<script setup lang="ts">
import type { Competence } from '@prisma/client'

const { data: competences, status, error } = await useFetch<Competence[]>('/api/competence')
</script>

<template>
  <main class="container">
    <h1>Competences</h1>

    <div v-if="status === 'pending'">Chargement...</div>
    <div v-else-if="error">Erreur : {{ error.message }}</div>

    <ul v-else>
      <li v-for="competence in competences" :key="competence.id">
        <h2>{{ competence.name }}</h2>
        <p>{{ competence.baseValue }}</p>
      </li>
    </ul>
  </main>
</template>
