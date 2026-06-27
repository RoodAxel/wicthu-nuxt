import type { ArmePerso, ArmeRulebook } from '~/types/investigateur'
import { FIXED_COMPETENCE_MAP } from '~/utils/investigateur/constants'

/**
 * Bibliothèque d'armes : armes perso (CRUD `/api/arme-perso`) + catalogue
 * (`/api/arme`), import vers un slot ARM2–5, résolution automatique de la
 * valeur « Ord. » selon la compétence associée.
 */
export function useWeaponLibrary(form: Record<string, string>) {
  const showLibrary = ref(false)
  const libraryTab = ref<'perso' | 'rulebook'>('perso')
  const rulebookSearch = ref('')
  const rulebookCategory = ref('')
  const importTargetSlot = ref<2 | 3 | 4 | 5>(2)

  const { data: armePersoData, refresh: refreshArmePerso } = useFetch<ArmePerso[]>('/api/arme-perso')
  const armePersoList = computed(() => armePersoData.value ?? [])

  const { data: armeRulebookData } = useLazyFetch<ArmeRulebook[]>('/api/arme')
  const rulebookCategories = computed(() => [...new Set((armeRulebookData.value ?? []).map(a => a.category))].sort())
  const filteredRulebook = computed(() => {
    const search = rulebookSearch.value.toLowerCase()
    return (armeRulebookData.value ?? []).filter(a =>
      (!rulebookCategory.value || a.category === rulebookCategory.value)
      && (!search || a.name.toLowerCase().includes(search))
    )
  })

  // Compétences uniques du catalogue pour les dropdowns de spécialité
  const uniqueWeaponCompetences = computed(() => {
    const seen = new Map<string, number | null>()
    for (const w of armeRulebookData.value ?? []) {
      if (!seen.has(w.competence.name)) seen.set(w.competence.name, w.competence.baseValue)
    }
    return Array.from(seen.entries())
      .map(([name, baseValue]) => ({ name, baseValue }))
      .sort((a, b) => a.name.localeCompare(b.name, 'fr'))
  })

  // Valeur de base de la compétence sélectionnée dans un slot de spécialité
  function getCompBase(labelKey: string): string {
    const label = form[labelKey]
    if (!label) return '0'
    const comp = uniqueWeaponCompetences.value.find(c => c.name === label)
    return comp?.baseValue == null ? '0' : String(comp.baseValue)
  }

  function resolveOrd(weapon: ArmeRulebook): string {
    const compName = weapon.competence.name
    const base = weapon.competence.baseValue ?? 0

    // 1. Compétence fixe → valeur saisie dans la fiche ou valeur de base
    const fixed = FIXED_COMPETENCE_MAP[compName]
    if (fixed) {
      return form[fixed.key] || String(fixed.base)
    }
    // 2. Slot de spécialité labelisé avec cette compétence → valeur saisie ou base
    for (const slot of ['CR2', 'CR3', 'CD3', 'CD4']) {
      if (form[`${slot}_label`] === compName) {
        return form[`${slot}_0`] || String(base)
      }
    }
    // 3. Fallback : valeur de base de la compétence
    return base > 0 ? String(base) : ''
  }

  async function saveWeaponToLibrary(slot: number) {
    const nom = form[`ARM${slot}`]
    if (!nom?.trim()) return
    await $fetch('/api/arme-perso', {
      method: 'POST',
      body: {
        nom: nom.trim(),
        deg: form[`Arm${slot}_DEG`] || null,
        port: form[`Arm${slot}_PORT`] || null,
        cap: form[`Arm${slot}_CAP`] || null,
        pann: form[`Arm${slot}_PANN`] || null
      }
    })
    await refreshArmePerso()
  }

  function clearWeaponSlot(slot: number) {
    form[`ARM${slot}`] = ''
    form[`Arm${slot}_ORD`] = ''
    form[`Arm${slot}_DEG`] = ''
    form[`Arm${slot}_PORT`] = ''
    form[`Arm${slot}_CAD`] = ''
    form[`Arm${slot}_CAP`] = ''
    form[`Arm${slot}_PANN`] = ''
  }

  async function deleteArmePerso(id: number) {
    await $fetch(`/api/arme-perso/${id}`, { method: 'DELETE' })
    await refreshArmePerso()
  }

  function importArmeToSlot(slot: number, arme: { nom: string, deg?: string | null, port?: string | null, cap?: string | null, pann?: string | null }) {
    form[`ARM${slot}`] = arme.nom
    form[`Arm${slot}_DEG`] = arme.deg ?? ''
    form[`Arm${slot}_PORT`] = arme.port ?? ''
    form[`Arm${slot}_CAP`] = arme.cap ?? ''
    form[`Arm${slot}_PANN`] = arme.pann ?? ''
  }

  function importRulebookToSlot(slot: number, arme: ArmeRulebook) {
    importArmeToSlot(slot, {
      nom: arme.name,
      deg: arme.damage,
      port: arme.range,
      cap: arme.capacity,
      pann: arme.failure == null ? null : String(arme.failure)
    })
    form[`Arm${slot}_ORD`] = resolveOrd(arme)
    form[`Arm${slot}_CAD`] = arme.cadence ?? ''
  }

  // Auto-résolution ORD réactive pour les armes reconnues dans le catalogue (ARM2–5)
  watchEffect(() => {
    for (const i of [2, 3, 4, 5]) {
      const weapon = (armeRulebookData.value ?? []).find(w => w.name === form[`ARM${i}`])
      if (weapon) form[`Arm${i}_ORD`] = resolveOrd(weapon)
    }
  })

  return {
    showLibrary, libraryTab, rulebookSearch, rulebookCategory, importTargetSlot,
    armePersoList, rulebookCategories, filteredRulebook, uniqueWeaponCompetences,
    getCompBase, saveWeaponToLibrary, clearWeaponSlot, deleteArmePerso,
    importArmeToSlot, importRulebookToSlot
  }
}
