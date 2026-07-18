// Limites des champs « Histoire & Background » de la fiche PDF.
// Chaque champ est réparti sur deux lignes du template Orbe : `split` = capacité
// de la 1re ligne (à côté du libellé), `max` = total exploitable sur les deux
// lignes (proportionnel à la largeur réelle des champs, avec une petite marge).
// Au-delà de `max`, le texte serait perdu à la génération — le formulaire
// impose donc ces limites (maxlength + compteur) et le serveur fait la césure.
export const BACKGROUND_LIMITS: Record<string, { split: number, max: number }> = {
  'Description': { split: 35, max: 75 },
  'ideologieEtCroyance': { split: 30, max: 72 },
  'traits': { split: 40, max: 82 },
  'personnesImportantes': { split: 30, max: 73 },
  'sequellesCicatrices': { split: 30, max: 71 },
  'lieuxSignificatifs': { split: 34, max: 77 },
  'phobiesManies': { split: 33, max: 76 },
  'bienPrécieux': { split: 36, max: 79 },
  'ouvragesOccultes': { split: 20, max: 59 },
  'rencontresEntites': { split: 20, max: 59 }
}
