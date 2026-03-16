# Guide d'installation — Wicthu

## Prérequis

| Outil | Version minimale |
|-------|-----------------|
| Node.js | 20.x |
| npm | 10.x |
| Git | toute version récente |
| Compte Supabase | — |

---

## 1. Récupérer le code source

```bash
git clone https://github.com/<username>/wicthu-nuxt.git
cd wicthu-nuxt
```

---

## 2. Installer les dépendances Node

```bash
npm install
```

---

## 3. Créer le projet Supabase

1. Se connecter sur [supabase.com](https://supabase.com) et créer un nouveau projet
2. Noter les informations suivantes (disponibles dans **Settings → API**) :
   - **Project URL** → `SUPABASE_URL`
   - **anon / public key** → `SUPABASE_KEY`
   - **service_role key** → `SUPABASE_SECRET_KEY`
3. Récupérer les URLs de connexion PostgreSQL (**Settings → Database → Connection string**) :
   - Mode **Transaction** (port 6543) → `DATABASE_URL`
   - Mode **Session** (port 5432) → `DIRECT_URL`

### Créer le bucket de stockage

Dans **Storage → New bucket** :
- Nom : `fiches`
- Accès : **Privé** (non public)

### Configurer les redirections d'authentification

Dans **Authentication → URL Configuration** :
- **Site URL** : `http://localhost:3000` (dev) ou `https://wicthu.com` (prod)
- **Redirect URLs** : ajouter `http://localhost:3000/auth/reset-password`

---

## 4. Configurer les variables d'environnement

```bash
cp .env.example .env
```

Éditer `.env` :

```env
# Connexion PostgreSQL via PgBouncer (pour l'application)
DATABASE_URL="postgresql://postgres.<ref>:<password>@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Connexion PostgreSQL directe (pour les migrations Prisma)
DIRECT_URL="postgresql://postgres.<ref>:<password>@aws-0-eu-central-1.pooler.supabase.com:5432/postgres"

# Supabase
SUPABASE_URL="https://<ref>.supabase.co"
SUPABASE_KEY="<anon-key>"
SUPABASE_SECRET_KEY="<service-role-key>"

# URL publique du site
SITE_URL="http://localhost:3000"
```

---

## 5. Initialiser la base de données

### Appliquer les migrations

```bash
npx prisma migrate deploy
```

### (Optionnel) Peupler les données de référence

```bash
npx prisma db seed
```

---

## 6. Lancer l'application

### Développement

```bash
npm run dev
```

Accéder à `http://localhost:3000`.

### Production

```bash
npm run build
npm run preview
```

---

## 7. Déploiement sur Vercel

1. Importer le dépôt GitHub dans [vercel.com](https://vercel.com)
2. Dans **Settings → Environment Variables**, renseigner toutes les variables du `.env` avec les valeurs de production
3. Vercel détecte automatiquement le framework Nuxt et configure le build
4. Mettre à jour le **Site URL** Supabase avec le domaine Vercel

---

## Variables d'environnement — récapitulatif

| Variable | Côté | Obligatoire | Description |
|----------|------|-------------|-------------|
| `DATABASE_URL` | Serveur | ✅ | Connexion poolée PostgreSQL |
| `DIRECT_URL` | Serveur | ✅ | Connexion directe PostgreSQL (migrations) |
| `SUPABASE_URL` | Client + Serveur | ✅ | URL du projet Supabase |
| `SUPABASE_KEY` | Client | ✅ | Clé publique anon |
| `SUPABASE_SECRET_KEY` | Serveur | ✅ | Clé service role (génération PDF) |
| `SITE_URL` | Serveur | ✅ | URL publique (redirections email) |

---

## Dépannage courant

| Problème | Cause probable | Solution |
|----------|----------------|----------|
| `PrismaClientInitializationError` | `DATABASE_URL` incorrect | Vérifier l'URL et le mode PgBouncer |
| Erreur 401 sur les API | Clé Supabase manquante | Vérifier `SUPABASE_KEY` |
| Email de reset redirige vers homepage | URL non whitelistée Supabase | Ajouter l'URL dans Redirect URLs |
| PDF non généré | `SUPABASE_SECRET_KEY` absent | Renseigner la service role key |
