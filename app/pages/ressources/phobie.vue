<script setup lang="ts">
import type { phobie } from '@prisma/client'

const { data: phobies, status, error } = useFetch<phobie[]>('/api/phobie')

const search = ref('')
const random = ref<phobie | null>(null)
const sortName = ref<'asc' | 'desc'>('asc')

const sortNameIcon = computed(() => sortName.value === 'asc' ? '↑' : '↓')

function cycleSortName() {
  sortName.value = sortName.value === 'asc' ? 'desc' : 'asc'
}

const filtered = computed(() => {
  if (!phobies.value) return []
  const q = normalizeStr(search.value.trim())
  const result = phobies.value.filter(p =>
    !q || normalizeStr(p.name).includes(q) || normalizeStr(p.description).includes(q)
  )
  return [...result].sort((a, b) => {
    const cmp = a.name.localeCompare(b.name, 'fr')
    return sortName.value === 'asc' ? cmp : -cmp
  })
})

const stats = computed(() => [
  { number: phobies.value?.length ?? 0, label: 'Phobies' },
  { number: filtered.value.length, label: 'Résultats' }
])

function pickRandom() {
  if (!phobies.value?.length) return
  const pool = phobies.value
  random.value = pool[Math.floor(Math.random() * pool.length)]!
}
</script>

<template>
  <ResourceListLayout
    title="Phobies"
    subtitle="Terreurs irrationnelles ancrées dans la psyché des survivants"
    quote="La peur est la plus ancienne et la plus puissante des émotions humaines — et la peur la plus ancienne est celle de l'inconnu."
    cite="— H.P. Lovecraft, L'Horreur Surnaturelle en Littérature"
    accent="gold"
    :status="status"
    :error="error"
    :result-count="filtered.length"
    :stats="stats"
    loading-text="Consultation des dossiers psychiatriques…"
    empty-text="Aucune phobie ne correspond à votre requête."
  >
    <template #toolbar>
      <div class="search-bar">
        <span class="search-icon">🔍</span>
        <input v-model="search" type="text" class="search-input" placeholder="Rechercher une phobie…">
      </div>
      <button class="btn-random" :disabled="!phobies?.length" @click="pickRandom">
        <span class="btn-random-icon">⚄</span>
        Phobie aléatoire
      </button>
    </template>

    <template #subtoolbar>
      <Transition name="random-reveal">
        <div v-if="random" class="random-result">
          <div class="random-header">
            <span class="random-label">Tirage</span>
            <button class="random-close" aria-label="Fermer" @click="random = null">✕</button>
          </div>
          <p class="random-name">{{ random.name }}</p>
          <p class="random-number">Numéro {{ random.id }}</p>
          <p class="random-desc">{{ random.description }}</p>
        </div>
      </Transition>
    </template>

    <div class="list-container stack-mobile" style="--list-cols: 44px 220px 1fr">
      <div class="list-header-row">
        <span class="col-id">N°</span>
        <button class="col-sortable sort-active" @click="cycleSortName">
          Phobie <span class="sort-icon">{{ sortNameIcon }}</span>
        </button>
        <span class="col-desc">Description</span>
      </div>
      <div class="list-body">
        <div
          v-for="(phobie, index) in filtered"
          :key="phobie.id"
          class="list-row"
          :class="index % 2 === 0 ? 'row-even' : 'row-odd'"
        >
          <span class="col-id row-id">{{ phobie.id }}</span>
          <span class="col-name row-name">{{ phobie.name }}</span>
          <span class="col-desc row-desc">{{ phobie.description }}</span>
        </div>
      </div>
    </div>
  </ResourceListLayout>
</template>
