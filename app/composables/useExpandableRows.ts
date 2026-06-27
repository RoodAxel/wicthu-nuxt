/**
 * Gère l'état d'expansion d'une ligne de liste (une seule ouverte à la fois).
 */
export function useExpandableRows() {
  const expandedId = ref<number | null>(null)

  function toggleExpand(id: number) {
    expandedId.value = expandedId.value === id ? null : id
  }

  return { expandedId, toggleExpand }
}
