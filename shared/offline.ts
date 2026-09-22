/**
 * Constantes du mode hors ligne, partagées entre le service worker
 * (`app/service-worker/sw.ts`) et l'app (`useOfflineCache`).
 */

/** Cache des réponses `GET /api/*` des ressources (consultables hors ligne). */
export const OFFLINE_API_CACHE = 'wicthu-api'

/** Cache des icônes Iconify servies par `@nuxt/icon`. */
export const OFFLINE_ICON_CACHE = 'wicthu-icons'

/**
 * Page « coquille » rendue en SPA (`ssr: false`), précachée par le service worker.
 * Hors ligne, toute navigation sans réseau reçoit cette coquille : l'app démarre
 * côté client et affiche la bonne route à partir des données en cache.
 */
export const OFFLINE_SHELL_URL = '/offline-shell'

/** Endpoints des ressources mis en cache (lecture seule, sans données privées). */
export const OFFLINE_RESOURCES = [
  'arme',
  'artefact',
  'competence',
  'entite',
  'equipement-classique',
  'equipement-moderne',
  'manie',
  'occupation',
  'ouvrage-mythe',
  'ouvrage-occulte',
  'phobie',
  'sort'
] as const

/**
 * `/api/<ressource>` et `/api/<ressource>/<id>` (query éventuelle comprise).
 * Ancré sur le nom exact : `/api/arme-perso` (privé) n'est PAS couvert.
 */
export const OFFLINE_API_PATTERN = new RegExp(
  `^/api/(${OFFLINE_RESOURCES.join('|')})(/[^/]+)?/?$`
)
