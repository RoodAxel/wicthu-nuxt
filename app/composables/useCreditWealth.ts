import type { Ref } from 'vue'
import type { OccupationDetail } from '~/types/investigateur'
import { n, fmtMoney } from '~/utils/investigateur/format'

/**
 * Richesse dérivée du Crédit (tranche, espèces, capital, dépenses) — barèmes
 * classique (1920) vs moderne selon l'occupation. Synchronise les valeurs dans `form`.
 */
export function useCreditWealth(
  form: Record<string, string>,
  occupationDetail: Ref<OccupationDetail | null>
) {
  const creditWealth = computed(() => {
    const cr = n(form['CRE_0'])
    if (cr === 0 && !form['CRE_0']) return null
    const modern = occupationDetail.value?.is_modern ?? false
    if (modern) {
      if (cr <= 0) return { tranche: 'Indigent', especes: '10 $', capital: 'Aucun', depenses: '10 $' }
      if (cr <= 9) return { tranche: 'Pauvre', especes: fmtMoney(cr * 20), capital: fmtMoney(cr * 200), depenses: '40 $' }
      if (cr <= 49) return { tranche: 'Moyen', especes: fmtMoney(cr * 40), capital: fmtMoney(cr * 1000), depenses: '200 $' }
      if (cr <= 89) return { tranche: 'Aisé', especes: fmtMoney(cr * 100), capital: fmtMoney(cr * 10000), depenses: '1 000 $' }
      if (cr <= 98) return { tranche: 'Riche', especes: fmtMoney(cr * 400), capital: fmtMoney(cr * 40000), depenses: '5 000 $' }
      return { tranche: 'Richissime', especes: '1 000 000 $', capital: '100 000 000 $ ou plus', depenses: '100 000 $' }
    } else {
      if (cr <= 0) return { tranche: 'Indigent', especes: '0,50 $', capital: 'Aucun', depenses: '0,50 $' }
      if (cr <= 9) return { tranche: 'Pauvre', especes: fmtMoney(cr), capital: fmtMoney(cr * 10), depenses: '2 $' }
      if (cr <= 49) return { tranche: 'Moyen', especes: fmtMoney(cr * 2), capital: fmtMoney(cr * 50), depenses: '10 $' }
      if (cr <= 89) return { tranche: 'Aisé', especes: fmtMoney(cr * 5), capital: fmtMoney(cr * 500), depenses: '50 $' }
      if (cr <= 98) return { tranche: 'Riche', especes: fmtMoney(cr * 20), capital: fmtMoney(cr * 2000), depenses: '250 $' }
      return { tranche: 'Richissime', especes: '50 000 $', capital: '5 000 000 $ ou plus', depenses: '5 000 $' }
    }
  })

  // Synchronise la richesse calculée dans `form` pour l'envoi
  watchEffect(() => {
    if (creditWealth.value) {
      form['Espèces'] = creditWealth.value.especes
      form['capital'] = creditWealth.value.capital
      form['depencesCourantes'] = creditWealth.value.depenses
    }
  })

  return { creditWealth }
}
