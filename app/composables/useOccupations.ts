import type {
  OccupationListItem, OccupationDetail, OccPicker, ChoiceListPicker
} from '~/types/investigateur'
import {
  SKILL_TO_FORM_KEYS, SPEC_TO_KEY, CAT_TO_VAR, COMP_BASE, CARAC_KEY
} from '~/utils/investigateur/constants'
import { n } from '~/utils/investigateur/format'

/**
 * Moteur « occupation » : sélection de l'occupation, choix de compétences,
 * mise en évidence (or = obligatoire/choisi, vert = disponible au choix) des clés
 * de la grille, slots variables, et budget de points (occupation + intérêt personnel).
 */
export function useOccupations(form: Record<string, string>) {
  const { data: occupationList } = useFetch<OccupationListItem[]>('/api/occupation')
  const selectedOccupationId = ref<number | null>(null)
  const occupationDetail = ref<OccupationDetail | null>(null)
  const customOccupation = ref(false)

  // ── État des sélections ──────────────────────────────────────────────────────
  const choiceSelections = ref<Record<number, string[]>>({}) // CHOICE_FROM_LIST
  const freeSpecSelections = ref<Record<number, string>>({}) // FREE_SPEC: idx → specName
  const freeChoiceSelections = ref<Record<number, string[]>>({}) // FREE_CHOICE: idx → names
  // Sous-sélection lorsqu'une option CHOICE_FROM_LIST est une catégorie : `${i}_${slot}` → specName
  const catSubSelections = ref<Record<string, string>>({})

  // ── Pickers unifiés (tout type sauf FIXED) ───────────────────────────────────
  const occSkillPickers = computed((): OccPicker[] => {
    if (!occupationDetail.value) return []
    return occupationDetail.value.skills.flatMap((skill, i): OccPicker[] => {
      if (skill.type === 'FIXED') return []
      if (skill.type === 'FIXED_SPEC')
        return [{ i, type: 'FIXED_SPEC', label: `${skill.specName ?? '?'} (${skill.competence?.name ?? ''})` }]
      if (skill.type === 'FREE_SPEC')
        return [{ i, type: 'FREE_SPEC', catName: skill.competence?.name ?? '?', children: skill.competence?.children ?? [] }]
      if (skill.type === 'CHOICE_FROM_LIST')
        return [{ i, type: 'CHOICE_FROM_LIST', count: skill.choiceCount ?? 1, note: skill.note, options: skill.options }]
      if (skill.type === 'FREE_CHOICE')
        return [{ i, type: 'FREE_CHOICE', count: skill.choiceCount ?? 1, note: skill.note }]
      return []
    })
  })

  // ── Calcul des clés dorées et vertes ──────────────────────────────────────────

  // FIXED_SPEC → clés grille principale
  const fixedSpecKeys = computed((): Set<string> => {
    const keys = new Set<string>()
    if (!occupationDetail.value) return keys
    for (const skill of occupationDetail.value.skills) {
      if (skill.type === 'FIXED_SPEC' && skill.specName) {
        const k = SPEC_TO_KEY[skill.specName]
        if (k) keys.add(k)
      }
    }
    return keys
  })

  // FREE_SPEC → clés grille principale (spec choisie par joueur)
  const freeSpecMainKeys = computed((): Set<string> => {
    const keys = new Set<string>()
    if (!occupationDetail.value) return keys
    occupationDetail.value.skills.forEach((skill, i) => {
      if (skill.type !== 'FREE_SPEC') return
      const k = SPEC_TO_KEY[freeSpecSelections.value[i] ?? '']
      if (k) keys.add(k)
    })
    return keys
  })

  // CHOICE_FROM_LIST → clés grille principale des options choisies
  const selectedChoiceKeys = computed((): Set<string> => {
    const keys = new Set<string>()
    if (!occupationDetail.value) return keys
    occupationDetail.value.skills.forEach((skill, i) => {
      if (skill.type !== 'CHOICE_FROM_LIST') return
      ;(choiceSelections.value[i] ?? []).filter(Boolean).forEach((name, slot) => {
        const opt = skill.options.find(o => o.competence.name === name)
        if (opt?.competence.isCategory) {
          // Option catégorie : utiliser la sous-sélection
          const sub = catSubSelections.value[`${i}_${slot}`]
          if (sub) {
            const k = SPEC_TO_KEY[sub]
            if (k) keys.add(k)
          }
        } else {
          ;(SKILL_TO_FORM_KEYS[name] ?? []).forEach(k => keys.add(k))
        }
      })
    })
    return keys
  })

  // FREE_CHOICE → clés grille principale
  const freeChoiceMainKeys = computed((): Set<string> => {
    const keys = new Set<string>()
    if (!occupationDetail.value) return keys
    occupationDetail.value.skills.forEach((skill, i) => {
      if (skill.type !== 'FREE_CHOICE') return
      ;(freeChoiceSelections.value[i] ?? []).filter(Boolean).forEach(name =>
        (SKILL_TO_FORM_KEYS[name] ?? []).slice(0, 1).forEach(k => keys.add(k))
      )
    })
    return keys
  })

  // Slots variables assignés par l'occupation (FIXED_SPEC, FREE_SPEC, sous-sélections catégories)
  const occupationVarSlots = computed((): Record<string, { spec: string, locked: boolean }> => {
    const result: Record<string, { spec: string, locked: boolean }> = {}
    if (!occupationDetail.value) return result
    const used: Record<string, number> = {}
    const assign = (catName: string, spec: string, locked: boolean) => {
      const catVar = CAT_TO_VAR[catName]
      if (!catVar) return
      const idx = used[catName] ?? 0
      if (idx >= catVar.labels.length) return
      result[catVar.labels[idx]] = { spec, locked }
      used[catName] = idx + 1
    }
    for (const [i, skill] of occupationDetail.value.skills.entries()) {
      if (skill.type === 'FIXED_SPEC' && skill.specName && skill.competence && !SPEC_TO_KEY[skill.specName])
        assign(skill.competence.name, skill.specName, true)
      if (skill.type === 'FREE_SPEC' && skill.competence) {
        const chosen = freeSpecSelections.value[i]
        if (chosen && !SPEC_TO_KEY[chosen]) assign(skill.competence.name, chosen, false)
      }
      if (skill.type === 'CHOICE_FROM_LIST') {
        ;(choiceSelections.value[i] ?? []).filter(Boolean).forEach((name, slot) => {
          const opt = skill.options.find(o => o.competence.name === name)
          if (!opt?.competence.isCategory) return
          const sub = catSubSelections.value[`${i}_${slot}`]
          if (sub && !SPEC_TO_KEY[sub]) assign(name, sub, false)
        })
      }
    }
    return result
  })

  // Synchronise les labels des slots variables
  watch(occupationVarSlots, (slots) => {
    for (const [labelKey, { spec }] of Object.entries(slots)) {
      if (!form[labelKey]) form[labelKey] = spec
    }
  }, { deep: true })

  // fixedKeys : or = FIXED + FIXED_SPEC + selections FREE_SPEC/CHOICE/FREE_CHOICE + slots variables
  const fixedKeys = computed((): Set<string> => {
    const keys = new Set<string>(['CRE_0'])
    if (!occupationDetail.value) return keys
    for (const skill of occupationDetail.value.skills)
      if (skill.type === 'FIXED' && skill.competence)
        (SKILL_TO_FORM_KEYS[skill.competence.name] ?? []).forEach(k => keys.add(k))
    fixedSpecKeys.value.forEach(k => keys.add(k))
    freeSpecMainKeys.value.forEach(k => keys.add(k))
    selectedChoiceKeys.value.forEach(k => keys.add(k))
    freeChoiceMainKeys.value.forEach(k => keys.add(k))
    // Slots variables → leurs clés valeur passent en or
    for (const labelKey of Object.keys(occupationVarSlots.value)) {
      const valueKey = labelKey.replace('_label', '_0')
      keys.add(valueKey)
    }
    return keys
  })

  // choiceKeys : vert = options CHOICE_FROM_LIST non sélectionnées (non-catégorie)
  const choiceKeys = computed((): Set<string> => {
    const keys = new Set<string>()
    if (!occupationDetail.value) return keys
    for (const picker of occSkillPickers.value) {
      if (picker.type !== 'CHOICE_FROM_LIST') continue
      const selected = new Set((choiceSelections.value[picker.i] ?? []).filter(Boolean))
      for (const opt of picker.options) {
        if (!opt.competence.isCategory && !selected.has(opt.competence.name))
          (SKILL_TO_FORM_KEYS[opt.competence.name] ?? []).forEach(k => keys.add(k))
      }
    }
    fixedKeys.value.forEach(k => keys.delete(k))
    return keys
  })

  const highlightedKeys = computed((): Set<string> => new Set([...fixedKeys.value, ...choiceKeys.value]))

  function isGroupHighlighted(...keys: string[]) {
    return keys.some(k => fixedKeys.value.has(k))
  }
  function isGroupChoice(...keys: string[]) {
    return !isGroupHighlighted(...keys) && keys.some(k => choiceKeys.value.has(k))
  }

  function updateChoice(idx: number, slot: number, value: string) {
    const picker = occSkillPickers.value.find(p => p.i === idx && p.type === 'CHOICE_FROM_LIST') as ChoiceListPicker | undefined
    const count = picker?.count ?? 1
    const current = [...(choiceSelections.value[idx] ?? Array(count).fill(''))]
    while (current.length < count) current.push('')
    current[slot] = value
    // Effacer la sous-sélection si l'option principale change
    const catKey = `${idx}_${slot}`
    if (catSubSelections.value[catKey]) {
      const { [catKey]: _omit, ...next } = catSubSelections.value
      catSubSelections.value = next
    }
    choiceSelections.value = { ...choiceSelections.value, [idx]: current }
  }

  // ── Watchers occupation ───────────────────────────────────────────────────────
  watch(selectedOccupationId, async (id) => {
    choiceSelections.value = {}
    freeSpecSelections.value = {}
    freeChoiceSelections.value = {}
    catSubSelections.value = {}
    if (!id) {
      occupationDetail.value = null
      return
    }
    const occ = occupationList.value?.find(o => o.id === id)
    if (occ) form['Occupation'] = occ.name
    occupationDetail.value = await $fetch<OccupationDetail>(`/api/occupation/${id}`)
  })

  // En mode édition : retrouver l'occupation depuis le nom sauvegardé
  watch([occupationList, () => form['Occupation']], () => {
    if (selectedOccupationId.value || !occupationList.value || !form['Occupation']) return
    const match = occupationList.value.find(
      o => o.name.toLowerCase() === form['Occupation']!.toLowerCase()
    )
    if (match) selectedOccupationId.value = match.id
    else if (form['Occupation']) customOccupation.value = true
  }, { immediate: true })

  watch(customOccupation, (custom) => {
    if (custom) {
      selectedOccupationId.value = null
      occupationDetail.value = null
    } else {
      form['Occupation'] = ''
    }
  })

  // ── Points d'occupation ─────────────────────────────────────────────────────
  // Valeur de base dynamique : Esquive = DEX÷2, Langue maternelle = EDU
  function getSkillBase(key: string): number {
    if (key === 'ESQ_0') return Math.floor(n(form['DEX_0']) / 2)
    if (key === 'LAG_0') return n(form['EDU_0'])
    return COMP_BASE[key] ?? 0
  }

  function parseOccPoints(formula: string | null): number {
    if (!formula) return 0
    let total = 0
    const terms = formula.split('+').map(t => t.trim())
    for (const term of terms) {
      if (term.startsWith('(')) {
        const inner = term.replaceAll(/[()]/g, '')
        const options = inner.split(/\s+ou\s+/i)
        const vals = options.map((opt) => {
          const m = opt.trim().match(/^([A-ZÉÈÀÂ]+)\s*x\s*(\d+)$/i)
          if (!m) return 0
          const key = CARAC_KEY[m[1]!.toUpperCase()] ?? ''
          return n(form[key]) * Number.parseInt(m[2]!)
        })
        total += Math.max(0, ...vals)
      } else {
        const m = term.match(/^([A-ZÉÈÀÂ]+)\s*x\s*(\d+)$/i)
        if (!m) continue
        const key = CARAC_KEY[m[1]!.toUpperCase()] ?? ''
        total += n(form[key]) * Number.parseInt(m[2]!)
      }
    }
    return total
  }

  const occPointsTotal = computed(() =>
    parseOccPoints(occupationDetail.value?.point_competence ?? null)
  )

  const highlightedInvested = computed(() =>
    Object.keys(COMP_BASE).reduce((sum, key) => {
      if (!highlightedKeys.value.has(key)) return sum
      return sum + Math.max(0, n(form[key]) - getSkillBase(key))
    }, 0)
  )

  const nonHighlightedInvested = computed(() =>
    Object.keys(COMP_BASE).reduce((sum, key) => {
      if (highlightedKeys.value.has(key)) return sum
      return sum + Math.max(0, n(form[key]) - getSkillBase(key))
    }, 0)
  )

  const occOverflow = computed(() => Math.max(0, highlightedInvested.value - occPointsTotal.value))

  const occPointsSpent = computed(() => highlightedInvested.value)
  const occPointsRemaining = computed(() => Math.max(0, occPointsTotal.value - highlightedInvested.value))

  const intPointsTotal = computed(() => n(form['INT_0']) * 2)
  const intPointsSpent = computed(() => nonHighlightedInvested.value + occOverflow.value)
  const intPointsRemaining = computed(() => intPointsTotal.value - intPointsSpent.value)

  return {
    occupationList, selectedOccupationId, occupationDetail, customOccupation,
    choiceSelections, occSkillPickers, updateChoice,
    fixedKeys, choiceKeys, occupationVarSlots, isGroupHighlighted, isGroupChoice,
    getSkillBase,
    occPointsTotal, occPointsSpent, occPointsRemaining, occOverflow,
    intPointsTotal, intPointsSpent, intPointsRemaining
  }
}
