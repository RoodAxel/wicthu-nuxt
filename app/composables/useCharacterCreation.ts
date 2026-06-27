import type { InjectionKey } from 'vue'

/**
 * Agrégateur de la fiche d'investigateur : instancie une seule fois tous les
 * composables métier (qui tournent autour du même `form` réactif partagé) et
 * expose le contexte complet. Fourni via provide/inject aux sous-composants de
 * section pour éviter le prop-drilling.
 *
 * L'ordre d'instanciation (form → occupations → richesse → âge → génération →
 * armes → persistance) est significatif : il fixe l'ordre d'enregistrement des
 * watchers/watchEffect et doit rester identique au comportement d'origine.
 */
export function useCharacterCreation() {
  // État central : le `form` réactif partagé + les stats dérivées
  const { form, pv_max, pm_max, sm_initial, impact, carrure, mvt } = useCharacterForm()

  // Moteur occupation : sélection, mise en évidence des compétences, budget de points
  const occupations = useOccupations(form)

  // Richesse dérivée du crédit (synchronisée dans `form` via un watchEffect interne)
  useCreditWealth(form, occupations.occupationDetail)

  // Modificateurs d'âge + tirage de la Chance
  const age = useAgeModifiers(form)

  // Génération des caractéristiques (classique / libre / achat / accélérée)
  const gen = useCharacteristicsGen(form)

  // Bibliothèque d'armes (perso + catalogue)
  const library = useWeaponLibrary(form)

  // Sauvegarde / export PDF / portrait / nom aléatoire (+ chargement en mode édition)
  const persistence = useCharacterPersistence(form)

  return {
    form, pv_max, pm_max, sm_initial, impact, carrure, mvt,
    ...occupations, ...age, ...gen, ...library, ...persistence
  }
}

export type CharacterCreationContext = ReturnType<typeof useCharacterCreation>

export const CharacterCreationKey: InjectionKey<CharacterCreationContext>
  = Symbol('character-creation')

/**
 * Récupère le contexte de création fourni par la page `creer.vue`.
 * À utiliser dans les sous-composants de section.
 */
export function injectCharacterCreation(): CharacterCreationContext {
  const ctx = inject(CharacterCreationKey)
  if (!ctx) throw new Error('Contexte de création de fiche non fourni (CharacterCreationKey)')
  return ctx
}
