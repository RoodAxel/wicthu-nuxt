import type { GenMethod, PoolEntry } from '~/types/investigateur'
import { caracteristiques } from '~/utils/investigateur/constants'
import { n } from '~/utils/investigateur/format'

/**
 * Génération des 8 caractéristiques : 4 méthodes (classique, distribution libre,
 * achat, création accélérée) + pool de valeurs à assigner.
 */
export function useCharacteristicsGen(form: Record<string, string>) {
  type Method = GenMethod
  const genMethod = ref<Method>('classic')

  function d6() {
    return Math.floor(Math.random() * 6) + 1
  }
  function rollFormula(formula: '3d6' | '2d6+6'): number {
    return formula === '3d6'
      ? (d6() + d6() + d6()) * 5
      : (d6() + d6() + 6) * 5
  }

  function rollOneStat(key: string) {
    const c = caracteristiques.find(c => c.key === key)
    if (c) form[key] = String(rollFormula(c.formula as '3d6' | '2d6+6'))
  }
  function rollAllClassic() {
    for (const c of caracteristiques) form[c.key] = String(rollFormula(c.formula as '3d6' | '2d6+6'))
  }

  // Nombre de stats < 50 (options 1 & 2)
  const lowStatsCount = computed(() =>
    caracteristiques.filter(c => n(form[c.key]) > 0 && n(form[c.key]) < 50).length
  )

  // Option 2 : coup de pouce
  const option2Bonus = ref(0)
  function rollOption2() {
    option2Bonus.value = d6() * 5
  }

  // Pool (options 3 & 5)
  const pool = ref<PoolEntry[]>([])
  const selectedPoolIdx = ref<number | null>(null)
  const isPoolMode = computed(() => genMethod.value === 'free' || genMethod.value === 'quick')

  function clearCaracStats() {
    for (const c of caracteristiques) form[c.key] = ''
  }
  function initFreePool() {
    const vals: number[] = []
    for (let i = 0; i < 5; i++) vals.push(rollFormula('3d6'))
    for (let i = 0; i < 3; i++) vals.push(rollFormula('2d6+6'))
    vals.sort(() => Math.random() - 0.5)
    pool.value = vals.map(v => ({ value: v, assignedTo: null }))
    selectedPoolIdx.value = null
    clearCaracStats()
  }
  function initQuickPool() {
    pool.value = [80, 70, 60, 60, 50, 50, 50, 40].map(v => ({ value: v, assignedTo: null }))
    selectedPoolIdx.value = null
    clearCaracStats()
  }

  function selectPool(idx: number) {
    const entry = pool.value[idx]
    if (!entry) return
    if (entry.assignedTo) {
      // Clic sur une valeur déjà assignée → désassigner
      form[entry.assignedTo] = ''
      entry.assignedTo = null
      return
    }
    selectedPoolIdx.value = selectedPoolIdx.value === idx ? null : idx
  }
  function assignPool(statKey: string) {
    const idx = selectedPoolIdx.value
    if (idx === null) return
    // Désassigner si ce stat avait déjà une valeur pool
    const prev = pool.value.findIndex(p => p.assignedTo === statKey)
    if (prev >= 0) {
      pool.value[prev]!.assignedTo = null
      if (prev === idx) {
        selectedPoolIdx.value = null
        return
      }
    }
    pool.value[idx]!.assignedTo = statKey
    form[statKey] = String(pool.value[idx]!.value)
    selectedPoolIdx.value = null
  }

  // Budget achat (option 4)
  const buyBudget = computed(() =>
    460 - caracteristiques.reduce((sum, c) => sum + n(form[c.key]), 0)
  )

  watch(genMethod, (m) => {
    if (m === 'quick') initQuickPool()
    if (m !== 'free' && m !== 'quick') pool.value = []
    option2Bonus.value = 0
  })

  return {
    genMethod, rollOneStat, rollAllClassic, lowStatsCount, option2Bonus, rollOption2,
    pool, selectedPoolIdx, isPoolMode, selectPool, assignPool, initFreePool, initQuickPool,
    clearCaracStats, buyBudget
  }
}
