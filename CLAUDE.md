# CLAUDE.md — Chantier « clean-code »

> Branche `chore/clean-code`. L'app est **déployée et fonctionnelle** : l'objectif ici n'est pas
> d'ajouter des features mais de **rendre le projet propre** (refacto, nettoyage, SEO) avant de
> régler les derniers bugs. Ordre conseillé : refacto code → nettoyage fichiers → SEO → bugs.

Stack : Nuxt 4 + Nuxt UI 4 + TypeScript strict + Prisma (PostgreSQL/Supabase). `srcDir = app/`.
Design system « Arkham Codex » piloté par `app/assets/css/main.css` (variables CSS). Voir `docs/`.

---

## 1. Refactoriser le code (priorité)

Beaucoup de fichiers ont grossi. Objectif : extraire des composants / composables réutilisables,
réduire la duplication, gagner en lisibilité — **sans changer le comportement**.

- [x] **`app/pages/investigateur/creer.vue` (2951 lignes) — le gros morceau.** — ✅ FAIT.
  **2951 → 261 lignes** (orchestrateur mince). Refacto incrémental en 5 phases (lint/typecheck/build
  vérifiés à chaque étape, comportement inchangé) :
  - **Constantes & types** : `app/utils/investigateur/constants.ts` + `format.ts`, types complétés
    dans `app/types/investigateur.ts`.
  - **Logique métier en composables** (`app/composables/`) : `useCharacterForm`, `useOccupations`,
    `useCreditWealth`, `useAgeModifiers`, `useCharacteristicsGen`, `useWeaponLibrary`,
    `useCharacterPersistence`, agrégés par `useCharacterCreation` (instancie tout autour du `form`
    réactif partagé).
  - **Contexte provide/inject** : `CharacterCreationKey` + `injectCharacterCreation()` (évite le
    prop-drilling ET `vue/no-mutating-props`).
  - **Sous-composants par section** : `app/components/investigateur/*` (11 composants :
    Identity, AgeModifiers, Characteristics, DerivedStats, Chance, Skills, VariableSkills, Weapons,
    Background, Finances, Equipment). Chacun injecte le contexte, template-only.
  - **CSS commun** : `app/assets/css/investigateur-form.css`, namespacé sous `.character-form`
    (même pattern que `resource-list.css`), enregistré dans `nuxt.config.ts`. Le chrome de page
    (header, citation) + la barre d'actions restent scopés dans `creer.vue`.
  - ⚠️ **À vérifier visuellement / en runtime** (compilation OK, exécution non testée) : création
    neuve **et** édition (`?edit=`), les 4 méthodes de génération, mise en évidence occupation +
    compteurs de points, modificateurs d'âge + tests d'ÉDU + Chance, bibliothèque d'armes, portrait,
    **sauvegarde + export PDF**, et le responsive.
