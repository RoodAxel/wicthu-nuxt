<script setup lang="ts">
defineProps<{
  id: number
  titre: string
  auteur: string | null
  langue: string | null
  date: string | null
  sante_mental: string | null
  gain_mythe_initial: number | null
  gain_mythe_complet: number | null
  mythe_cthulhu: number | null
  semaine: number | null
  sortCount: number
}>()

const router = useRouter()
function openDetail(id: number) {
  router.push(`/ressources/ouvrage-mythe/${id}`)
}
</script>

<template>
  <div class="ouvrage-row" @click="openDetail(id)">
    <span class="col-titre">{{ titre }}</span>
    <span class="col-auteur row-muted">{{ auteur ?? '—' }}</span>
    <span class="col-langue row-muted">{{ langue ?? '—' }}</span>
    <span class="col-date row-muted">{{ date ?? '—' }}</span>
    <span class="col-sm row-sanity">{{ sante_mental ?? '—' }}</span>
    <span class="col-gain row-gain">
      <span v-if="gain_mythe_initial != null">{{ gain_mythe_initial }}/{{ gain_mythe_complet }}</span>
      <span v-else>—</span>
    </span>
    <span class="col-mythe row-mythe">{{ mythe_cthulhu != null ? `${mythe_cthulhu}%` : '—' }}</span>
    <span class="col-sorts row-sorts">{{ sortCount }} sort{{ sortCount !== 1 ? 's' : '' }}</span>
  </div>
</template>

<style scoped>
.ouvrage-row {
  display: grid;
  grid-template-columns: 1fr 160px 90px 100px 80px 80px 75px 70px;
  align-items: center;
  padding: var(--space-sm) var(--space-lg);
  gap: var(--space-md);
  cursor: pointer;
  transition: background var(--transition-fast);
  border-bottom: 1px solid transparent;
}
.ouvrage-row:nth-child(odd)  { background: var(--color-surface); }
.ouvrage-row:nth-child(even) { background: var(--color-deep); }
.ouvrage-row:hover { background: var(--color-elevated); }

.col-titre {
  font-family: var(--font-heading);
  font-size: var(--fs-md);
  font-weight: 600;
  letter-spacing: 0.03em;
  color: var(--color-gold);
}

.row-muted {
  font-family: var(--font-flavor);
  font-style: italic;
  font-size: var(--fs-base);
  color: var(--color-text-muted);
}

.row-sanity {
  font-family: var(--font-heading);
  font-size: var(--fs-sm);
  color: var(--color-crimson);
}

.row-gain {
  font-family: var(--font-heading);
  font-size: var(--fs-sm);
  font-weight: 600;
  color: var(--color-arcane);
}

.row-mythe {
  font-family: var(--font-heading);
  font-size: var(--fs-sm);
  color: var(--color-gold);
}

.row-sorts {
  font-family: var(--font-heading);
  font-size: var(--fs-xs);
  letter-spacing: 0.08em;
  color: var(--color-text-muted);
}
</style>
