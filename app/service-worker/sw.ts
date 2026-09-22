/**
 * Service worker Wicthu — consultation des ressources hors ligne.
 *
 * - Assets du build (JS, CSS, polices, images) + coquille SPA : précachés.
 * - `GET /api/<ressource>` : réseau d'abord, cache en secours (rempli à la
 *   navigation et par le bouton « Rendre disponible hors ligne »).
 * - Navigations : toujours le réseau (SSR, SEO intacts) ; sans réseau, la
 *   coquille SPA prend le relais et l'app se rend côté client.
 * - Tout le reste (auth, investigateurs, armes perso…) : jamais mis en cache.
 */
import { clientsClaim } from 'workbox-core'
import { cleanupOutdatedCaches, matchPrecache, precacheAndRoute, type PrecacheEntry } from 'workbox-precaching'
import { NavigationRoute, registerRoute, setCatchHandler } from 'workbox-routing'
import { CacheFirst, NetworkFirst, NetworkOnly } from 'workbox-strategies'
import {
  OFFLINE_API_CACHE,
  OFFLINE_API_PATTERN,
  OFFLINE_ICON_CACHE,
  OFFLINE_SHELL_URL
} from '../../shared/offline'

// Typage minimal : évite de mélanger les libs `dom` et `webworker` dans le projet.
declare const self: {
  __WB_MANIFEST: Array<PrecacheEntry | string>
  skipWaiting: () => Promise<void>
}

/** Au-delà, on bascule sur le cache (réseau faible plutôt qu'absent). */
const NETWORK_TIMEOUT_SECONDS = 4

precacheAndRoute(self.__WB_MANIFEST)
cleanupOutdatedCaches()
self.skipWaiting()
clientsClaim()

registerRoute(
  ({ url, request, sameOrigin }) =>
    sameOrigin && request.method === 'GET' && OFFLINE_API_PATTERN.test(url.pathname),
  new NetworkFirst({
    cacheName: OFFLINE_API_CACHE,
    networkTimeoutSeconds: NETWORK_TIMEOUT_SECONDS,
    // Les entrées préchargées par l'app n'ont pas les mêmes en-têtes que ofetch.
    matchOptions: { ignoreVary: true }
  })
)

registerRoute(
  ({ url, sameOrigin }) => sameOrigin && url.pathname.startsWith('/api/_nuxt_icon/'),
  new CacheFirst({ cacheName: OFFLINE_ICON_CACHE })
)

registerRoute(
  new NavigationRoute(new NetworkOnly({ networkTimeoutSeconds: NETWORK_TIMEOUT_SECONDS }), {
    denylist: [/^\/api\//, /^\/_/]
  })
)

setCatchHandler(async ({ request }) => {
  if (request.destination === 'document') {
    return (await matchPrecache(OFFLINE_SHELL_URL)) ?? Response.error()
  }
  return Response.error()
})
