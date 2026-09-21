import type { NameGender } from '~/composables/useRandomName'

export const GENDER_OPTIONS: { value: NameGender, label: string }[] = [
  { value: 'homme', label: 'Homme' },
  { value: 'femme', label: 'Femme' },
  { value: 'autre', label: 'Autre (à préciser)' }
]

const HOMME_ALIASES = new Set(['homme', 'h', 'm', 'masculin', 'male'])
const FEMME_ALIASES = new Set(['femme', 'f', 'féminin', 'feminin', 'female'])

/**
 * Genre de l'investigateur. Le champ `Sexe` du formulaire (celui imprimé sur le
 * PDF) reste une simple chaîne : « Homme », « Femme », ou le texte libre saisi
 * quand « Autre » est choisi. Le choix est dérivé dans les deux sens pour que le
 * chargement d'une fiche existante (mode édition) resélectionne la bonne option.
 *
 * `nameGender` pilote le générateur de nom aléatoire (cf. `useRandomName`).
 */
export function useGender(form: Record<string, string>) {
  const genderChoice = ref<NameGender | ''>('')
  const genderCustom = ref('')

  // Valeur écrite dans `form['Sexe']` pour l'état courant de l'UI
  const sexeValue = computed(() => {
    if (genderChoice.value === 'homme') return 'Homme'
    if (genderChoice.value === 'femme') return 'Femme'
    if (genderChoice.value === 'autre') return genderCustom.value.trim()
    return ''
  })

  // UI → formulaire
  watch(sexeValue, (v) => {
    form['Sexe'] = v
  })

  // Formulaire → UI (fiche chargée en mode édition)
  watch(() => form['Sexe'], (v) => {
    const raw = (v ?? '').trim()
    if (raw === sexeValue.value) return
    if (!raw) {
      genderChoice.value = ''
      genderCustom.value = ''
      return
    }
    const low = raw.toLowerCase()
    if (HOMME_ALIASES.has(low)) {
      genderChoice.value = 'homme'
      genderCustom.value = ''
    } else if (FEMME_ALIASES.has(low)) {
      genderChoice.value = 'femme'
      genderCustom.value = ''
    } else {
      genderChoice.value = 'autre'
      genderCustom.value = raw
    }
  }, { immediate: true })

  /** Genre retenu pour le tirage du prénom (`null` = les deux listes réunies). */
  const nameGender = computed<NameGender | null>(() => genderChoice.value || null)

  return { genderChoice, genderCustom, nameGender, genderOptions: GENDER_OPTIONS }
}
