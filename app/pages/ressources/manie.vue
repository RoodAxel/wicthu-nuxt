<script setup lang="ts">
import type { manie } from '@prisma/client'

const { data: manies, status, error } = useFetch<manie[]>('/api/manie')

const search = ref('')
const random = ref<manie | null>(null)
const sortName = ref<'asc' | 'desc'>('asc')

const sortNameIcon = computed(() => sortName.value === 'asc' ? '↑' : '↓')

function cycleSortName() {
  sortName.value = sortName.value === 'asc' ? 'desc' : 'asc'
}

const filtered = computed(() => {
  if (!manies.value) return []
  const q = normalizeStr(search.value.trim())
  const result = manies.value.filter(m =>
    !q || normalizeStr(m.name).includes(q) || normalizeStr(m.description).includes(q)
  )
  return [...result].sort((a, b) => {
    const cmp = a.name.localeCompare(b.name, 'fr')
    return sortName.value === 'asc' ? cmp : -cmp
  })
})

const stats = computed(() => [
  { number: manies.value?.length ?? 0, label: 'Manies' },
  { number: filtered.value.length, label: 'Résultats' }
])

function pickRandom() {
  if (!manies.value?.length) return
  const pool = manies.value
  random.value = pool[Math.floor(Math.random() * pool.length)]!
}

useSeoMeta({
  title: 'Manies',
  description: 'Liste des manies pour incarner les séquelles mentales de vos investigateurs de L\'Appel de Cthulhu.'
})
</script>

<template>
  <ResourceListLayout
    title="Manies"
    subtitle="Troubles obsessionnels issus du contact avec l'indicible"
    quote="L'esprit humain, confronté à l'impensable, se brise de mille façons — chacune plus étrange et pathétique que la précédente."
    cite="— Dr. Armitage, Miskatonic University, 1921"
    accent="crimson"
    :status="status"
    :error="error"
    :result-count="filtered.length"
    :stats="stats"
    loading-text="Consultation des dossiers psychiatriques…"
    empty-text="Aucune manie ne correspond à votre requête."
  >
    <template #toolbar>
      <div class="search-bar">
        <span class="search-icon">🔍</span>
        <input v-model="search" type="text" class="search-input" placeholder="Rechercher une manie…">
      </div>
      <button class="btn-random" :disabled="!manies?.length" @click="pickRandom">
        <span class="btn-random-icon">⚄</span>
        Manie aléatoire
      </button>
    </template>

    <template #subtoolbar>
      <Transition name="random-reveal">
        <div v-if="random" class="random-result">
          <button class="random-close" aria-label="Fermer" @click="random = null">✕</button>
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
          Manie <span class="sort-icon">{{ sortNameIcon }}</span>
        </button>
        <span class="col-desc">Description</span>
      </div>
      <div class="list-body">
        <div
          v-for="(manie, index) in filtered"
          :key="manie.id"
          class="list-row"
          :class="index % 2 === 0 ? 'row-even' : 'row-odd'"
        >
          <span class="col-id row-id">{{ manie.id }}</span>
          <span class="col-name row-name">{{ manie.name }}</span>
          <span class="col-desc row-desc">{{ manie.description }}</span>
        </div>
      </div>
    </div>
  </ResourceListLayout>
</template>
