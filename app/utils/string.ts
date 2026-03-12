/**
 * Normalise une chaîne pour la recherche : minuscules + suppression des accents.
 * Permet par ex. de retrouver "fléaux" en tapant "fleaux".
 */
export function normalizeStr(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}
