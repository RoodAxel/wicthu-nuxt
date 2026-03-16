# Wicthu — Compagnon de l'Investigateur

Application web dédiée aux joueurs de **L'Appel de Cthulhu 7e édition** (jeu de rôle). Elle centralise les ressources de jeu et permet la création et l'export de fiches d'investigateur en PDF.

---

## Fonctionnalités

- **Bibliothèque de ressources** : Armes, artefacts, compétences, entités du Mythe, équipements, manies, phobies, occupations, ouvrages, sorts
- **Fiche d'investigateur** : Création, édition, sauvegarde et export PDF
- **Authentification** : Inscription, connexion, réinitialisation de mot de passe (Supabase Auth)
- **Design thématique** : Système de design *Arkham Codex* (thème Cthulhu)

---

## Stack technique

| Couche | Technologie |
|--------|-------------|
| Frontend | Nuxt 4 + Vue 3 + TypeScript (strict) |
| UI | Nuxt UI v4 + TailwindCSS v4 |
| Backend | Nitro (serveur Nuxt) |
| ORM | Prisma v6 |
| Base de données | PostgreSQL via Supabase |
| Authentification | Supabase Auth |
| Stockage fichiers | Supabase Storage |
| Génération PDF | Gotenberg API |
| Déploiement | Vercel |

---

## Prérequis

- **Node.js** >= 20
- **npm** >= 10
- Un projet **Supabase** (PostgreSQL + Auth + Storage)
- Un bucket Supabase Storage nommé `fiches` (accès privé)

---

## Installation

### 1. Cloner le dépôt

```bash
git clone https://github.com/<username>/wicthu-nuxt.git
cd wicthu-nuxt
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configurer les variables d'environnement

```bash
cp .env.example .env
```

Renseigner les valeurs dans `.env` :

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | URL PostgreSQL via PgBouncer (connexion poolée) |
| `DIRECT_URL` | URL PostgreSQL directe (migrations Prisma) |
| `SUPABASE_URL` | URL du projet Supabase |
| `SUPABASE_KEY` | Clé publique anon Supabase |
| `SUPABASE_SECRET_KEY` | Clé service role Supabase (serveur uniquement) |
| `SITE_URL` | URL publique du site (ex: `https://wicthu.com`) |

### 4. Appliquer les migrations Prisma

```bash
npx prisma migrate deploy
```

### 5. (Optionnel) Peupler la base de données

```bash
npx prisma db seed
```

### 6. Lancer en développement

```bash
npm run dev
```

L'application est accessible sur `http://localhost:3000`.

---

## Scripts disponibles

```bash
npm run dev        # Serveur de développement
npm run build      # Build de production
npm run preview    # Prévisualiser le build
npm run lint       # Linter ESLint
```

---

## Configuration Supabase (production)

Dans le Dashboard Supabase → **Authentication → URL Configuration** :

- **Site URL** : `https://wicthu.com`
- **Redirect URLs** : `https://wicthu.com/auth/reset-password`

---

## Structure du projet

```
wicthu-nuxt/
├── app/
│   ├── components/       # Composants Vue réutilisables
│   ├── middleware/        # Middleware d'authentification
│   ├── pages/             # Pages (routing file-based Nuxt)
│   │   ├── auth/          # Connexion, inscription, reset mdp
│   │   ├── investigateur/ # Fiche de personnage
│   │   └── ressources/    # Bibliothèque de jeu
│   ├── plugins/           # Plugin auth Supabase (PASSWORD_RECOVERY)
│   └── types/             # Types TypeScript partagés client
├── prisma/
│   ├── schema.prisma      # Schéma de base de données
│   └── migrations/        # Historique des migrations SQL
└── server/
    ├── api/               # Routes API REST (Nitro/H3)
    ├── types/             # Types TypeScript serveur
    └── utils/             # Utilitaires serveur
```

---

## Documentation technique

Voir le dossier [`docs/`](./docs/) :

- [Guide d'installation](./docs/INSTALLATION.md)
- [Architecture applicative](./docs/ARCHITECTURE.md)
- [Modèle de données](./docs/DATA_MODEL.md)
- [Infrastructure](./docs/INFRASTRUCTURE.md)

---

## Licence

Projet académique — voir [LICENSE](./LICENSE).
