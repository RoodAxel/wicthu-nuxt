import type { Ref } from 'vue'

/**
 * Gère un filtre multi-sélection (dropdown) : ensemble des valeurs sélectionnées,
 * état ouvert/fermé du menu, et fermeture au clic extérieur.
 *
 * Le `triggerRef` doit être posé sur l'élément wrapper du dropdown
 * (`<div ref="triggerRef" class="dropdown-wrapper">`).
 */
export function useMultiSelectFilter<T = string>() {
  const selected = ref(new Set<T>()) as Ref<Set<T>>
  const open = ref(false)
  const triggerRef = ref<HTMLElement | null>(null)

  function toggle(value: T) {
    const next = new Set(selected.value)
    if (next.has(value)) next.delete(value)
    else next.add(value)
    selected.value = next
  }

  function remove(value: T) {
    const next = new Set(selected.value)
    next.delete(value)
    selected.value = next
  }

  function handleClickOutside(e: MouseEvent) {
    if (triggerRef.value && !triggerRef.value.contains(e.target as Node)) {
      open.value = false
    }
  }

  onMounted(() => document.addEventListener('mousedown', handleClickOutside))
  onUnmounted(() => document.removeEventListener('mousedown', handleClickOutside))

  return { selected, open, triggerRef, toggle, remove }
}
