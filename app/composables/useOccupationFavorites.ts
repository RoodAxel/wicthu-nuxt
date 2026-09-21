const STORAGE_KEY = 'wicthu:occupation-favoris'

/**
 * Favoris d'occupations, stockés dans le navigateur (localStorage).
 *
 * On indexe par **slug** et non par id : les identifiants changent à chaque
 * réimport des occupations, alors que les slugs sont stables.
 *
 * L'état est partagé entre tous les composants qui appellent ce composable
 * (`useState`), et hydraté au montage seulement — `localStorage` n'existe pas
 * pendant le rendu serveur.
 */
export function useOccupationFavorites() {
  const favorites = useState<string[]>('occupation-favoris', () => [])
  const loaded = useState<boolean>('occupation-favoris-loaded', () => false)

  function read(): string[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return []
      const parsed: unknown = JSON.parse(raw)
      return Array.isArray(parsed) ? parsed.filter(v => typeof v === 'string') : []
    } catch {
      // navigation privée, stockage bloqué, JSON corrompu : on repart à vide
      return []
    }
  }

  function persist(list: string[]) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
    } catch { /* stockage indisponible : les favoris restent en mémoire */ }
  }

  onMounted(() => {
    if (loaded.value) return
    favorites.value = read()
    loaded.value = true
  })

  const isFavorite = (slug: string | null) => !!slug && favorites.value.includes(slug)

  function toggle(slug: string | null) {
    if (!slug) return
    favorites.value = favorites.value.includes(slug)
      ? favorites.value.filter(s => s !== slug)
      : [...favorites.value, slug]
    persist(favorites.value)
  }

  function clear() {
    favorites.value = []
    persist([])
  }

  return { favorites, loaded, isFavorite, toggle, clear }
}
