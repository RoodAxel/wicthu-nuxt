# Architecture applicative — Wicthu

## Vue d'ensemble

Wicthu est une application **full-stack** construite sur Nuxt 4, avec un rendu hybride (SSR + prerender), une API REST interne et Supabase comme backend-as-a-service.

---

## Schéma d'architecture logicielle

```mermaid
graph TB
    subgraph Client["Navigateur (Client)"]
        Pages["Pages Vue\n(Nuxt / file-based routing)"]
        Components["Composants\n(AppHeader, Cards…)"]
        Plugin["Plugin auth\n(supabase-auth.client.ts)"]
        Middleware["Middleware\n(auth.ts)"]
    end

    subgraph Nuxt["Serveur Nuxt (Nitro — Vercel)"]
        API["Routes API\n/api/**"]
        Prisma["Prisma Client\n(ORM)"]
    end

    subgraph Supabase["Supabase (BaaS)"]
        SupaAuth["Auth\n(JWT, email/password)"]
        SupaDB["PostgreSQL\n(base de données)"]
    end

    Gotenberg["Gotenberg API\n(demo.gotenberg.dev)\nConversion HTML → PDF"]

    Pages -->|useFetch / $fetch| API
    Pages -->|useSupabaseClient| SupaAuth
    Plugin -->|onAuthStateChange| SupaAuth
    Middleware -->|useSupabaseUser| SupaAuth

    API -->|Prisma queries| SupaDB
    API -->|serverSupabaseUser| SupaAuth
    API -->|HTTP POST multipart| Gotenberg

    Prisma --> SupaDB
```

---

## Flux de données principaux

### 1. Consultation des ressources

```mermaid
sequenceDiagram
    participant U as Utilisateur
    participant P as Page Vue
    participant A as API Nitro
    participant D as PostgreSQL

    U->>P: Navigation vers /ressources/sort
    P->>A: GET /api/sort
    A->>D: prisma.sort.findMany()
    D-->>A: Liste des sorts
    A-->>P: JSON[]
    P-->>U: Affichage avec filtres/tri
```

### 2. Génération de fiche PDF

```mermaid
sequenceDiagram
    participant U as Utilisateur
    participant P as Page creer.vue
    participant A as API Nitro
    participant G as Gotenberg
    participant S as Supabase Storage

    U->>P: Clic "Générer la fiche PDF"
    P->>A: POST /api/investigateur/generate-pdf (form data)
    A->>A: Sauvegarde investigateur en BDD
    A->>A: Génération HTML (buildInvestigateurHtml)
    A->>G: POST /forms/chromium/convert/html
    G-->>A: PDF binaire
    A->>S: Upload PDF dans bucket "fiches"
    S-->>A: Confirmation
    A->>S: createSignedUrl (60s)
    S-->>A: URL signée temporaire
    A-->>P: { url }
    P-->>U: Ouverture PDF dans nouvel onglet
```

### 3. Authentification et reset de mot de passe

```mermaid
sequenceDiagram
    participant U as Utilisateur
    participant P as Page login.vue
    participant R as Page reset-password.vue
    participant SA as Supabase Auth

    U->>P: Saisie email + "Envoyer le lien"
    P->>SA: resetPasswordForEmail(email, { redirectTo: /auth/reset-password })
    SA-->>U: Email avec lien de récupération
    U->>R: Clic lien → /auth/reset-password?token_hash=X&type=recovery
    R->>SA: verifyOtp({ token_hash, type: 'recovery' })
    SA-->>R: Session PASSWORD_RECOVERY
    U->>R: Saisie nouveau mot de passe
    R->>SA: updateUser({ password })
    SA-->>R: Succès
    R->>SA: signOut()
    R-->>U: Redirection vers /auth/login
```

---

## Couches applicatives

| Couche | Rôle | Technologies |
|--------|------|-------------|
| **Présentation** | Rendu UI, interactions utilisateur | Vue 3, Nuxt UI, TailwindCSS |
| **Routage** | Navigation, protection des routes | Nuxt file-based routing, middleware auth |
| **État** | Données réactives locales | `ref`, `computed`, `useFetch` |
| **API** | Endpoints REST internes | Nitro (H3), file-based `/server/api/` |
| **Accès données** | Requêtes base de données | Prisma ORM |
| **Auth** | Sessions, JWT, emails | Supabase Auth |
| **Stockage** | Fichiers PDF temporaires | Supabase Storage |
| **PDF** | Conversion HTML → PDF | Gotenberg (Chromium headless) |

---

## Décisions architecturales

| Décision | Justification |
|----------|---------------|
| Nuxt 4 (full-stack) | Évite un projet backend séparé, API et frontend colocalisés |
| Prisma + Supabase | Prisma apporte le typage fort et les migrations, Supabase l'hébergement PostgreSQL et l'Auth clé-en-main |
| `redirect: false` (Supabase module) | Contrôle explicite des redirections auth via middleware custom |
| Gotenberg pour PDF | Démontre l'intégration d'API externe pour la présentation académique |
| Supabase Storage (PDF temporaire) | Les PDFs sont uploadés, une URL signée 60s est retournée, puis supprimés automatiquement |
