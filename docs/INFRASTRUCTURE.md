# Infrastructure Architecture — Wicthu

## Schéma d'infrastructure de déploiement

```mermaid
graph TB
    subgraph Internet["Internet"]
        User["👤 Utilisateur\n(navigateur)"]
    end

    subgraph DNS["DNS"]
        Domain["wicthu.com\n(domaine custom)"]
    end

    subgraph Vercel["Vercel (hébergement)"]
        direction TB
        Edge["Edge Network\nCDN mondial"]
        SSR["Serverless Functions\n(Nitro / Node.js)\nAPI + SSR"]
        Static["Assets statiques\n(CSS, JS, images)"]
    end

    subgraph Supabase["Supabase (BaaS — région EU)"]
        direction TB
        SupaAuth["Auth Service\nJWT + email SMTP"]
        SupaDB["PostgreSQL\n(via PgBouncer)"]
        SupaStorage["Object Storage\nbucket : fiches"]
    end

    subgraph External["Services externes"]
        Gotenberg["Gotenberg Demo API\ndemo.gotenberg.dev\nChromium headless"]
    end

    User -->|HTTPS| Domain
    Domain -->|CNAME| Edge
    Edge -->|requêtes SSR / API| SSR
    Edge -->|assets| Static

    SSR -->|Prisma / TCP SSL\n(PgBouncer port 6543)| SupaDB
    SSR -->|supabase-js SDK\n(HTTPS)| SupaAuth
    SSR -->|supabase-js SDK\n(HTTPS)| SupaStorage
    SSR -->|HTTP POST multipart\n(HTTPS)| Gotenberg

    User -->|supabase-js SDK\n(HTTPS)| SupaAuth
```

---

## Composants d'infrastructure

### Vercel

| Aspect | Détail |
|--------|--------|
| Type | Platform-as-a-Service (PaaS) |
| Rendu | SSR + prerender (page `/`) |
| Fonctions | Serverless (Node.js 20) |
| Déploiement | Automatique via push GitHub |
| CDN | Edge Network mondial |
| TLS | Certificat SSL automatique |

### Supabase

| Service | Rôle |
|---------|------|
| **PostgreSQL** | Base de données principale (région eu-central-1) |
| **PgBouncer** | Pool de connexions (port 6543) — utilisé par l'app |
| **Auth** | Gestion des sessions, JWT, emails transactionnels |
| **Storage** | Stockage temporaire des PDFs générés (bucket `fiches`) |

### Gotenberg

| Aspect | Détail |
|--------|--------|
| Type | API externe (démo publique) |
| Usage | Conversion HTML → PDF via Chromium headless |
| Endpoint | `POST https://demo.gotenberg.dev/forms/chromium/convert/html` |
| Authentification | Aucune (démo publique) |

> **Note** : La démo Gotenberg est utilisée à des fins académiques. En production pérenne, une instance Gotenberg auto-hébergée (Docker) est recommandée.

---

## Flux réseau

| Source | Destination | Protocole | Description |
|--------|-------------|-----------|-------------|
| Navigateur | Vercel Edge | HTTPS 443 | Chargement pages + appels API |
| Navigateur | Supabase Auth | HTTPS 443 | Authentification (SDK client) |
| Serveur Nitro | PostgreSQL | TCP SSL 6543 | Requêtes Prisma (PgBouncer) |
| Serveur Nitro | Supabase Auth | HTTPS 443 | Vérification session serveur |
| Serveur Nitro | Supabase Storage | HTTPS 443 | Upload / URL signée PDF |
| Serveur Nitro | Gotenberg | HTTPS 443 | Génération PDF |

---

## Environnements

| Environnement | URL | Base de données | Notes |
|---------------|-----|-----------------|-------|
| **Développement** | `http://localhost:3000` | Supabase (même projet) | Variables `.env` local |
| **Production** | `https://wicthu.com` | Supabase (même projet) | Variables Vercel Dashboard |

---

## Sécurité

| Mesure | Description |
|--------|-------------|
| TLS/HTTPS | Partout (Vercel, Supabase, Gotenberg) |
| JWT Supabase | Sessions signées, validées côté serveur |
| `SUPABASE_SECRET_KEY` | Service role key — jamais exposée côté client, uniquement dans les serverless functions |
| PDFs temporaires | Supprimés automatiquement 70s après génération |
| URLs signées | Validité 60s pour le téléchargement PDF |
| Middleware auth | Routes `/investigateur/*` et `/profil` protégées |
