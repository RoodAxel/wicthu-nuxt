import { OFFLINE_API_CACHE, OFFLINE_RESOURCES } from '#shared/offline'

/**
 * Préchargement des ressources pour la consultation hors ligne.
 *
 * Télécharge toutes les listes `/api/<ressource>` puis chaque fiche détail
 * (sorts + sous-sorts, entités, ouvrages du Mythe, occupations) et les range
 * dans le cache lu par le service worker. À lancer avant une session sans réseau.
 */

type ListItem = { id: number, slug?: string | null }

/** Ressources avec page détail : comment construire l'URL de chaque fiche. */
const DETAIL_RESOURCES: Array<{
  resource: typeof OFFLINE_RESOURCES[number]
  key: (item: ListItem) => string | number
  /** Fiches filles découvertes dans le détail (ex. variantes d'un sort). */
  children?: (detail: unknown) => ListItem[]
}> = [
  {
    resource: 'sort',
    key: i => i.id,
    children: d => (d as { children?: ListItem[] }).children ?? []
  },
  { resource: 'entite', key: i => i.id },
  { resource: 'ouvrage-mythe', key: i => i.id },
  // Les pages occupation sont adressées par slug (id en repli), cf. occHref().
  { resource: 'occupation', key: i => i.slug ?? i.id }
]

const LAST_SYNC_KEY = 'wicthu:offline-last-sync'
const CONCURRENCY = 6

async function runPool<T>(items: T[], worker: (item: T) => Promise<void>) {
  let next = 0
  const lanes = Array.from({ length: Math.min(CONCURRENCY, items.length) }, async () => {
    while (next < items.length) await worker(items[next++]!)
  })
  await Promise.all(lanes)
}

export function useOfflineCache() {
  const supported = useState('offline-supported', () => false)
  const lastSync = useState<string | null>('offline-last-sync', () => null)
  const syncing = useState('offline-syncing', () => false)
  const done = useState('offline-done', () => 0)
  const total = useState('offline-total', () => 0)
  const failed = useState('offline-failed', () => 0)

  onMounted(() => {
    supported.value = 'serviceWorker' in navigator && 'caches' in window
    try {
      lastSync.value = localStorage.getItem(LAST_SYNC_KEY)
    } catch { /* stockage indisponible : on affiche simplement « jamais » */ }
  })

  async function sync() {
    if (syncing.value || !supported.value) return
    syncing.value = true
    done.value = 0
    failed.value = 0
    total.value = OFFLINE_RESOURCES.length

    try {
      const cache = await caches.open(OFFLINE_API_CACHE)

      /** Télécharge + met en cache ; renvoie le JSON, ou null en cas d'échec. */
      async function store<T>(url: string): Promise<T | null> {
        try {
          const res = await fetch(url, { cache: 'no-store', headers: { accept: 'application/json' } })
          if (!res.ok) throw new Error(`${res.status}`)
          await cache.put(url, res.clone())
          return await res.json() as T
        } catch {
          failed.value++
          return null
        } finally {
          done.value++
        }
      }

      // 1. Toutes les listes
      const lists = new Map<string, ListItem[]>()
      await runPool([...OFFLINE_RESOURCES], async (r) => {
        const data = await store<ListItem[]>(`/api/${r}`)
        if (data) lists.set(r, data)
      })

      // 2. Toutes les fiches détail (+ fiches filles découvertes en chemin)
      const detailUrls = DETAIL_RESOURCES.flatMap(({ resource, key, children }) =>
        (lists.get(resource) ?? []).map(item => ({ url: `/api/${resource}/${key(item)}`, resource, key, children }))
      )
      total.value += detailUrls.length
      const seen = new Set(detailUrls.map(d => d.url))

      const queue = [...detailUrls]
      await runPool(queue, async ({ url, resource, key, children }) => {
        const detail = await store<unknown>(url)
        if (!detail || !children) return
        for (const child of children(detail)) {
          const childUrl = `/api/${resource}/${key(child)}`
          if (seen.has(childUrl)) continue
          seen.add(childUrl)
          total.value++
          queue.push({ url: childUrl, resource, key, children })
        }
      })

      if (failed.value === 0) {
        lastSync.value = new Date().toISOString()
        try {
          localStorage.setItem(LAST_SYNC_KEY, lastSync.value)
        } catch { /* sans stockage, la date ne survivra pas au rechargement */ }
      }
    } finally {
      syncing.value = false
    }
  }

  return { supported, lastSync, syncing, done, total, failed, sync }
}