- [x] **Mutualiser les pages `app/pages/ressources/*`** — ✅ FAIT. Les 9 pages partagent
  désormais :
  - `app/components/ResourceListLayout.vue` — chrome commun (header, citation, panneau stats,
    toolbar, messages d'état) via props + slots (`#toolbar`, `#subtoolbar`, défaut = liste, `#footer`).
  - `app/assets/css/resource-list.css` — CSS commun namespacé sous `.resource-page`, accent piloté
    par `--accent`/`--accent-text`/`--accent-rgb` (gold/crimson/arcane), inclus widgets (tags,
    dropdown, filtres actifs, badges, légende, lignes dépliables).
  - composables `useMultiSelectFilter` (dropdown + click-outside) et `useExpandableRows`.
  - Résultat : pages **6182 → 2858 lignes** (−54 %) ; infra partagée 751 lignes.
  - ⚠️ `arme.vue` (la plus custom) migrée en mode conservateur (chrome via le layout, corps
    préservé en scoped namespacé) → **à vérifier visuellement** (toolbar, table, détail, CRUD
    « sauver dans la bibliothèque », responsive).
- [ ] **`app/components/AppHeader.vue` (661 lignes)** — voir s'il y a des sous-éléments
  (menu, navigation) à extraire.
- [ ] Vérifier la cohérence des appels API côté pages (`$fetch`/`useFetch`) et factoriser les
  schémas de récupération récurrents si besoin.
- [ ] Faire passer `pnpm lint` / `npm run lint` et `npm run typecheck` après chaque refacto.

## 2. Nettoyer le projet (fichiers inutilisés) — ✅ FAIT

> Réalisé sur la branche `chore/clean-code`. Tout est tracké git (réversible). Build vérifié OK.

- [x] **Code mort PDF supprimé** : `server/api/investigateur/generate-pdf.pdflib.ts` (ancienne
  route) et `server/utils/investigateur-html.ts` (approche HTML→PDF abandonnée).
- [x] **Doublons racine supprimés** : `fiche_investigateur.pdf` (copie exacte de `public/`),
  `fiche_investigateur_generation.pdf` (copie racine — l'app n'utilise que celle de `public/`),
  `pdf-fields.json` (artefact généré).
- [x] **`server/assets/pdfs/` + bloc `nitro.serverAssets` retirés** (jamais lus via `useStorage`).
- [x] **Bloc PDF.co supprimé** : endpoint `pdf-fields.get.ts`, `public/fiche_investigateur.pdf`
  (son seul consommateur restant), `pdfcoApiKey` dans `nuxt.config.ts`, et `PDFCO_API_KEY`
  dans `.env` / `.env.example`. Plus aucune dépendance à l'API externe PDF.co.
- [x] **`cthulhu-design.html`** déplacé à la racine → `docs/cthulhu-design.html`.
- [x] **Templates d'email consolidés** : `reset-password.html` déplacé dans
  `supabase/email-templates/` (avec `confirmation.html`), dossier `email-templates/` supprimé.
- [x] **Logos inutilisés supprimés** : `public/logo.png`, `public/logoclair.png` (seul
  `logoWicthu.png` est référencé).
- [x] **Dépendances inutilisées retirées** : `@nuxtjs/tailwindcss` (non chargé, prévu pour
  Tailwind v3) et `sass-embedded` (aucun `.scss`). `npm run build` ✅.

> ℹ️ À noter (hors périmètre section 2) : `npm run lint` remonte ~411 erreurs **stylistiques**
> préexistantes (auto-corrigeables via `eslint --fix`) ; `npm audit` signale des vulnérabilités
> de dépendances. À traiter séparément (cf. section 1 / maintenance).

## 3. Référencement (SEO)

État actuel : seul `app/app.vue` définit un titre/description génériques + `lang="fr"`. Plusieurs
pages `ressources/*` (listes) n'ont **pas** de `useSeoMeta` propre. Pas de sitemap, robots, ni OG.

- [ ] Ajouter **`@nuxtjs/sitemap`** et **`@nuxtjs/robots`** (génération `sitemap.xml` + `robots.txt`).
- [ ] Définir un **`useSeoMeta` par page** (titre + description uniques) sur toutes les pages
  publiques, notamment les listes `ressources/*` qui en sont dépourvues, l'accueil et les pages
  légales. Les pages dynamiques `[id].vue` (entité, sort, ouvrage-mythe) ont déjà du meta — vérifier
  qu'il est complet (titre dynamique + description).
- [ ] Ajouter les **balises Open Graph / Twitter Card** (`og:title`, `og:description`, `og:image`,
  `twitter:card`) + une image OG par défaut dans `public/`.
- [ ] Ajouter les **URLs canoniques** (s'appuyer sur `runtimeConfig.public.siteUrl`).
- [ ] Vérifier que les pages d'auth/profil ne sont **pas** indexées (`robots: noindex`).
- [ ] Soigner la structure sémantique (un seul `<h1>` par page, hiérarchie des titres) et les
  `alt` des images.
- [ ] (Optionnel) Données structurées JSON-LD pour les fiches de ressources.

## 4. Derniers bugs (à la fin)

> À compléter au fil de l'eau. Consigner ici chaque bug repéré avec étapes de repro.

- [ ] l'esquive n'est pas renseigné dans les stats de combat en bas de page.

---

### Notes / vérifs utiles
- Lint : `npm run lint` · Types : `npm run typecheck` · Build : `npm run build` (lance `prisma generate`).
- Le générateur PDF actif est `server/api/investigateur/generate-pdf.post.ts` (pdf-lib), template
  chargé depuis `public/fiche_investigateur_generation.pdf`.
