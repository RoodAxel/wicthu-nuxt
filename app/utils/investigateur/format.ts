// Helpers de formatage de la fiche d'investigateur (purs).

/** Parse une valeur de champ en nombre (0 si vide/NaN). */
export function n(val: string | undefined) {
  return Number(val) || 0
}

/** Moitié entière d'une valeur (chaîne vide si ≤ 0). */
export function half(val: string | undefined) {
  const v = Math.floor(n(val) / 2)
  return v > 0 ? String(v) : ''
}

/** Cinquième entier d'une valeur (chaîne vide si ≤ 0). */
export function fifth(val: string | undefined) {
  const v = Math.floor(n(val) / 5)
  return v > 0 ? String(v) : ''
}

/** Formate un montant en dollars avec séparateurs de milliers. */
export function fmtMoney(v: number): string {
  return Math.round(v).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' $'
}
