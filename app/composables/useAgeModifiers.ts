import type { AgeCat, EduTestResult } from '~/types/investigateur'
import { n } from '~/utils/investigateur/format'

/**
 * Modificateurs liés à l'âge : catégorie d'âge (malus phys/APP/ÉDU, tests
 * d'expérience), jets de tests d'ÉDU, et tirage de la Chance (×2 pour la jeunesse).
 */
export function useAgeModifiers(form: Record<string, string>) {
  const ageCategory = computed((): AgeCat | null => {
    const age = Number(form['age']) || 0
    if (age < 15 || age > 89) return null
    if (age <= 19) return { label: 'Jeunesse', range: '15–19', eduTests: 0, eduYouthMalus: true, physMalus: 5, physStats: ['FOR', 'TAI'], appMalus: 0 }
    if (age <= 39) return { label: 'Adulte', range: '20–39', eduTests: 1, eduYouthMalus: false, physMalus: 0, physStats: [], appMalus: 0 }
    if (age <= 49) return { label: 'Maturité', range: '40–49', eduTests: 2, eduYouthMalus: false, physMalus: 5, physStats: ['FOR', 'CON', 'DEX'], appMalus: 5 }
    if (age <= 59) return { label: 'Âge mûr', range: '50–59', eduTests: 3, eduYouthMalus: false, physMalus: 10, physStats: ['FOR', 'CON', 'DEX'], appMalus: 10 }
    if (age <= 69) return { label: 'Sénior', range: '60–69', eduTests: 4, eduYouthMalus: false, physMalus: 20, physStats: ['FOR', 'CON', 'DEX'], appMalus: 15 }
    if (age <= 79) return { label: 'Vieillesse', range: '70–79', eduTests: 4, eduYouthMalus: false, physMalus: 40, physStats: ['FOR', 'CON', 'DEX'], appMalus: 20 }
    return { label: 'Grand âge', range: '80–89', eduTests: 4, eduYouthMalus: false, physMalus: 80, physStats: ['FOR', 'CON', 'DEX'], appMalus: 25 }
  })

  const eduTestResults = ref<EduTestResult[]>([])

  watch(() => form['age'], () => {
    eduTestResults.value = []
  })

  function rollEduTests() {
    const cat = ageCategory.value
    if (!cat || cat.eduTests === 0) return
    const results: EduTestResult[] = []
    let runningEdu = n(form['EDU_0'])
    for (let i = 0; i < cat.eduTests; i++) {
      const roll = Math.floor(Math.random() * 100) + 1
      const success = roll > runningEdu
      const bonus = success ? Math.floor(Math.random() * 10) + 1 : 0
      results.push({ index: i + 1, roll, threshold: runningEdu, success, bonus })
      if (success) runningEdu = Math.min(99, runningEdu + bonus)
    }
    eduTestResults.value = results
  }

  const totalEduBonus = computed(() => eduTestResults.value.reduce((s, r) => s + r.bonus, 0))

  function roll3d6x5() {
    return (Math.floor(Math.random() * 6) + 1
      + Math.floor(Math.random() * 6) + 1
      + Math.floor(Math.random() * 6) + 1) * 5
  }

  function rollChance() {
    const isYouth = ageCategory.value?.eduYouthMalus ?? false
    if (isYouth) {
      const a = roll3d6x5()
      const b = roll3d6x5()
      form['Chance'] = String(Math.max(a, b))
    } else {
      form['Chance'] = String(roll3d6x5())
    }
  }

  return { ageCategory, eduTestResults, rollEduTests, totalEduBonus, rollChance }
}
